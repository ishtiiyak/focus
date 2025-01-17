const fs = require('fs');
const { exec } = require('child_process');

// Create the sounds directory if it doesn't exist
if (!fs.existsSync('public/sounds')) {
  fs.mkdirSync('public/sounds', { recursive: true });
}

// Command to create MP3 files using ffmpeg
const createPomoSound = 'ffmpeg -f lavfi -i "sine=frequency=800:duration=1" public/sounds/pomo-complete.mp3';
const createBreakSound = 'ffmpeg -f lavfi -i "sine=frequency=600:duration=1" public/sounds/break-complete.mp3';

// Execute the commands
exec(createPomoSound, (error) => {
  if (error) {
    console.error('Error creating pomo sound:', error);
    return;
  }
  console.log('Created pomo-complete.mp3');
});

exec(createBreakSound, (error) => {
  if (error) {
    console.error('Error creating break sound:', error);
    return;
  }
  console.log('Created break-complete.mp3');
}); 