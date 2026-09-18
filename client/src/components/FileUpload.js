import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';  //useDropzone → hook from react-dropzone that handles drag‑and‑drop file uploads.

const FileUpload = ({ onFileSelect, selectedFile }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? '#6c63ff' : '#2d3142'}`,
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragActive ? 'rgba(108,99,255,0.05)' : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <div>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</p>
          <p style={{ color: '#6c63ff', fontWeight: 600 }}>{selectedFile.name}</p>
          <p style={{ color: '#8892a4', fontSize: '0.82rem' }}>
            {(selectedFile.size / 1024).toFixed(1)} KB — Click or drag to replace
          </p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</p>
          <p style={{ color: '#e2e8f0', fontWeight: 500 }}>Drag & drop your resume here</p>
          <p style={{ color: '#8892a4', fontSize: '0.82rem', marginTop: '0.25rem' }}>
            or click to browse — PDF or DOCX, max 5MB
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

