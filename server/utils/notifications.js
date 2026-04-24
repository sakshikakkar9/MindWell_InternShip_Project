import Reminder from '../models/Reminder.js';

/**
 * Mock Notification Service
 * In a real application, this would use node-cron or a similar scheduler
 * to check for reminders and send push notifications or emails.
 */

export const checkReminders = async () => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

  try {
    const activeReminders = await Reminder.find({
      isEnabled: true,
      time: currentTime,
      days: currentDay
    }).populate('userId', 'username email');

    activeReminders.forEach(reminder => {
      console.log(`[NOTIFICATION] Reminder for ${reminder.userId.username}: Time to ${reminder.activity}!`);
      // Integration with an email or push notification service would go here
    });
  } catch (error) {
    console.error("Error checking reminders:", error);
  }
};

// Start a simple interval to check every minute
export const startReminderService = () => {
  console.log("🚀 Reminder service started...");
  setInterval(checkReminders, 60000); // Check every minute
};