const axios = require('axios');
const https = require('https');

// Create a dedicated axios instance for WhatsApp Business API
const createWhatsAppAxios = () => {
  return axios.create({
    timeout: 30000,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // For development - bypasses SSL certificate issues
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 10
    }),
    headers: {
      'User-Agent': 'TrafikkvaktBot/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
};

class WhatsAppBusinessService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER;
    this.apiVersion = 'v22.0'; // Updated to match working manual test
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    this.isReady = false;
    this.status = 'disconnected';
    
    // Create dedicated axios instance with SSL handling
    this.api = createWhatsAppAxios();
  }

  // Helper method to format phone number (remove + prefix)
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    return phoneNumber.replace(/^\+/, ''); // Remove leading +
  }

  async initialize() {
    console.log('🚀 Initializing WhatsApp Business Cloud API...');
    
    if (!this.accessToken) {
      throw new Error('WhatsApp Access Token not configured. Please set WHATSAPP_ACCESS_TOKEN environment variable.');
    }
    
    if (!this.phoneNumberId) {
      throw new Error('WhatsApp Phone Number ID not configured. Please set WHATSAPP_PHONE_NUMBER_ID environment variable.');
    }
    
    if (!this.recipientNumber) {
      throw new Error('WhatsApp Recipient Number not configured. Please set WHATSAPP_RECIPIENT_NUMBER environment variable.');
    }

    try {
      // Test the connection by getting phone number info
      console.log('🔍 Testing WhatsApp Business API connection...');
      console.log('🌐 API URL:', `${this.baseUrl}/${this.phoneNumberId}`);
      console.log('🔑 Using Access Token:', this.accessToken ? `${this.accessToken.substring(0, 20)}...` : 'NOT SET');
      
      const response = await this.api.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      console.log('✅ WhatsApp Business API connected successfully');
      console.log('📱 Phone Number Info:', {
        id: response.data.id,
        display_phone_number: response.data.display_phone_number,
        verified_name: response.data.verified_name
      });

      this.isReady = true;
      this.status = 'ready';
      
    } catch (error) {
      console.error('❌ Error connecting to WhatsApp Business API:', error.response?.data || error.message);
      this.status = 'error';
      throw new Error(`WhatsApp Business API connection failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Send hello_world template message (like working manual test)
  async sendHelloWorldTemplate(recipient = null) {
    if (!this.isReady) {
      throw new Error('WhatsApp Business API is not ready. Please ensure it is initialized.');
    }

    const targetNumber = this.formatPhoneNumber(recipient || this.recipientNumber);

    try {
      console.log('📤 Sending hello_world template message...');
      console.log('🎯 Recipient:', targetNumber);

      const payload = {
        messaging_product: 'whatsapp',
        to: targetNumber,
        type: 'template',
        template: {
          name: 'hello_world',
          language: {
            code: 'en_US'
          }
        }
      };

      const response = await this.api.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      console.log('✅ Hello world template sent successfully');
      console.log('📋 Response:', {
        message_id: response.data.messages[0].id,
        status: 'sent'
      });
      
      return {
        success: true,
        messageId: response.data.messages[0].id,
        recipient: targetNumber,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending hello world template:', error.response?.data || error.message);
      throw new Error(`Failed to send hello world template: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Send custom trafikkvakt duties template (once approved)
  async sendTrafikkvaktTemplate(dutiesText, dateText, recipient = null) {
    if (!this.isReady) {
      throw new Error('WhatsApp Business API is not ready. Please ensure it is initialized.');
    }

    const targetNumber = this.formatPhoneNumber(recipient || this.recipientNumber);

    try {
      console.log('📤 Sending trafikkvakt_dagens_vakter template message...');
      console.log('🎯 Recipient:', targetNumber);
      console.log('📅 Date:', dateText);
      console.log('👥 Duties:', dutiesText);

      const payload = {
        messaging_product: 'whatsapp',
        to: targetNumber,
        type: 'template',
        template: {
          name: 'trafikkvakt_dagens_vakter',
          language: {
            code: 'nb' // Norwegian
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: dateText
                },
                {
                  type: 'text', 
                  text: dutiesText
                }
              ]
            }
          ]
        }
      };

      const response = await this.api.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      console.log('✅ Trafikkvakt template sent successfully');
      console.log('📋 Response:', {
        message_id: response.data.messages[0].id,
        status: 'sent'
      });
      
      return {
        success: true,
        messageId: response.data.messages[0].id,
        recipient: targetNumber,
        timestamp: new Date().toISOString(),
        template: 'trafikkvakt_dagens_vakter'
      };

    } catch (error) {
      console.error('❌ Error sending trafikkvakt template:', error.response?.data || error.message);
      
      // If template not found, fallback to hello world
      if (error.response?.data?.error?.code === 131026) {
        console.log('⚠️ Custom template not approved yet, falling back to hello_world');
        return await this.sendHelloWorldTemplate(recipient);
      }
      
      throw new Error(`Failed to send trafikkvakt template: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendMessage(message, recipient = null) {
    if (!this.isReady) {
      throw new Error('WhatsApp Business API is not ready. Please ensure it is initialized.');
    }

    const targetNumber = this.formatPhoneNumber(recipient || this.recipientNumber);
    
    if (!targetNumber) {
      throw new Error('No recipient number specified');
    }

    try {
      console.log('📤 Sending WhatsApp message via Business API...');
      console.log('🎯 Recipient:', targetNumber);
      console.log('📝 Message preview:', message.substring(0, 100) + '...');

      const payload = {
        messaging_product: 'whatsapp',
        to: targetNumber,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await this.api.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      console.log('✅ Message sent successfully');
      console.log('📋 Response:', {
        message_id: response.data.messages[0].id,
        status: 'sent'
      });

      return {
        success: true,
        messageId: response.data.messages[0].id,
        recipient: targetNumber,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
      
      const errorMsg = error.response?.data?.error?.message || error.message;
      const errorCode = error.response?.data?.error?.code || 'unknown';
      
      throw new Error(`Failed to send WhatsApp message: ${errorMsg} (Code: ${errorCode})`);
    }
  }

  formatDutiesForTemplate(todayDuties) {
    if (todayDuties.length === 0) {
      return 'Ingen vakter planlagt i dag.';
    }

    return todayDuties.map(duty => `📍 ${duty.crossing}: ${duty.child}`).join('\n');
  }

  formatDateForTemplate(date) {
    const dayNames = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const dayName = dayNames[date.getDay()];
    const dateStr = date.toLocaleDateString('nb-NO', { 
      day: 'numeric',
      month: 'long'
    });
    
    return `${dayName} ${dateStr}`;
  }

  formatTodayMessage(todayDuties, date) {
    const dayNames = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const dayName = dayNames[date.getDay()];
    const dateStr = date.toLocaleDateString('nb-NO');
    
    if (todayDuties.length === 0) {
      return `🚸 Trafikkvakter for ${dayName} ${dateStr}\n\nIngen vakter planlagt i dag.`;
    }

    let message = `🚸 Trafikkvakter for ${dayName} ${dateStr}\n\n`;
    
    todayDuties.forEach(duty => {
      message += `📍 ${duty.crossing}: ${duty.child}\n`;
    });
    
    message += `\nHusk å møte opp 5 minutter før skoletid!\n`;
    message += `Ta kontakt hvis du ikke kan møte opp.`;
    
    return message;
  }

  getStatus() {
    return {
      status: this.status,
      isReady: this.isReady,
      service: 'whatsapp-business-api',
      phoneNumberId: this.phoneNumberId,
      recipientNumber: this.recipientNumber,
      hasCredentials: !!(this.accessToken && this.phoneNumberId && this.recipientNumber)
    };
  }
}

module.exports = new WhatsAppBusinessService();