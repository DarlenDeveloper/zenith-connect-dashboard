import { toast } from 'sonner';

// Define different notification types
export type NotificationType = 'default' | 'success' | 'error' | 'info' | 'warning' | 'tech_issue';

// Default audio for each notification type
const DEFAULT_SOUNDS: Record<NotificationType | string, string> = {
  default: '/sounds/notification.mp3',
  success: '/sounds/mixkit-confirmation-tone.mp3',
  error: '/sounds/error.mp3',
  info: '/sounds/info.mp3',
  warning: '/sounds/warning.mp3',
  tech_issue: '/sounds/tech_issue.mp3', // Using dedicated tech issue sound
  tech_issue_flagged: '/sounds/tech_issue.mp3' // Using dedicated tech issue sound
};

// Interface for notification options
export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType | string;
  playSound?: boolean;
  customSound?: string;
  duration?: number;
}

// Function to play a sound
const playSoundFile = (soundPath: string) => {
  try {
    const audio = new Audio(soundPath);
    audio.play().catch(error => {
      console.error('Failed to play notification sound:', error);
    });
  } catch (error) {
    console.error('Error creating Audio object:', error);
  }
};

// Main notification function
export const notify = ({
  title,
  message,
  type = 'default',
  playSound = true,
  customSound,
  duration = 5000,
}: NotificationOptions) => {
  // Play sound if enabled
  if (playSound) {
    const soundPath = customSound || DEFAULT_SOUNDS[type] || DEFAULT_SOUNDS.default;
    playSoundFile(soundPath);
  }

  // Use the appropriate toast type
  switch (type) {
    case 'success':
      return toast.success(title || 'Success', {
        description: message,
        duration,
      });
    case 'error':
    case 'tech_issue':
    case 'tech_issue_flagged':
      return toast.error(title || 'Error', {
        description: message,
        duration,
      });
    case 'warning':
      return toast.warning(title || 'Warning', {
        description: message,
        duration,
      });
    case 'info':
      return toast.info(title || 'Info', {
        description: message,
        duration,
      });
    default:
      return toast(title || message, {
        description: title ? message : undefined,
        duration,
      });
  }
};

// Helper methods for specific notification types
export const notifySuccess = (message: string, title?: string, options?: Partial<NotificationOptions>) => 
  notify({ message, title, type: 'success', ...options });

export const notifyError = (message: string, title?: string, options?: Partial<NotificationOptions>) => 
  notify({ message, title, type: 'error', ...options });

export const notifyWarning = (message: string, title?: string, options?: Partial<NotificationOptions>) => 
  notify({ message, title, type: 'warning', ...options });

export const notifyInfo = (message: string, title?: string, options?: Partial<NotificationOptions>) => 
  notify({ message, title, type: 'info', ...options });

export const notifyTechIssue = (message: string, title?: string, options?: Partial<NotificationOptions>) => 
  notify({ message, title, type: 'tech_issue', ...options }); 