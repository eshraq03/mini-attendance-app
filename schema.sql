-- Table: students
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    class_level VARCHAR(50) NOT NULL
);

-- Table: attendance_logs
CREATE TABLE IF NOT EXISTS attendance_logs (
    id SERIAL PRIMARY KEY,
    session_date DATE NOT NULL,
    class_level VARCHAR(50) NOT NULL,
    records JSONB NOT NULL,
    stats JSONB NOT NULL,
    UNIQUE(session_date, class_level)
);
