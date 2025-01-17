import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfHour, endOfHour, differenceInMinutes, isToday } from 'date-fns';
import { IoInformationCircleOutline } from 'react-icons/io5';

const CalendarView = ({ completedPomodoros, tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredCell, setHoveredCell] = useState(null);
  const scrollContainerRef = useRef(null);
  
  const { monthStart, monthEnd, daysInMonth, hours } = useMemo(() => ({
    monthStart: startOfMonth(currentDate),
    monthEnd: endOfMonth(currentDate),
    daysInMonth: eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }),
    hours: Array.from({ length: 24 }, (_, i) => i)
  }), [currentDate]);

  const tasksByColor = useMemo(() => {
    const grouped = {};
    tasks.forEach(task => {
      if (!grouped[task.color]) {
        grouped[task.color] = [];
      }
      grouped[task.color].push(task);
    });
    return grouped;
  }, [tasks]);

  const getPomodorosForHour = (day, hour) => {
    return completedPomodoros.filter(pomo => {
      const pomoDate = new Date(pomo.timestamp);
      const pomoHour = pomoDate.getHours();
      const pomoDay = pomoDate.getDate();
      return pomoDay === day.getDate() && pomoHour === hour;
    }).map(pomo => ({
      ...pomo,
      // Calculate start and end minutes within the hour
      startMinute: new Date(pomo.timestamp).getMinutes(),
      endMinute: Math.min(60, new Date(pomo.timestamp).getMinutes() + (pomo.duration / 60))
    }));
  };

  const CellTooltip = ({ day, hour, pomodoros }) => {
    if (!pomodoros.length) return null;

    // Group pomodoros by task
    const taskSummaries = pomodoros.reduce((acc, pomo) => {
      const task = tasks.find(t => t.id === pomo.taskId);
      if (task) {
        if (!acc[task.id]) {
          acc[task.id] = {
            title: task.title,
            color: task.color || pomo.taskColor,
            minutes: 0,
            sessions: []
          };
        }
        const duration = (pomo.endMinute - pomo.startMinute);
        acc[task.id].minutes += duration;
        acc[task.id].sessions.push({
          startTime: `${String(hour).padStart(2, '0')}:${String(pomo.startMinute).padStart(2, '0')}`,
          duration: Math.round(duration)
        });
      }
      return acc;
    }, {});

    return (
      <div className="absolute z-10 p-4 bg-white rounded-lg shadow-xl border border-gray-200 text-sm -translate-y-full -translate-x-1/2 left-1/2 mb-2 min-w-[200px]">
        <div className="font-medium mb-3 border-b pb-2">
          {format(day, 'MMMM d')} at {String(hour).padStart(2, '0')}:00
        </div>
        {Object.values(taskSummaries).map((task, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="flex items-center gap-2 font-medium">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: task.color }}
              />
              <span>{task.title}</span>
            </div>
            <div className="ml-5 mt-1 space-y-1">
              {task.sessions.map((session, i) => (
                <div key={i} className="text-xs text-gray-600">
                  Started at {session.startTime} ({session.duration}m)
                </div>
              ))}
              <div className="text-xs font-medium text-gray-700 pt-1 border-t">
                Total: {Math.round(task.minutes)} minutes
              </div>
            </div>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t text-xs text-gray-500">
          Total focus time: {Math.round(Object.values(taskSummaries).reduce((sum, task) => sum + task.minutes, 0))} minutes
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const today = new Date();
      const dayIndex = daysInMonth.findIndex(day => isToday(day));
      if (dayIndex !== -1) {
        const rowHeight = 24; // height of each row in pixels
        const containerHeight = scrollContainerRef.current.clientHeight;
        const scrollPosition = (dayIndex * rowHeight) - (containerHeight / 2) + (rowHeight / 2);
        scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
      }
    }
  }, [daysInMonth]);

  return (
    <div className="bg-white rounded-lg p-2 flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-none">
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-sm font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="text-xs text-gray-500">
            Showing pomodoro activity
          </div>
        </div>

        {/* Legend */}
        {Object.keys(tasksByColor).length > 0 && (
          <div className="flex flex-wrap gap-1 items-center text-xs mb-1">
            {Object.entries(tasksByColor).sort((a, b) => {
              const latestTaskA = a[1].reduce((latest, task) => new Date(task.createdAt) > new Date(latest.createdAt) ? task : latest, a[1][0]);
              const latestTaskB = b[1].reduce((latest, task) => new Date(task.createdAt) > new Date(latest.createdAt) ? task : latest, b[1][0]);
              return new Date(latestTaskB.createdAt) - new Date(latestTaskA.createdAt);
            }).map(([color, tasksWithColor]) => (
              <div key={color} className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600">
                  {tasksWithColor.map(t => t.title).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex space-x-1 mb-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="px-2 py-1 rounded hover:bg-gray-100 text-xs"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 py-1 rounded hover:bg-gray-100 text-xs"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="px-2 py-1 rounded hover:bg-gray-100 text-xs"
          >
            →
          </button>
        </div>
      </div>

      {/* Scrollable Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto h-[450px]"
        > 
          <div className="min-w-full">
            {/* Hours header - Remains fixed */}
            <div className="grid grid-cols-[40px_repeat(24,1fr)] sticky top-0 bg-white z-10">
              <div className="text-xs font-medium text-gray-500 pr-1">
                Day
              </div>
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="text-center text-xs font-medium text-gray-500"
                >
                  {String(hour).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Days and hours grid - Scrollable */}
            <div className="border-l border-r border-gray-200">
              {daysInMonth.map((day, index) => (
                <div 
                  key={day.toISOString()} 
                  className={`
                    grid grid-cols-[40px_repeat(24,1fr)] 
                    hover:bg-gray-50
                    border-b border-gray-200
                    ${index === 0 ? 'border-t' : ''}
                  `}
                >
                  <div className={`
                    text-xs font-medium 
                    flex items-center justify-end 
                    pr-1 border-r border-gray-200
                    ${isToday(day) ? 'text-indigo-600' : 'text-gray-700'}
                  `}>
                    {format(day, 'd')}
                    {isToday(day) && <span className="ml-1 text-[10px]">(Today)</span>}
                  </div>
                  {hours.map(hour => {
                    const pomodoros = getPomodorosForHour(day, hour);
                    
                    return (
                      <div
                        key={hour}
                        className={`
                          h-6 relative overflow-hidden
                          ${hour % 2 === 0 ? 'border-l border-gray-300' : ''}
                        `}
                        onMouseEnter={() => setHoveredCell({ day, hour })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {pomodoros.map((pomo, index) => {
                          const task = tasks.find(t => t.id === pomo.taskId);
                          const width = ((pomo.endMinute - pomo.startMinute) / 60) * 100;
                          const left = (pomo.startMinute / 60) * 100;
                          
                          return (
                            <div
                              key={index}
                              className="absolute inset-y-0 transition-opacity duration-200"
                              style={{ 
                                backgroundColor: task?.color || pomo.taskColor,
                                opacity: 0.8,
                                width: `${width}%`,
                                left: `${left}%`
                              }}
                            />
                          );
                        })}
                        {hoveredCell?.day === day && hoveredCell?.hour === hour && pomodoros.length > 0 && (
                          <CellTooltip day={day} hour={hour} pomodoros={pomodoros} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile message */}
      <div className="flex-none mt-2 text-xs text-gray-500 lg:hidden">
        <IoInformationCircleOutline className="inline-block mr-1" />
        Scroll horizontally to view full calendar
      </div>
    </div>
  );
};

export default CalendarView;