CREATE TABLE t_p68343413_expert_finance_landi.legal_pages (
  slug VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p68343413_expert_finance_landi.legal_pages (slug, title, content) VALUES
('policy', 'Политика конфиденциальности', '<h2>Политика конфиденциальности</h2><p>Добавьте текст политики конфиденциальности.</p>'),
('complaints', 'Требования к содержанию обращений', '<h2>Требования к содержанию обращений</h2><p>Добавьте текст требований к обращениям.</p>'),
('personal-data', 'Политика обработки персональных данных', '<h2>Политика обработки персональных данных</h2><p>Добавьте текст политики обработки персональных данных.</p>');
