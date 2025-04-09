import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ExternalLink, Clock, CheckCircle, XCircle, Plus, ListChecks, UserCheck } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  referral_link: string;
  points_reward: number;
  status: string;
  created_at: string;
  creator_id: string;
  profiles: {
    username: string;
  };
  task_submissions: {
    id: string;
    status: string;
    user_id: string;
    proof_url: string;
    created_at: string;
    profiles: {
      username: string;
    };
  }[];
}

export function TaskList() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [view, setView] = useState<'all' | 'created'>(
    searchParams.get('view') === 'created' ? 'created' : 'all'
  );

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [filter, view, user]);

  async function loadTasks() {
    try {
      setLoading(true);
      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles (username),
          task_submissions (
            id,
            status,
            user_id,
            proof_url,
            created_at,
            profiles (username)
          )
        `);

      if (view === 'created') {
        // Load tasks created by the current user
        query = query.eq('creator_id', user?.id);
      } else {
        // Load tasks created by others and filter by status
        query = query
          .neq('creator_id', user?.id)
          .eq('status', filter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Process the tasks to ensure task_submissions is always an array
      const processedTasks = (data || []).map(task => ({
        ...task,
        task_submissions: task.task_submissions || []
      }));

      setTasks(processedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleVerification = async (submissionId: string, approved: boolean) => {
    try {
      const { error } = await supabase.rpc('approve_task_submission', {
        submission_id: submissionId,
        approve: approved
      });

      if (error) throw error;

      // Reload tasks after verification
      await loadTasks();
    } catch (error) {
      console.error('Error processing verification:', error);
      alert('Failed to process verification. Please try again.');
    }
  };

  const handleViewChange = (newView: 'all' | 'created') => {
    setView(newView);
    setSearchParams({ view: newView });
    if (newView === 'created') {
      // Reset filter when switching to created tasks view
      setFilter('active');
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
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleViewChange('all')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                view === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <ListChecks className="h-5 w-5" />
              Available Tasks
            </button>
            <button
              onClick={() => handleViewChange('created')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                view === 'created'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <UserCheck className="h-5 w-5" />
              My Tasks
            </button>
          </div>
          {view === 'all' && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'completed'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Completed
              </button>
            </div>
          )}
        </div>
        <Link
          to="/tasks/create"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Task
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">{task.title}</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">{task.description}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
                      {task.points_reward} points
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {view === 'all' && (
                  <Link
                    to={`/tasks/${task.id}/submit`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Complete Task
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {view === 'created' && (
                <div className="mt-6 border-t dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-semibold mb-4 dark:text-white">
                    Submissions ({task.task_submissions.length})
                  </h4>
                  <div className="space-y-4">
                    {task.task_submissions.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No submissions yet
                      </p>
                    ) : (
                      task.task_submissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${submission.profiles.username}`}
                                alt="Submitter avatar"
                                className="h-6 w-6 rounded-full"
                              />
                              <span className="font-medium dark:text-white">
                                {submission.profiles.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {submission.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleVerification(submission.id, false)}
                                    className="px-3 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleVerification(submission.id, true)}
                                    className="px-3 py-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center gap-1"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                  </button>
                                </>
                              ) : (
                                <span className={`flex items-center gap-1 ${
                                  submission.status === 'approved'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {submission.status === 'approved' ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(submission.created_at).toLocaleDateString()}
                            </span>
                            <a
                              href={submission.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View Proof
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              {view === 'created' ? (
                <UserCheck className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              ) : (
                <ListChecks className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {view === 'created'
                ? "You haven't created any tasks yet"
                : `No ${filter} tasks available`}
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {view === 'created'
                ? "Create your first task to start getting referrals"
                : filter === 'active'
                ? "There are no active tasks available right now"
                : "You haven't completed any tasks yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}