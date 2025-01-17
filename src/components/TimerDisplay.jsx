import React, { useEffect } from 'react';
import { Timer, Coffee, Moon, Clock } from 'lucide-react';

const TimerDisplay = ({ state }) => {
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  const duration = getDurationForMode(state.mode);
  const progress = ((duration - state.timeRemaining) / duration) * 100;

  useEffect(() => {
    let interval;
    if (state.isRunning && state.timeRemaining > 0) {
      interval = setInterval(() => {
        if (state.timeRemaining > 0) {
          state.setTimeRemaining(prev => prev - 1);
        } else {
          clearInterval(interval);
          state.onTimerComplete();
        }
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isRunning, state.timeRemaining]);

  function getDurationForMode(mode) {
    const settings = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
    switch (mode) {
      case 'work':
        return settings.workDuration || 25 * 60;
      case 'shortBreak':
        return settings.shortBreakDuration || 5 * 60;
      case 'longBreak':
        return settings.longBreakDuration || 15 * 60;
      default:
        return 25 * 60;
    }
  }

  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
      <div className="relative flex flex-col items-center justify-center h-[min(80vw,400px)] w-[min(80vw,400px)] p-4 sm:p-8 rounded-full shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="1"
            fill="transparent"
            className="text-gray-300"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="282.743"
            strokeDashoffset={282.743 - (282.743 * progress) / 100}
            className="transition-[stroke-dashoffset] duration-1000 ease-in-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={getGradientColors(state.mode)[0]} />
              <stop offset="100%" stopColor={getGradientColors(state.mode)[1]} />
            </linearGradient>
          </defs>
        </svg>

        {/* Timer Display */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-extrabold tracking-tight text-white">
            <span>{String(minutes).padStart(2, '0')}</span>
            <span className="animate-pulse">:</span>
            <span>{String(seconds).padStart(2, '0')}</span>
          </div>

          {/* Mode and Session Info */}
          <div
            className={`mt-2 sm:mt-4 flex items-center space-x-2 text-base sm:text-lg font-medium ${getTextColor(state.mode)}`}
          >
            {getModeIcon(state.mode)}
            <span>{formatMode(state.mode)}</span>
          </div>
          <div className="mt-2 px-3 sm:px-4 py-1 rounded-full bg-gray-100/30 text-xs sm:text-sm font-medium text-white/80">
            Session {state.currentSession}
          </div>
        </div>

        {/* Glowing Background Effect */}
        <div
          className={`absolute inset-0 rounded-full ${getGlowEffect(state.mode)} opacity-25 blur-3xl`}
        />
      </div>
    </div>
  );
};

function getGradientColors(mode) {
  switch (mode) {
    case 'work':
      return ['#FF5722', '#FFC107'];
    case 'shortBreak':
      return ['#4CAF50', '#8BC34A'];
    case 'longBreak':
      return ['#2196F3', '#3F51B5'];
    default:
      return ['#9E9E9E', '#757575'];
  }
}

function getTextColor(mode) {
  switch (mode) {
    case 'work':
      return 'text-red-500';
    case 'shortBreak':
      return 'text-green-500';
    case 'longBreak':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}

function getModeIcon(mode) {
  switch (mode) {
    case 'work':
      return <Timer className="h-6 w-6" />;
    case 'shortBreak':
      return <Coffee className="h-6 w-6" />;
    case 'longBreak':
      return <Moon className="h-6 w-6" />;
    default:
      return <Clock className="h-6 w-6" />;
  }
}

function formatMode(mode) {
  switch (mode) {
    case 'work':
      return 'Focus Time';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
    default:
      return mode;
  }
}

function getGlowEffect(mode) {
  switch (mode) {
    case 'work':
      return 'bg-red-500';
    case 'shortBreak':
      return 'bg-green-500';
    case 'longBreak':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

export default TimerDisplay;
