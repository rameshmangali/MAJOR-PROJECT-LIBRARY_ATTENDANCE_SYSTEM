import React from 'react';

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'attendance', label: 'Attendance', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📊' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>📚 Library Manager</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;