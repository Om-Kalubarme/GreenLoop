#!/usr/bin/env python3
"""
GreenLoop — 4-Class Waste & Material Classifier
===================================================
Fine-tunes a MobileNetV3-Large pre-trained deep neural network on
the GreenLoop dataset ('archive' directory) across 4 core classes:
  1. Hazardous
  2. Non-Recyclable
  3. Organic
  4. Recyclable

Uses Apple Silicon MPS acceleration, stratified train/val split,
class-weighted CrossEntropyLoss, and 2-phase smooth transfer learning.
"""

import os
import sys
import json
import time
import random
from collections import defaultdict
from PIL import Image, ImageFile
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models

ImageFile.LOAD_TRUNCATED_IMAGES = True

SEED = 42
random.seed(SEED)
torch.manual_seed(SEED)

CLASSES = ["Hazardous", "Non-Recyclable", "Organic", "Recyclable"]
CLASS_TO_IDX = {cls_name: i for i, cls_name in enumerate(CLASSES)}

METADATA = {
    "Hazardous": {
        "badge_color": "#D9381E",
        "bg_color": "#FCEBE6",
        "icon": "⚠️",
        "recyclable": False,
        "hazard_level": "High",
        "description": "Hazardous materials including batteries, e-waste, solvents, paints, and chemicals requiring specialized disposal.",
        "handling_instructions": "Do NOT place in municipal landfills or general recycling. Store in leak-proof containers and hand over to certified e-waste or hazmat collection centers.",
        "suggested_actions": ["Hazmat Disposal Facility", "E-Waste Safe Recycler", "Certified Battery Drop-off"]
    },
    "Non-Recyclable": {
        "badge_color": "#7F8C8D",
        "bg_color": "#F2F3F4",
        "icon": "🗑️",
        "recyclable": False,
        "hazard_level": "Low",
        "description": "Contaminated ceramics, styrofoam (EPS), sanitary products, or multi-laminate plastics that cannot be remanufactured.",
        "handling_instructions": "Sort into non-recyclable solid waste streams. Where possible, seek mechanical downcycling or clean energy recovery.",
        "suggested_actions": ["Solid Waste Diversion", "Refuse-Derived Fuel", "Sanitary Landfill Management"]
    },
    "Organic": {
        "badge_color": "#27AE60",
        "bg_color": "#E8F8F5",
        "icon": "🌱",
        "recyclable": True,
        "hazard_level": "None",
        "description": "Biodegradable organic biomass, food offcuts, egg shells, yard waste, and compostable organic matter.",
        "handling_instructions": "Ideal for aerobic composting, vermicomposting, or community anaerobic biodigesters to produce nutrient-rich bio-fertilizer.",
        "suggested_actions": ["Community Composting", "Biogas Generation", "Soil Conditioning"]
    },
    "Recyclable": {
        "badge_color": "#0A5C36",
        "bg_color": "#E1F2E8",
        "icon": "♻️",
        "recyclable": True,
        "hazard_level": "None",
        "description": "High-purity secondary commodities: clean cardboard, paper packaging, glass containers, metal cans, and rigid plastics.",
        "handling_instructions": "Rinse clean, compact if possible, and list on GreenLoop Marketplace for remanufacturers, upcyclers, and artisans.",
        "suggested_actions": ["GreenLoop Marketplace Listing", "Materials Recovery Facility (MRF)", "Industrial Upcycling"]
    }
}


class WasteDataset(Dataset):
    """Custom Dataset for loading waste classification images."""
    def __init__(self, samples, transform=None):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            with Image.open(path) as img:
                if img.mode != "RGB":
                    img = img.convert("RGB")
                if self.transform:
                    img = self.transform(img)
                return img, label
        except Exception as e:
            # Fallback to black image in case of I/O glitch
            img = Image.new("RGB", (224, 224), (0, 0, 0))
            if self.transform:
                img = self.transform(img)
            return img, label


def scan_dataset(archive_dir):
    """Collects and organizes all image paths by class."""
    samples_by_class = defaultdict(list)
    for cat in CLASSES:
        cat_dir = os.path.join(archive_dir, cat)
        if not os.path.exists(cat_dir):
            raise FileNotFoundError(f"Missing category folder: {cat_dir}")
        for root, _, files in os.walk(cat_dir):
            for f in files:
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp")):
                    filepath = os.path.join(root, f)
                    samples_by_class[cat].append((filepath, CLASS_TO_IDX[cat]))

    train_samples = []
    val_samples = []

    print("\n--- Dataset Distribution ---")
    for cat in CLASSES:
        cat_samples = samples_by_class[cat]
        random.shuffle(cat_samples)
        split_idx = int(len(cat_samples) * 0.82)
        train_part = cat_samples[:split_idx]
        val_part = cat_samples[split_idx:]
        train_samples.extend(train_part)
        val_samples.extend(val_part)
        print(f"  [{cat:15s}]: Total {len(cat_samples):4d} | Train: {len(train_part):4d} | Val: {len(val_part):3d}")

    random.shuffle(train_samples)
    random.shuffle(val_samples)
    print(f"\nTotal Dataset: {len(train_samples) + len(val_samples)} images ({len(train_samples)} Train, {len(val_samples)} Val)")
    return train_samples, val_samples, samples_by_class


