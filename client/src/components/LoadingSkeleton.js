import React from 'react';

const LoadingSkeleton = ({ height = '20px', width = '100%', borderRadius = '8px' }) => {
  return (
    <div
      className="skeleton"
      style={{ height, width, borderRadius, marginBottom: '0.75rem' }}
    />
  );
};

export default LoadingSkeleton;
