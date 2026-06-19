"use client"
export default function Loading() {
  return (
    <>
      <div className="loading-container" role="status" aria-live="polite">
        <div className="loading-dots">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
        </div>

        <p>Loading, please wait...</p>
      </div>

      <style>{`
        .loading-container {
          width: 100%;
          height: 100vh;
          background-color: #f2f2f2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          transition: opacity 0.3s ease-out;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .dot {
          width: 20px;
          height: 20px;
          background-color: #68764B;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        .dot-1 {
          animation-delay: -0.32s;
        }

        .dot-2 {
          animation-delay: -0.16s;
        }

        .dot-3 {
          animation-delay: -0.08s;
        }

        p {
          color: #333;
          font-size: 16x;
          font-family: system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin-top: 16px;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }

          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}