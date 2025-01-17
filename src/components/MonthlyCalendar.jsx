import React from 'react';
import { format, getDaysInMonth, startOfMonth, getHours } from 'date-fns';

const MonthlyCalendar = ({ completedPomodoros }) => {
  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  
  // Create array of days in month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Create array of hours
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Group pomodoros by day and hour
  const pomodorosByDayAndHour = completedPomodoros.reduce((acc, pomodoro) => {
    const date = new Date(pomodoro.timestamp);
    const day = date.getDate();
    const hour = date.getHours();
    
    if (!acc[day]) {
      acc[day] = {};
    }
    if (!acc[day][hour]) {
      acc[day][hour] = [];
    }
    acc[day][hour].push(pomodoro);
    return acc;
  }, {});

  return (
    <div className="monthly-calendar">
      <div className="calendar-header">
        <div className="hour-labels">
          {hours.map(hour => (
            <div key={hour} className="hour-label">
              {String(hour).padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
      <div className="calendar-body">
        {days.map(day => (
          <div key={day} className="calendar-row">
            <div className="day-label">
              {String(day).padStart(2, '0')}
            </div>
            {hours.map(hour => {
              const pomodoros = pomodorosByDayAndHour[day]?.[hour] || [];
              const backgroundColor = pomodoros[0]?.taskColor || 'transparent';
              const count = pomodoros.length;
              
              return (
                <div
                  key={`${day}-${hour}`}
                  className="calendar-cell"
                  style={{ 
                    backgroundColor,
                    opacity: count > 0 ? 0.8 : 0.1
                  }}
                  title={count > 0 ? `${count} pomodoro(s) at ${String(hour).padStart(2, '0')}:00` : ''}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyCalendar; 