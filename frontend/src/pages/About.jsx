import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();

    return (
      <div
        className="login-page-wrapper"
        style={{ overflowY: "auto", padding: "2rem 1rem" }}
      >
        {/* Animated Background Orbs */}
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>

        <div
          className="login-container"
          style={{
            margin: "0 auto",
            flexDirection: "column",
            maxWidth: "900px",
            minHeight: "auto",
            padding: "0",
            backgroundColor: "#ffffff",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
            borderRadius: "24px",
          }}
        >
          {/* --- HEADER SECTION --- */}
          <div
            style={{ textAlign: "center", padding: "3rem 2rem 1.5rem 2rem" }}
          >
            <h3
              style={{
                color: "#10b981",
                fontSize: "0.85rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: "0 0 0.5rem 0",
              }}
            >
              Welcome to the future of clinic management
            </h3>
            <h1
              style={{
                fontSize: "2.5rem",
                color: "#0f172a",
                margin: "0",
                fontWeight: 800,
              }}
            >
              About Doctor Portal
            </h1>
          </div>

          {/* --- HERO IMAGE SECTION --- */}
          <div style={{ padding: "0 2.5rem", marginBottom: "2.5rem" }}>
            <div
              style={{
                width: "100%",
                height: "240px",
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#e2e8f0",
              }}
            >
              {/* High-quality medical banner image */}
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
                alt="Modern Clinic Team"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>
          </div>

          {/* --- 2x2 FEATURE GRID --- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              padding: "0 2.5rem 3rem 2.5rem",
            }}
          >
            {/* Feature 1: Workflow */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                transition: "transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  backgroundColor: "#d1fae5",
                  color: "#10b981",
                  padding: "1rem",
                  borderRadius: "12px",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#0f172a",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  Effortless Workflow
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  Welcome to the next generation of management. Streamline daily
                  operations.
                </p>
              </div>
            </div>

            {/* Feature 2: Patient Care */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                transition: "transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#ef4444",
                  padding: "1rem",
                  borderRadius: "12px",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#0f172a",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  Patient-Centric Care
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  Spend less time on paperwork and focus entirely on what
                  matters most: your patients.
                </p>
              </div>
            </div>

            {/* Feature 3: Data Security */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                transition: "transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  backgroundColor: "#e0f2fe",
                  color: "#0ea5e9",
                  padding: "1rem",
                  borderRadius: "12px",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#0f172a",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  Comprehensive Data
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  Handles infinite patient records and visit histories with
                  maximum security and speed.
                </p>
              </div>
            </div>

            {/* Feature 4: Financial */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                transition: "transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#f59e0b",
                  padding: "1rem",
                  borderRadius: "12px",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#0f172a",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  Financial Clarity
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  Effortless daily revenue tracking and insight generation built
                  directly into your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* --- FOOTER ACTION --- */}
          <div style={{ padding: "0 2.5rem 3rem 2.5rem", textAlign: "center" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "0.9rem 2.5rem",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.2s, transform 0.1s",
                boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.25)",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#059669")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#10b981")}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
            >
              Return to Login
            </button>
            <div
              style={{
                marginTop: "1.5rem",
                fontSize: "0.85rem",
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              Doctor Portal v2.0 &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    );
};

export default About;