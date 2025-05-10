# Notification Sounds

This directory contains sound files used for notification alerts in the application.

## Required Sound Files

The application expects the following sound files to be placed in this directory:

- `notification.mp3` - Default notification sound
- `mixkit-confirmation-tone.mp3` - Success notification sound (using Mixkit audio)
- `error.mp3` - Error notification sound
- `info.mp3` - Information notification sound
- `warning.mp3` - Warning notification sound

## Where to Find Free Notification Sounds

You can download free notification sounds from the following websites:

1. [Mixkit](https://mixkit.co/free-sound-effects/notification/) - Currently using mixkit-confirmation-tone for success notifications
2. [Notification Sounds](https://notificationsounds.com/)
3. [Zapsplat](https://www.zapsplat.com/sound-effect-categories/notifications-alerts-blips-beeps/)
4. [Soundsnap](https://www.soundsnap.com/tags/notification)
5. [Freesound](https://freesound.org/search/?q=notification)

## Adding Your Own Sounds

Simply download MP3 files and place them in this directory with the filenames mentioned above.

You can also use custom sounds by specifying the path in your notification calls:

```typescript
import { notify } from '@/utils/notification';

// Using custom sound
notify({
  title: 'Hello World',
  message: 'This is a custom sound notification',
  customSound: '/sounds/your-custom-sound.mp3'
});
``` 