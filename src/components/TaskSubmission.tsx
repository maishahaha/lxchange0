import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Upload, AlertCircle, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  referral_link: string;
  points_reward: number;
}

interface Submission {
  id: string;
  status: string;
  proof_url: string;
  created_at: string;
}

export function TaskSubmission() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTaskAndSubmission() {
      if (!taskId || !user) return;

      try {
        const [taskResponse, submissionResponse] = await Promise.all([
          supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single(),
          supabase
            .from('task_submissions')
            .select('*')
            .eq('task_id', taskId)
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        if (taskResponse.error) throw taskResponse.error;
        setTask(taskResponse.data);

        if (!submissionResponse.error) {
          setSubmission(submissionResponse.data);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        navigate('/tasks');
      }
    }

    loadTaskAndSubmission();
  }, [taskId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !user) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: submissionError } = await supabase
        .from('task_submissions')
        .insert({
          task_id: task.id,
          user_id: user.id,
          proof_url: proofUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (submissionError) throw submissionError;
      setSubmission(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!submission) return null;

    const statusConfig = {
      pending: {
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
        text: 'Pending Review',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200'
      },
      approved: {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: 'Approved',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      },
      rejected: {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: 'Rejected',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      }
    };

    const config = statusConfig[submission.status as keyof typeof statusConfig];

    return (
      <div className={`mt-6 p-4 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`font-medium ${config.textColor}`}>
            {config.text}
          </span>
        </div>
        <div className="mt-2">
          <a
            href={submission.proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            View Submitted Proof
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="text-sm text-gray-500 mt-1">
            Submitted on {new Date(submission.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Submit Task Completion</h1>
          
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="font-semibold text-lg mb-2 dark:text-white">{task.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{task.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Reward: {task.points_reward} points</span>
              <a
                href={task.referral_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Open Referral Link
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {getStatusDisplay()}

          {!submission && (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="proofUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Proof URL (Screenshot or completion evidence)
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      id="proofUrl"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://example.com/screenshot.png"
                      className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please upload your screenshot to an image hosting service and provide the link here
                  </p>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Proof'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}