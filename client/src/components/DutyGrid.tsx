import { useState, useEffect } from 'react';
import { usePolling } from '../hooks/usePolling';

interface DutyData {
  duties: {
    [crossing: string]: {
      [day: string]: string;
    };
  };
}

interface ScheduleConfig {
  startDate: string;
  endDate: string;
  weekNumber: number;
  year: number;
}

interface Crossing {
  name: string;
  googleMapsLink: string;
}

const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'];

// Color palette for children - using Tailwind CSS colors for consistency
// Extended palette with more colors and variations for better differentiation
const CHILD_COLORS = [
  // Primary bright colors
  'bg-red-100 text-red-800 border-red-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  
  // Secondary colors
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-lime-100 text-lime-800 border-lime-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  
  // Violet and purple variations
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  
  // Stronger color variations (200 background for more contrast)
  'bg-red-200 text-red-900 border-red-300',
  'bg-blue-200 text-blue-900 border-blue-300',
  'bg-green-200 text-green-900 border-green-300',
  'bg-yellow-200 text-yellow-900 border-yellow-300',
  'bg-purple-200 text-purple-900 border-purple-300',
  'bg-pink-200 text-pink-900 border-pink-300',
  'bg-indigo-200 text-indigo-900 border-indigo-300',
  'bg-teal-200 text-teal-900 border-teal-300',
  'bg-orange-200 text-orange-900 border-orange-300',
  'bg-cyan-200 text-cyan-900 border-cyan-300',
  
  // Additional unique colors
  'bg-lime-200 text-lime-900 border-lime-300',
  'bg-emerald-200 text-emerald-900 border-emerald-300',
  'bg-violet-200 text-violet-900 border-violet-300',
  'bg-fuchsia-200 text-fuchsia-900 border-fuchsia-300',
  'bg-rose-200 text-rose-900 border-rose-300',
  'bg-amber-200 text-amber-900 border-amber-300',
  'bg-sky-200 text-sky-900 border-sky-300',
  
  // Neutral colors for additional children
  'bg-slate-100 text-slate-800 border-slate-200',
  'bg-gray-100 text-gray-800 border-gray-200',
  'bg-stone-100 text-stone-800 border-stone-200',
  'bg-zinc-100 text-zinc-800 border-zinc-200',
  'bg-neutral-100 text-neutral-800 border-neutral-200',
  
  // More distinct combinations
  'bg-red-50 text-red-700 border-red-300',
  'bg-blue-50 text-blue-700 border-blue-300',
  'bg-green-50 text-green-700 border-green-300',
  'bg-yellow-50 text-yellow-700 border-yellow-300',
  'bg-purple-50 text-purple-700 border-purple-300',
  'bg-pink-50 text-pink-700 border-pink-300',
  'bg-indigo-50 text-indigo-700 border-indigo-300',
  'bg-teal-50 text-teal-700 border-teal-300',
  'bg-orange-50 text-orange-700 border-orange-300',
  'bg-cyan-50 text-cyan-700 border-cyan-300'
];

