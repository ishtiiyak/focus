# Focus and Productivity Tool

A productivity and focus management tool built with React, Vite, and Tailwind CSS. This app leverages the Pomodoro technique to help users stay focused, track tasks, and analyze productivity. It features task management, Pomodoro timer, customizable settings, and task analytics.

## Features

- **Task Management**: Add, edit, and delete tasks. Organize tasks by priority.
- **Pomodoro Timer**: Start Pomodoro sessions and track focus time with breaks.
- **Task Analytics**: View productivity insights with charts and statistics.
- **Customizable Settings**: Personalize your timer settings, notification preferences, and more.
- **Responsive Design**: The app is fully responsive and works on all device sizes.
- **Dark Mode**: Toggle between light and dark modes for better accessibility.
- **Recurring Tasks**: Set tasks to repeat at intervals for better task management.

## Tech Stack

- **Frontend**:
  - **React**: JavaScript library for building user interfaces.
  - **Vite**: Build tool for fast and optimized development.
  - **Tailwind CSS**: Utility-first CSS framework for styling.
  
- **Other Tools**:
  - **FFmpeg**: Used for generating sound files (e.g., timer sounds).
  - **ESLint**: Linting configuration to maintain code quality.

## Project Structure

```plaintext
├── public/
│   └── index.html                  # Main HTML file for the app.
├── src/
│   ├── components/                 # React components for the app.
│   ├── hooks/                      # Custom hooks used in the app.
│   ├── styles/                     # CSS files for styling the components.
│   ├── App.jsx                     # Main React component with routing.
│   ├── index.css                   # Global styles using Tailwind CSS.
│   ├── main.jsx                    # Entry point for the React app.
│   ├── sounds.js                   # Base64 encoded sound data for Pomodoro.
│   └── utils/                      # Utility functions (if applicable).
├── package.json                    # Project dependencies and scripts.
├── README.md                       # Project documentation.
└── vite.config.js                  # Vite configuration file.
