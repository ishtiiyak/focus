import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { IoClose, IoPlay, IoPause, IoStop, IoCheckmarkCircle } from 'react-icons/io5';
import { useAccurateTimer } from '../hooks/useAccurateTimer';

const Timer = forwardRef(({ isFullScreen, onClose, selectedTask, settings, onCompletedPomodoro, onUpdateTask }, ref) => {
  const [timeLeft, setTimeLeft] = useState(settings?.pomodoroMinutes * 60 || 1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showStopPrompt, setShowStopPrompt] = useState(false);
  const endTimeRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  // Keep screen awake
  useEffect(() => {
    let wakeLock = null;
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    if (isRunning && !isPaused) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) wakeLock.release().catch(console.error);
    };
  }, [isRunning, isPaused]);

  const updateTimer = useCallback((remainingSeconds) => {
    const now = Date.now();
    const tickDiff = now - lastTickRef.current;
    lastTickRef.current = now;

    if (tickDiff > 1100) {
      // Recalculate based on absolute time if drift detected
      const actualRemaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
      setTimeLeft(actualRemaining);
    } else {
      setTimeLeft(remainingSeconds);
    }

    // Handle timer completion
    if (remainingSeconds === 0 && isRunning && !isPaused) {
      if (!isBreak) {
        onCompletedPomodoro(selectedTask?.id || null);
        if (selectedTask) {
          const updatedTask = {
            ...selectedTask,
            completedPomodoros: (selectedTask.completedPomodoros || 0) + 1
          };
          if (updatedTask.completedPomodoros >= updatedTask.totalPomodoros) {
            updatedTask.completed = true;
            updatedTask.completedAt = new Date().toISOString();
          }
          onUpdateTask(updatedTask);
        }
        if (settings?.autoStartBreaks) {
          startBreak();
        } else {
          setIsRunning(false);
          setIsBreak(true);
          setTimeLeft(settings?.shortBreakMinutes * 60 || 300);
        }
      } else {
        if (settings?.autoStartPomodoros) {
          startPomodoro();
        } else {
          setIsRunning(false);
          setIsBreak(false);
          setTimeLeft(settings?.pomodoroMinutes * 60 || 1500);
        }
      }
    }
  }, [isRunning, isPaused, isBreak, selectedTask, settings, onCompletedPomodoro, onUpdateTask]);

  useAccurateTimer(
    updateTimer,
    endTimeRef.current,
    isRunning && !isPaused
  );

  // Start/pause/resume timer
  const toggleTimer = () => {
    if (!selectedTask && !isBreak) {
      // Show a notification or alert that task selection is required
      alert('Please select a task before starting the timer');
      return;
    }

    if (!isRunning || isPaused) {
      const now = Date.now();
      endTimeRef.current = now + (timeLeft * 1000);
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsPaused(true);
      endTimeRef.current = null;
    }
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isRunning && !isPaused) {
          localStorage.setItem('timerEndTime', endTimeRef.current.toString());
        }
      } else {
        const savedEndTime = localStorage.getItem('timerEndTime');
        if (savedEndTime && isRunning && !isPaused) {
          const now = Date.now();
          const remaining = Math.max(0, Math.ceil((parseInt(savedEndTime) - now) / 1000));
          setTimeLeft(remaining);
          endTimeRef.current = parseInt(savedEndTime);
          localStorage.removeItem('timerEndTime');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Start break
  const startBreak = useCallback(() => {
    const duration = settings?.shortBreakMinutes * 60 || 300;
    setIsBreak(true);
    setTimeLeft(duration);
    endTimeRef.current = Date.now() + (duration * 1000);
    setIsRunning(true);
    setIsPaused(false);
  }, [settings?.shortBreakMinutes]);

  // Start pomodoro
  const startPomodoro = useCallback(() => {
    const duration = settings?.pomodoroMinutes * 60 || 1500;
    setIsBreak(false);
    setTimeLeft(duration);
    endTimeRef.current = Date.now() + (duration * 1000);
    setIsRunning(true);
    setIsPaused(false);
  }, [settings?.pomodoroMinutes]);

  const handleStop = () => {
    setShowStopPrompt(true);
  };

  const confirmStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    endTimeRef.current = null;
    setTimeLeft(settings?.pomodoroMinutes * 60 || 1500);
    setShowStopPrompt(false);
    setIsBreak(false);
  };

  const cancelStop = () => {
    setShowStopPrompt(false);
  };

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        onCompletedPomodoro(selectedTask?.id || null);
        
        if (selectedTask) {
          const updatedTask = {
            ...selectedTask,
            completedPomodoros: (selectedTask.completedPomodoros || 0) + 1
          };
          
          if (updatedTask.completedPomodoros >= updatedTask.totalPomodoros) {
            updatedTask.completed = true;
            updatedTask.completedAt = new Date().toISOString();
          }
          
          onUpdateTask(updatedTask);
        }
        
        if (settings?.autoStartBreaks) {
          startBreak();
        } else {
          setIsRunning(false);
          setIsBreak(true);
          setTimeLeft(settings?.shortBreakMinutes * 60 || 300);
        }
      } else {
        if (settings?.autoStartPomodoros) {
          startPomodoro();
        } else {
          setIsRunning(false);
          setIsBreak(false);
          setTimeLeft(settings?.pomodoroMinutes * 60 || 1500);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft, isBreak, selectedTask, onCompletedPomodoro, startBreak, startPomodoro, settings, onUpdateTask]);

  const progress = ((settings?.pomodoroMinutes * 60 - timeLeft) / (settings?.pomodoroMinutes * 60)) * 100;

  useImperativeHandle(ref, () => ({
    resetAndStart: (task) => {
      setTimeLeft(settings?.pomodoroMinutes * 60 || 1500);
      setIsRunning(true);
      setIsPaused(false);
      setIsBreak(false);
    }
  }));

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* Full screen background overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 z-40" />
      )}
      
      <div 
        className={`
          ${isFullScreen 
            ? 'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'
            : 'p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl'
          }
          relative
        `}
      >
        {isFullScreen && (
          <button
            onClick={handleClose}
            className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-colors"
          >
            <IoClose className="w-8 h-8 text-white/90" />
          </button>
        )}

        <div className={`
          relative flex flex-col items-center
          ${isFullScreen ? 'scale-110' : ''}
        `}>
          {selectedTask && !isBreak && (
            <div className={`
              text-center mb-6
              ${isFullScreen ? 'text-white/90' : 'text-gray-800'}
            `}>
              <h2 className={`
                ${isFullScreen ? 'text-4xl' : 'text-sm'}
                font-semibold tracking-tight
              `}>
                {selectedTask.title}
              </h2>
            </div>
          )}

          {isBreak && (
            <div className={`
              text-center mb-6
              ${isFullScreen ? 'text-white/90' : 'text-gray-800'}
            `}>
              <h2 className={`
                ${isFullScreen ? 'text-4xl' : 'text-sm'}
                font-semibold tracking-tight
              `}>
                Break Time
              </h2>
            </div>
          )}

          {/* Timer Circle */}
          <div className={`
            relative
            ${isFullScreen ? 'w-80 h-80' : 'w-24 h-24'}
          `}>
            {/* Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className={`${isFullScreen ? 'text-white/10' : 'text-gray-200/50'}`}
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="48%"
                cx="50%"
                cy="50%"
              />
              <circle
                className={`${isFullScreen ? 'text-white' : 'text-indigo-600'}`}
                strokeWidth="4"
                strokeDasharray={`${progress} 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="48%"
                cx="50%"
                cy="50%"
              />
            </svg>

            {/* Timer Text */}
            <div className={`
              absolute inset-0 flex items-center justify-center
              ${isFullScreen ? 'text-7xl' : 'text-2xl'}
              font-bold
              ${isFullScreen ? 'text-white' : 'text-gray-800'}
              tracking-tight
            `}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Timer Controls */}
          <div className={`
            flex justify-center space-x-4
            ${isFullScreen ? 'mt-10' : 'mt-3'}
          `}>
            {!isRunning ? (
              <button
                onClick={toggleTimer}
                disabled={!selectedTask && !isBreak}
                className={`
                  p-3 rounded-full
                  ${isFullScreen 
                    ? 'bg-white/10 hover:bg-white/20' 
                    : 'bg-white/80 hover:bg-white shadow-sm'
                  }
                  ${(!selectedTask && !isBreak) ? 'opacity-50 cursor-not-allowed' : ''}
                  transition-all duration-200
                `}
              >
                <IoPlay className={`
                  ${isFullScreen ? 'w-8 h-8' : 'w-5 h-5'}
                  ${isFullScreen ? 'text-white' : 'text-indigo-600'}
                `} />
              </button>
            ) : (
              <>
                <button
                  onClick={toggleTimer}
                  className={`
                    p-3 rounded-full
                    ${isFullScreen 
                      ? 'bg-white/10 hover:bg-white/20' 
                      : 'bg-white/80 hover:bg-white shadow-sm'
                    }
                    transition-all duration-200
                  `}
                >
                  {isPaused ? (
                    <IoPlay className={`
                      ${isFullScreen ? 'w-8 h-8' : 'w-5 h-5'}
                      ${isFullScreen ? 'text-white' : 'text-indigo-600'}
                    `} />
                  ) : (
                    <IoPause className={`
                      ${isFullScreen ? 'w-8 h-8' : 'w-5 h-5'}
                      ${isFullScreen ? 'text-white' : 'text-indigo-600'}
                    `} />
                  )}
                </button>
                <button
                  onClick={handleStop}
                  className={`
                    p-3 rounded-full
                    ${isFullScreen 
                      ? 'bg-white/10 hover:bg-white/20' 
                      : 'bg-white/80 hover:bg-white shadow-sm'
                    }
                    transition-all duration-200
                  `}
                >
                  <IoStop className={`
                    ${isFullScreen ? 'w-8 h-8' : 'w-5 h-5'}
                    ${isFullScreen ? 'text-white' : 'text-indigo-600'}
                  `} />
                </button>
              </>
            )}
          </div>

          {/* Session Info */}
          {isFullScreen && (
            <div className="absolute bottom-12 left-0 right-0 text-center text-white/70">
              <p className="text-lg font-medium">{isBreak ? 'Break Time' : 'Focus Session'}</p>
              <p className="text-sm mt-1">
                {isBreak 
                  ? 'Take a moment to relax'
                  : 'Stay focused and minimize distractions'
                }
              </p>
            </div>
          )}
        </div>

        {/* Stop Confirmation Dialog */}
        {showStopPrompt && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className={`
              bg-white rounded-lg p-6 m-4 max-w-sm w-full
              ${isFullScreen ? 'text-gray-800' : ''}
            `}>
              <h3 className="text-lg font-semibold mb-4">Stop Timer?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to stop the timer? Your progress will be lost.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelStop}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStop}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Stop Timer
                </button>
              </div>
            </div>
          </div>
        )}

        {timeLeft === 0 && !isBreak && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className={`
              bg-white rounded-lg p-6 m-4 max-w-sm w-full
              ${isFullScreen ? 'text-gray-800' : ''}
            `}>
              <h3 className="text-lg font-semibold mb-4">Pomodoro Completed!</h3>
              <p className="text-gray-600 mb-6">
                Great job! Would you like to mark this task as completed?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    if (settings?.autoStartBreaks) {
                      startBreak();
                    } else {
                      setTimeLeft(settings?.shortBreakMinutes * 60 || 300);
                      setIsBreak(true);
                    }
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    if (selectedTask) {
                      onUpdateTask({
                        ...selectedTask,
                        completed: true,
                        completedAt: new Date().toISOString()
                      });
                    }
                    if (settings?.autoStartBreaks) {
                      startBreak();
                    } else {
                      setTimeLeft(settings?.shortBreakMinutes * 60 || 300);
                      setIsBreak(true);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Complete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default Timer; 