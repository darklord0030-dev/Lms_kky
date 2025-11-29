import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import HomePage from './HomePage';
import TestsPage from './TestsPage';
import AssignmentsPage from './AssignmentsPage';
import CertificatesPage from "./CertificatesPage";
function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'tests':
        return <TestsPage />;
      case 'assignments':
        return <AssignmentsPage />;
      case 'certificates':
        return <CertificatesPage />;
      case 'catalog':
        return <HomePage />;
      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Calendar</h1>
            <p className="text-gray-600">Calendar view coming soon...</p>
          </div>
        );
      case 'skills':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Skills</h1>
            <p className="text-gray-600">Skills tracking coming soon...</p>
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
