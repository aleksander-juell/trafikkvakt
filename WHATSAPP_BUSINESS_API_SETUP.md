# WhatsApp Business Cloud API Setup Guide

## Overview
WhatsApp Business Cloud API is the official, most reliable way to send WhatsApp messages programmatically. It's hosted by Meta and offers a free tier with 1000 conversations per month.

## Step-by-Step Setup

### 1. Create Meta for Developers Account
1. Go to https://developers.facebook.com/
2. Click "Get Started"
3. Use your Facebook account or create a new one
4. Complete the developer account verification

### 2. Create a WhatsApp Business App
1. In Meta for Developers dashboard, click "Create App"
2. Select "Business" as app type
3. Fill in app details:
   - App Name: "Trafikkvakt Notifications"
   - Contact Email: your email
   - Business Portfolio: Create new or select existing
4. Click "Create App"

### 3. Add WhatsApp Product
1. In your app dashboard, find "WhatsApp" product
2. Click "Set up" on WhatsApp Business API
3. This will create a WhatsApp Business Account

### 4. Get API Credentials
1. In WhatsApp > API Setup section, you'll find:
   - **Phone Number ID**: Used to send messages
   - **WhatsApp Business Account ID**: Your business account
   - **Access Token**: Temporary token for testing
2. For production, you'll need to generate a permanent token

### 5. Configure Webhook (Optional)
1. In WhatsApp > Configuration section
2. Set webhook URL for receiving message status updates
3. For now, we'll skip this and focus on sending messages

### 6. Add Recipients
1. In WhatsApp > API Setup
2. Go to "To" field
3. Add phone numbers that can receive test messages
4. Format: +47xxxxxxxx (Norwegian numbers)

### 7. Test the API
1. In API Setup section, try sending a test message
2. Use the test phone number
3. You should receive a WhatsApp message

## Required Information for Implementation

### Environment Variables Needed:
```
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_RECIPIENT_NUMBER=+47xxxxxxxx
```

### API Endpoint:
```
https://graph.facebook.com/v18.0/{phone-number-id}/messages
```

## Important Notes
- Free tier: 1000 conversations per month
- A conversation starts when you send a message and lasts 24 hours
- Template messages required for messages outside 24-hour window
- For notifications like ours, you'll need approved message templates

## Next Steps
1. Complete the setup above
2. Get your credentials
3. Add them to environment variables
4. Test the implementation
5. Create message templates for approval

## Template Message Example
For scheduled notifications, you'll need an approved template like:

**Template Name**: `traffic_duty_notification`
**Category**: `UTILITY`
**Language**: `no` (Norwegian)
**Content**:
```
🚸 *Trafikkvakt {{1}}*

Følgende barn har trafikkvakt i dag:

{{2}}

📍 Møtetid: 07:30
⏰ Husk refleksvest!

Ha en fin dag! 😊
```

Variables:
- {{1}} = Day name (e.g., "torsdag")  
- {{2}} = Duty list (formatted)

This template needs to be submitted and approved by WhatsApp before use.