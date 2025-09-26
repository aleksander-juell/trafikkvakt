import { useState, useEffect } from 'react';

interface AuditLogEntry {
  id: string;
  fromChild: string;
  toChild: string;
  fromCrossing: string;
  fromDay: string;
  toCrossing: string;
  toDay: string;
  swapType: 'swap' | 'move';
  timestamp: string;
}

export function AuditLog() {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLog();
  }, []);

  const loadAuditLog = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audit-log');
      if (response.ok) {
        const data = await response.json();
        setAuditLog(data.auditLog || []);
      }
    } catch (error) {
      console.error('Error loading audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuditLog = async () => {
    try {
      const response = await fetch('/api/audit-log', {
        method: 'DELETE'
      });
      if (response.ok) {
        setAuditLog([]);
      } else {
        console.error('Failed to clear audit log');
      }
    } catch (error) {
      console.error('Error clearing audit log:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('nb-NO') + ' ' + date.toLocaleTimeString('nb-NO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatSwap = (entry: AuditLogEntry) => {
    if (entry.swapType === 'move') {
      return `${entry.fromChild} flyttet fra ${entry.fromCrossing} (${entry.fromDay}) til ${entry.toCrossing} (${entry.toDay})`;
    } else {
      return `${entry.fromChild} og ${entry.toChild} byttet plass: ${entry.fromCrossing} (${entry.fromDay}) ↔ ${entry.toCrossing} (${entry.toDay})`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Vaktbyttelogg</h2>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-500">Laster...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Vaktbyttelogg</h2>
        {auditLog.length > 0 && (
          <button
            onClick={clearAuditLog}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            Tøm logg
          </button>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Denne loggen viser alle vaktbytter som har blitt utført. Loggen tømmes automatisk når auto-utfyll kjøres.
      </div>

      {auditLog.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">📋</div>
          <div>Ingen vaktbytter registrert ennå</div>
          <div className="text-sm mt-1">Bytter vil vises her når de utføres</div>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Byttedetaljer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tidspunkt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLog.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatSwap(entry)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.swapType === 'swap' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {entry.swapType === 'swap' ? 'Bytte' : 'Flytting'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}