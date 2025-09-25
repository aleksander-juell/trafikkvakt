import { useState, useEffect } from 'react';

interface WhatsAppBusinessStatus {
  status: string;
  isReady: boolean;
  hasCredentials: boolean;
  phoneNumberId?: string;
  recipientNumber?: string;
  service?: string;
}

interface NotificationStatus {
  enabled: boolean;
  running: boolean;
  notificationTime: string;
  nextScheduled: string | null;
}

const WhatsAppConfig = () => {
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppBusinessStatus>({
    status: 'disconnected',
    isReady: false,
    hasCredentials: false
  });
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [newNotificationTime, setNewNotificationTime] = useState('07:00');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStatus();
    fetchNotificationStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp-business/status');
      const data = await response.json();
      setWhatsappStatus(data);
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      setError('Failed to fetch WhatsApp Business API status');
    }
  };

  const fetchNotificationStatus = async () => {
    try {
      const response = await fetch('/api/notifications/status');
      if (response.ok) {
        const data = await response.json();
        setNotificationStatus(data);
        setNewNotificationTime(data.notificationTime || '07:00');
      }
    } catch (error) {
      console.error('Error fetching notification status:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/whatsapp-business/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message || 'Connected successfully!');
        await fetchStatus();
      } else {
        setError(result.error || 'Failed to connect');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setError('Network error during connection');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/whatsapp-business/test-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Test message sent successfully!');
      } else {
        setError(result.error || 'Failed to send test message');
      }
    } catch (error) {
      console.error('Test message error:', error);
      setError('Network error sending test message');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTodaysDuties = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/notifications/send-todays-duties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Today\'s duties notification sent successfully!');
      } else {
        setError(result.error || 'Failed to send today\'s duties');
      }
    } catch (error) {
      console.error('Today\'s duties error:', error);
      setError('Network error sending today\'s duties');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCustomTemplate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/whatsapp-business/test-custom-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Custom template test sent successfully!');
      } else {
        // If template not approved, show friendly message
        if (result.error.includes('Template name does not exist')) {
          setError('Custom template not yet approved by Meta. Using Hello World fallback.');
          // Try fallback
          await handleSendTestMessage();
        } else {
          setError(result.error || 'Failed to send custom template');
        }
      }
    } catch (error) {
      console.error('Custom template error:', error);
      setError('Network error sending custom template');
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationTime = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/notifications/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ time: newNotificationTime })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Notification time updated to ${newNotificationTime}`);
        await fetchNotificationStatus();
      } else {
        setError(result.error || 'Failed to update notification time');
      }
    } catch (error) {
      console.error('Notification time update error:', error);
      setError('Network error updating notification time');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string, isReady: boolean) => {
    if (isReady) return 'Connected & Ready';
    switch (status) {
      case 'ready': return 'Ready';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      case 'disconnected': return 'Disconnected';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">WhatsApp Business API Configuration</h2>
        
        {/* Status Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Connection Status</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className={`text-lg font-semibold ${getStatusColor(whatsappStatus.status)}`}>
                  {getStatusText(whatsappStatus.status, whatsappStatus.isReady)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Service</p>
                <p className="text-sm font-medium text-gray-900">{whatsappStatus.service || 'WhatsApp Business API'}</p>
              </div>
            </div>
            
            {whatsappStatus.recipientNumber && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">Target Phone Number</p>
                <p className="text-sm font-medium text-gray-900">{whatsappStatus.recipientNumber}</p>
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Credentials</p>
              <p className={`text-sm font-medium ${whatsappStatus.hasCredentials ? 'text-green-600' : 'text-red-600'}`}>
                {whatsappStatus.hasCredentials ? 'Configured' : 'Missing'}
              </p>
            </div>
          </div>
        </div>

        {/* Connection Button */}
        <div className="mb-6">
          <button
            onClick={handleConnect}
            disabled={loading}
            className={`w-full px-4 py-2 rounded-md font-medium ${
              whatsappStatus.isReady
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Connecting...' : whatsappStatus.isReady ? 'Reconnect' : 'Connect to WhatsApp Business API'}
          </button>
        </div>

        {/* Test Messages Section */}
        {whatsappStatus.isReady && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Test Messages</h3>
            <div className="space-y-3">
              <button
                onClick={handleSendTestMessage}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Hello World Test'}
              </button>
              
              <button
                onClick={handleTestCustomTemplate}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Test Custom Duties Template'}
              </button>
              
              <button
                onClick={handleSendTodaysDuties}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Today\'s Duties Notification'}
              </button>
            </div>
          </div>
        )}

        {/* Notification Scheduler Section */}
        {notificationStatus && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Daily Notification Schedule</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${notificationStatus.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {notificationStatus.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Running</p>
                  <p className={`text-sm font-medium ${notificationStatus.running ? 'text-green-600' : 'text-red-600'}`}>
                    {notificationStatus.running ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Time</p>
                  <p className="text-sm font-medium text-gray-900">{notificationStatus.notificationTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Scheduled</p>
                  <p className="text-sm font-medium text-gray-900">
                    {notificationStatus.nextScheduled ? new Date(notificationStatus.nextScheduled).toLocaleString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newNotificationTime}
                  onChange={(e) => setNewNotificationTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={updateNotificationTime}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Time'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">About WhatsApp Business API</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Uses Meta's official WhatsApp Business Cloud API</li>
            <li>• Sends notifications directly to configured phone number</li>
            <li>• Template messages for compliance with WhatsApp policies</li>
            <li>• Daily notifications at scheduled time (Monday-Friday)</li>
            <li>• Custom template pending approval: "trafikkvakt_dagens_vakter"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfig;