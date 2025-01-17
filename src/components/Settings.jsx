import React, { useState } from 'react';
import { IoSave } from 'react-icons/io5';

const Settings = ({ settings, onUpdateSettings, onClearData }) => {
  const [formData, setFormData] = useState({
    pomodoroMinutes: settings?.pomodoroMinutes || 25,
    shortBreakMinutes: settings?.shortBreakMinutes || 5,
    longBreakMinutes: settings?.longBreakMinutes || 15,
    autoStartBreaks: settings?.autoStartBreaks || false,
    autoStartPomodoros: settings?.autoStartPomodoros || false,
    longBreakInterval: settings?.longBreakInterval || 4
  });
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [errors, setErrors] = useState({});

  const validateSettings = (data) => {
    const newErrors = {};
    
    if (data.pomodoroMinutes < 1 || data.pomodoroMinutes > 60) {
      newErrors.pomodoroMinutes = 'Pomodoro duration must be between 1 and 60 minutes';
    }
    
    if (data.shortBreakMinutes < 1 || data.shortBreakMinutes > 30) {
      newErrors.shortBreakMinutes = 'Short break must be between 1 and 30 minutes';
    }
    
    if (data.longBreakMinutes < 1 || data.longBreakMinutes > 60) {
      newErrors.longBreakMinutes = 'Long break must be between 1 and 60 minutes';
    }
    
    if (data.longBreakInterval < 1 || data.longBreakInterval > 10) {
      newErrors.longBreakInterval = 'Long break interval must be between 1 and 10 pomodoros';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : Number(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error for this field when it changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateSettings(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onUpdateSettings(formData);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Timer Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Timer Durations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Timer Durations</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pomodoro
              </label>
              <input
                type="number"
                name="pomodoroMinutes"
                value={formData.pomodoroMinutes}
                onChange={handleChange}
                min="1"
                max="60"
                className={`mt-1 block w-full rounded-md shadow-sm 
                  ${errors.pomodoroMinutes ? 'border-red-300' : 'border-gray-300'}
                  focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {errors.pomodoroMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.pomodoroMinutes}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Short Break
              </label>
              <input
                type="number"
                name="shortBreakMinutes"
                value={formData.shortBreakMinutes}
                onChange={handleChange}
                min="1"
                max="30"
                className={`mt-1 block w-full rounded-md shadow-sm 
                  ${errors.shortBreakMinutes ? 'border-red-300' : 'border-gray-300'}
                  focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {errors.shortBreakMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.shortBreakMinutes}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Long Break
              </label>
              <input
                type="number"
                name="longBreakMinutes"
                value={formData.longBreakMinutes}
                onChange={handleChange}
                min="1"
                max="60"
                className={`mt-1 block w-full rounded-md shadow-sm 
                  ${errors.longBreakMinutes ? 'border-red-300' : 'border-gray-300'}
                  focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {errors.longBreakMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.longBreakMinutes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Auto Start Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Auto Start Options</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoStartBreaks"
                checked={formData.autoStartBreaks}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Auto-start Breaks
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoStartPomodoros"
                checked={formData.autoStartPomodoros}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Auto-start Pomodoros
              </label>
            </div>
          </div>
        </div>

        {/* Long Break Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Long Break Interval
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="longBreakInterval"
              value={formData.longBreakInterval}
              onChange={handleChange}
              min="1"
              max="10"
              className={`block w-full rounded-md shadow-sm 
                ${errors.longBreakInterval ? 'border-red-300' : 'border-gray-300'}
                focus:border-indigo-500 focus:ring-indigo-500`}
            />
            {errors.longBreakInterval && (
              <p className="mt-1 text-sm text-red-600">{errors.longBreakInterval}</p>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Number of pomodoros before a long break
          </p>
        </div>

        {/* Submit Button with Feedback */}
        <div className="flex justify-end items-center">
          {showSaveMessage && (
            <span className="text-green-600 mr-4">Settings saved successfully!</span>
          )}
          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <IoSave className="w-4 h-4 mr-2" />
            Save Settings
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-red-800">Clear All Data</h4>
              <p className="text-sm text-red-600">
                This will reset all tasks and pomodoro history. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  onClearData();
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;