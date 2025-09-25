# WhatsApp Notifications Setup Guide

## Overview
This system sends daily WhatsApp notifications to a parent group with information about children scheduled for traffic warden duties each morning at 7:00 AM.

## Setup Steps

### 1. Environment Configuration
Create a `.env` file in the `server` folder based on `.env.example`:

```bash
# WhatsApp Configuration
WHATSAPP_GROUP_ID=your_whatsapp_group_id_here@g.us
WHATSAPP_AUTO_INIT=false
WHATSAPP_NOTIFICATIONS_ENABLED=true
NOTIFICATION_TIME=07:00
```

### 2. WhatsApp Connection
1. Start the server: `npm run dev` (in server folder)
2. Navigate to the WhatsApp configuration page in your web app
3. Click "Koble til WhatsApp"
4. Scan the QR code with your phone (WhatsApp → Settings → Linked Devices → Link a device)
5. Once connected, find your parent group in the list
6. Copy the group ID and update the `WHATSAPP_GROUP_ID` environment variable

### 3. Testing
- Use the "Send Test" button to verify WhatsApp connection works
- Use "Send test varsel" to test the notification system
- Check server logs for any errors

## Message Format
The daily message will look like:
```
🚸 Trafikkvakt mandag

Følgende barn har trafikkvakt i dag:

1. Ameli - Holmen gate/Tovesvingen
2. Johan - Holmen gate/Åsenveien

📍 Møtetid: 07:30
⏰ Husk refleksvest!

Ha en fin dag! 😊
```

## Features
- **Daily notifications**: Automatic messages at 7:00 AM on weekdays
- **Smart scheduling**: Only sends on school days (Monday-Friday)
- **Norwegian language**: All messages in Norwegian
- **Group messaging**: Single message to parent WhatsApp group
- **Empty day handling**: Notifies when no duties are scheduled
- **Test functionality**: Ability to send test messages and notifications

## Technical Details
- Uses `whatsapp-web.js` library
- Requires persistent browser session (saved locally)
- Scheduled using `node-cron`
- Timezone: Europe/Oslo
- Notification time configurable via environment variable

## Troubleshooting
1. **QR Code not appearing**: Restart server and try connecting again
2. **Messages not sending**: Check WhatsApp connection status and group ID
3. **Notifications not scheduled**: Ensure `WHATSAPP_NOTIFICATIONS_ENABLED=true`
4. **Wrong time**: Update `NOTIFICATION_TIME` in environment variables

## Production Considerations
- Session data is stored in `server/whatsapp-session/` folder
- Keep this folder persistent across deployments
- Consider using WhatsApp Business API for production reliability
- Monitor server logs for connection issues

## API Endpoints
- `GET /api/whatsapp/status` - Connection status
- `POST /api/whatsapp/connect` - Initialize connection
- `GET /api/whatsapp/groups` - List available groups
- `POST /api/whatsapp/test` - Send test message
- `GET /api/notifications/status` - Notification status
- `POST /api/notifications/test` - Send test notification