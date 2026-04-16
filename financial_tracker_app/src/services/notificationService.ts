import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { RecurringExpense, RecurringFrequency } from './recurringExpenseService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('recurring-expenses', {
        name: 'Recurring Expense Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4ecca3',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleRecurringExpenseNotification = async (
  expense: RecurringExpense
): Promise<string | null> => {
  try {
    if (!expense.notificationEnabled) {
      return null;
    }

    // Cancel any existing notification for this expense
    await cancelNotification(expense.id);

    const dueDate = expense.nextDueDate?.toDate?.() || new Date(expense.nextDueDate);
    const notificationDate = new Date(dueDate);

    // Set the notification time based on user preference
    if (expense.notificationTime) {
      const [hours, minutes] = expense.notificationTime.split(':');
      notificationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Schedule notification 1 day before due date
    const oneDayBefore = new Date(notificationDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);

    const now = new Date();
    if (oneDayBefore <= now) {
      // If notification time has passed, schedule for the due date itself
      if (notificationDate > now) {
        return await scheduleNotification(expense, notificationDate);
      }
      return null;
    }

    return await scheduleNotification(expense, oneDayBefore);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

const scheduleNotification = async (
  expense: RecurringExpense,
  triggerDate: Date
): Promise<string> => {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 Recurring Expense Reminder',
      body: `${expense.name} of $${expense.amount.toFixed(2)} is due tomorrow`,
      data: { 
        expenseId: expense.id,
        type: 'recurring_expense' 
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: triggerDate,
    identifier: `recurring_expense_${expense.id}`,
  });

  return notificationId;
};

export const cancelNotification = async (expenseId: string): Promise<void> => {
  try {
    const identifier = `recurring_expense_${expenseId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Re-schedule all notifications for recurring expenses
export const rescheduleAllNotifications = async (expenses: RecurringExpense[]): Promise<void> => {
  try {
    await cancelAllNotifications();
    
    for (const expense of expenses) {
      if (expense.notificationEnabled) {
        await scheduleRecurringExpenseNotification(expense);
      }
    }
  } catch (error) {
    console.error('Error rescheduling notifications:', error);
  }
};
