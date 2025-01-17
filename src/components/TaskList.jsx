import React, { useState } from 'react';
import { 
  IoTimeOutline, 
  IoCheckmarkOutline, 
  IoAddOutline, 
  IoCalendarOutline, 
  IoFlagOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, isPast, isValid } from 'date-fns';

const TASK_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Sky', value: '#0284c7' },
];

const CATEGORIES = [
  { id: 'today', label: 'Today', icon: IoCalendarOutline },
  { id: 'tomorrow', label: 'Tomorrow', icon: IoCalendarOutline },
  { id: 'thisWeek', label: 'This Week', icon: IoCalendarOutline },
  { id: 'planned', label: 'Planned', icon: IoCalendarOutline },
  { id: 'important', label: 'Important', icon: IoFlagOutline },
  { id: 'someday', label: 'Someday', icon: IoCalendarOutline },
  { id: 'overdue', label: 'Overdue', icon: IoTimeOutline },
];

const TaskList = ({ tasks, onAddTask, onCompleteTask, currentTaskId, onSelectTask, onUpdateTask, onDeleteTask }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    estimatedPomodoros: 1,
    color: TASK_COLORS[0].value,
    deadline: new Date(),
    important: false,
    category: 'today'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      if (editingTask) {
        onUpdateTask(editingTask.id, {
          title: formData.title.trim(),
          estimatedPomodoros: formData.estimatedPomodoros,
          color: formData.color,
          deadline: formData.deadline,
          important: formData.important,
          category: formData.category
        });
        setEditingTask(null);
      } else {
        onAddTask(
          formData.title.trim(),
          formData.estimatedPomodoros,
          formData.color,
          {
            deadline: formData.deadline,
            category: formData.category,
            important: formData.important
          }
        );
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      estimatedPomodoros: 1,
      color: TASK_COLORS[0].value,
      deadline: new Date(),
      important: false,
      category: 'today'
    });
    setShowAddForm(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      estimatedPomodoros: task.estimatedPomodoros,
      color: task.color,
      deadline: new Date(task.deadline),
      important: task.important,
      category: task.category || 'someday'
    });
    setShowAddForm(true);
  };

  const categorizeTask = (task) => {
    if (!task.deadline) return 'someday';
    
    const deadline = new Date(task.deadline);
    if (!isValid(deadline)) return 'someday';
    
    if (isPast(deadline) && !isToday(deadline)) return 'overdue';
    if (isToday(deadline)) return 'today';
    if (isTomorrow(deadline)) return 'tomorrow';
    if (isThisWeek(deadline)) return 'thisWeek';
    if (isThisMonth(deadline)) return 'thisMonth';
    if (task.important) return 'important';
    return 'someday';
  };

  const filterTasksByCategory = (category) => {
    return tasks.filter(task => {
      const taskCategory = categorizeTask(task);
      if (category === 'overdue') {
        return taskCategory === 'overdue';
      }
      if (category === 'important') {
        return task.important;
      }
      return taskCategory === category;
    });
  };

  const TaskForm = ({ onSubmit, onCancel }) => (
    <form onSubmit={onSubmit} className="mb-6 space-y-4 bg-white p-4 rounded-lg shadow">
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        placeholder="Task title"
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="1"
          value={formData.estimatedPomodoros}
          onChange={(e) => setFormData(prev => ({ ...prev, estimatedPomodoros: Number(e.target.value) }))}
          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-600">estimated pomodoros</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Color:</span>
        <div className="flex gap-2">
          {TASK_COLORS.map(color => (
            <button
              key={color.value}
              type="button"
              className={`w-6 h-6 rounded-full border-2 ${
                formData.color === color.value ? 'border-gray-600' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
              title={color.name}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <IoCalendarOutline className="text-gray-500" />
          <input
            type="date"
            value={format(formData.deadline, 'yyyy-MM-dd')}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: new Date(e.target.value) }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.important}
            onChange={(e) => setFormData(prev => ({ ...prev, important: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Important</span>
        </label>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
        >
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );

  const TaskItem = ({ task }) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    return (
      <div
        className={`flex items-center justify-between rounded-lg border p-3 
          ${currentTaskId === task.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}
          ${task.completed ? 'bg-gray-50' : ''}
        `}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onCompleteTask(task.id)}
            className="text-gray-400 hover:text-indigo-600"
            style={{ color: task.completed ? task.color : undefined }}
          >
            <IoCheckmarkOutline className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {task.title}
              </h3>
              {task.important && (
                <IoFlagOutline className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex space-x-1">
                {Array.from({ length: task.estimatedPomodoros }).map((_, index) => (
                  <IoTimeOutline
                    key={index}
                    className={`w-4 h-4 ${
                      index < task.completedPomodoros
                        ? 'text-current'
                        : 'text-gray-300'
                    }`}
                    style={index < task.completedPomodoros ? { color: task.color } : {}}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {task.deadline ? format(new Date(task.deadline), 'MMM d') : 'No deadline'}
              </span>
            </div>
          </div>
        </div>
        {!task.completed && (
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: task.color }}
            />
            <button
              onClick={() => handleEdit(task)}
              className="p-1 text-gray-500 hover:text-indigo-600"
              title="Edit task"
            >
              <IoPencilOutline className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1 text-gray-500 hover:text-red-600"
              title="Delete task"
            >
              <IoTrashOutline className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTask(task.id)}
              className={`rounded px-3 py-1 text-sm ${
                currentTaskId === task.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {currentTaskId === task.id ? 'Selected' : 'Select'}
            </button>
          </div>
        )}

        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-medium mb-4">Delete Task?</h3>
              <p className="text-gray-500 mb-4">
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteTask(task.id);
                    setShowConfirmDelete(false);
                  }}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
        >
          <IoAddOutline size={16} className="mr-1" />
          Add Task
        </button>
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
            className={`flex items-center px-3 py-1 rounded-full text-sm
              ${formData.category === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <category.icon className="w-4 h-4 mr-1" />
            {category.label}
          </button>
        ))}
      </div>

      {showAddForm && (
        <TaskForm 
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {/* Task Lists by Category */}
      {CATEGORIES.map(category => {
        const filteredTasks = filterTasksByCategory(category.id);
        if (filteredTasks.length === 0) return null;

        return (
          <div key={category.id} className="mb-6">
            <h3 className="flex items-center text-lg font-semibold mb-3">
              <category.icon className="w-5 h-5 mr-2" />
              {category.label}
              <span className="ml-2 text-sm text-gray-500">
                ({filteredTasks.length})
              </span>
            </h3>
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;