export function DutyGrid() {
  const [duties, setDuties] = useState<DutyData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [crossings, setCrossings] = useState<Crossing[]>([]);
  const [children, setChildren] = useState<string[]>([]);
  const [lastDataVersion, setLastDataVersion] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [draggedData, setDraggedData] = useState<{
    child: string;
    crossing: string;
    day: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{
    crossing: string;
    day: string;
  } | null>(null);
  const [selectedChild, setSelectedChild] = useState('');
  
  // Mobile tap-to-swap state
  const [selectedForSwap, setSelectedForSwap] = useState<{
    child: string;
    crossing: string;
    day: string;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lastTap, setLastTap] = useState<{
    child: string;
    crossing: string;
    day: string;
    timestamp: number;
  } | null>(null);
  
  // Selection state for highlighting duties
  const [selectedChildForHighlight, setSelectedChildForHighlight] = useState<string | null>(null);

  // Success animation state for swap feedback
  const [swapSuccessAnimation, setSwapSuccessAnimation] = useState<{
    sourceCrossing: string;
    sourceDay: string;
    targetCrossing: string;
    targetDay: string;
  } | null>(null);

  // Function to check for data updates
  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/data-version');
      const data = await response.json();
      
      if (lastDataVersion && data.lastUpdate !== lastDataVersion) {
        console.log('Data update detected, refreshing UI...');
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
      }
      
      setLastDataVersion(data.lastUpdate);
    } catch (error) {
      console.error('Error checking for updates:', error);
      setIsRefreshing(false);
    }
  };

  // Set up fast polling for near real-time updates (check every 2 seconds)
  usePolling(checkForUpdates, 2000, !loading);

  useEffect(() => {
    loadData();
    
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Listen for auto-fill completion events
    const handleAutoFillComplete = () => {
      console.log('DutyGrid: Received autoFillComplete event, reloading data...');
      loadData();
    };

    window.addEventListener('autoFillComplete', handleAutoFillComplete);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('autoFillComplete', handleAutoFillComplete);
    };
  }, []);

  const loadData = async () => {
    console.log('DutyGrid: Loading data...');
    try {
      const [dutiesRes, scheduleRes, crossingsRes, childrenRes] = await Promise.all([
        fetch('/api/duties'),
        fetch('/api/schedule'),
        fetch('/api/crossings'),
        fetch('/api/children')
      ]);

      const [dutiesData, scheduleData, crossingsData, childrenData] = await Promise.all([
        dutiesRes.json(),
        scheduleRes.json(),
        crossingsRes.json(),
        childrenRes.json()
      ]);

      console.log('DutyGrid: Loaded duties data:', dutiesData);
      console.log('DutyGrid: Loaded crossings data:', crossingsData);
      console.log('DutyGrid: Setting duties to:', dutiesData);
      setDuties(dutiesData);
      setSchedule(scheduleData);
      setCrossings(crossingsData.crossings || []);
      setChildren(childrenData.children || []);

      // Get initial data version after first load
      if (!lastDataVersion) {
        try {
          const versionRes = await fetch('/api/data-version');
          const versionData = await versionRes.json();
          setLastDataVersion(versionData.lastUpdate);
          console.log('DutyGrid: Set initial data version:', versionData.lastUpdate);
        } catch (error) {
          console.error('Error getting initial data version:', error);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (child: string, crossing: string, day: string) => {
    setDraggedData({ child, crossing, day });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetCrossing: string, targetDay: string) => {
    e.preventDefault();
    if (draggedData && duties) {
      const newDuties = { ...duties };
      
      // Get the current child in the target cell
      const targetChild = newDuties.duties[targetCrossing]?.[targetDay];
      
      // Ensure both crossings exist in the duties object
      if (!newDuties.duties[draggedData.crossing]) {
        newDuties.duties[draggedData.crossing] = {};
      }
      if (!newDuties.duties[targetCrossing]) {
        newDuties.duties[targetCrossing] = {};
      }

      // Prepare audit log entry
      const auditEntry: any = {
        fromChild: draggedData.child,
        fromCrossing: draggedData.crossing,
        fromDay: draggedData.day,
        toCrossing: targetCrossing,
        toDay: targetDay,
        swapType: targetChild ? 'swap' : 'move'
      };
      
      // Perform the swap
      newDuties.duties[targetCrossing][targetDay] = draggedData.child;
      
      if (targetChild) {
        // If target cell had a child, move it to the source cell
        auditEntry.toChild = targetChild;
        newDuties.duties[draggedData.crossing][draggedData.day] = targetChild;
      } else {
        // If target cell was empty, clear the source cell
        auditEntry.toChild = '';
        delete newDuties.duties[draggedData.crossing][draggedData.day];
      }
      
      setDuties(newDuties);
      saveDuties(newDuties);
      
      // Log the swap to audit log
      logSwapToAudit(auditEntry);
      
      // Trigger success animation
      setSwapSuccessAnimation({
        sourceCrossing: draggedData.crossing,
        sourceDay: draggedData.day,
        targetCrossing,
        targetDay
      });
      
      // Clear animation after 2.5 seconds
      setTimeout(() => {
        setSwapSuccessAnimation(null);
      }, 2500);
      
      setDraggedData(null);
    }
  };

  // Mobile tap-to-swap handlers
  const handleChildTap = (child: string, crossing: string, day: string) => {
    if (!isMobile) return; // Only handle on mobile
    
    // If we have a child selected for swapping
    if (selectedForSwap) {
      // Check if tapping the same child that's selected for swapping
      if (selectedForSwap.child === child && 
          selectedForSwap.crossing === crossing && 
          selectedForSwap.day === day) {
        // Deselect the swap selection
        setSelectedForSwap(null);
        // Allow highlighting to work
        if (selectedChildForHighlight === child) {
          setSelectedChildForHighlight(null);
        } else {
          setSelectedChildForHighlight(child);
        }
      } else {
        // Different child - perform the swap
        performSwap(selectedForSwap, { child, crossing, day });
        setSelectedForSwap(null);
      }
      return;
    }
    
    // No child selected for swapping - handle double-tap detection for selection
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // milliseconds
    
    // Check if this is a double tap on the same child
    if (lastTap && 
        lastTap.child === child && 
        lastTap.crossing === crossing && 
        lastTap.day === day &&
        now - lastTap.timestamp < DOUBLE_TAP_DELAY) {
      
      // Double tap detected - select for swapping
      setSelectedForSwap({ child, crossing, day });
      
      // Clear last tap to prevent triple-tap issues
      setLastTap(null);
    } else {
      // Single tap - handle highlighting
      if (selectedChildForHighlight === child) {
        setSelectedChildForHighlight(null);
      } else {
        setSelectedChildForHighlight(child);
      }
      
      // Store this tap for potential double-tap
      setLastTap({ child, crossing, day, timestamp: now });
    }
  };

  const handleCellClick = (childName: string | undefined, crossing: string, day: string) => {
    const isEmptyCell = !childName || childName.trim() === '';
    
    // Handle mobile empty cell tap for swapping
    if (isMobile && selectedForSwap && isEmptyCell) {
      performSwap(selectedForSwap, { child: '', crossing, day });
      setSelectedForSwap(null);
      return;
    }
    
    // On mobile, if we have a child selected for swapping, don't interfere with highlighting
    // The child tap handler will deal with swapping logic
    if (isMobile && selectedForSwap && childName) {
      // Don't handle highlighting when in swap mode - let handleChildTap handle it
      return;
    }
    
    // Handle normal highlighting behavior (desktop or mobile without swap selection)
    if (!childName) {
      // Clicked on empty cell, clear selection
      setSelectedChildForHighlight(null);
      return;
    }
    
    // Toggle selection - if same child is clicked, deselect
    if (selectedChildForHighlight === childName) {
      setSelectedChildForHighlight(null);
    } else {
      setSelectedChildForHighlight(childName);
    }
  };

  const handleEmptyCellTap = (crossing: string, day: string) => {
    if (!isMobile || !selectedForSwap) return;
    
    // Single tap on empty cell when child is selected for swapping
    performSwap(selectedForSwap, { child: '', crossing, day });
    setSelectedForSwap(null);
  };

  const logSwapToAudit = async (auditEntry: any) => {
    try {
      await fetch('/api/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditEntry),
      });
    } catch (error) {
      console.error('Error logging swap to audit log:', error);
    }
  };

  const performSwap = (source: { child: string; crossing: string; day: string }, 
                      target: { child: string; crossing: string; day: string }) => {
    if (!duties) return;

    const newDuties = { ...duties };
    
    // Ensure both crossings exist in duties
    if (!newDuties.duties[source.crossing]) {
      newDuties.duties[source.crossing] = {};
    }
    if (!newDuties.duties[target.crossing]) {
      newDuties.duties[target.crossing] = {};
    }

    // Prepare audit log entry
    const auditEntry: any = {
      fromChild: source.child,
      fromCrossing: source.crossing,
      fromDay: source.day,
      toCrossing: target.crossing,
      toDay: target.day,
      swapType: target.child ? 'swap' : 'move'
    };

    // Perform the swap
    if (target.child) {
      // Swap with existing child
      auditEntry.toChild = target.child;
      newDuties.duties[target.crossing][target.day] = source.child;
      newDuties.duties[source.crossing][source.day] = target.child;
    } else {
      // Move to empty cell
      auditEntry.toChild = '';
      newDuties.duties[target.crossing][target.day] = source.child;
      delete newDuties.duties[source.crossing][source.day];
    }

    setDuties(newDuties);
    saveDuties(newDuties);
    
    // Log the swap to audit log
    logSwapToAudit(auditEntry);
    
    // Trigger success animation
    setSwapSuccessAnimation({
      sourceCrossing: source.crossing,
      sourceDay: source.day,
      targetCrossing: target.crossing,
      targetDay: target.day
    });
    
    // Clear animation after 2.5 seconds
    setTimeout(() => {
      setSwapSuccessAnimation(null);
    }, 2500);
  };

  const saveDuties = async (dutiesData: DutyData) => {
    try {
      await fetch('/api/duties', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dutiesData),
      });
    } catch (error) {
      console.error('Error saving duties:', error);
    }
  };

  const handleDoubleClick = (crossing: string, day: string) => {
    if (!duties?.duties[crossing]?.[day]) {
      setEditingCell({ crossing, day });
      setSelectedChild('');
    }
  };

  const getAvailableChildren = (day: string, currentCrossing?: string) => {
    if (!duties || !children) return [];
    
    // Get all children assigned to this day across all crossings
    const assignedChildren = new Set<string>();
    Object.entries(duties.duties).forEach(([crossing, days]) => {
      if (days[day] && crossing !== currentCrossing) {
        assignedChildren.add(days[day]);
      }
    });
    
    // Return children not assigned to this day
    return children.filter(child => !assignedChildren.has(child));
  };

  const getChildColor = (childName: string, crossing?: string, day?: string) => {
    if (!children || !childName) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    // Get consistent color index based on child's position in the children array
    const childIndex = children.indexOf(childName);
    if (childIndex === -1) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    // Get the base color
    const baseColor = CHILD_COLORS[childIndex % CHILD_COLORS.length];
    
    // Check if this child is selected for swapping on mobile
    const isSelectedForSwap = selectedForSwap && 
                              selectedForSwap.child === childName && 
                              selectedForSwap.crossing === crossing && 
                              selectedForSwap.day === day;
    
    // If a child is selected for highlighting and this is not that child, apply muted styling
    if (selectedChildForHighlight && selectedChildForHighlight !== childName) {
      return 'bg-gray-50 text-gray-400 border-gray-200 opacity-50';
    }
    
    // If this child is selected for swapping (mobile), add swap selection styling
    if (isSelectedForSwap) {
      return `${baseColor} ring-4 ring-orange-400 ring-opacity-75 shadow-xl scale-105 transform`;
    }
    
    // If this child is selected for highlighting, add highlight styling
    if (selectedChildForHighlight === childName) {
      return `${baseColor} ring-2 ring-blue-400 ring-opacity-75 shadow-lg`;
    }
    
    return baseColor;
  };

  // Check if a cell should show success animation
  const isSuccessAnimating = (crossing: string, day: string) => {
    if (!swapSuccessAnimation) return false;
    return (
      (swapSuccessAnimation.sourceCrossing === crossing && swapSuccessAnimation.sourceDay === day) ||
      (swapSuccessAnimation.targetCrossing === crossing && swapSuccessAnimation.targetDay === day)
    );
  };

  const getDateForDay = (dayName: string) => {
    if (!schedule?.startDate) return '';
    
    const startDate = new Date(schedule.startDate);
    const dayIndex = DAYS.indexOf(dayName);
    
    if (dayIndex === -1) return '';
    
    // Add the day index to get the correct date
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayIndex);
    
    // Format as DD/MM
    return targetDate.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit' 
    });
  };

  const isTodaysColumn = (dayName: string) => {
    if (!schedule?.startDate) return false;
    
    const startDate = new Date(schedule.startDate);
    const dayIndex = DAYS.indexOf(dayName);
    
    if (dayIndex === -1) return false;
    
    // Add the day index to get the correct date
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayIndex);
    
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    return targetDate.getTime() === today.getTime();
  };

  const handleAddChild = (crossing: string, day: string) => {
    if (selectedChild.trim() && duties) {
      const newDuties = { ...duties };
      if (!newDuties.duties[crossing]) {
        newDuties.duties[crossing] = {};
      }
      newDuties.duties[crossing][day] = selectedChild.trim();
      
      setDuties(newDuties);
      saveDuties(newDuties);
      setEditingCell(null);
      setSelectedChild('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setSelectedChild('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Laster...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Holmen Skole 4C Trafikkvakt
          {isRefreshing && (
            <span className="ml-3 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded animate-pulse">
              Oppdaterer...
            </span>
          )}
        </h1>
        {schedule && (
          <p className="text-gray-600">
            Uke {schedule.weekNumber}, {schedule.year} ({schedule.startDate} til {schedule.endDate})
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Duty Grid */}
        <div className="w-full">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className={`px-4 py-3 text-center text-sm font-semibold text-gray-900 ${
                          isTodaysColumn(day) ? 'bg-blue-100 border-b-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className={isTodaysColumn(day) ? 'text-blue-900 font-bold' : ''}>
                            {day}
                          </span>
                          <span className={`text-xs font-normal ${
                            isTodaysColumn(day) ? 'text-blue-700' : 'text-gray-500'
                          }`}>
                            {getDateForDay(day)}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {crossings.map((crossing) => (
                    <tr key={crossing.name}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 bg-gray-50">
                        <a
                          href={crossing.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-blue-700 transition-colors duration-200 flex items-center space-x-1 group"
                          title="Åpne i Google Maps"
                        >
                          <span>{crossing.name}</span>
                          <span className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200">📍</span>
                        </a>
                      </td>
                      {DAYS.map((day) => {
                        const assignedChild = duties?.duties[crossing.name]?.[day];
                        return (
                          <td
                            key={day}
                            className={`px-4 py-4 text-center relative ${
                              isTodaysColumn(day) ? 'bg-blue-50 border-l-2 border-r-2 border-blue-200' : ''
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, crossing.name, day)}
                            data-crossing={crossing.name}
                            data-day={day}
                          >
                            <div 
                              className={`min-h-[60px] border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-500 ${
                                isSuccessAnimating(crossing.name, day) 
                                  ? 'border-green-400 bg-green-50 ring-2 ring-green-300 ring-opacity-75 swap-success-animation' 
                                  : 'border-gray-300 hover:border-blue-400'
                              }`}
                              onDoubleClick={() => handleDoubleClick(crossing.name, day)}
                              onClick={(e) => {
                                const isEmptyCell = !assignedChild || assignedChild.trim() === '';
                                
                                // On mobile, if we have a selected child for swapping and this is an empty cell, handle the swap
                                if (isMobile && selectedForSwap && isEmptyCell) {
                                  e.stopPropagation();
                                  handleEmptyCellTap(crossing.name, day);
                                  return;
                                }
                                // Otherwise handle normal cell click (highlighting)
                                handleCellClick(assignedChild, crossing.name, day);
                              }}
                            >
                              {editingCell?.crossing === crossing.name && editingCell?.day === day ? (
                                // Edit mode
                                <div className="flex items-center space-x-2 p-2">
                                  <select
                                    value={selectedChild}
                                    onChange={(e) => setSelectedChild(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddChild(crossing.name, day);
                                      } else if (e.key === 'Escape') {
                                        handleCancelEdit();
                                      }
                                    }}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                  >
                                    <option value="">Velg et barn...</option>
                                    {getAvailableChildren(day, crossing.name).map((child) => (
                                      <option key={child} value={child}>
                                        {child}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleAddChild(crossing.name, day)}
                                    disabled={!selectedChild}
                                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : assignedChild ? (
                                // Child assigned
                                <div 
                                  className={`${getChildColor(assignedChild, crossing.name, day)} px-3 py-2 rounded-lg text-sm font-medium cursor-pointer hover:opacity-80 transition-all border`}
                                  draggable={!isMobile}
                                  onDragStart={() => !isMobile && handleDragStart(assignedChild, crossing.name, day)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isMobile) {
                                      handleChildTap(assignedChild, crossing.name, day);
                                    } else {
                                      handleCellClick(assignedChild, crossing.name, day);
                                    }
                                  }}
                                >
                                  {assignedChild}
                                </div>
                              ) : (
                                // Empty slot
                                <div 
                                  className={`text-gray-400 text-sm w-full h-full flex items-center justify-center ${
                                    selectedForSwap ? 'border-orange-300 bg-orange-50 cursor-pointer hover:border-orange-400' : ''
                                  }`}
                                >
                                  {isMobile && selectedForSwap ? (
                                    <span className="text-orange-600 font-medium">Trykk for å flytte hit</span>
                                  ) : isMobile ? (
                                    <span>Dobbeltklikk barn for å bytte</span>
                                  ) : (
                                    <span>Dobbeltklikk for å tildele</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Info Panel */}
      {selectedChildForHighlight && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-900 mb-2">
            Valgt barn: {selectedChildForHighlight}
          </h3>
          <div className="text-sm text-green-800">
            <p className="mb-2">Trafikkvakter denne uken:</p>
            <div className="flex flex-wrap gap-2">
              {duties && Object.entries(duties.duties).map(([crossing, days]) =>
                Object.entries(days).map(([day, child]) =>
                  child === selectedChildForHighlight ? (
                    <span
                      key={`${crossing}-${day}`}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                    >
                      {day} - {crossing}
                    </span>
                  ) : null
                )
              ).filter(Boolean)}
            </div>
            {isMobile ? (
              <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-md">
                <p className="text-xs text-green-700 font-medium mb-1">
                  💡 For å bytte dette barnet med en annen:
                </p>
                <p className="text-xs text-green-600">
                  <strong>Dobbeltklikk</strong> på dette barnet for å velge det for bytte
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-green-600">
                Klikk på en annen celle eller samme celle igjen for å avbryte valget
              </p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Instruksjoner:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Klikk på et barns navn for å se alle deres vakter uthevet</li>
          <li>• Dra et barns navn fra en celle til en annen for å bytte</li>
          <li>• Alle endringer lagres automatisk</li>
        </ul>
      </div>

      {/* Mobile Instructions Panel */}
      {isMobile && selectedForSwap && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-100 border border-orange-300 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="text-center">
            <div className="text-orange-800 font-semibold mb-2">
              Valgt barn: {selectedForSwap.child}
            </div>
            <div className="text-orange-700 text-sm">
              <strong>Klikk</strong> på et annet barn for å bytte, eller på en tom rute for å flytte dit. 
              Klikk på samme barn igjen for å avbryte.
            </div>
            <button 
              onClick={() => setSelectedForSwap(null)}
              className="mt-2 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Mobile Help Text */}
      {isMobile && !selectedForSwap && !selectedChildForHighlight && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-blue-800 text-sm">
            <div className="font-semibold mb-2">📱 Mobil:</div>
            <div className="space-y-1">
              <div>• <strong>Enkelt-klikk</strong> på et barn for å se alle deres vakter</div>
              <div>• <strong>Dobbeltklikk</strong> på et barn for å velge det for bytte</div>
              <div>• Klikk på tom rute eller annet barn for å fullføre bytte</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}