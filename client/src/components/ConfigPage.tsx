import { useState, useEffect } from 'react';
import { AuditLog } from './AuditLog';

interface Crossing {
  name: string;
  googleMapsLink: string;
}

export function ConfigPage() {
  const [children, setChildren] = useState<string[]>([]);
  const [crossings, setCrossings] = useState<Crossing[]>([]);
  const [schedule, setSchedule] = useState({
    startDate: '',
    endDate: '',
    weekNumber: 1,
    year: 2025
  });
  const [newChild, setNewChild] = useState('');
  const [newCrossing, setNewCrossing] = useState('');
  const [newCrossingLink, setNewCrossingLink] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillMessage, setAutoFillMessage] = useState('');
  const [auditLogKey, setAuditLogKey] = useState(0);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const [childrenRes, crossingsRes, scheduleRes] = await Promise.all([
        fetch('/api/children'),
        fetch('/api/crossings'),
        fetch('/api/schedule')
      ]);

      const [childrenData, crossingsData, scheduleData] = await Promise.all([
        childrenRes.json(),
        crossingsRes.json(),
        scheduleRes.json()
      ]);

      setChildren(childrenData.children || []);
      setCrossings(crossingsData.crossings || []);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const saveChildren = async (newChildren: string[]) => {
    try {
      await fetch('/api/children', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ children: newChildren }),
      });
    } catch (error) {
      console.error('Error saving children:', error);
    }
  };

  const saveCrossings = async (newCrossings: Crossing[]) => {
    try {
      await fetch('/api/crossings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crossings: newCrossings }),
      });
    } catch (error) {
      console.error('Error saving crossings:', error);
    }
  };

  const saveSchedule = async (newSchedule: any) => {
    try {
      await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const addChild = () => {
    if (newChild.trim()) {
      const updated = [...children, newChild.trim()];
      setChildren(updated);
      saveChildren(updated);
      setNewChild('');
    }
  };

  const removeChild = (index: number) => {
    const updated = children.filter((_, i) => i !== index);
    setChildren(updated);
    saveChildren(updated);
  };

  const addCrossing = () => {
    if (newCrossing.trim()) {
      const crossing: Crossing = {
        name: newCrossing.trim(),
        googleMapsLink: newCrossingLink.trim() || `https://maps.google.com/?q=${encodeURIComponent(newCrossing.trim())} Oslo`
      };
      const updated = [...crossings, crossing];
      setCrossings(updated);
      saveCrossings(updated);
      setNewCrossing('');
      setNewCrossingLink('');
    }
  };

  const removeCrossing = (index: number) => {
    const updated = crossings.filter((_, i) => i !== index);
    setCrossings(updated);
    saveCrossings(updated);
  };

  const updateSchedule = (field: string, value: any) => {
    const updated = { ...schedule, [field]: value };
    setSchedule(updated);
    saveSchedule(updated);
  };

  const autoFillDuties = async () => {
    if (children.length === 0 || crossings.length === 0) {
      setAutoFillMessage('Vennligst legg til barn og veikryss før auto-utfylling av vakter.');
      setTimeout(() => setAutoFillMessage(''), 5000);
      return;
    }

    setIsAutoFilling(true);
    setAutoFillMessage('');
    
    try {
      const response = await fetch('/api/duties/auto-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        setAutoFillMessage(`Vakter auto-utfylt! ${Object.keys(result.distribution).length} barn tildelt.`);
        
        console.log('ConfigPage: Auto-fill successful, result:', result);
        console.log('ConfigPage: Dispatching autoFillComplete event after delay');
        
        // Add a small delay to ensure file operations are complete
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('autoFillComplete'));
          // Force refresh of audit log component since it was cleared
          setAuditLogKey(prev => prev + 1);
        }, 100);
      } else {
        const error = await response.json();
        setAutoFillMessage(`Feil: ${error.error}`);
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
      setAutoFillMessage('Kunne ikke auto-utfylle vakter. Prøv igjen.');
    } finally {
      setIsAutoFilling(false);
      setTimeout(() => setAutoFillMessage(''), 5000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Konfigurasjon</h1>

      <div className="space-y-8">
        {/* Schedule Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Timeplan innstillinger</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Startdato
              </label>
              <input
                type="date"
                value={schedule.startDate}
                onChange={(e) => updateSchedule('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sluttdato
              </label>
              <input
                type="date"
                value={schedule.endDate}
                onChange={(e) => updateSchedule('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ukenummer
              </label>
              <input
                type="number"
                value={schedule.weekNumber}
                onChange={(e) => updateSchedule('weekNumber', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                År
              </label>
              <input
                type="number"
                value={schedule.year}
                onChange={(e) => updateSchedule('year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Children Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Barn</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newChild}
              onChange={(e) => setNewChild(e.target.value)}
              placeholder="Skriv inn barnets navn"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addChild()}
            />
            <button
              onClick={addChild}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Legg til
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {children.map((child, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
              >
                <span>{child}</span>
                <button
                  onClick={() => removeChild(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Crossings Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Veikryss</h2>
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={newCrossing}
              onChange={(e) => setNewCrossing(e.target.value)}
              placeholder="Skriv inn veikryss plassering"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && newCrossingLink.trim() && addCrossing()}
            />
            <input
              type="url"
              value={newCrossingLink}
              onChange={(e) => setNewCrossingLink(e.target.value)}
              placeholder="Google Maps lenke (valgfritt - genereres automatisk hvis tom)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && newCrossing.trim() && addCrossing()}
            />
            <button
              onClick={addCrossing}
              disabled={!newCrossing.trim()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Legg til veikryss
            </button>
          </div>
          <div className="space-y-2">
            {crossings.map((crossing, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{crossing.name}</span>
                  <a 
                    href={crossing.googleMapsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    📍 {crossing.googleMapsLink}
                  </a>
                </div>
                <button
                  onClick={() => removeCrossing(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Fill Duties */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Vaktadministrasjon</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 mb-4">
                Auto-utfyll vil fordele vakter rettferdig mellom alle barn, og sikre at ingen barn blir tildelt flere veikryss på samme dag.
              </p>
              <button
                onClick={autoFillDuties}
                disabled={isAutoFilling || children.length === 0 || crossings.length === 0}
                className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isAutoFilling ? 'Auto-utfyller...' : 'Auto-utfyll alle vakter'}
              </button>
            </div>
            {autoFillMessage && (
              <div className={`p-3 rounded-md ${
                autoFillMessage.includes('Error') || autoFillMessage.includes('Failed')
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : autoFillMessage.includes('Please add')
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}>
                {autoFillMessage}
              </div>
            )}
          </div>
        </div>

        {/* Audit Log */}
        <AuditLog key={auditLogKey} />
      </div>
    </div>
  );
}