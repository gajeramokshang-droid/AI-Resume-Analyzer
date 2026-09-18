import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats?.scoreHistory?.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.score,
  })) || [];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Dashboard</h1>

        {loading ? (
          <>
            <div className="stats-grid">
              {[1,2,3,4].map(i => <LoadingSkeleton key={i} height="100px" />)}
            </div>
            <LoadingSkeleton height="250px" />
          </>
        ) : !stats || stats.totalAnalyses === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3rem' }}>📄</p>
            <h3>No analyses yet</h3>
            <p>Upload your resume to get your first AI analysis</p>
            <Link to="/analyze" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Analyze Resume
            </Link>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Total Resumes</p>
                <p className="stat-value">{stats.totalResumes}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Analyses</p>
                <p className="stat-value">{stats.totalAnalyses}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Average Score</p>
                <p className="stat-value" style={{ color: '#f6ad55' }}>{stats.avgScore}%</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Best Score</p>
                <p className="stat-value" style={{ color: '#48bb78' }}>{stats.highestScore}%</p>
              </div>
            </div>

            {chartData.length > 1 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 className="section-title">Score Trend</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3142" />
                    <XAxis dataKey="name" stroke="#8892a4" />
                    <YAxis domain={[0, 100]} stroke="#8892a4" />
                    <Tooltip contentStyle={{ background: '#1e2130', border: '1px solid #2d3142', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="score" stroke="#6c63ff" strokeWidth={2} dot={{ fill: '#6c63ff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="card">
              <h2 className="section-title">Recent Analyses</h2>
              <table className="analyses-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Overall</th>
                    <th>ATS</th>
                    <th>Match</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAnalyses.map((a) => (
                    <tr key={a._id}>
                      <td>{a.jobTitle}</td>
                      <td><span className="score-pill">{a.overallScore}%</span></td>
                      <td>{a.atsScore}%</td>
                      <td>{a.jobMatchScore}%</td>
                      <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
