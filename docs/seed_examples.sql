-- Seed Data for Examples
-- Run this in Supabase SQL Editor to populate sample data

-- 1. Create Scenes
INSERT INTO scenes (id, name, description)
VALUES 
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Christmas 2024', 'Our magical Christmas celebration in the mountains.'),
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Alice Birthday 18th', 'Sweet 18th Birthday Party with friends and family.');

-- 2. Create Members
INSERT INTO members (id, name, avatar_url)
VALUES 
    ('e290f1ee-6c54-4b01-90e6-d701748f0851', 'Alice', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'),
    ('e290f1ee-6c54-4b01-90e6-d701748f0852', 'Bob', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'),
    ('e290f1ee-6c54-4b01-90e6-d701748f0853', 'Mom', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom');

-- 3. Create Photos (Sample URLs - unsplash)
INSERT INTO photos (image_url, title, description, position_index, is_featured, scene_id, member_id, tags)
VALUES 
    -- Christmas Scene
    ('https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800', 'Snowy Morning', 'Woke up to a winter wonderland!', 1, true, 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'e290f1ee-6c54-4b01-90e6-d701748f0853', ARRAY['snow', 'morning']),
    ('https://images.unsplash.com/photo-1512474932049-782abb8be2e9?auto=format&fit=crop&w=800', 'Christmas Tree', 'Decorating the tree together.', 2, false, 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'e290f1ee-6c54-4b01-90e6-d701748f0852', ARRAY['tree', 'decor']),
    ('https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800', 'Gifts!', 'So many presents under the tree.', 3, false, 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'e290f1ee-6c54-4b01-90e6-d701748f0851', ARRAY['gifts']),
    
    -- Birthday Scene
    ('https://images.unsplash.com/photo-1530103862676-de3c9da59af7?auto=format&fit=crop&w=800', 'Birthday Cake', 'The most delicious chocolate cake.', 1, true, 'd290f1ee-6c54-4b01-90e6-d701748f0852', 'e290f1ee-6c54-4b01-90e6-d701748f0853', ARRAY['cake', 'food']),
    ('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800', 'Party Time', 'Dancing all night long!', 2, false, 'd290f1ee-6c54-4b01-90e6-d701748f0852', 'e290f1ee-6c54-4b01-90e6-d701748f0851', ARRAY['party', 'dance']);
