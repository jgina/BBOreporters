const LoadingSkeleton = () => (
  <div className="skeleton-grid">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="skeleton-card">
        <div className="skeleton-image" />
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
