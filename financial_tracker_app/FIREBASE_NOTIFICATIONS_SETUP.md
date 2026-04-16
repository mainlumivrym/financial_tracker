# Firebase Cloud Functions for Recurring Expense Notifications

This guide explains how to set up server-side daily notifications using Firebase Cloud Functions and Firebase Cloud Messaging (FCM).

## Benefits Over Local Notifications

- ✅ **Truly daily**: Runs every day at 9 AM automatically
- ✅ **Stops when paid**: Checks `isPaid` status before sending
- ✅ **No app needed**: Works even if user hasn't opened the app
- ✅ **Reliable**: Server-side scheduling via Google Cloud
- ✅ **Auto-reset monthly**: Automatically resets `isPaid` on 1st of each month

## Setup Steps

### 1. Enable Firebase Cloud Messaging

```bash
# Install FCM in your Expo app
npx expo install expo-notifications
npx expo install @react-native-firebase/app @react-native-firebase/messaging
```

### 2. Update User Service to Store FCM Tokens

Add this to `src/services/userService.js`:

```javascript
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';

export const saveFCMToken = async (userId) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Save to Firestore
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
      updatedAt: new Date()
    });

    return token;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return null;
  }
};
```

### 3. Call saveFCMToken on Login/Signup

In `AuthContext.js`, after successful login:

```javascript
import { saveFCMToken } from '../services/userService';

// After successful login/signup
await saveFCMToken(user.uid);
```

### 4. Deploy Cloud Functions

```bash
# Login to Firebase
firebase login

# Deploy functions
firebase deploy --only functions
```

### 5. Verify Deployment

Check Firebase Console → Functions to see:
- `sendRecurringExpenseNotifications` - Runs daily at 9 AM
- `cleanupExpiredExpenses` - Runs monthly on 1st at midnight

## How It Works

### Daily Notification Function
- Runs every day at 9:00 AM (configurable timezone)
- Queries all unpaid recurring expenses with `notificationEnabled: true`
- Calculates days until due
- Sends push notification if due within 7 days
- Automatically stops sending when expense is marked as paid

### Monthly Cleanup Function
- Runs on the 1st of each month at midnight
- Resets all `isPaid` statuses from previous months
- Ensures notifications resume for new month

## Notification Messages

- **Due today**: "Netflix of $15.99 is due today!"
- **Due tomorrow**: "Netflix of $15.99 is due tomorrow"
- **Due in X days**: "Netflix of $15.99 is due in 5 days"

## Testing

### Test Locally
```bash
cd functions
npm run serve
```

### Trigger Manually
In Firebase Console → Functions → Select function → Testing tab

### View Logs
```bash
firebase functions:log
```

## Cost

- **Free tier**: 2M function invocations/month
- Daily notifications function runs once per day = 30 times/month
- Monthly cleanup runs once/month = 1 time/month
- **Total**: ~31 invocations/month (well within free tier)

## Timezone Configuration

Edit `functions/index.js` line 9:
```javascript
.timeZone('America/Los_Angeles') // Change to your timezone
```

Available timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

## Troubleshooting

### Notifications not received
1. Check FCM token is saved in Firestore users collection
2. Verify function deployed: `firebase functions:list`
3. Check logs: `firebase functions:log`
4. Ensure `notificationEnabled: true` and `isPaid: false`

### Function not running
1. Check Firebase Console → Functions for errors
2. Verify billing is enabled (required for scheduled functions)
3. Check timezone configuration

## Security

The Cloud Function runs with admin privileges and:
- Only sends to users who own the expense
- Validates `isPaid` status before sending
- Uses FCM tokens for secure delivery
