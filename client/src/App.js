import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalyzeResume from './pages/AnalyzeResume';
import AnalysisResults from './pages/AnalysisResults';
import AnalysisHistory from './pages/AnalysisHistory';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/analyze" element={<PrivateRoute><AnalyzeResume /></PrivateRoute>} />
          <Route path="/results/:id" element={<PrivateRoute><AnalysisResults /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><AnalysisHistory /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
