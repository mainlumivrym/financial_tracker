const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

admin.initializeApp();

// Run daily at 9:00 AM (adjust timezone as needed)
exports.sendRecurringExpenseNotifications = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/Los_Angeles') // Change to your timezone
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    try {
      // Get all unpaid recurring expenses
      const expensesSnapshot = await db.collection('recurringExpenses')
        .where('isPaid', '==', false)
        .where('notificationEnabled', '==', true)
        .get();

      if (expensesSnapshot.empty) {
        console.log('No unpaid recurring expenses with notifications enabled');
        return null;
      }

      const notifications = [];
      const userIds = new Set();

      // Process each expense
      for (const doc of expensesSnapshot.docs) {
        const expense = doc.data();
        const dueDate = expense.nextDueDate.toDate();
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        
        // Calculate days until due
        const daysUntilDue = Math.ceil((dueDateOnly - today) / (1000 * 60 * 60 * 24));
        
        // Only send notification if due date is in the future or today
        if (daysUntilDue >= 0) {
          userIds.add(expense.userId);
          
          // Determine notification message
          let message = '';
          if (daysUntilDue === 0) {
            message = `${expense.name} of $${expense.amount.toFixed(2)} is due today!`;
          } else if (daysUntilDue === 1) {
            message = `${expense.name} of $${expense.amount.toFixed(2)} is due tomorrow`;
          } else if (daysUntilDue <= 7) {
            message = `${expense.name} of $${expense.amount.toFixed(2)} is due in ${daysUntilDue} days`;
          } else {
            // Don't send notification if due date is more than 7 days away
            continue;
          }

          notifications.push({
            userId: expense.userId,
            expenseId: doc.id,
            title: '💰 Recurring Expense Reminder',
            body: message,
            data: {
              expenseId: doc.id,
              type: 'recurring_expense',
              daysUntilDue: daysUntilDue.toString()
            }
          });
        }
      }

      if (notifications.length === 0) {
        console.log('No notifications to send');
        return null;
      }

      // Get device tokens for all users
      const userTokensMap = {};
      for (const userId of userIds) {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().fcmToken) {
          userTokensMap[userId] = userDoc.data().fcmToken;
        }
      }

      // Send notifications
      const messagesToSend = [];
      for (const notification of notifications) {
        const token = userTokensMap[notification.userId];
        if (token) {
          messagesToSend.push({
            token: token,
            notification: {
              title: notification.title,
              body: notification.body
            },
            data: notification.data,
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                channelId: 'recurring-expenses'
              }
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1
                }
              }
            }
          });
        }
      }

      // Send all notifications
      if (messagesToSend.length > 0) {
        const response = await admin.messaging().sendAll(messagesToSend);
        console.log(`Successfully sent ${response.successCount} notifications`);
        console.log(`Failed to send ${response.failureCount} notifications`);
        
        // Log failures for debugging
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send notification to token: ${messagesToSend[idx].token}`, resp.error);
          }
        });
      }

      return null;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return null;
    }
  });

// Clean up expired notifications (optional)
exports.cleanupExpiredExpenses = functions.pubsub
  .schedule('0 0 1 * *') // Run at midnight on the 1st of each month
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    try {
      // Reset all isPaid statuses at the start of new month
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      
      const expensesSnapshot = await db.collection('recurringExpenses')
        .where('isPaid', '==', true)
        .where('paidMonth', '!=', currentMonth)
        .get();

      if (expensesSnapshot.empty) {
        console.log('No expenses to reset');
        return null;
      }

      const batch = db.batch();
      expensesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isPaid: false });
      });

      await batch.commit();
      console.log(`Reset ${expensesSnapshot.size} expenses to unpaid`);
      
      return null;
    } catch (error) {
      console.error('Error cleaning up expenses:', error);
      return null;
    }
  });
