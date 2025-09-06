export function Loading({ message = '載入中...' }: { message?: string }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(201, 169, 97, 0.2);
          border-top-color: #c9a961;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loading-message {
          margin-top: 16px;
          color: #6d685f;
          font-size: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}