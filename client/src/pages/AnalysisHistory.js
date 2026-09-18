import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import '../styles/history.css';

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/analyses')
      .then(res => setAnalyses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Analysis History</h1>

        {loading ? (
          [1,2,3].map(i => <LoadingSkeleton key={i} height="70px" />)
        ) : analyses.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3rem' }}>📋</p>
            <h3>No analyses yet</h3>
            <p>Your analysis history will appear here</p>
          </div>
        ) : (
          <div className="card">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Overall</th>
                  <th>ATS</th>
                  <th>Match</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => (
                  <tr key={a._id} className="history-row" onClick={() => navigate(`/results/${a._id}`)}>
                    <td className="job-title-cell">{a.jobTitle}</td>
                    <td><span className="score-pill">{a.overallScore}%</span></td>
                    <td>{a.atsScore}%</td>
                    <td>{a.jobMatchScore}%</td>
                    <td style={{ color: '#8892a4', fontSize: '0.82rem' }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ color: '#6c63ff' }}>→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalysisHistory;
