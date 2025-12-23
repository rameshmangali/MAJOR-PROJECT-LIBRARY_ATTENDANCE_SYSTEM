import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';

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

function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 5000);
  };
  
  const calculateMinutes = (inTime, outTime) => {
    if (!inTime) return 0;
    const start = new Date(inTime);
    const end = outTime ? new Date(outTime) : new Date();
    return Math.floor((end - start) / 1000 / 60);
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAttendanceByDate(selectedDate);
      
      const aggregated = {};
      // FIX: Check if data is an array before calling forEach
      if (Array.isArray(data)) {
        data.forEach(record => {
          const key = record.rollNumber;
          if (!aggregated[key]) {
            aggregated[key] = {
              rollNumber: record.rollNumber,
              cardId: record.cardId,
              name: record.name,
              branch: record.branch,
              totalMinutes: 0,
              records: []
            };
          }
          
          const duration = calculateMinutes(record.inTime, record.outTime);
          aggregated[key].totalMinutes += duration;
          aggregated[key].records.push(record);
        });
      }
      
      setReportData(Object.values(aggregated));
    } catch (error) {
      showAlert('Error fetching report: ' + error.message, 'error');
      setReportData([]); // Clear old data on error
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString();
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const exportToCSV = () => {
    let csv = 'Roll Number,Card ID,Name,Branch,Total Time\n';
    reportData.forEach(student => {
      csv += `${student.rollNumber},${student.cardId},${student.name},${student.branch},${formatMinutes(student.totalMinutes)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedDate}.csv`;
    a.click();
    
    showAlert('Report exported successfully!', 'success');
  };

  const totalStudents = reportData.length;
  const totalMinutes = reportData.reduce((sum, s) => sum + s.totalMinutes, 0);

  return (
    <div className="page-content">
      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
      
      <div className="page-header">
        <h1>📊 Attendance Reports</h1>
        <button className="btn btn-success" onClick={exportToCSV} disabled={reportData.length === 0}>
          📥 Export CSV
        </button>
      </div>

      <div className="filter-section">
        <div className="form-group" style={{marginBottom: 0}}>
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{totalStudents}</div><div className="stat-label">Total Students</div></div>
        <div className="stat-card"><div className="stat-value">{formatMinutes(totalMinutes)}</div><div className="stat-label">Total Time Spent</div></div>
        <div className="stat-card"><div className="stat-value">{totalStudents > 0 ? formatMinutes(Math.floor(totalMinutes / totalStudents)) : '0h 0m'}</div><div className="stat-label">Average Time</div></div>
      </div>

      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Card ID</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Total Time Spent</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.rollNumber}</td>
                    <td>{student.cardId}</td>
                    <td>
                      <button className="link-button" onClick={() => openStudentDetails(student)}>
                        {student.name}
                      </button>
                    </td>
                    <td>{student.branch}</td>
                    <td><strong>{formatMinutes(student.totalMinutes)}</strong></td>
                    <td>
                      <button className="btn-icon btn-view" onClick={() => openStudentDetails(student)} title="View Details">👁️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No records found for this date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Details for ${selectedStudent?.name}`}>
        {selectedStudent && (
          <div>
            <h4>Total Time: {formatMinutes(selectedStudent.totalMinutes)}</h4>
            <ul>
              {selectedStudent.records.map((rec, i) => (
                <li key={i}>
                  <strong>In:</strong> {formatTime(rec.inTime)} | <strong>Out:</strong> {formatTime(rec.outTime)} | <strong>Duration:</strong> {formatMinutes(calculateMinutes(rec.inTime, rec.outTime))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default Reports;
