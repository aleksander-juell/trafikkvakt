# Testing the Audit Log Feature

This document provides step-by-step instructions for testing the audit log functionality.

## Prerequisites
1. Both server (port 3001) and client (port 5174) are running
2. Azure Table Storage is configured and working
3. Some children and crossings are configured in the system

## Test Scenarios

### Scenario 1: Test Duty Swap Logging
1. Navigate to the main duty grid page
2. Perform a duty swap by:
   - **Desktop**: Drag one child's name to another child's position
   - **Mobile**: Double-tap a child, then tap another child
3. Navigate to the Configuration page
4. Scroll down to "Vaktbyttelogg" section
5. **Expected**: Should see a log entry showing the swap with timestamp

### Scenario 2: Test Duty Move Logging
1. Navigate to the main duty grid page
2. Move a child to an empty slot:
   - **Desktop**: Drag a child's name to an empty cell
   - **Mobile**: Double-tap a child, then tap an empty cell
3. Navigate to the Configuration page
4. Check the audit log
5. **Expected**: Should see a log entry showing the move operation

### Scenario 3: Test Auto-Fill Clears Log
1. Make sure there are some entries in the audit log (perform swaps/moves)
2. Navigate to the Configuration page
3. Verify audit log has entries
4. Click "Auto-utfyll alle vakter" button
5. Wait for auto-fill to complete
6. Check the audit log again
7. **Expected**: Audit log should be empty

### Scenario 4: Test Manual Clear
1. Perform some swaps/moves to populate the audit log
2. Navigate to Configuration page
3. Click "Tøm logg" (Clear Log) button
4. **Expected**: Audit log should be empty immediately

### Scenario 5: Test Log Persistence
1. Perform some swaps/moves
2. Refresh the browser page
3. Navigate to Configuration page
4. **Expected**: Audit log entries should still be there (persisted in Azure)

## API Testing (Optional)

You can also test the API endpoints directly:

```bash
# Get audit log
curl -X GET "http://localhost:3001/api/audit-log"

# Clear audit log
curl -X DELETE "http://localhost:3001/api/audit-log"

# Add test audit log entry
curl -X POST "http://localhost:3001/api/audit-log" \
  -H "Content-Type: application/json" \
  -d '{
    "fromChild": "Test Child 1",
    "toChild": "Test Child 2",
    "fromCrossing": "Test Crossing 1",
    "fromDay": "Mandag",
    "toCrossing": "Test Crossing 2",
    "toDay": "Tirsdag",
    "swapType": "swap"
  }'
```

## Expected Log Entry Formats

### Swap Entry
"Emma og Liam byttet plass: Hovedgata (Mandag) ↔ Skolegata (Tirsdag)"

### Move Entry
"Sofia flyttet fra Parkveien (Onsdag) til Storgata (Fredag)"

## Troubleshooting

### No Log Entries Appearing
1. Check browser console for JavaScript errors
2. Verify server is running and accessible
3. Check server logs for Azure Table Storage errors
4. Ensure swaps are actually being performed (check for success animations)

### Log Not Clearing After Auto-Fill
1. Check server logs for errors during auto-fill
2. Verify Azure Table Storage connection
3. Check that auto-fill completed successfully

### Entries Not Persisting
1. Verify Azure Table Storage configuration
2. Check server logs for storage errors
3. Test API endpoints directly with curl