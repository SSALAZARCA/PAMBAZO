-- Fix owner password hash for 123456
UPDATE users SET password_hash = '$2b$10$7eiseK8m9e7zrqDANwLz2uUGymm4zJRDU887phw.Z3S3LWyY/uBMu' WHERE email = 'owner@pambazo.com';

-- Verify the update
SELECT email, password_hash FROM users WHERE email = 'owner@pambazo.com';