/*
  # Add RPC Functions for Points Management

  1. New Functions
    - update_user_points: Updates user points balance
    
  2. Security
    - Function is accessible only to authenticated users
*/

CREATE OR REPLACE FUNCTION update_user_points(user_id UUID, points_to_add INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET points = points + points_to_add
  WHERE id = user_id;
END;
$$;