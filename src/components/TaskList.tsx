import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  referral_link: string;
  points_reward: number;
  status: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

export function TaskList() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    async function loadTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles (username)
        `)
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      setTasks(data || []);
      setLoading(false);
    }

    loadTasks();
  }, [filter]);

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
        <div className="space-x-2">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Tasks
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed Tasks
          </button>
        </div>
        <Link
          to="/tasks/create"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {task.points_reward} points
                </span>
              </div>
              <p className="mt-2 text-gray-600 line-clamp-2">{task.description}</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.profiles.username}`}
                  alt="Creator avatar"
                  className="h-6 w-6 rounded-full"
                />
                <span className="ml-2 text-sm text-gray-600">{task.profiles.username}</span>
              </div>
              {task.status === 'active' && user?.id !== task.profiles.id && (
                <Link
                  to={`/tasks/${task.id}/submit`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  Complete Task
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            {filter === 'active' ? (
              <Clock className="h-6 w-6 text-gray-400" />
            ) : (
              <CheckCircle className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900">No {filter} tasks</h3>
          <p className="mt-1 text-gray-500">
            {filter === 'active'
              ? "There are no active tasks available right now. Why not create one?"
              : "You haven't completed any tasks yet. Check out the active tasks!"}
          </p>
        </div>
      )}
    </div>
  );
}