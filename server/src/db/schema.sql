-- ========================================================
-- GreenLoop — PostgreSQL Relational Database Schema DDL
-- Production-Ready Idempotent Schema
-- ========================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'recipient' CHECK (role IN ('donor', 'recipient', 'admin')),
    city VARCHAR(100) NOT NULL,
    preferred_categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on users email for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);

-- 2. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    material_category VARCHAR(50) NOT NULL CHECK (material_category IN ('cardboard', 'plastic', 'glass', 'wood', 'textile', 'metal', 'other')),
    material_type VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Good', 'Fair', 'Salvage')),
    quantity_description VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    image_url TEXT,
    cloudinary_public_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'collected', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for listings search, category, location, and status queries
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(material_category);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_city_category ON listings(city, material_category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- 3. INTERESTS TABLE
CREATE TABLE IF NOT EXISTS interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_listing_recipient UNIQUE (listing_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_interests_listing ON interests(listing_id);
CREATE INDEX IF NOT EXISTS idx_interests_recipient ON interests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_interests_status ON interests(status);

-- 4. MATCH RESULTS TABLE (Auditing & Recommendation Cache)
CREATE TABLE IF NOT EXISTS match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL CHECK (score >= 0.0 AND score <= 100.0),
    reason TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_match_results_user ON match_results(user_id);
CREATE INDEX IF NOT EXISTS idx_match_results_score ON match_results(score DESC);
