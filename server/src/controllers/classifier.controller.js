import axios from 'axios';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MATCHER_SERVICE_URL = process.env.MATCHER_SERVICE_URL || 'http://localhost:8000';
const PREDICT_SCRIPT_PATH = path.resolve(__dirname, '../../../matcher/predict.py');

const DEFAULT_METADATA = {
  "Hazardous": {
    "badge_color": "#D9381E",
    "bg_color": "#FCEBE6",
    "icon": "⚠️",
    "recyclable": false,
    "hazard_level": "High",
    "description": "Hazardous materials including batteries, e-waste, solvents, paints, and chemicals requiring specialized disposal.",
    "handling_instructions": "Do NOT place in municipal landfills or general recycling. Hand over to certified e-waste or hazmat collection centers.",
    "suggested_actions": ["Hazmat Disposal Facility", "E-Waste Safe Recycler", "Certified Battery Drop-off"]
  },
  "Non-Recyclable": {
    "badge_color": "#7F8C8D",
    "bg_color": "#F2F3F4",
    "icon": "🗑️",
    "recyclable": false,
    "hazard_level": "Low",
    "description": "Contaminated ceramics, styrofoam (EPS), sanitary products, or multi-laminate plastics that cannot be remanufactured.",
    "handling_instructions": "Sort into non-recyclable solid waste streams. Where possible, seek mechanical downcycling or clean energy recovery.",
    "suggested_actions": ["Solid Waste Diversion", "Refuse-Derived Fuel", "Sanitary Landfill Management"]
  },
  "Organic": {
    "badge_color": "#27AE60",
    "bg_color": "#E8F8F5",
    "icon": "🌱",
    "recyclable": true,
    "hazard_level": "None",
    "description": "Biodegradable organic biomass, food offcuts, egg shells, yard waste, and compostable organic matter.",
    "handling_instructions": "Ideal for aerobic composting, vermicomposting, or community anaerobic biodigesters to produce nutrient-rich bio-fertilizer.",
    "suggested_actions": ["Community Composting", "Biogas Generation", "Soil Conditioning"]
  },
  "Recyclable": {
    "badge_color": "#0A5C36",
    "bg_color": "#E1F2E8",
    "icon": "♻️",
    "recyclable": true,
    "hazard_level": "None",
    "description": "High-purity secondary commodities: clean cardboard, paper packaging, glass containers, metal cans, and rigid plastics.",
    "handling_instructions": "Rinse clean, compact if possible, and list on GreenLoop Marketplace for remanufacturers, upcyclers, and artisans.",
    "suggested_actions": ["GreenLoop Marketplace Listing", "Materials Recovery Facility (MRF)", "Industrial Upcycling"]
  }
};

/**
 * Execute standalone python prediction script directly
 */
const runPythonPredictScript = (imageInput) => {
  return new Promise((resolve, reject) => {
    execFile('python3', [PREDICT_SCRIPT_PATH, imageInput], { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        if (parsed.success && parsed.prediction) {
          resolve(parsed.prediction);
        } else {
          reject(new Error(parsed.error || 'Prediction script returned invalid output'));
        }
      } catch (parseErr) {
        reject(new Error(`Could not parse python output: ${stdout}`));
      }
    });
  });
};

/**
 * GET /api/classifier/info
 * Returns metadata and handling guidelines for the 4 categories
 */
export const getClassifierInfo = async (req, res, next) => {
  try {
    // Try querying microservice first
    try {
      const response = await axios.get(`${MATCHER_SERVICE_URL}/classify/info`, { timeout: 1000 });
      if (response.data && response.data.classes) {
        return res.json(response.data);
      }
    } catch (e) {
      // microservice offline, continue with local metadata
    }

    return res.json({
      success: true,
      classes: Object.keys(DEFAULT_METADATA),
      metadata: DEFAULT_METADATA,
      engine: 'MobileNetV3 4-Class Neural Classifier',
      architecture: 'MobileNetV3-Large Transfer Learning'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/classifier/predict
 * Classifies an image into one of 4 waste categories:
 * Hazardous, Non-Recyclable, Organic, Recyclable
 */
export const predictWasteCategory = async (req, res, next) => {
  try {
    let imageInput = null;

    if (req.file) {
      // Uploaded file: pass base64 or temporary path
      const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      imageInput = base64Data;
    } else if (req.body.image_base64) {
      imageInput = req.body.image_base64;
    } else if (req.body.image_url) {
      // Check if image_url is a relative public file (e.g. /thumb-wood.jpg)
      if (req.body.image_url.startsWith('/')) {
        const localPath = path.resolve(__dirname, '../../../client/public', req.body.image_url.replace(/^\//, ''));
        imageInput = localPath;
      } else {
        imageInput = req.body.image_url;
      }
    } else if (req.body.image_path) {
      imageInput = req.body.image_path;
    }

    if (!imageInput) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an image file, image_base64, or image_url for classification.'
      });
    }

    let prediction = null;
    let engine = 'microservice';

    // 1. Try microservice HTTP endpoint
    try {
      const msRes = await axios.post(
        `${MATCHER_SERVICE_URL}/classify`,
        { image: imageInput },
        { timeout: 5000 }
      );
      if (msRes.data && msRes.data.success && msRes.data.prediction) {
        prediction = msRes.data.prediction;
      }
    } catch (msErr) {
      // Microservice HTTP unreachable or timed out -> fallback to direct python CLI
      engine = 'direct-python-cli';
    }

    // 2. Fallback to direct Python runner if microservice is offline
    if (!prediction) {
      try {
        prediction = await runPythonPredictScript(imageInput);
      } catch (cliErr) {
        console.warn('[Classifier Controller] CLI runner error:', cliErr.message);
      }
    }

    // 3. Fallback heuristic if python execution completely unavailable
    if (!prediction) {
      const lowerInput = String(imageInput).toLowerCase();
      let cat = 'Recyclable';
      let conf = 88.5;
      if (lowerInput.includes('battery') || lowerInput.includes('paint') || lowerInput.includes('hazard') || lowerInput.includes('chemical')) {
        cat = 'Hazardous';
        conf = 92.4;
      } else if (lowerInput.includes('food') || lowerInput.includes('scrap') || lowerInput.includes('organic') || lowerInput.includes('yard')) {
        cat = 'Organic';
        conf = 94.1;
      } else if (lowerInput.includes('ceramic') || lowerInput.includes('diaper') || lowerInput.includes('styrofoam') || lowerInput.includes('wrapper')) {
        cat = 'Non-Recyclable';
        conf = 89.0;
      }

      const meta = DEFAULT_METADATA[cat];
      prediction = {
        category: cat,
        confidence: conf,
        confidence_ratio: conf / 100,
        probabilities: {
          Hazardous: cat === 'Hazardous' ? 0.924 : 0.025,
          'Non-Recyclable': cat === 'Non-Recyclable' ? 0.890 : 0.035,
          Organic: cat === 'Organic' ? 0.941 : 0.020,
          Recyclable: cat === 'Recyclable' ? 0.885 : 0.040,
        },
        badge_color: meta.badge_color,
        bg_color: meta.bg_color,
        icon: meta.icon,
        recyclable: meta.recyclable,
        hazard_level: meta.hazard_level,
        description: meta.description,
        handling_instructions: meta.handling_instructions,
        suggested_actions: meta.suggested_actions,
      };
      engine = 'rule-based-fallback';
    }

    res.json({
      success: true,
      engine,
      prediction,
    });
  } catch (err) {
    next(err);
  }
};
