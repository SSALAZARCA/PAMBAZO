UPDATE users SET password_hash = '$2b$12$qV5rfA.6wa6Wcdyohn8bEpVgG5lHEQS8Dct.' WHERE email = 'admin@pambazo.com';
SELECT 'Updated user:', email, substr(password_hash, 1, 30) as hash FROM users WHERE email = 'admin@pambazo.com';
