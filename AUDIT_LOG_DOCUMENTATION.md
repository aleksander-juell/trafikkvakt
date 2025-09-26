# Traffic Duty Swap Audit Log

## Overview
The audit log feature tracks all duty swaps and moves performed in the traffic duty management system. This provides transparency and accountability for all changes made to duty assignments.

## Features

### 1. Automatic Logging
- **Duty Swaps**: When two children's duties are swapped between different positions
- **Duty Moves**: When a child's duty is moved from one position to an empty slot
- **Timestamp Tracking**: Each action is recorded with a precise timestamp

### 2. Audit Log Display
- Located in the **Configuration page**
- Shows a table with all swap/move operations
- Displays detailed information about each change:
  - Which children were involved
  - Source and destination positions (crossing and day)
  - Type of operation (swap or move)
  - When the operation occurred

### 3. Automatic Cleanup
- The audit log is **automatically cleared** when the auto-fill functionality is run
- This ensures a fresh start for each new duty assignment cycle
- Manual clear option is also available

## Technical Implementation

### Backend Components
1. **AzureTableService**: Stores audit log entries in Azure Table Storage
2. **DataService**: Provides audit log operations (get, store, clear)
3. **API Endpoints**:
   - `GET /api/audit-log` - Retrieve audit log entries
   - `POST /api/audit-log` - Add new audit log entry
   - `DELETE /api/audit-log` - Clear all audit log entries

### Frontend Components
1. **AuditLog Component**: Displays audit log table in the configuration page
2. **DutyGrid Component**: Logs swaps/moves when they occur
3. **ConfigPage Component**: Hosts the audit log display

### Data Structure
Each audit log entry contains:
```typescript
{
  id: string;              // Unique identifier (timestamp-based)
  fromChild: string;       // Child being moved/swapped
  toChild: string;         // Child being swapped with (empty for moves)
  fromCrossing: string;    // Source crossing name
  fromDay: string;         // Source day
  toCrossing: string;      // Destination crossing name
  toDay: string;           // Destination day
  swapType: 'swap' | 'move'; // Type of operation
  timestamp: string;       // When the operation occurred
}
```

## Usage

### Viewing the Audit Log
1. Navigate to the **Configuration** page
2. Scroll down to the **"Vaktbyttelogg"** (Duty Swap Log) section
3. View the table showing all recorded operations

### Understanding Log Entries
- **Bytte (Swap)**: Two children exchanged positions
- **Flytting (Move)**: One child moved to an empty slot
- **Timestamps**: Shown in Norwegian date/time format

### Clearing the Log
- **Automatic**: Happens when "Auto-utfyll alle vakter" is clicked
- **Manual**: Click the "Tøm logg" (Clear Log) button

## Benefits
1. **Transparency**: All duty changes are tracked and visible
2. **Accountability**: History of who made what changes and when
3. **Audit Trail**: Useful for understanding how duties evolved
4. **Fresh Start**: Auto-clearing ensures each cycle starts clean

## Example Log Entries
- "Emma og Liam byttet plass: Hovedgata (Mandag) ↔ Skolegata (Tirsdag)"
- "Sofia flyttet fra Parkveien (Onsdag) til Storgata (Fredag)"