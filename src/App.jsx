import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [completedPomodoros, setCompletedPomodoros] = useState(() => {
    const savedPomodoros = localStorage.getItem('completedPomodoros');
    return savedPomodoros ? JSON.parse(savedPomodoros) : [];
  });

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    const defaultSettings = {
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      longBreakInterval: 4
    };
    
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        ...defaultSettings,
        ...parsed
      };
    }
    
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('completedPomodoros', JSON.stringify(completedPomodoros));
  }, [completedPomodoros]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const addTask = (taskDetails) => {
    const newTask = {
      id: Date.now().toString(),
      title: taskDetails.title || '',
      description: taskDetails.description || '',
      color: taskDetails.color || '#4F46E5',
      completed: false,
      important: taskDetails.important || false,
      deadline: taskDetails.deadline || null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      totalPomodoros: taskDetails.totalPomodoros || 1,
      completedPomodoros: 0,
      ...taskDetails
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (updatedTask) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === updatedTask.id ? {
        ...task,
        ...updatedTask,
        completedAt: updatedTask.completed && !task.completed 
          ? new Date().toISOString() 
          : updatedTask.completed ? task.completedAt : null
      } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const addCompletedPomodoro = (taskId = null) => {
    const newPomodoro = {
      id: Date.now().toString(),
      taskId,
      timestamp: new Date().toISOString(),
      duration: settings.pomodoroMinutes * 60,
      taskColor: taskId ? (tasks.find(t => t.id === taskId)?.color || '#4F46E5') : '#4F46E5'
    };
    setCompletedPomodoros([...completedPomodoros, newPomodoro]);
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const clearAllData = () => {
    // Clear localStorage
    localStorage.removeItem('tasks');
    localStorage.removeItem('completedPomodoros');
    
    // Reset states
    setTasks([]);
    setCompletedPomodoros([]);
    
    // Keep settings but reset to defaults if needed
    const defaultSettings = {
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      longBreakInterval: 4
    };
    setSettings(defaultSettings);
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  tasks={tasks}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  settings={settings}
                  onCompletedPomodoro={addCompletedPomodoro}
                  completedPomodoros={completedPomodoros}
                />
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <Analytics 
                  tasks={tasks}
                  completedPomodoros={completedPomodoros}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={
                <Settings 
                  settings={settings}
                  onUpdateSettings={updateSettings}
                  onClearData={clearAllData}
                />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

