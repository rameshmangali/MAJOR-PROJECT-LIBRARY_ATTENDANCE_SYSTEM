import React from 'react';

function AttendanceTable({ attendance, formatTime, formatDate, calculateDuration }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Roll Number</th>
            <th>Card ID</th>
            <th>Name</th>
            <th>Branch</th>
            <th>In Time</th>
            <th>Out Time</th>
            <th>Duration</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record, idx) => (
            <tr key={idx}>
              <td>{record.rollNumber}</td>
              <td>{record.cardId}</td>
              <td>{record.name}</td>
              <td>{record.branch}</td>
              <td>{formatTime(record.inTime)}</td>
              <td>{formatTime(record.outTime)}</td>
              <td>{calculateDuration(record.inTime, record.outTime)}</td>
              <td>{formatDate(record.inTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;