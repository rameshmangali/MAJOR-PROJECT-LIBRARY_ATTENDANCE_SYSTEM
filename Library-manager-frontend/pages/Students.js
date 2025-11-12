import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import StudentTable from '../components/StudentTable';

// Alert Component (kept here for simplicity as it's only used in page components)
function Alert({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      <button className="alert-close" onClick={onClose}>×</button>
    </div>
  );
}

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [formData, setFormData] = useState({
    rollNumber: '', cardId: '', name: '', branch: '', mobile: '', email: ''
  });
  const [bulkData, setBulkData] = useState('');

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 5000);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      showAlert('Error fetching students: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortedStudents = () => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  };
  
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addStudent(formData);
      showAlert('Student added successfully!', 'success');
      setShowAddModal(false);
      setFormData({ rollNumber: '', cardId: '', name: '', branch: '', mobile: '', email: '' });
      fetchStudents();
    } catch (error) {
      showAlert('Error adding student: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateStudent(currentStudent._id, formData);
      showAlert('Student updated successfully!', 'success');
      setShowEditModal(false);
      setCurrentStudent(null);
      fetchStudents();
    } catch (error) {
      showAlert('Error updating student: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    setLoading(true);
    try {
      await api.deleteStudent(id);
      showAlert('Student deleted successfully!', 'success');
      fetchStudents();
    } catch (error) {
      showAlert('Error deleting student: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student) => {
    setCurrentStudent(student);
    setFormData({
      rollNumber: student.rollNumber,
      cardId: student.cardId,
      name: student.name,
      branch: student.branch,
      mobile: student.mobile,
      email: student.email
    });
    setShowEditModal(true);
  };
  
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const studentsArray = JSON.parse(bulkData);
      await api.addManyStudents(studentsArray);
      showAlert('Students added successfully!', 'success');
      setShowBulkModal(false);
      setBulkData('');
      fetchStudents();
    } catch (error) {
      showAlert('Error adding students: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortedStudents = getSortedStudents();

  return (
    <div className="page-content">
      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
      
      <div className="page-header">
        <h1>👥 Students Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>➕ Add Student</button>
          <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)}>📦 Bulk Upload</button>
        </div>
      </div>

      <div className="filter-section">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by name or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="summary">
          Total Students: <strong>{sortedStudents.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <StudentTable 
          students={sortedStudents}
          sortConfig={sortConfig}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={handleDeleteStudent}
        />
      )}
      
      {/* Modals */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student">
        <form onSubmit={handleAddStudent} className="form">
           <div className="form-group"><label>Roll Number *</label><input type="text" required value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} /></div>
           <div className="form-group"><label>Card ID *</label><input type="text" required value={formData.cardId} onChange={(e) => setFormData({...formData, cardId: e.target.value})} /></div>
           <div className="form-group"><label>Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
           <div className="form-group"><label>Branch *</label><input type="text" required value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} /></div>
           <div className="form-group"><label>Mobile *</label><input type="tel" required value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} /></div>
           <div className="form-group"><label>Email *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Student'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Student">
        <form onSubmit={handleEditStudent} className="form">
           <div className="form-group"><label>Roll Number *</label><input type="text" required value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} /></div>
           <div className="form-group"><label>Card ID *</label><input type="text" required value={formData.cardId} onChange={(e) => setFormData({...formData, cardId: e.target.value})} /></div>
           <div className="form-group"><label>Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
           <div className="form-group"><label>Branch *</label><input type="text" required value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} /></div>
           <div className="form-group"><label>Mobile *</label><input type="tel" required value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} /></div>
           <div className="form-group"><label>Email *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Student'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Upload Students">
        <form onSubmit={handleBulkUpload} className="form">
          <div className="form-group">
            <label>Paste JSON Array *</label>
            <textarea
              required
              rows="10"
              placeholder='[{"rollNumber":"101","cardId":"C001","name":"John Doe","branch":"CSE","mobile":"1234567890","email":"john@example.com"}]'
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              style={{fontFamily: 'monospace', fontSize: '12px'}}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Upload Students'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Students;