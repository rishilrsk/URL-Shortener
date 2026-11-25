import { Link } from 'react-router-dom';

/* Split-screen layout for the account pages: a dark brand panel with a
   small animated "long link becomes short link" demo, and the form. */
export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <aside className="auth-panel">
        <Link to="/" className="auth-logo" aria-label="URL Shortener home">
          <img src="/URL-Shortener-logo.png" alt="URL Shortener" width="510" height="144" />
        </Link>

        <div className="auth-pitch">
          <p className="auth-pitch-title">Long links in.<br /><span>Short links out.</span></p>

          <div className="demo" aria-hidden="true">
            <div className="demo-long">
              <span className="demo-tag">before</span>
              <code>https://www.example.com/blog/2026/11/how-we-rebuilt-onboarding?utm_source=newsletter&amp;utm_medium=email</code>
            </div>
            <div className="demo-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" /></svg>
            </div>
            <div className="demo-short">
              <span className="demo-tag">after</span>
              <code><span className="demo-type">backend-7kq8.onrender.com/aZ3kP9q</span></code>
              <span className="demo-clicks"><b>128</b> clicks</span>
            </div>
          </div>

          <ul className="auth-facts">
            <li>QR code with every link</li>
            <li>Click counts for each link</li>
            <li>Links last 14 days</li>
          </ul>
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-form-wrap">
          {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
          <h1 className="auth-heading">{title}</h1>
          {subtitle && <p className="auth-lead">{subtitle}</p>}
          {children}
          {footer && <div className="auth-alt">{footer}</div>}
        </div>
      </section>
    </div>
  );
}
