// API Configuration
const API_BASE_URL = 'https://library-attendance-backend.onrender.com/api';
// const API_BASE_URL = "http://localhost:5000/api";
// API Helper Functions
export const api = {
  // Students API
  getStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },
  
  addStudent: async (data) => {
    const response = await fetch(`${API_BASE_URL}/students/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add student');
    return response.json();
  },
  
  updateStudent: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update student');
    return response.json();
  },
  
  deleteStudent: async (id) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete student');
    return response.json();
  },
  
  addManyStudents: async (students) => {
    const response = await fetch(`${API_BASE_URL}/students/addMany`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(students)
    });
    if (!response.ok) throw new Error('Failed to add multiple students');
    return response.json();
  },
  
  // Attendance API
  getAttendance: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return response.json();
  },
  
  getActiveAttendance: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/active`);
    if (!response.ok) throw new Error('Failed to fetch active attendance');
    return response.json();
  },
  
  forceOutAll: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/force-out`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to force out');
    return response.json();
  },
  
  getAttendanceByDate: async (date) => {
    const response = await fetch(`${API_BASE_URL}/attendance/date/${date}`);
    if (!response.ok) throw new Error('Failed to fetch attendance by date');
    return response.json();
  },
  updateAttendance: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update attendance record');
    return response.json();
  },
// --- NEW FUNCTION TO TRIGGER A MANUAL CLOCK-OUT ---
  manualClockOut: async (id) => {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}/clock-out`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to clock out student');
    return response.json();
  }
};