def build_model(num_classes=4):
    """Loads pre-trained MobileNetV3-Large and sets up custom classifier."""
    weights = models.MobileNet_V3_Large_Weights.DEFAULT
    model = models.mobilenet_v3_large(weights=weights)
    in_features = model.classifier[0].in_features
    
    # Custom classifier head with Dropout and Hardswish
    model.classifier = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.Hardswish(),
        nn.Dropout(p=0.35),
        nn.Linear(256, num_classes)
    )
    return model


def train_model(archive_dir=None,
                output_dir=None,
                warmup_epochs=3,
                finetune_epochs=6,
                batch_size=32):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    archive_dir = archive_dir or os.path.abspath(os.path.join(base_dir, "..", "archive"))
    output_dir = output_dir or os.path.join(base_dir, "models")
    
    os.makedirs(output_dir, exist_ok=True)
    device = torch.device("mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu"))
    print(f"Using compute acceleration device: {device}")

    train_samples, val_samples, samples_by_class = scan_dataset(archive_dir)

    # Compute class weights for balanced loss
    total_train = len(train_samples)
    class_counts = [len(samples_by_class[c]) for c in CLASSES]
    class_weights = [total_train / (len(CLASSES) * c) for c in class_counts]
    class_weights_t = torch.tensor(class_weights, dtype=torch.float32).to(device)
    print(f"Computed inverse class weights: {class_weights_t.cpu().numpy().round(3)}")

    # Data Transforms
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.75, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_loader = DataLoader(
        WasteDataset(train_samples, transform=train_transform),
        batch_size=batch_size,
        shuffle=True,
        num_workers=2,
        pin_memory=(device.type == "cuda")
    )

    val_loader = DataLoader(
        WasteDataset(val_samples, transform=val_transform),
        batch_size=batch_size,
        shuffle=False,
        num_workers=2,
        pin_memory=(device.type == "cuda")
    )

    model = build_model(num_classes=len(CLASSES)).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights_t)

    # -------------------------------------------------------------
    # STAGE 1: WARMUP (Classifier Head only)
    # -------------------------------------------------------------
    print("\n=======================================================")
    print(f"🚀 STAGE 1: Warmup Classifier Head ({warmup_epochs} Epochs)")
    print("=======================================================")
    for param in model.features.parameters():
        param.requires_grad = False

    optimizer = torch.optim.AdamW(model.classifier.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=warmup_epochs, eta_min=1e-5)

    history = {
        "train_loss": [], "train_acc": [],
        "val_loss": [], "val_acc": [],
        "epochs": []
    }

    best_val_acc = 0.0
    best_weights_path = os.path.join(output_dir, "waste_classifier_mobilenetv3.pth")

    for epoch in range(1, warmup_epochs + 1):
        t0 = time.time()
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * imgs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        scheduler.step()
        train_loss = running_loss / total
        train_acc = (correct / total) * 100.0

        # Evaluate on Validation
        val_loss, val_acc, per_class = evaluate(model, val_loader, criterion, device)
        elapsed = time.time() - t0

        print(f"[Warmup {epoch}/{warmup_epochs}] Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}% ({elapsed:.1f}s)")
        
        history["epochs"].append(epoch)
        history["train_loss"].append(round(train_loss, 4))
        history["train_acc"].append(round(train_acc, 2))
        history["val_loss"].append(round(val_loss, 4))
        history["val_acc"].append(round(val_acc, 2))

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), best_weights_path)
            print(f"  ⭐ New Best Model Checkpointed (Val Acc: {best_val_acc:.2f}%)")

    # -------------------------------------------------------------
    # STAGE 2: FULL FINE-TUNING (All layers with differential lr)
    # -------------------------------------------------------------
    print("\n=======================================================")
    print(f"🔥 STAGE 2: Full Fine-Tuning ({finetune_epochs} Epochs)")
    print("=======================================================")
    for param in model.features.parameters():
        param.requires_grad = True

    optimizer = torch.optim.AdamW([
        {"params": model.features.parameters(), "lr": 8e-5},
        {"params": model.classifier.parameters(), "lr": 3e-4}
    ], weight_decay=1e-4)

    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=finetune_epochs, eta_min=1e-6)

    for epoch in range(warmup_epochs + 1, warmup_epochs + finetune_epochs + 1):
        t0 = time.time()
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * imgs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        scheduler.step()
        train_loss = running_loss / total
        train_acc = (correct / total) * 100.0

        val_loss, val_acc, per_class = evaluate(model, val_loader, criterion, device)
        elapsed = time.time() - t0

        print(f"[FineTune {epoch}/{warmup_epochs + finetune_epochs}] Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}% ({elapsed:.1f}s)")
        
        history["epochs"].append(epoch)
        history["train_loss"].append(round(train_loss, 4))
        history["train_acc"].append(round(train_acc, 2))
        history["val_loss"].append(round(val_loss, 4))
        history["val_acc"].append(round(val_acc, 2))

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), best_weights_path)
            print(f"  ⭐ New Best Model Checkpointed (Val Acc: {best_val_acc:.2f}%)")

    # Load best model for final evaluation
    print(f"\nLoading best saved checkpoint with {best_val_acc:.2f}% accuracy...")
    model.load_state_dict(torch.load(best_weights_path, map_location=device))
    val_loss, final_acc, per_class = evaluate(model, val_loader, criterion, device)

    print("\n=======================================================")
    print("🏆 FINAL MODEL PERFORMANCE REPORT")
    print("=======================================================")
    print(f"Overall Validation Accuracy: {final_acc:.2f}%\n")
    print(f"{'Class':<16} | {'Correct':<8} | {'Total':<6} | {'Accuracy':<8} | {'Precision':<10} | {'Recall':<8} | {'F1-Score':<8}")
    print("-" * 75)
    for c_idx, cls_name in enumerate(CLASSES):
        stat = per_class[c_idx]
        print(f"{cls_name:<16} | {stat['correct']:<8} | {stat['total']:<6} | {stat['accuracy']:<7.1f}% | {stat['precision']:<9.1f}% | {stat['recall']:<7.1f}% | {stat['f1']:<7.1f}%")

    # Save metadata & history
    classes_json_path = os.path.join(output_dir, "waste_classes.json")
    with open(classes_json_path, "w") as f:
        json.dump({
            "classes": CLASSES,
            "class_to_idx": CLASS_TO_IDX,
            "metadata": METADATA,
            "architecture": "MobileNetV3-Large",
            "val_accuracy": round(final_acc, 2),
            "per_class_metrics": per_class
        }, f, indent=2)

    history_json_path = os.path.join(output_dir, "training_history.json")
    with open(history_json_path, "w") as f:
        json.dump(history, f, indent=2)

    print(f"\nArtifacts generated successfully in: {output_dir}")
    print(f"  - Model weights: {best_weights_path}")
    print(f"  - Class metadata: {classes_json_path}")
    print(f"  - Training history: {history_json_path}\n")
    return final_acc


