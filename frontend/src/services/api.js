import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add token
API.interceptors.request.use((config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const facultyRegister = (data) => API.post('/faculty/register', data);
export const facultyLogin = (data) => API.post('/faculty/login', data);
export const studentLogin = (data) => API.post('/students/login', data);
export const createStudent = (data) => API.post('/students/create', data);
export const getStudents = () => API.get('/students');
export const getStudentById = (id) => API.get(`/students/${id}`);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);

// Message APIs
export const sendMessage = (data) => API.post('/messages/send', data);
export const getStudentMessages = () => API.get('/messages/student');
export const getUnreadCount = () => API.get('/messages/unread-count');
export const markMessagesRead = () => API.put('/messages/mark-read');
export const getFacultyMessages = (studentId) => API.get(`/messages/faculty/${studentId}`);
export const deleteMessage = (id) => API.delete(`/messages/${id}`);

export default API;
