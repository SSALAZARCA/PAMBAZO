-- Add tips column to orders table
ALTER TABLE orders ADD COLUMN tip REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN tip_percentage REAL DEFAULT 0;

-- Create tips tracking table
CREATE TABLE IF NOT EXISTS tips (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id TEXT NOT NULL,
    waiter_id TEXT NOT NULL,
    amount REAL NOT NULL,
    percentage REAL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'digital')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tips_waiter ON tips(waiter_id);
CREATE INDEX IF NOT EXISTS idx_tips_date ON tips(created_at);
