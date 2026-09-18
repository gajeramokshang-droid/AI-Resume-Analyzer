import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ScoreCircle from '../components/ScoreCircle';
import LoadingSkeleton from '../components/LoadingSkeleton';
import '../styles/results.css';

const AnalysisResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analyses/${id}`)
      .then(res => setData(res.data))
      .catch(() => navigate('/history'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <LoadingSkeleton height="40px" width="200px" />
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          {[1,2,3].map(i => <LoadingSkeleton key={i} height="140px" width="140px" borderRadius="50%" />)}
        </div>
        {[1,2,3].map(i => <LoadingSkeleton key={i} height="120px" />)}
      </main>
    </div>
  );

  if (!data) return null;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <div className="results-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>{data.jobTitle}</h1>
            <p style={{ color: '#8892a4', fontSize: '0.85rem' }}>
              {new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/history')}>← Back</button>
        </div>

        {/* Score circles */}
        <div className="card scores-row">
          <ScoreCircle score={data.overallScore} label="Overall Score" size={130} />
          <ScoreCircle score={data.atsScore} label="Est. ATS Score" size={130} />
          <ScoreCircle score={data.jobMatchScore} label="Job Match" size={130} />
        </div>

        {/* Skills */}
        <div className="results-grid">
          <div className="card">
            <h2 className="section-title">✅ Matching Skills</h2>
            <div className="chips-wrap">
              {data.matchingSkills.length > 0
                ? data.matchingSkills.map((s, i) => <span key={i} className="badge badge-green">{s}</span>)
                : <p style={{ color: '#8892a4' }}>None found</p>}
            </div>
          </div>
          <div className="card">
            <h2 className="section-title">❌ Missing Skills</h2>
            <div className="chips-wrap">
              {data.missingSkills.length > 0
                ? data.missingSkills.map((s, i) => <span key={i} className="badge badge-red">{s}</span>)
                : <p style={{ color: '#48bb78' }}>No missing skills!</p>}
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="card">
          <h2 className="section-title">🔑 Top Keywords from Job Description</h2>
          <div className="keywords-wrap">
            {data.keywords.slice(0, 15).map((kw, i) => (
              <div key={i} className="keyword-item">
                <span className="keyword-term">{kw.term}</span>
                <span className="keyword-freq">{kw.frequency}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="results-grid">
          <div className="card">
            <h2 className="section-title">💪 Strengths</h2>
            <ul className="list-items">
              {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="card">
            <h2 className="section-title">⚠️ Weaknesses</h2>
            <ul className="list-items warning">
              {data.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <h2 className="section-title">💡 AI Recommendations</h2>
          <ol className="recommendations-list">
            {data.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        </div>

        {/* Recommended Roles */}
        <div className="card">
          <h2 className="section-title">🎯 Recommended Job Roles</h2>
          <div className="roles-list">
            {data.recommendedRoles.map((r, i) => (
              <div key={i} className="role-item">
                <div className="role-header">
                  <span className="role-name">{r.role}</span>
                  <span className="role-pct">{r.matchPercentage}%</span>
                </div>
                <div className="role-bar-bg">
                  <div className="role-bar-fill" style={{ width: `${r.matchPercentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalysisResults;
