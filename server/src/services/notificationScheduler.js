const cron = require('node-cron');
const whatsappBusinessService = require('./whatsappBusinessService');

class NotificationScheduler {
  constructor(dataService) {
    this.dataService = dataService;
    this.job = null;
    this.isEnabled = process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true';
    this.notificationTime = process.env.NOTIFICATION_TIME || '07:00';
  }

  start() {
    if (!this.isEnabled) {
      console.log('WhatsApp notifications are disabled');
      return;
    }

    // Parse notification time (format: "HH:MM")
    const [hours, minutes] = this.notificationTime.split(':');
    const cronPattern = `${minutes} ${hours} * * 1-5`; // Monday to Friday
    
    console.log(`Starting notification scheduler for ${this.notificationTime} on weekdays`);
    console.log(`Cron pattern: ${cronPattern}`);

    this.job = cron.schedule(cronPattern, async () => {
      console.log('Running scheduled WhatsApp notification check...');
      await this.checkAndSendTodaysDuties();
    }, {
      timezone: 'Europe/Oslo' // Norwegian timezone
    });

    console.log('Notification scheduler started');
  }

  stop() {
    if (this.job) {
      this.job.destroy();
      this.job = null;
      console.log('Notification scheduler stopped');
    }
  }

  async checkAndSendTodaysDuties() {
    try {
      console.log('Checking today\'s duties for notifications...');
      
      // Get today's date
      const today = new Date();
      const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
      const norwegianDays = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'];
      
      const dayOfWeek = today.getDay();
      const todayName = dayNames[dayOfWeek];
      
      // Skip weekends
      if (!norwegianDays.includes(todayName)) {
        console.log(`Today is ${todayName}, skipping notification`);
        return;
      }

      // Get current duties
      const dutiesData = await this.dataService.getDuties();
      if (!dutiesData || !dutiesData.duties) {
        console.log('No duties data available');
        return;
      }

      // Extract today's duties
      const todaysDuties = this.extractTodaysDuties(dutiesData.duties, todayName);
      
      if (todaysDuties.length === 0) {
        console.log('No duties scheduled for today');
        // Try custom template first, fallback to hello world
        try {
          const dateText = whatsappBusinessService.formatDateForTemplate(today);
          const dutiesText = whatsappBusinessService.formatDutiesForTemplate([]);
          await whatsappBusinessService.sendTrafikkvaktTemplate(dutiesText, dateText);
        } catch (error) {
          console.log('Custom template failed, using hello world fallback');
          await whatsappBusinessService.sendHelloWorldTemplate();
        }
        return;
      }

      console.log(`Found ${todaysDuties.length} duties for today:`, todaysDuties);
      
      // Try custom template first, fallback to hello world
      try {
        const dateText = whatsappBusinessService.formatDateForTemplate(today);
        const dutiesText = whatsappBusinessService.formatDutiesForTemplate(todaysDuties);
        await whatsappBusinessService.sendTrafikkvaktTemplate(dutiesText, dateText);
        console.log('Daily notification sent successfully (custom template)');
      } catch (error) {
        console.log('Custom template failed, using hello world fallback');
        await whatsappBusinessService.sendHelloWorldTemplate();
        console.log('Daily notification sent successfully (hello world fallback)');
      }
      
    } catch (error) {
      console.error('Error sending daily notification:', error);
    }
  }

  extractTodaysDuties(duties, dayName) {
    const todaysDuties = [];
    
    // duties is an object with crossing names as keys
    Object.entries(duties).forEach(([crossing, days]) => {
      if (days[dayName]) {
        todaysDuties.push({
          child: days[dayName],
          crossing: crossing
        });
      }
    });

    return todaysDuties;
  }

  formatDutiesMessage(todaysDuties, date) {
    const dayName = date.toLocaleDateString('nb-NO', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('nb-NO');
    
    if (todaysDuties.length === 0) {
      return `🚸 Trafikkvakter for ${dayName} ${dateStr}\n\nIngen vakter planlagt i dag.`;
    }

    let message = `🚸 Trafikkvakter for ${dayName} ${dateStr}\n\n`;
    
    todaysDuties.forEach(duty => {
      message += `📍 ${duty.crossing}: ${duty.child}\n`;
    });
    
    message += `\nHusk å møte opp 5 minutter før skoletid!\n`;
    message += `Ta kontakt hvis du ikke kan møte opp.`;
    
    return message;
  }

  // Manual trigger for testing
  async sendTestNotification() {
    console.log('Sending test notification...');
    // For testing, just send the hello world template
    await whatsappBusinessService.sendHelloWorldTemplate();
  }

  // Update schedule if notification time changes
  updateSchedule(newTime) {
    this.notificationTime = newTime;
    if (this.job) {
      this.stop();
      this.start();
    }
  }

  getStatus() {
    return {
      enabled: this.isEnabled,
      running: !!this.job,
      notificationTime: this.notificationTime,
      nextScheduled: this.job ? this.job.nextDate() : null
    };
  }
}

module.exports = NotificationScheduler;