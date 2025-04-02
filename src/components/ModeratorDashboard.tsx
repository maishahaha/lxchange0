import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface Submission {
  id: string;
  proof_url: string;
  created_at: string;
  tasks: {
    title: string;
    points_reward: number;
    creator_id: string;
  };
  profiles: {
    username: string;
  };
}

export function ModeratorDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        *,
        tasks (title, points_reward, creator_id),
        profiles (username)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading submissions:', error);
      return;
    }

    setSubmissions(data || []);
    setLoading(false);
  }

  const handleVerification = async (submissionId: string, approved: boolean) => {
    try {
      const { error } = await supabase.rpc('approve_task_submission', {
        submission_id: submissionId,
        approve: approved
      });

      if (error) throw error;
      await loadSubmissions();
    } catch (error) {
      console.error('Error processing verification:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Pending Submissions</h1>

      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No pending submissions</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">All submissions have been reviewed!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white">{submission.tasks.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted by {submission.profiles.username} • 
                      {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
                    {submission.tasks.points_reward} points
                  </span>
                </div>

                <div className="mb-6">
                  <a
                    href={submission.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    View Proof
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => handleVerification(submission.id, false)}
                    className="px-4 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerification(submission.id, true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}