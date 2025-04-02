/*
  # Fix Profiles RLS Policies

  1. Changes
    - Add INSERT policy for profiles table
    - Add policy for users to create their own profile
    - Ensure users can only manage their own profile data

  2. Security
    - Users can only insert/update their own profile
    - Users can read all profiles (needed for username display)
*/

-- First, remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);