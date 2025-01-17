import React, { useState } from 'react';
import { format, isToday, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';
import { IoTimeOutline, IoCheckmarkDoneOutline, IoListOutline } from 'react-icons/io5';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CalendarView from './CalendarView';

const Analytics = ({ tasks = [], completedPomodoros = [] }) => {
  const [sidebarView, setSidebarView] = useState('today');
  
  // Get today's tasks
  const todaysTasks = tasks.filter(task => {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    return deadline && isToday(deadline);
  });

  const completedTodaysTasks = todaysTasks.filter(task => task.completed);
  const completionPercentage = todaysTasks.length === 0 ? 100 : 
    Math.round((completedTodaysTasks.length / todaysTasks.length) * 100);

  // Calculate total focus time for today
  const todaysFocusTime = completedPomodoros
    .filter(pomo => isToday(new Date(pomo.timestamp)))
    .reduce((total, pomo) => total + (pomo.duration / 60), 0);

  // Calculate total stats
  const totalStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.completed).length,
    totalPomodoros: completedPomodoros.length,
    totalFocusHours: Math.round(completedPomodoros.reduce((total, pomo) => total + (pomo.duration / 3600), 0))
  };

  // Weekly report data
  const getWeeklyData = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = subDays(today, 6 - index);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayPomodoros = completedPomodoros.filter(pomo => {
        const pomoDate = new Date(pomo.timestamp);
        return pomoDate >= dayStart && pomoDate <= dayEnd;
      });

      const focusMinutes = dayPomodoros.reduce((total, pomo) => {
        return total + (pomo.duration / 60);
      }, 0);

      const taskBreakdown = dayPomodoros.reduce((acc, pomo) => {
        if (pomo.taskId) {
          const task = tasks.find(t => t.id === pomo.taskId);
          if (task) {
            if (!acc[task.id]) {
              acc[task.id] = {
                taskName: task.title,
                color: task.color,
                count: 0,
                minutes: 0
              };
            }
            acc[task.id].count++;
            acc[task.id].minutes += pomo.duration / 60;
          }
        } else {
          if (!acc['unassigned']) {
            acc['unassigned'] = {
              taskName: 'Unassigned',
              color: '#4F46E5',
              count: 0,
              minutes: 0
            };
          }
          acc['unassigned'].count++;
          acc['unassigned'].minutes += pomo.duration / 60;
        }
        return acc;
      }, {});

      return {
        day: format(date, 'EEE'),
        date: date,
        focusTime: Math.round(focusMinutes),
        taskBreakdown: Object.values(taskBreakdown)
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Content Grid - Top Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Calendar View - Left */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-4" style={{ height: '600px' }}>
            <CalendarView 
              completedPomodoros={completedPomodoros} 
              tasks={tasks}
            />
          </div>
        </div>

        {/* Right Panel - Reports and Today's Stats */}
        <div className="space-y-6">
          {/* Reports Panel */}
          <div className="bg-white rounded-lg shadow p-4">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {sidebarView === 'today' ? "Today's Progress" : 'Weekly Focus Time'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSidebarView('today')}
                  className={`px-3 py-1 rounded text-sm ${
                    sidebarView === 'today'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setSidebarView('weekly')}
                  className={`px-3 py-1 rounded text-sm ${
                    sidebarView === 'weekly'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            {/* Content based on selected view */}
            {sidebarView === 'today' ? (
              <div className="space-y-4">
                {/* Today's Tasks List */}
                <div className="space-y-3">
                  {todaysTasks.length === 0 ? (
                    <p className="text-gray-500">No tasks due today</p>
                  ) : (
                    todaysTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex flex-col p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: task.color }}
                            />
                            <span className={task.completed ? 'line-through text-gray-500' : ''}>
                              {task.title}
                            </span>
                          </div>
                          <div className={`text-sm ${task.completed ? 'text-green-600' : 'text-gray-500'}`}>
                            {task.completed ? 'Completed' : 'Pending'}
                          </div>
                        </div>
                        {/* Task Progress Bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{task.completedPomodoros}/{task.totalPomodoros} pomodoros</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(task.completedPomodoros / task.totalPomodoros) * 100}%`,
                                backgroundColor: task.color
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Today's Focus Time Summary */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Focus Time Today</div>
                  <div className="text-2xl font-bold text-indigo-600 mt-1">
                    {Math.round(todaysFocusTime)} minutes
                  </div>
                </div>
              </div>
            ) : (
              /* Weekly View Chart */
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getWeeklyData()}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'Minutes', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 12 }
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 shadow-lg rounded-lg border">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm text-gray-600">
                                Total: {payload[0].value} minutes
                              </p>
                              {payload[0].payload.taskBreakdown.map((task, index) => (
                                <div key={index} className="flex items-center mt-1">
                                  <div 
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: task.color }}
                                  />
                                  <span className="text-xs">
                                    {task.taskName}: {task.minutes} min
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="focusTime" 
                      fill="#4F46E5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Today's Stats - 2 cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Today's Focus Time */}
            <div className="bg-indigo-50 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Today's Focus Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(todaysFocusTime)}
                    <span className="text-sm font-normal text-gray-500 ml-1">minutes</span>
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <IoTimeOutline className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Tasks Due Today */}
            <div className="bg-green-50 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Tasks Due Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {completedTodaysTasks.length}/{todaysTasks.length}
                    <span className="text-sm font-normal text-gray-500 ml-1">tasks</span>
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <IoCheckmarkDoneOutline className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Stats - Bottom Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total Tasks */}
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalStats.completedTasks}/{totalStats.totalTasks}
                <span className="text-sm font-normal text-gray-500 ml-1">completed</span>
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <IoListOutline className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Pomodoros */}
        <div className="bg-amber-50 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Pomodoros</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalStats.totalPomodoros}
                <span className="text-sm font-normal text-gray-500 ml-1">completed</span>
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <IoTimeOutline className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Total Focus Time */}
        <div className="bg-teal-50 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Focus Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalStats.totalFocusHours}
                <span className="text-sm font-normal text-gray-500 ml-1">hours</span>
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <IoTimeOutline className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
