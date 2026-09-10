CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  pet_name TEXT NOT NULL,
  age TEXT,
  breed TEXT,
  owner_contact TEXT NOT NULL,
  last_grooming TEXT,
  preferred_time TEXT,
  additional_services TEXT,
  home_care TEXT,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(preferred_time);
CREATE TABLE IF NOT EXISTS hours (day TEXT PRIMARY KEY,value TEXT NOT NULL);
INSERT OR IGNORE INTO hours(day,value) VALUES ('monday','09:00–19:00'),('tuesday','09:00–19:00'),('wednesday','09:00–19:00'),('thursday','09:00–19:00'),('friday','09:00–19:00'),('saturday','10:00–18:00'),('sunday','Вихідний');
CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY,name TEXT NOT NULL,rating INTEGER NOT NULL,text TEXT NOT NULL,reply TEXT DEFAULT '',status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL);
INSERT OR IGNORE INTO reviews(id,name,rating,text,reply,status,created_at) VALUES ('demo-review','Анюта',5,'Дуже задоволена результатом!','','published',datetime('now'));
