CREATE DATABASE IF NOT EXISTS sportzone_db;
USE sportzone_db;

-- User Credentials Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Demo User (Username: demo_athlete | Password: password123)
INSERT INTO users (username, email, password) VALUES
('demo_athlete', 'demo@sportzone.com', '$2b$12$zAohND6kqiTPwCKBSC4Q5.enWvMWrhIg2.ahE28NAGkBqeR4X9u36')
ON DUPLICATE KEY UPDATE id=id;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    stock INT DEFAULT 20,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Products
INSERT INTO products (name, category, price, description, image_url, stock, rating) VALUES
('Pro Match Soccer Ball', 'Soccer', 29.99, 'FIFA Quality Pro match ball with thermal bonding technology.', 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=500&auto=format&fit=crop&q=60', 45, 4.8),
('Elite Grip Basketball', 'Basketball', 34.99, 'High-tack composite leather designed for both indoor and outdoor courts.', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500&auto=format&fit=crop&q=60', 30, 4.7),
('Pro Carbon Tennis Racket', 'Tennis', 89.99, 'Lightweight carbon graphite frame for power, spin, and precision control.', 'https://images.unsplash.com/photo-1617083934555-563d60a169b2?w=500&auto=format&fit=crop&q=60', 15, 4.9),
('Velocity Pro Running Shoes', 'Running', 79.99, 'Breathable engineered mesh upper with responsive energy-return foam cushioning.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60', 25, 4.6),
('HyperFlex Hex Dumbbells (Pair)', 'Fitness', 49.99, 'Solid cast iron with anti-roll hexagonal rubber casing and knurled chrome handles.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&auto=format&fit=crop&q=60', 40, 4.8),
('Waterproof Sport Duffle Bag', 'Accessories', 39.99, 'Rugged 45L duffle featuring a separate ventilated shoe pocket and wet compartment.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60', 50, 4.5);
