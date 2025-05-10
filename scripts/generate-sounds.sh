#!/bin/bash

# Create directory if it doesn't exist
mkdir -p public/sounds

echo "Generating notification sound files..."

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed. Please install it first."
    echo "On Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "On macOS with Homebrew: brew install ffmpeg"
    exit 1
fi

# Generate simple notification sounds with different tones
echo "Creating default notification sound..."
ffmpeg -f lavfi -i "sine=frequency=700:duration=0.5" public/sounds/notification.mp3 -y

echo "Creating success notification sound..."
ffmpeg -f lavfi -i "sine=frequency=900:duration=0.5" public/sounds/success.mp3 -y

echo "Creating error notification sound..."
ffmpeg -f lavfi -i "sine=frequency=500:duration=0.7" public/sounds/error.mp3 -y

echo "Creating info notification sound..."
ffmpeg -f lavfi -i "sine=frequency=800:duration=0.5" public/sounds/info.mp3 -y

echo "Creating warning notification sound..."
ffmpeg -f lavfi -i "sine=frequency=600:duration=0.6" public/sounds/warning.mp3 -y

echo "Done! Notification sound files created in public/sounds/ directory."
echo "You can now use the notification utility with sound." 