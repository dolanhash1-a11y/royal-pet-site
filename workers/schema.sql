CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  pet_name TEXT NOT NULL,
  age TEXT,
  breed TEXT,
  owner_name TEXT DEFAULT '',
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
INSERT OR IGNORE INTO reviews(id,name,rating,text,reply,status,created_at) VALUES
('review-1','АНЮТА',5,'Дуже задоволена результатом! Собачка виглядає чудово, обов\'язково прийдемо ще.','','published','2026-01-01T00:00:00Z'),
('review-2','Марія',5,'Дуже уважне ставлення до тваринки. Все акуратно та професійно.','','published','2026-01-02T00:00:00Z');
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
INSERT OR IGNORE INTO services(id,title,price,duration,category,description,image,active,sort_order,created_at) VALUES
('service-1','Комплексний грумінг','від 800 грн','2–3 години','Грумінг','Повний комплекс догляду за вашим улюбленцем: купання, сушка, вичісування, стрижка та догляд за кігтями.','',1,1,'2026-01-01T00:00:00Z'),
('service-2','Гігієнічний грумінг','від 500 грн','1–1,5 години','Гігієна','Гігієнічний догляд, який допомагає підтримувати чистоту та комфорт вашого улюбленця.','',1,2,'2026-01-01T00:00:00Z'),
('service-3','Вичісування','від 400 грн','45–60 хвилин','Догляд','Ретельне вичісування шерсті та видалення зайвого підшерстя.','',1,3,'2026-01-01T00:00:00Z'),
('service-4','Стрижка','від 600 грн','1–2 години','Грумінг','Стрижка відповідно до породи, побажань власника та стану шерсті.','',1,4,'2026-01-01T00:00:00Z'),
('service-5','Зубки','100','2 години','Гігієна','Чистка зубів новітніми засобами','/uploads/img_4725.jpg',1,5,'2026-01-01T00:00:00Z');