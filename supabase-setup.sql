-- Create the tracking_entries table
CREATE TABLE tracking_entries (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  submissions_got TEXT,
  submissions_received TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user_email
CREATE INDEX idx_tracking_entries_user_email ON tracking_entries(user_email);

-- Create index for date queries
CREATE INDEX idx_tracking_entries_date ON tracking_entries(date);

-- Enable Row Level Security (RLS)
ALTER TABLE tracking_entries ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own data
CREATE POLICY "Users can view own tracking entries" ON tracking_entries
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Create policy: Users can insert their own data
CREATE POLICY "Users can insert own tracking entries" ON tracking_entries
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Create policy: Users can update their own data
CREATE POLICY "Users can update own tracking entries" ON tracking_entries
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Create policy: Users can delete their own data
CREATE POLICY "Users can delete own tracking entries" ON tracking_entries
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Add sweeps and dominant_positions columns
ALTER TABLE tracking_entries ADD COLUMN sweeps TEXT;
ALTER TABLE tracking_entries ADD COLUMN dominant_positions TEXT;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tracking_entries_updated_at 
  BEFORE UPDATE ON tracking_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 