import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { QRCode } from "react-qr-code";
import QRCodeGenerator from "qrcode";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../api";
import { Alert, Spinner, LinkIcon, CopyIcon, CheckIcon, ExternalIcon, DownloadIcon } from "../components/ui";

const displayUrl = (u) => u.replace(/^https?:\/\//, "");

function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied((c) => (c === text ? null : c)), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);
  return [copied, copy];
}

export default function Home() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null); // { shortUrl, originalUrl, qrImage }
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [myLinks, setMyLinks] = useState([]);
  const [copied, copy] = useCopy();

  const loadMyLinks = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/api/urls/mine");
      setMyLinks(res.data);
    } catch {
      // the list is optional; ignore failures
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api.get("/api/urls/mine")
      .then((res) => !cancelled && setMyLinks(res.data))
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError("");
    setNeedsLogin(false);
    // Free hosting sleeps when idle; tell the user if the first request is slow.
    const slowTimer = setTimeout(() => setSlow(true), 5000);

    try {
      const res = await api.post("/shorten", { originalUrl: url });
      const shortUrl = res.data.shortUrl;
      const qrImage = await QRCodeGenerator.toDataURL(shortUrl, { width: 512, margin: 2 });
      setResult({ shortUrl, originalUrl: url.trim(), qrImage });
      setUrl("");
      loadMyLinks();
    } catch (err) {
      setResult(null);
      setNeedsLogin(err.response?.data?.code === "GUEST_LIMIT");
      setError(errorMessage(err));
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    if (!(await copy(text))) setError("Couldn't copy automatically. Please select the link and copy it.");
  };

  return (
    <div className="home">
      <section className="hero">
        <h1>Shorten a link.</h1>
        <p>Paste a long URL and get a short link and a QR code you can share anywhere.</p>
      </section>

      <form className="shorten-form" onSubmit={handleShorten} noValidate>
        <div className="shorten-input">
          <label htmlFor="url-input" className="visually-hidden">Long URL</label>
          <LinkIcon />
          <input
            id="url-input"
            className="input"
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="https://example.com/a-very-long-link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? <><Spinner /> Shortening</> : "Shorten"}
        </button>
      </form>

      <p className="form-note">
        Links expire after 14 days.
        {!user && <> Guests get 2 links a day. <Link to="/signup" className="btn-link">Sign up</Link> for more and to track clicks.</>}
      </p>

      {slow && (
        <Alert tone="info">
          The server is waking up after being idle. The first request can take up to a minute.
        </Alert>
      )}

      {error && (
        <Alert tone="error">
          {error}
          {needsLogin && <> <Link to="/login">Log in</Link> or <Link to="/signup">sign up</Link>.</>}
        </Alert>
      )}

      {result && (
        <section className="panel result" aria-label="Your short link" aria-live="polite">
          <div className="result-main">
            <h2 className="section-title">Your short link</h2>
            <a className="short-link" href={result.shortUrl} target="_blank" rel="noopener noreferrer">
              {displayUrl(result.shortUrl)}
            </a>
            <p className="original-url" title={result.originalUrl}>{result.originalUrl}</p>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={() => handleCopy(result.shortUrl)}>
                {copied === result.shortUrl ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy link</>}
              </button>
              <a className="btn btn-secondary" href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                <ExternalIcon /> Open
              </a>
            </div>
          </div>
          <div className="result-qr">
            <div className="qr-box">
              <QRCode value={result.shortUrl} size={256} style={{ width: "100%", height: "100%" }} />
            </div>
            <div className="qr-text">
              <p>Scan to open</p>
              <a className="btn btn-secondary btn-sm" download="qr-code.png" href={result.qrImage}>
                <DownloadIcon /> Download PNG
              </a>
            </div>
          </div>
        </section>
      )}

      {user && myLinks.length > 0 && (
        <section className="panel" aria-labelledby="links-title">
          <div className="links-head">
            <h2 id="links-title">Your links</h2>
            <span>{myLinks.length} {myLinks.length === 1 ? "link" : "links"}</span>
          </div>
          <ul className="links-list">
            {myLinks.map((link) => (
              <li key={link.shortId} className="link-row">
                <a className="short-link" href={link.shortUrl} target="_blank" rel="noopener noreferrer">
                  {displayUrl(link.shortUrl)}
                </a>
                <p className="original-url" title={link.originalUrl}>{link.originalUrl}</p>
                <div className="link-meta">
                  <span><span className="clicks">{link.clicks}</span> {link.clicks === 1 ? "click" : "clicks"}</span>
                  <span>Expires {new Date(link.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(link.shortUrl)}
                  aria-label={`Copy ${displayUrl(link.shortUrl)}`}
                >
                  {copied === link.shortUrl ? <CheckIcon /> : <CopyIcon />}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!result && !(user && myLinks.length > 0) && (
        <section aria-labelledby="how-title">
          <h2 id="how-title" className="visually-hidden">How it works</h2>
          <ol className="steps">
            <li><span><strong>Paste</strong> any long web address.</span></li>
            <li><span><strong>Copy</strong> the short link it gives you.</span></li>
            <li><span><strong>Share</strong> it, or download the QR code.</span></li>
          </ol>
        </section>
      )}
    </div>
  );
}
