import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Link, AlertCircle } from 'lucide-react';

export function CreateTask() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    referralLink: '',
    pointsReward: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: profileError, data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      if (profile.points < formData.pointsReward) {
        throw new Error('Insufficient points balance');
      }

      const { error: taskError } = await supabase.from('tasks').insert({
        creator_id: user?.id,
        title: formData.title,
        description: formData.description,
        referral_link: formData.referralLink,
        points_reward: formData.pointsReward,
      });

      if (taskError) throw taskError;

      const { error: transactionError } = await supabase.from('transactions').insert({
        user_id: user?.id,
        amount: formData.pointsReward,
        type: 'spent',
        description: `Created task: ${formData.title}`,
      });

      if (transactionError) throw transactionError;

      navigate('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="referralLink" className="block text-sm font-medium text-gray-700 mb-1">
              Referral Link
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="url"
                id="referralLink"
                value={formData.referralLink}
                onChange={(e) => setFormData({ ...formData, referralLink: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="pointsReward" className="block text-sm font-medium text-gray-700 mb-1">
              Points Reward
            </label>
            <input
              type="number"
              id="pointsReward"
              min="1"
              value={formData.pointsReward}
              onChange={(e) => setFormData({ ...formData, pointsReward: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
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
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}