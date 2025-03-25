import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Upload, AlertCircle, ExternalLink } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  referral_link: string;
  points_reward: number;
}

export function TaskSubmission() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTask() {
      if (!taskId) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error loading task:', error);
        navigate('/tasks');
        return;
      }

      setTask(data);
    }

    loadTask();
  }, [taskId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !user) return;

    setLoading(true);
    setError('');

    try {
      const { error: submissionError } = await supabase
        .from('task_submissions')
        .insert({
          task_id: task.id,
          user_id: user.id,
          proof_url: proofUrl,
          status: 'pending',
        });

      if (submissionError) throw submissionError;

      navigate('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Submit Task Completion</h1>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">{task.title}</h2>
            <p className="text-gray-600 mb-4">{task.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Reward: {task.points_reward} points</span>
              <a
                href={task.referral_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                Open Referral Link
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="proofUrl" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Please upload your screenshot to an image hosting service and provide the link here
              </p>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
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
        </div>
      </div>
    </div>
  );
}