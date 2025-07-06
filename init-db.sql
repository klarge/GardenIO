-- GardenIO Database Initialization Script
-- This script sets up the database schema for the GardenIO application

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create the plants table
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'vegetable',
    "daysToSprout" INTEGER DEFAULT 7,
    "daysToHarvest" INTEGER DEFAULT 60,
    season VARCHAR(50) DEFAULT 'Spring',
    "imageUrl" TEXT
);

-- Create the locations table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create the plantings table
CREATE TABLE IF NOT EXISTS plantings (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "plantId" INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    location VARCHAR(255),
    "plantedDate" DATE NOT NULL,
    quantity INTEGER DEFAULT 1,
    notes TEXT
);

-- Create the session table for session storage
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);

-- Insert sample data
INSERT INTO plants (name, description, category, "daysToSprout", "daysToHarvest", season, "imageUrl") VALUES
('Tomato - Cherry', 'Sweet cherry tomatoes perfect for snacking and salads', 'vegetable', 7, 65, 'Spring', ''),
('Basil - Sweet', 'Classic Italian basil with aromatic leaves', 'herb', 5, 60, 'Spring', ''),
('Lettuce - Butterhead', 'Tender butterhead lettuce with soft leaves', 'vegetable', 4, 45, 'Spring', ''),
('Carrot - Baby', 'Small sweet carrots perfect for containers', 'vegetable', 10, 70, 'Spring', ''),
('Sunflower - Dwarf', 'Compact sunflowers for small gardens', 'flower', 7, 80, 'Summer', '')
ON CONFLICT DO NOTHING;

-- Create default admin user (password: admin123)
-- Note: In production, this should be changed immediately
INSERT INTO users (username, password) VALUES
('admin', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08.salt')
ON CONFLICT (username) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (name, description) VALUES
('Front Garden', 'Sunny area in front of the house'),
('Backyard Beds', 'Raised beds in the backyard'),
('Greenhouse', 'Temperature controlled greenhouse'),
('Container Garden', 'Pots and containers on the patio')
ON CONFLICT DO NOTHING;