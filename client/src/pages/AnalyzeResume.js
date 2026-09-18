import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import '../styles/analyze.css';

// Normally, you use <Link to="/home"> to move between pages.
// But sometimes you need to redirect the user after an action (like login, logout, or form submission). That’s where useNavigate comes in.

const AnalyzeResume = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!file) e.file = 'Please upload a resume file';
    if (!jobTitle.trim()) e.jobTitle = 'Job title is required';
    if (jobDesc.length < 50) e.jobDesc = 'Job description must be at least 50 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Step 1: Upload resume
      const formData = new FormData();  //FormData is a built‑in browser API.It lets you build a set of key/value pairs that represent form fields and their values.
      formData.append('file', file);
      const uploadRes = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Step 2: Analyze
      const analyzeRes = await api.post('/analyses', {
        resumeId: uploadRes.data.resumeId,
        jobTitle,
        jobDescription: jobDesc,
      });

      toast.success('Analysis complete!');
      navigate(`/results/${analyzeRes.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Analyze Resume</h1>
        <div className="analyze-card card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="section-label">1. Upload Your Resume</h2>
              <FileUpload onFileSelect={setFile} selectedFile={file} />
              {errors.file && <p className="form-error">{errors.file}</p>}
            </div>

            <div className="form-section">
              <h2 className="section-label">2. Target Job Title</h2>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Senior Python Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
              {errors.jobTitle && <p className="form-error">{errors.jobTitle}</p>}
            </div>

            <div className="form-section">
              <h2 className="section-label">3. Job Description</h2>
              <textarea
                className="text-input"
                rows="8"
                placeholder="Paste the full job description here..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
              <p className="char-count" style={{ color: jobDesc.length >= 50 ? '#48bb78' : '#8892a4' }}>
                {jobDesc.length} characters {jobDesc.length < 50 ? `(${50 - jobDesc.length} more needed)` : '✓'}
              </p>
              {errors.jobDesc && <p className="form-error">{errors.jobDesc}</p>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? '⏳ Analyzing...' : '🔍 Analyze Resume'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AnalyzeResume;
