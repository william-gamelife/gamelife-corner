export function ErrorMessage({ 
  error, 
  onRetry 
}: { 
  error: string
  onRetry?: () => void 
}) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          重試
        </button>
      )}
      <style jsx>{`
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          padding: 24px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
        }
        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .error-message {
          color: #ef4444;
          font-size: 16px;
          margin: 0 0 16px 0;
        }
        .retry-button {
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .retry-button:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  )
}