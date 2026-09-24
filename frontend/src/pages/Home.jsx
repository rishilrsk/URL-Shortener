import { useState } from "react";
import axios from "axios";
import { QRCode } from "react-qr-code";
import QRCodeGenerator from "qrcode";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.trim();

export default function Home() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShorten = async () => {
    if (!user) {
      const guestCount = parseInt(localStorage.getItem("guestCount") || "0", 10);
      if (guestCount >= 2) {
        setError("You've used your 2 free links! Please log in to continue.");
        return;
      }
    }
    if (!url || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/shorten`, {
        originalUrl: url,
      });

      if (!user) {
        const guestCount = parseInt(localStorage.getItem("guestCount") || "0", 10);
        localStorage.setItem("guestCount", (guestCount + 1).toString());
      }

      const newShortUrl = res.data.shortUrl;
      setShortUrl(newShortUrl);
      setCopied(false);

      const qr = await QRCodeGenerator.toDataURL(newShortUrl);
      setQrImage(qr);
    } catch (err) {
      console.log(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">
          <span className="hero-word hero-word-plain">URL</span>
          <span className="hero-word hero-word-accent">Shortener</span>
        </h1>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" role="alert" style={{
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1px solid #f87171"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{error}</span>
        </div>
      )}

      {/* Input Card */}
      <section className="card input-card" aria-label="URL shortener form">
        <label htmlFor="url-input" className="input-label">
          Paste your long URL
        </label>
        <div className="input-row">
          <div className="input-wrapper">
            <span className="input-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </span>
            <input
              id="url-input"
              type="text"
              className="url-input"
              placeholder="https://example.com/very-long-url..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleShorten()}
              aria-label="Long URL to shorten"
            />
          </div>
          <button
            type="button"
            onClick={handleShorten}
            className={`shorten-btn ${loading ? "loading" : ""}`}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Shortening…
              </>
            ) : (
              <>
                Shorten
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Result Card */}
      {shortUrl && (
        <section
          className="card result-card"
          aria-label="Shortened URL result"
        >
          <div className="result-header">
            <span className="result-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Link ready
            </span>
          </div>

          <div className="result-link-row">
            <a
              className="result-link"
              target="_blank"
              rel="noopener noreferrer"
              href={shortUrl}
            >
              {shortUrl}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <button
              onClick={handleCopy}
              className={`copy-btn ${copied ? "copied" : ""}`}
              aria-label={copied ? "Copied!" : "Copy link"}
            >
              {copied ? (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="divider" role="separator" />

          {/* QR Code Section */}
          <div className="qr-section">
            <p className="qr-label">Scan QR Code</p>
            <div className="qr-container">
              <QRCode value={shortUrl} size={160} />
            </div>
            {qrImage && (
              <a
                className="download-btn"
                download="qr-code.png"
                href={qrImage}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download QR Code
              </a>
            )}
          </div>
        </section>
      )}

      {/* Empty state hint when no result */}
      {!shortUrl && (
        <div className="empty-hints" aria-hidden="true">
          {[
            "Paste any URL above",
            "Get a clean short link",
            "Share or scan QR",
          ].map((hint, i) => (
            <div className="hint-chip" key={i}>
              <span className="hint-num">{i + 1}</span>
              {hint}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
