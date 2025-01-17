import React, { useState, useRef } from 'react';
import { format, isToday, isTomorrow, isThisWeek, isPast, addDays, endOfWeek, endOfDay } from 'date-fns';
import { IoAdd, IoPlay, IoTimer, IoClose, IoPencil, IoTrash, IoCheckmarkCircleOutline, IoExpand } from 'react-icons/io5';
import Timer from './Timer';

const Home = ({ tasks = [], onAddTask, onUpdateTask, onDeleteTask, settings, onCompletedPomodoro, completedPomodoros = [] }) => {
  const [isTimerFullScreen, setIsTimerFullScreen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedView, setSelectedView] = useState('Today');
  const timerRef = useRef(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const filterTags = {
    Today: task => !task.completed && (!task.deadline || isToday(new Date(task.deadline))),
    Tomorrow: task => !task.completed && isTomorrow(new Date(task.deadline)),
    'This Week': task => {
      if (!task.deadline || task.completed) return false;
      const taskDate = new Date(task.deadline);
      return isThisWeek(taskDate) && !isToday(taskDate) && !isTomorrow(taskDate);
    },
    Planned: task => !task.completed && task.deadline && !isPast(new Date(task.deadline)),
    Important: task => !task.completed && task.important,
    Someday: task => !task.completed && !task.deadline,
    Overdue: task => !task.completed && task.deadline && isPast(new Date(task.deadline)) && !isToday(new Date(task.deadline)),
    Completed: task => task.completed
  };

  const startPomodoro = (task) => {
    setSelectedTask(task);
    setIsTimerFullScreen(true);
    if (timerRef.current) {
      timerRef.current.resetAndStart(task);
    }
  };

  const getFilteredTasks = (view) => {
    return tasks.filter(filterTags[view] || (() => true));
  };

  const getTodayStats = () => {
    const todayTasks = getFilteredTasks('Today');
    const completedTodayTasks = tasks.filter(task => 
      task.completed && 
      task.completedAt && 
      isToday(new Date(task.completedAt))
    );
    
    const todayPomodoros = completedPomodoros.filter(pomo => 
      isToday(new Date(pomo.timestamp))
    );

    const totalMinutes = todayPomodoros.length * settings.pomodoroMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return {
      focusTime: `${hours}h ${minutes}m`,
      completed: `${completedTodayTasks.length}/${todayTasks.length}`,
      pomodoros: todayPomodoros.length
    };
  };

  const stats = getTodayStats();

  const handleAddTask = () => {
    if (tasks.length >= 50) {
      alert('You can only have up to 50 active tasks');
      return;
    }

    // Set default deadline based on selected view
    let deadline = null;
    switch (selectedView) {
      case 'Tomorrow':
        deadline = addDays(new Date(), 1).toISOString();
        break;
      case 'This Week':
        deadline = endOfWeek(new Date()).toISOString();
        break;
      case 'Today':
        deadline = endOfDay(new Date()).toISOString();
        break;
      default:
        break;
    }

    const newTask = {
      title: '',
      description: '',
      color: '#4F46E5',
      important: selectedView === 'Important',
      deadline,
      totalPomodoros: 1,
      completedPomodoros: 0
    };

    setEditingTask(null); // Reset editing task to ensure we're adding new
    setShowTaskModal(true);
    setFormData(newTask); // Set initial form data
  };

  const TaskModal = ({ task, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      title: task?.title || '',
      description: task?.description || '',
      color: task?.color || '#4F46E5',
      important: task?.important || false,
      deadline: task?.deadline || null,
      totalPomodoros: task?.totalPomodoros || 1,
      completedPomodoros: task?.completedPomodoros || 0
    });

    // Add deadline handling
    const handleDeadlineChange = (date) => {
      setFormData(prev => ({
        ...prev,
        deadline: date ? new Date(date).toISOString() : null
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.title.trim()) {
        const taskData = {
          ...formData,
          id: task?.id || Date.now().toString(),
          createdAt: task?.createdAt || new Date().toISOString(),
          completedAt: task?.completedAt || null,
          completed: task?.completed || false,
          completedPomodoros: task?.completedPomodoros || 0,
          totalPomodoros: parseInt(formData.totalPomodoros) || 1
        };
        onSave(taskData);
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {task ? 'Edit Task' : 'New Task'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-md border-gray-300"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.important}
                onChange={e => setFormData({ ...formData, important: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Mark as Important
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Pomodoros
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.totalPomodoros}
                onChange={e => setFormData({ ...formData, totalPomodoros: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline ? format(new Date(formData.deadline), 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {task ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Tags */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Views</h2>
        {Object.keys(filterTags).map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedView(tag)}
            className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
              selectedView === tag 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-6 space-y-4">
          {/* Today's Overview Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedView} - {format(new Date(), 'MMMM d, yyyy')}
              </h2>
              <span className="text-sm text-gray-500">
                {getFilteredTasks(selectedView).length} tasks remaining
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Focus Time</p>
                <p className="text-xl font-semibold">{stats.focusTime}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold">{stats.completed}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Pomodoros</p>
                <p className="text-xl font-semibold">{stats.pomodoros}</p>
              </div>
            </div>
          </div>

          {/* Add Task Card */}
          {selectedView !== 'Completed' && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <button
                onClick={handleAddTask}
                className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-200"
              >
                <IoAdd className="w-5 h-5" />
                <span>Add New Task for {selectedView}</span>
              </button>
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-2">
            {getFilteredTasks(selectedView).map(task => (
              <div
                key={task.id}
                className={`
                  bg-white rounded-lg shadow-sm p-4 flex items-center justify-between
                  ${selectedTask?.id === task.id ? 'ring-2 ring-indigo-500' : ''}
                  ${task.completed ? 'opacity-75' : ''}
                `}
                style={{ borderLeft: `4px solid ${task.color}` }}
              >
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onUpdateTask({
                      ...task,
                      completed: !task.completed,
                      completedAt: !task.completed ? new Date().toISOString() : null
                    })}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: task.totalPomodoros }).map((_, index) => (
                          <div
                            key={index}
                            className={`w-4 h-4 rounded-full border ${
                              index < task.completedPomodoros
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-300'
                            }`}
                          >
                            <IoTimer 
                              className={`w-full h-full ${
                                index < task.completedPomodoros
                                  ? 'text-white'
                                  : 'text-gray-300'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                      {task.completed && task.completedAt && (
                        <span className="text-xs text-gray-500">
                          Completed {format(new Date(task.completedAt), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedView === 'Completed' ? (
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this completed task?')) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="p-2 rounded-full hover:bg-gray-100"
                      title="Delete Task"
                    >
                      <IoTrash className="w-5 h-5 text-red-600" />
                    </button>
                  ) : (
                    !task.completed && (
                      <>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className={`
                            p-2 rounded-full hover:bg-gray-100
                            ${selectedTask?.id === task.id ? 'bg-indigo-50' : ''}
                          `}
                          title="Select Task"
                        >
                          <IoCheckmarkCircleOutline 
                            className={`w-5 h-5 ${
                              selectedTask?.id === task.id ? 'text-indigo-600' : 'text-gray-400'
                            }`}
                          />
                        </button>
                        {selectedTask?.id === task.id && (
                          <button
                            onClick={() => startPomodoro(task)}
                            className="p-2 rounded-full hover:bg-gray-100"
                            title="Start Pomodoro"
                          >
                            <IoPlay className="w-5 h-5 text-indigo-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setShowTaskModal(true);
                          }}
                          className="p-2 rounded-full hover:bg-gray-100"
                          title="Edit Task"
                        >
                          <IoPencil className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this task?')) {
                              onDeleteTask(task.id);
                            }
                          }}
                          className="p-2 rounded-full hover:bg-gray-100"
                          title="Delete Task"
                        >
                          <IoTrash className="w-5 h-5 text-red-600" />
                        </button>
                      </>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div class="w-[130px] h-screen bg-gray-100">
</div>

      {/* Timer Card */}
      <div
        className={`fixed transition-all duration-300 ease-in-out ${
          isTimerFullScreen
            ? 'inset-0 bg-white z-50'
            : 'bottom-6 right-6 w-auto rounded-xl shadow-lg overflow-hidden group'
        }`}
      >
        {/* Fullscreen button that appears on hover */}
        {!isTimerFullScreen && (
          <button
            onClick={() => setIsTimerFullScreen(true)}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md 
                     hover:bg-gray-50 z-10 opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200"
          >
            <IoExpand className="w-4 h-4 text-gray-600" />
          </button>
        )}
        
        <Timer
          ref={timerRef}
          isFullScreen={isTimerFullScreen}
          onClose={() => setIsTimerFullScreen(false)}
          selectedTask={selectedTask}
          settings={settings}
          onCompletedPomodoro={onCompletedPomodoro}
          onUpdateTask={onUpdateTask}
        />
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={(formData) => {
            if (editingTask?.id) {
              // Editing existing task
              onUpdateTask({
                ...editingTask,
                ...formData
              });
            } else {
              // Adding new task
              onAddTask({
                ...formData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                completedAt: null,
                completed: false,
                completedPomodoros: 0
              });
            }
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Home; 