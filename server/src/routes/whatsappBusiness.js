const express = require('express');
const whatsappBusinessService = require('../services/whatsappBusinessService');

const router = express.Router();

// GET /api/whatsapp-business/status - Get WhatsApp Business API status
router.get('/status', async (req, res) => {
  try {
    const status = whatsappBusinessService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/whatsapp-business/connect - Initialize WhatsApp Business API
router.post('/connect', async (req, res) => {
  try {
    console.log('Received WhatsApp Business API connect request');
    
    await whatsappBusinessService.initialize();
    res.json({ 
      message: 'WhatsApp Business API connected successfully',
      status: whatsappBusinessService.getStatus()
    });
  } catch (error) {
    console.error('WhatsApp Business API connect error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/whatsapp-business/send - Send a text message
router.post('/send', async (req, res) => {
  try {
    const { message, recipient } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await whatsappBusinessService.sendMessage(message, recipient);
    res.json(result);
  } catch (error) {
    console.error('WhatsApp Business API send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/whatsapp-business/send-template - Send a template message
router.post('/send-template', async (req, res) => {
  try {
    const { templateName, languageCode, components } = req.body;
    
    if (!templateName) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    const result = await whatsappBusinessService.sendTemplateMessage(templateName, languageCode, components);
    res.json(result);
  } catch (error) {
    console.error('WhatsApp Business API template send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/whatsapp-business/test-template - Send hello_world template (like working manual test)
router.post('/test-template', async (req, res) => {
  try {
    console.log('Received request to send hello_world template via WhatsApp Business API');
    
    const result = await whatsappBusinessService.sendHelloWorldTemplate();
    res.json(result);
  } catch (error) {
    console.error('WhatsApp Business API hello_world template error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/whatsapp-business/test-custom-template - Test custom trafikkvakt template  
router.post('/test-custom-template', async (req, res) => {
  try {
    console.log('Received request to test custom trafikkvakt template');
    
    const dataService = req.app.get('dataService');
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }

    // Get today's duties for testing
    const today = new Date();
    const norwegianDays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const todayName = norwegianDays[today.getDay()];
    
    const dutiesData = await dataService.getDuties();
    if (!dutiesData || !dutiesData.duties) {
      return res.status(404).json({ error: 'No duties data available' });
    }
    
    // Extract today's duties
    const todayDuties = [];
    Object.entries(dutiesData.duties).forEach(([crossing, days]) => {
      if (days[todayName]) {
        todayDuties.push({
          child: days[todayName],
          crossing: crossing
        });
      }
    });

    // Format data for template - ensure it's clean and within limits
    const dateText = whatsappBusinessService.formatDateForTemplate(today);
    const dutiesText = whatsappBusinessService.formatDutiesForTemplate(todayDuties);
    
    console.log('Template data prepared:', { 
      dateText, 
      dutiesText: dutiesText.substring(0, 100) + '...', // Log first 100 chars
      dutiesCount: todayDuties.length,
      dateLength: dateText.length,
      dutiesLength: dutiesText.length 
    });
    
    const result = await whatsappBusinessService.sendTrafikkvaktTemplate(dutiesText, dateText);
    
    res.json({
      success: true,
      message: 'Custom template test sent successfully',
      result: result,
      dutiesCount: todayDuties.length,
      templateData: {
        dateText: dateText,
        dutiesText: dutiesText.length > 100 ? dutiesText.substring(0, 100) + '...' : dutiesText
      }
    });
  } catch (error) {
    console.error('WhatsApp Business API custom template test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/whatsapp-business/template-preview - Preview template data
router.get('/template-preview', async (req, res) => {
  try {
    const dataService = req.app.get('dataService');
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }

    // Get today's duties
    const today = new Date();
    const norwegianDays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const todayName = norwegianDays[today.getDay()];
    
    const dutiesData = await dataService.getDuties();
    if (!dutiesData || !dutiesData.duties) {
      return res.status(404).json({ error: 'No duties data available' });
    }
    
    // Extract today's duties
    const todayDuties = [];
    Object.entries(dutiesData.duties).forEach(([crossing, days]) => {
      if (days[todayName]) {
        todayDuties.push({
          child: days[todayName],
          crossing: crossing
        });
      }
    });

    // Format data for template
    const dateText = whatsappBusinessService.formatDateForTemplate(today);
    const dutiesText = whatsappBusinessService.formatDutiesForTemplate(todayDuties);
    
    res.json({
      todayName,
      dutiesCount: todayDuties.length,
      rawDuties: todayDuties,
      templateParameters: {
        dateText: {
          value: dateText,
          length: dateText.length,
          hasSpecialChars: /[^\w\s\.]/.test(dateText)
        },
        dutiesText: {
          value: dutiesText,
          length: dutiesText.length,
          lines: dutiesText.split('\n').length,
          hasSpecialChars: /[^\w\s\.\-]/.test(dutiesText)
        }
      }
    });
  } catch (error) {
    console.error('Template preview error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/whatsapp-business/test-basic-template - Test with minimal parameters
router.post('/test-basic-template', async (req, res) => {
  try {
    console.log('Testing basic template parameters');
    
    // Test with the exact same example from the template definition
    const result = await whatsappBusinessService.sendTrafikkvaktTemplate('Hhh', 'Hhh');
    
    res.json({
      success: true,
      message: 'Basic template test sent successfully', 
      result: result
    });
  } catch (error) {
    console.error('Basic template test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/whatsapp-business/send-today - Send today's duty notification
router.post('/send-today', async (req, res) => {
  try {
    console.log('Received request to send today\'s duty notification via WhatsApp Business API');
    
    const dataService = req.app.get('dataService');
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }

    // Get today's duties
    const today = new Date();
    const norwegianDays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const todayName = norwegianDays[today.getDay()];
    
    const dutiesData = await dataService.getDuties();
    if (!dutiesData || !dutiesData.duties) {
      return res.status(404).json({ error: 'No duties data available' });
    }
    
    // Extract today's duties from the object structure
    const todayDuties = [];
    Object.entries(dutiesData.duties).forEach(([crossing, days]) => {
      if (days[todayName]) {
        todayDuties.push({
          child: days[todayName],
          crossing: crossing
        });
      }
    });

    // Format and send message
    const message = whatsappBusinessService.formatTodayMessage(todayDuties, today);
    
    // WhatsApp Business API requires templates for first contact
    // Send template message instead of custom message
    const result = await whatsappBusinessService.sendHelloWorldTemplate();
    
    res.json({
      success: true,
      message: 'Today\'s duty notification sent via WhatsApp Business API (template)',
      messageId: result.messageId,
      dutiesCount: todaysDuties.length,
      sentAt: result.timestamp,
      note: 'Template message sent - custom messages require user response first'
    });
  } catch (error) {
    console.error('Error sending today\'s duty notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/whatsapp-business/message/today - Get today's duty message (for testing/preview)
router.get('/message/today', async (req, res) => {
  try {
    console.log('Generating today\'s duty message for WhatsApp Business API');
    
    const dataService = req.app.get('dataService');
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }

    // Get today's duties
    const today = new Date();
    const norwegianDayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const todayName = norwegianDayNames[today.getDay()];
    
    const dutiesData = await dataService.getDuties();
    if (!dutiesData || !dutiesData.duties) {
      return res.status(404).json({ error: 'No duties data available' });
    }
    
    // Extract today's duties from the object structure
    const todayDuties = [];
    Object.entries(dutiesData.duties).forEach(([crossing, days]) => {
      if (days[todayName]) {
        todayDuties.push({
          child: days[todayName],
          crossing: crossing
        });
      }
    });

    // Format message
    const message = whatsappBusinessService.formatTodayMessage(todayDuties, today);
    const dayNames = {
      0: 'søndag', 1: 'mandag', 2: 'tirsdag', 3: 'onsdag', 
      4: 'torsdag', 5: 'fredag', 6: 'lørdag'
    };
    const dayName = dayNames[today.getDay()] || 'i dag';
    
    res.json({
      message: message,
      isEmpty: todayDuties.length === 0,
      dutiesCount: todayDuties.length,
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      duties: todayDuties
    });
  } catch (error) {
    console.error('Error generating today\'s duty message:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/whatsapp-business/templates - Get message templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await whatsappBusinessService.getMessageTemplates();
    res.json(templates);
  } catch (error) {
    console.error('WhatsApp Business API templates error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/whatsapp-business/profile - Get business profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await whatsappBusinessService.getBusinessProfile();
    res.json(profile);
  } catch (error) {
    console.error('WhatsApp Business API profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/whatsapp-business/test - Send test message
router.post('/test', async (req, res) => {
  try {
    const testMessage = `🧪 WhatsApp Business API Test\n\nThis is a test message from Trafikkvakt.\n\nSent at: ${new Date().toLocaleString('no-NO', { timeZone: 'Europe/Oslo' })}`;
    
    const result = await whatsappBusinessService.sendMessage(testMessage);
    res.json({
      success: true,
      message: 'Test message sent successfully',
      result: result
    });
  } catch (error) {
    console.error('WhatsApp Business API test error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;