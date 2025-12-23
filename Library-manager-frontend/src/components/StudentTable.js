import React from 'react';

function StudentTable({ students, sortConfig, onSort, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => onSort('rollNumber')}>
              Roll Number {sortConfig.key === 'rollNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => onSort('cardId')}>
              Card ID {sortConfig.key === 'cardId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => onSort('name')}>
              Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => onSort('branch')}>
              Branch {sortConfig.key === 'branch' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student._id}>
              <td>{student.rollNumber}</td>
              <td>{student.cardId}</td>
              <td>{student.name}</td>
              <td>{student.branch}</td>
              <td>{student.mobile}</td>
              <td>{student.email}</td>
              <td>
                <button className="btn-icon btn-edit" onClick={() => onEdit(student)} title="Edit">
                  ✏️
                </button>
                <button className="btn-icon btn-delete" onClick={() => onDelete(student._id)} title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;