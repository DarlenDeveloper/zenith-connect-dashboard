-- Create the payments table (using user_id as the organization identifier)
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User who owns this payment (acting as org)
  flutterwave_tx_id BIGINT UNIQUE NOT NULL, -- Flutterwave's unique transaction ID
  flutterwave_tx_ref TEXT UNIQUE NOT NULL, -- Your unique reference for the transaction
  status TEXT NOT NULL, -- e.g., successful, failed, pending
  amount DECIMAL(10, 2) NOT NULL, -- Store amount accurately
  currency TEXT NOT NULL, -- e.g., NGN, USD, GHS
  payment_method TEXT, -- e.g., card, banktransfer, ussd
  processor_response JSONB, -- Store the raw response from Flutterwave if needed
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for faster querying
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_flutterwave_tx_id ON payments(flutterwave_tx_id);
CREATE INDEX idx_payments_flutterwave_tx_ref ON payments(flutterwave_tx_ref);
CREATE INDEX idx_payments_status ON payments(status);

-- Optional: Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now()); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own payments
CREATE POLICY "Users can view their own payments" 
ON payments
FOR SELECT
USING (user_id = auth.uid());

-- Allow backend (webhook) to insert payments (using service key)
-- Note: No explicit INSERT/UPDATE policy for users is defined here, assuming only backend writes.
-- If users need to initiate or update payments directly, add appropriate policies. 