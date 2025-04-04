/*
  # Add Notifications System

  1. New Tables
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - title (text)
      - message (text)
      - type (text)
      - read (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS on notifications table
    - Add policies for users to read their own notifications
    - Add function to create notifications on task submission
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update the approve_task_submission function to create notifications
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
  _creator_id UUID;
BEGIN
  -- Get submission details
  SELECT 
    task_id,
    user_id,
    tasks.points_reward,
    tasks.title,
    tasks.creator_id
  INTO
    _task_id,
    _user_id,
    _points_reward,
    _task_title,
    _creator_id
  FROM task_submissions
  JOIN tasks ON tasks.id = task_submissions.task_id
  WHERE task_submissions.id = submission_id;

  -- Update submission status
  UPDATE task_submissions
  SET 
    status = CASE WHEN approve THEN 'approved' ELSE 'rejected' END,
    approver_id = auth.uid()
  WHERE id = submission_id;

  -- If approved, add points and create notifications
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

    -- Create notification for user
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      _user_id,
      'Task Approved!',
      'Your submission for "' || _task_title || '" has been approved. You earned ' || _points_reward || ' points!',
      'success'
    );
  ELSE
    -- Create rejection notification
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      _user_id,
      'Task Submission Rejected',
      'Your submission for "' || _task_title || '" was not approved. Please review the requirements and try again.',
      'error'
    );
  END IF;
END;
$$;

-- Create function to create notification on new submission
CREATE OR REPLACE FUNCTION create_submission_notification()
RETURNS TRIGGER AS $$
DECLARE
  _task_title TEXT;
  _creator_id UUID;
  _submitter_username TEXT;
BEGIN
  -- Get task details
  SELECT title, creator_id
  INTO _task_title, _creator_id
  FROM tasks
  WHERE id = NEW.task_id;

  -- Get submitter username
  SELECT username
  INTO _submitter_username
  FROM profiles
  WHERE id = NEW.user_id;

  -- Create notification for task creator
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type
  ) VALUES (
    _creator_id,
    'New Task Submission',
    _submitter_username || ' has submitted proof for your task "' || _task_title || '"',
    'info'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new submissions
CREATE TRIGGER on_task_submission
  AFTER INSERT ON task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION create_submission_notification();