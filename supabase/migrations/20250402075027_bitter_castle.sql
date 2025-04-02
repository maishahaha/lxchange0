/*
  # Update Task System

  1. Changes
    - Remove points check constraint from tasks table
    - Add task approval column to task_submissions
    - Update RLS policies for task submissions
    - Add policy for task creators to approve submissions
*/

-- Add approver_id to task_submissions
ALTER TABLE task_submissions
ADD COLUMN approver_id uuid REFERENCES profiles(id);

-- Add policy for task creators to approve submissions
CREATE POLICY "Task creators can approve submissions"
  ON task_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_submissions.task_id
      AND tasks.creator_id = auth.uid()
    )
  );

-- Create function to approve task submission
CREATE OR REPLACE FUNCTION approve_task_submission(submission_id UUID, approve BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _task_id UUID;
  _user_id UUID;
  _points_reward INTEGER;
  _task_title TEXT;
BEGIN
  -- Get submission details
  SELECT 
    task_id,
    user_id,
    tasks.points_reward,
    tasks.title
  INTO
    _task_id,
    _user_id,
    _points_reward,
    _task_title
  FROM task_submissions
  JOIN tasks ON tasks.id = task_submissions.task_id
  WHERE task_submissions.id = submission_id;

  -- Update submission status
  UPDATE task_submissions
  SET 
    status = CASE WHEN approve THEN 'approved' ELSE 'rejected' END,
    approver_id = auth.uid()
  WHERE id = submission_id;

  -- If approved, add points and create transaction
  IF approve THEN
    -- Update user points
    UPDATE profiles
    SET points = points + _points_reward
    WHERE id = _user_id;

    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      amount,
      type,
      description
    ) VALUES (
      _user_id,
      _points_reward,
      'earned',
      'Completed task: ' || _task_title
    );
  END IF;
END;
$$;