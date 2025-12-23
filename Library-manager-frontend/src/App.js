import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

function App() {
  const [activePage, setActivePage] = useState('students'); // Default page

  const renderPage = () => {
    switch (activePage) {
      case 'students':
        return <Students />;
      case 'attendance':
        return <Attendance />;
      case 'reports':
        return <Reports />;
      default:
        return <Students />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;