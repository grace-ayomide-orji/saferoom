"use client"
export default function NotFound() {
  return (
    <>
      <div className="not-found">
        <div className="content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>
            Sorry, the page you are looking for does not exist or has been
            moved.
          </p>

          <a href="/" className="home-btn">
            Back to Home
          </a>
        </div>
      </div>

      <style>{`
        .not-found {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #f2f2f2;
        }

        .content {
          text-align: center;
          max-width: 500px;
        }

        h1 {
          font-size: clamp(2rem, 10vw, 5rem);
          line-height: 1;
          margin: 0;
          color: #68764B;
          font-weight: 700;
        }

        h2 {
          font-size: 1.5rem;
          color: #333;
        }

        p {
          margin-bottom:1rem;
          color: #1a1a1a;
          line-height: 1.6;
          font-size: 1rem;
        }

        .home-btn {
          display: inline-block;
          padding: 0.875rem 2.75rem;
          background: #68764B;
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          transition: opacity 0.3s ease;
        }

        .home-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </>
  );
}