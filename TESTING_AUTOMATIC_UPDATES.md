# How to Test Automatic Updates

## ✅ **FIXED & DEPLOYED** - Ready for Testing!

The automatic updates feature has been fixed and deployed to:
**https://trafikkvakt.azurewebsites.net**

### 🧪 **Testing Instructions:**

#### **Method 1: Two Browser Windows**
1. Open the app in **two different browser windows/tabs**:
   - Window A: https://trafikkvakt.azurewebsites.net
   - Window B: https://trafikkvakt.azurewebsites.net (or different browser)

2. **Make a duty swap in Window A**:
   - Double-tap a child's name (mobile) or drag-drop (desktop)
   - Save the change

3. **Watch Window B**:
   - Within **15 seconds**, Window B should automatically refresh
   - Look for the blue "**Oppdaterer...**" indicator
   - The duty grid will update with the changes from Window A

#### **Method 2: Different Devices**
1. Open the app on your **computer**: https://trafikkvakt.azurewebsites.net
2. Open the app on your **phone**: https://trafikkvakt.azurewebsites.net  
3. Make changes on one device
4. Watch the other device automatically update within 15 seconds

#### **Method 3: Test with API Calls** (Advanced)
```bash
# Get current data version
curl https://trafikkvakt.azurewebsites.net/api/data-version

# The timestamp should change after making duty updates through the UI
```

### 🔍 **What to Look For:**

1. **Visual Indicator**: Blue "Oppdaterer..." badge appears during refresh
2. **Console Logs**: Open browser DevTools to see:
   - "DutyGrid: Set initial data version: [timestamp]"
   - "Data update detected, refreshing UI..."
   - "DutyGrid: Loading data..."

3. **Automatic Refresh**: Changes appear in the second window/device without manual refresh

### 🐛 **Troubleshooting:**

If automatic updates still don't work:

1. **Check Browser Console** (F12 → Console tab) for errors
2. **Verify Network Requests**: Look for regular `/api/data-version` calls every 15 seconds
3. **Test Data Version Endpoint**: Should return current timestamp
4. **Check if Changes Save**: Verify that duty swaps actually save to the server

### ⚡ **How It Works:**

- **Every 15 seconds**: UI checks if data has changed on the server
- **When changes detected**: Automatically refreshes the duty grid  
- **Visual feedback**: Shows "Oppdaterer..." during refresh
- **Multi-user sync**: All users see changes from other users automatically

The system is now live and ready for testing! 🚀