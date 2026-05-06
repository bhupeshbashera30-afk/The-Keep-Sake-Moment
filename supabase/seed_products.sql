-- ============================================================
-- Keepsake Moments — Sample Products Seed
-- Run AFTER 001_commerce_schema.sql
-- ============================================================

INSERT INTO products (name, description, price, image_url, category, stock) VALUES

-- Hampers
('Luxury Gift Hamper', 'A curated selection of premium chocolates, teas, and artisanal goodies presented in an elegant box.', 1499.00, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600', 'hampers', 50),
('Celebration Hamper', 'Sparkling wine, gourmet snacks, and a heartfelt greeting card — perfect for any milestone.', 2199.00, 'https://images.unsplash.com/photo-1607469256872-4b8ee0748a27?w=600', 'hampers', 40),
('Sweet Treats Hamper', 'Handpicked cookies, brownies, and confections wrapped in festive packaging.', 899.00, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'hampers', 60),

-- Flowers
('Red Rose Bouquet (12)', 'Twelve long-stemmed red roses arranged in an elegant wrap with a ribbon.', 799.00, 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600', 'flowers', 30),
('Pastel Mixed Bouquet', 'A hand-tied arrangement of peonies, lisianthus, and eucalyptus in soft pastel tones.', 1099.00, 'https://images.unsplash.com/photo-1444930694458-01babf71870c?w=600', 'flowers', 25),
('Sunflower Bunch', 'Bright and cheerful sunflowers — a perfect smile-maker for any occasion.', 599.00, 'https://images.unsplash.com/photo-1596443686812-2f45229eebc3?w=600', 'flowers', 35),

-- Gift Boxes
('Personalized Memory Box', 'A keepsake wooden box with your message engraved, filled with chocolates and a candle.', 1899.00, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600', 'gift_boxes', 20),
('Self-Care Gift Box', 'Bath salts, a scented candle, face mask, and a hand cream — indulge and relax.', 1299.00, 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600', 'gift_boxes', 30),
('Anniversary Love Box', 'Champagne, candles, rose petals, and a custom love note — set the mood perfectly.', 2499.00, 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600', 'gift_boxes', 15),

-- Celebration
('Balloon Bouquet (10 balloons)', '10 helium-filled metallic balloons in your chosen colour scheme delivered inflated.', 499.00, 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', 'celebration', 100),
('Birthday Cake Topper Set', 'Elegant acrylic toppers with number candles, sprinkles, and ribbon — ready to use.', 349.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', 'celebration', 80),
('Confetti & Cracker Set', 'A party set of confetti cannons, poppers, and a metallic curtain backdrop.', 699.00, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600', 'celebration', 60),

-- Event Add-ons
('LED Fairy Light String (5m)', 'Warm white fairy lights on copper wire — perfect for backdrop or table décor.', 299.00, 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600', 'event_addons', 200),
('Table Centre Floral Arrangement', 'A fresh floral centrepiece designed to complement your event theme.', 799.00, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600', 'event_addons', 40),
('Polaroid Guest Book Kit', 'Instant camera film, a memory book, and washi tape — let guests capture the moments.', 1199.00, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600', 'event_addons', 25);
