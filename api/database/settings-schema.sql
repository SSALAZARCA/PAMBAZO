-- Settings table for store configuration
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, category, description) VALUES
-- Location
('store_name', 'PAMBAZO', 'location', 'Nombre de la tienda'),
('store_address', 'Av. Principal 123, Col. Centro', 'location', 'Dirección física'),
('store_city', 'Ciudad', 'location', 'Ciudad'),
('store_state', 'Estado', 'location', 'Estado/Provincia'),
('store_zip', '12345', 'location', 'Código postal'),
('store_country', 'Colombia', 'location', 'País'),
('store_lat', '4.6097', 'location', 'Latitud'),
('store_lng', '-74.0817', 'location', 'Longitud'),
('store_maps_url', 'https://maps.google.com', 'location', 'URL de Google Maps'),

-- Contact
('contact_phone', '+57 123 456 7890', 'contact', 'Teléfono principal'),
('contact_whatsapp', '+57 123 456 7890', 'contact', 'WhatsApp'),
('contact_email', 'info@pambazo.com', 'contact', 'Email de contacto'),
('contact_facebook', 'https://facebook.com/pambazo', 'contact', 'Facebook URL'),
('contact_instagram', 'https://instagram.com/pambazo', 'contact', 'Instagram URL'),
('contact_twitter', 'https://twitter.com/pambazo', 'contact', 'Twitter URL'),

-- Hours (JSON format)
('hours_monday', '{"open":"06:00","close":"20:00","closed":false}', 'hours', 'Horario Lunes'),
('hours_tuesday', '{"open":"06:00","close":"20:00","closed":false}', 'hours', 'Horario Martes'),
('hours_wednesday', '{"open":"06:00","close":"20:00","closed":false}', 'hours', 'Horario Miércoles'),
('hours_thursday', '{"open":"06:00","close":"20:00","closed":false}', 'hours', 'Horario Jueves'),
('hours_friday', '{"open":"06:00","close":"20:00","closed":false}', 'hours', 'Horario Viernes'),
('hours_saturday', '{"open":"06:00","close":"21:00","closed":false}', 'hours', 'Horario Sábado'),
('hours_sunday', '{"open":"07:00","close":"19:00","closed":false}', 'hours', 'Horario Domingo'),

-- General
('store_description', 'Panadería Artesanal desde 2024', 'general', 'Descripción de la tienda'),
('store_slogan', 'Pan fresco todos los días', 'general', 'Eslogan'),
('delivery_enabled', 'true', 'general', 'Delivery habilitado'),
('delivery_radius_km', '5', 'general', 'Radio de delivery en km'),
('delivery_fee', '3000', 'general', 'Costo de delivery'),
('delivery_time_min', '30', 'general', 'Tiempo mínimo de entrega (minutos)'),
('delivery_time_max', '45', 'general', 'Tiempo máximo de entrega (minutos)');
