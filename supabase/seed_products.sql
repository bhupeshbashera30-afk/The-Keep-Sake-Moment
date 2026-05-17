-- Current website shop seed. Services are managed as products in service categories.

INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Royal Celebration Hamper', 'Premium hamper with chocolates, dry fruits, scented candles, and a handwritten note card.', 2499.00, '/images/hampers-category.png', 'hampers', 25),
('Luxury Gift Hamper', 'Curated collection of artisanal goodies, premium tea blends, and spa essentials in a keepsake box.', 3499.00, '/images/hampers-category.png', 'hampers', 15),
('Rose Bouquet (12 stems)', 'Fresh red roses wrapped in premium satin paper with a ribbon.', 799.00, 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=600&auto=format&fit=crop', 'flowers', 50),
('Mixed Wildflower Arrangement', 'Cheerful mix of seasonal blooms in a rustic kraft wrap.', 1199.00, 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=600&auto=format&fit=crop', 'flowers', 40),
('Crochet Table Centrepiece', 'A handcrafted crochet centrepiece arrangement for table decor at events or home display.', 3500.00, '/images/crochets-category.png', 'crochets', 10),
('Crochet Event Favours (Set of 10)', 'Bulk mini crochet pieces for event favours, keychains, mini flowers, or small animals.', 3000.00, '/images/crochets-category.png', 'crochets', 10),
('Amigurumi Keepsake', 'Custom crochet amigurumi stuffed toy, a personalised keepsake for any occasion.', 1800.00, '/images/crochets-category.png', 'crochets', 10);
