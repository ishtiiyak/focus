import React, { useState } from 'react';
import { IoPlayOutline, IoStopOutline, IoPauseOutline, IoCheckmarkOutline } from 'react-icons/io5';

const TimerControls = ({ 
  isRunning, 
  onToggle, 
  onStop,
  onBreakComplete,
  mode,
  settings 
}) => {
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const handleStopClick = () => {
    setShowStopConfirm(true);
  };

  const handleConfirmStop = () => {
    setShowStopConfirm(false);
    onStop();
  };

  return (
    <div className="mt-6 flex justify-center space-x-4">
      {mode === 'work' ? (
        <>
          {!isRunning ? (
            <button
              onClick={onToggle}
              className="flex items-center rounded-full bg-indigo-600 p-4 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <IoPlayOutline className="h-8 w-8" />
            </button>
          ) : (
            <>
              <button
                onClick={onToggle}
                className="flex items-center rounded-full bg-yellow-500 p-4 text-white shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <IoPauseOutline className="h-8 w-8" />
              </button>
              <button
                onClick={handleStopClick}
                className="flex items-center rounded-full bg-red-500 p-4 text-white shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <IoStopOutline className="h-8 w-8" />
              </button>
            </>
          )}
        </>
      ) : (
        // Break mode
        <button
          onClick={onBreakComplete}
          className="flex items-center rounded-full bg-green-500 p-4 text-white shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <IoCheckmarkOutline className="h-8 w-8" />
        </button>
      )}

      {showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Stop Timer?
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              This pomodoro will not be counted in your statistics.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStopConfirm(false)}
                className="rounded px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStop}
                className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerControls;
