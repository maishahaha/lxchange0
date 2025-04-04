import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';

interface Submission {
  id: string;
  proof_url: string;
  created_at: string;
  status: string;
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
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (!user) return;
    loadSubmissions();
  }, [user, filter]);

  async function loadSubmissions() {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        *,
        tasks (title, points_reward, creator_id),
        profiles (username)
      `)
      .eq('status', filter)
      .eq('tasks.creator_id', user?.id)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Task Submissions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'approved'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'rejected'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            {getStatusIcon(filter)}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No {filter} submissions
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {filter === 'pending'
              ? 'No pending submissions to review'
              : filter === 'approved'
              ? 'No approved submissions yet'
              : 'No rejected submissions'}
          </p>
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
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                    <span className={`text-sm font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
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

                {submission.status === 'pending' && (
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
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}