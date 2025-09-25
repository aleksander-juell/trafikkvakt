import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DutyGrid } from './components/DutyGrid';
import { ConfigPage } from './components/ConfigPage';
import WhatsAppConfig from './components/WhatsAppConfig';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          <Link
            to="/"
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              location.pathname === '/' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Oversikt
          </Link>
          <Link
            to="/config"
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              location.pathname === '/config' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Innstillinger
          </Link>
          <Link
            to="/whatsapp"
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              location.pathname === '/whatsapp' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            WhatsApp
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<DutyGrid />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/whatsapp" element={<WhatsAppConfig />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;