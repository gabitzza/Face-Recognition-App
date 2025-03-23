-- ========================
-- FaceRun - DB Init SQL
-- ========================

-- 1. USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('fotograf', 'alergator')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CONTESTS
CREATE TABLE contests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PHOTOS
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    image_path TEXT NOT NULL, -- ex: uploads/img123.jpg
    face_encoding TEXT, -- JSON string (vector 128 floats)
    contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
    photographer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    matched_runner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. USER_GALLERY (saved photos)
CREATE TABLE user_gallery (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, photo_id)
);

-- 5. OPTIONAL: MATCHES LOG (istoric potriviri)
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
    runner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    match_score FLOAT,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
