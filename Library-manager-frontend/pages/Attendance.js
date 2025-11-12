import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

// Alert Component
function Alert({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      <button className="alert-close" onClick={onClose}>×</button>
    </div>
  );
}

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [activeAttendance, setActiveAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 5000);
  };

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAttendance();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert('Error fetching attendance: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveAttendance = useCallback(async () => {
    try {
      const data = await api.getActiveAttendance();
      setActiveAttendance(Array.isArray(data.activeRecords) ? data.activeRecords : []);
    } catch (error) {
      showAlert('Error fetching active attendance: ' + error.message, 'error');
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchActiveAttendance();
  }, [fetchAttendance, fetchActiveAttendance]);
  
  const handleRefresh = () => {
    showAlert('Refreshing data...', 'success');
    fetchAttendance();
    fetchActiveAttendance();
  };

  const handleForceOut = async () => {
    if (!window.confirm('Are you sure you want to force out all students?')) return;
    setLoading(true);
    try {
      await api.forceOutAll();
      showAlert('All students forced out successfully!', 'success');
      handleRefresh();
    } catch (error) {
      showAlert('Error forcing out students: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualClockOut = async (id, studentName) => {
    if (!window.confirm(`Are you sure you want to manually clock out ${studentName}?`)) return;
    setLoading(true);
    try {
      await api.manualClockOut(id);
      showAlert(`${studentName} has been clocked out successfully!`, 'success');
      handleRefresh();
    } catch (error) {
      showAlert('Error clocking out: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- CORRECTED: Reads the time directly, ignoring local timezone conversion ---
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    
    // Use getUTCHours() and getUTCMinutes() to read the time "as-is" from the string,
    // preventing the browser from adding its local timezone offset.
    let hours = d.getUTCHours();
    let minutes = d.getUTCMinutes();
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutes} ${ampm}`;
  };

  // --- CORRECTED: Reads the date directly, ignoring local timezone conversion ---
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);

    // Use UTC methods to prevent timezone shifts that might change the date
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1; // getUTCMonth is 0-indexed
    const day = d.getUTCDate();

    return `${month}/${day}/${year}`;
  };
  
  const calculateDuration = (inTime, outTime, currentTime) => {
    if (!inTime) return '-';
    const start = new Date(inTime);

    if (!outTime) {
      const end = currentTime;
      // Note: This duration will be based on the user's local machine time,
      // which is correct for showing a live "active" duration.
      const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
      if (diff < 1) return "Just Now (Active)";
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      return `${hours}h ${minutes}m (Active)`;
    }

    const end = new Date(outTime);
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    if (diff < 0) return "Invalid Timestamps";

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="page-content">
      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
      
      <div className="page-header">
        <h1>📋 Attendance Management</h1>
        <div className="header-actions">
           <button className="btn btn-secondary" onClick={handleRefresh}>
             🔄 Refresh
           </button>
           <button className="btn btn-danger" onClick={handleForceOut}>
             ⚠️ Force OUT All
           </button>
        </div>
      </div>

      <div className="info-card">
        <h2>🟢 Currently Inside Library ({activeAttendance.length})</h2>
        {activeAttendance.length > 0 ? (
          <div className="active-list">
            {activeAttendance.map((record) => (
              <div key={record._id} className="active-item">
                <strong>{record.name}</strong> ({record.rollNumber})
                <br />
                <small>In: {formatTime(record.inTime)}</small>
              </div>
            ))}
          </div>
        ) : (
           <p className="empty-state">No students currently inside</p>
        )}
      </div>

      <div className="summary">Total Records: <strong>{attendance.length}</strong></div>

      {loading ? <div className="loader">Loading...</div> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Duration</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.rollNumber}</td>
                  <td>{record.name}</td>
                  <td>{formatTime(record.inTime)}</td>
                  <td>{formatTime(record.outTime)}</td>
                  <td>{calculateDuration(record.inTime, record.outTime, now)}</td>
                  <td>{formatDate(record.inTime)}</td>
                  <td>
                    {!record.outTime ? (
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleManualClockOut(record._id, record.name)} 
                        title="Manual Clock OUT"
                      >
                        ➡️
                      </button>
                    ) : (
                      <span title="Student is already out">✅</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Attendance;

