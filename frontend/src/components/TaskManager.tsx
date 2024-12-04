import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Task, Document, User, TaskCreateRequest } from '../types/api';

interface TaskManagerProps {
  document: Document;
  onClose: () => void;
  onTaskUpdate: () => void;
}

export default function TaskManager({ document, onClose, onTaskUpdate }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState<TaskCreateRequest>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    assigned_to_id: 0,
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [document.id]);

  const fetchTasks = async () => {
    try {
      const response = await api.get<Task[]>(`/documents/${document.id}/tasks`);
      setTasks(response.data);
    } catch (err: any) {
      setError('Failed to fetch tasks');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/documents/${document.id}/tasks`, newTask);
      setIsCreating(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: new Date().toISOString().split('T')[0],
        assigned_to_id: 0,
      });
      await fetchTasks();
      onTaskUpdate();
    } catch (err: any) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: Task['status']) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      await fetchTasks();
      onTaskUpdate();
    } catch (err: any) {
      setError('Failed to update task status');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-solarized-red';
      case 'medium':
        return 'text-solarized-yellow';
      case 'low':
        return 'text-solarized-green';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-solarized-yellow bg-opacity-10 text-solarized-yellow';
      case 'in_progress':
        return 'bg-solarized-blue bg-opacity-10 text-solarized-blue';
      case 'completed':
        return 'bg-solarized-green bg-opacity-10 text-solarized-green';
      case 'rejected':
        return 'bg-solarized-red bg-opacity-10 text-solarized-red';
    }
  };

  return (
    <div className="fixed inset-0 bg-solarized-base03 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-solarized-base03 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-solarized-base01 flex justify-between items-center">
          <h2 className="heading-2 text-solarized-base1">Tasks for {document.title}</h2>
          <button
            onClick={onClose}
            className="text-solarized-base1 hover:text-solarized-base0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="rounded-md bg-solarized-red bg-opacity-10 p-4 mb-4">
              <p className="text-solarized-red text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <button
              onClick={() => setIsCreating(true)}
              className="btn btn-primary"
            >
              Create New Task
            </button>
          </div>

          {isCreating && (
            <div className="card mb-4">
              <h3 className="heading-3 mb-4">Create New Task</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-solarized-base1 text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-solarized-base1 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-solarized-base1 text-sm font-medium mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-solarized-base1 text-sm font-medium mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-solarized-base1 text-sm font-medium mb-2">
                      Assign To
                    </label>
                    <select
                      value={newTask.assigned_to_id}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to_id: Number(e.target.value) })}
                      className="input"
                      required
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-solarized-base1">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="card">
              <p className="text-solarized-base1">No tasks found for this document.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-solarized-base1">{task.title}</h3>
                      <p className="mt-1 text-solarized-base0">{task.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-sm ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-solarized-base01">Assigned to:</p>
                      <p className="text-solarized-base1">{task.assigned_to.full_name}</p>
                    </div>
                    <div>
                      <p className="text-solarized-base01">Due date:</p>
                      <p className="text-solarized-base1">
                        {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-solarized-base01">Priority:</p>
                      <p className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-solarized-base01">Created by:</p>
                      <p className="text-solarized-base1">{task.assigned_by.full_name}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                        className="btn btn-primary text-sm"
                      >
                        Start Task
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          className="btn btn-primary text-sm"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'rejected')}
                          className="btn btn-secondary text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
