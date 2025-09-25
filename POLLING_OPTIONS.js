// Quick polling options for faster updates

// Current: 15 seconds
usePolling(checkForUpdates, 15000, !loading && !isConnected);

// Faster options:

// Option A: 5 seconds (very responsive, more server load)
usePolling(checkForUpdates, 5000, !loading && !isConnected);

// Option B: 3 seconds (near real-time, higher server load)
usePolling(checkForUpdates, 3000, !loading && !isConnected);

// Option C: 1 second (very fast, significant server load - not recommended for production)
usePolling(checkForUpdates, 1000, !loading && !isConnected);