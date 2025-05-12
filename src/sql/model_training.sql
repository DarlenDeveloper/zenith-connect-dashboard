-- Create model_training table
CREATE TABLE IF NOT EXISTS model_training (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_ref_id TEXT UNIQUE NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_type TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  first_message TEXT NOT NULL,
  temperature NUMERIC NOT NULL DEFAULT 0.1,
  max_tokens INTEGER NOT NULL DEFAULT 2500,
  files TEXT[] DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create sequence for model_ref_id generation
CREATE SEQUENCE IF NOT EXISTS model_training_seq START 1;

-- Create function to get next model sequence number
CREATE OR REPLACE FUNCTION get_next_model_training_sequence()
RETURNS INTEGER
LANGUAGE SQL
AS $$
  SELECT nextval('model_training_seq')::INTEGER
$$;

-- Enable row level security
ALTER TABLE model_training ENABLE ROW LEVEL SECURITY;

-- Create access policies
CREATE POLICY "Enable read access for authenticated users" ON model_training
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON model_training
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for users based on user_id" ON model_training
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users based on user_id" ON model_training
  FOR DELETE USING (auth.uid() = user_id);

-- Setup realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE model_training;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_model_training_user_id ON model_training(user_id);
CREATE INDEX IF NOT EXISTS idx_model_training_provider ON model_training(provider);
CREATE INDEX IF NOT EXISTS idx_model_training_model_type ON model_training(model_type);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_model_training_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_model_training_updated_at
BEFORE UPDATE ON model_training
FOR EACH ROW
EXECUTE FUNCTION update_model_training_updated_at();