def evaluate(model, loader, criterion, device):
    """Evaluates validation set and computes detailed metrics."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    class_correct = [0] * len(CLASSES)
    class_total = [0] * len(CLASSES)
    pred_counts = [0] * len(CLASSES)
    confusion = [[0] * len(CLASSES) for _ in range(len(CLASSES))]

    with torch.no_grad():
        for imgs, labels in loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * imgs.size(0)
            _, preds = torch.max(outputs, 1)

            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

            for p, l in zip(preds.view(-1), labels.view(-1)):
                p_i, l_i = p.item(), l.item()
                confusion[l_i][p_i] += 1
                pred_counts[p_i] += 1
                class_total[l_i] += 1
                if p_i == l_i:
                    class_correct[l_i] += 1

    val_loss = running_loss / total
    val_acc = (correct / total) * 100.0

    per_class = {}
    for i in range(len(CLASSES)):
        acc = (class_correct[i] / class_total[i] * 100.0) if class_total[i] > 0 else 0.0
        prec = (class_correct[i] / pred_counts[i] * 100.0) if pred_counts[i] > 0 else 0.0
        rec = acc
        f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0
        per_class[i] = {
            "name": CLASSES[i],
            "correct": class_correct[i],
            "total": class_total[i],
            "accuracy": round(acc, 2),
            "precision": round(prec, 2),
            "recall": round(rec, 2),
            "f1": round(f1, 2)
        }

    return val_loss, val_acc, per_class


if __name__ == "__main__":
    train_model()
