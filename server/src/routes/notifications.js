const express = require('express');

const router = express.Router();

// This will be set by the main server when initializing
let notificationScheduler = null;

// Middleware to set scheduler instance
router.use((req, res, next) => {
  if (!notificationScheduler) {
    notificationScheduler = req.app.get('notificationScheduler');
  }
  next();
});

// GET /api/notifications/status - Get notification scheduler status
router.get('/status', (req, res) => {
  try {
    if (!notificationScheduler) {
      return res.status(500).json({ error: 'Notification scheduler not initialized' });
    }
    
    const status = notificationScheduler.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/test - Send test notification
router.post('/test', async (req, res) => {
  try {
    if (!notificationScheduler) {
      return res.status(500).json({ error: 'Notification scheduler not initialized' });
    }
    
    await notificationScheduler.sendTestNotification();
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/send-todays-duties - Send today's duties (manual trigger)
router.post('/send-todays-duties', async (req, res) => {
  try {
    if (!notificationScheduler) {
      return res.status(500).json({ error: 'Notification scheduler not initialized' });
    }
    
    await notificationScheduler.checkAndSendTodaysDuties();
    res.json({ message: 'Today\'s duties notification sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/schedule - Update notification schedule
router.put('/schedule', (req, res) => {
  try {
    if (!notificationScheduler) {
      return res.status(500).json({ error: 'Notification scheduler not initialized' });
    }
    
    const { time } = req.body;
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:MM format (e.g., 07:00)' });
    }
    
    notificationScheduler.updateSchedule(time);
    res.json({ message: 'Notification schedule updated successfully', time });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;