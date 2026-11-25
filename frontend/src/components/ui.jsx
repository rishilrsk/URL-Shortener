import { useState } from 'react';

/* Small shared building blocks so every page looks and behaves the same. */

function Svg({ size = 18, children, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function LinkIcon(props) {
  return (
    <Svg {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

export function CopyIcon(props) {
  return (
    <Svg size={16} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  );
}

export function CheckIcon(props) {
  return <Svg size={16} {...props}><polyline points="20 6 9 17 4 12" /></Svg>;
}

export function ExternalIcon(props) {
  return (
    <Svg size={16} {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </Svg>
  );
}

export function DownloadIcon(props) {
  return (
    <Svg size={16} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </Svg>
  );
}

function EyeIcon() {
  return <Svg><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Svg>;
}

function EyeOffIcon() {
  return (
    <Svg>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </Svg>
  );
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export function Alert({ tone = 'error', children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export function Field({ id, label, aside, hint, ...inputProps }) {
  return (
    <div className="field">
      <div className="field-head">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      <input id={id} className="input" {...inputProps} />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function SegGroup({ children }) {
  return <div className="seg">{children}</div>;
}

export function SegField({ id, label, aside, className = '', ...inputProps }) {
  return (
    <div className="seg-item">
      <div className="seg-head">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      <input id={id} className={`seg-input ${className}`} {...inputProps} />
    </div>
  );
}

export function SegPassword({ id, label = 'Password', aside, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="seg-item">
      <div className="seg-head">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      <div className="seg-row">
        <input id={id} className="seg-input" type={visible ? 'text' : 'password'} {...inputProps} />
        <button
          type="button"
          className="seg-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

export function SegCode({ id, value, onChange }) {
  return (
    <SegField
      id={id}
      label="6-digit code"
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      maxLength={6}
      required
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      className="seg-code"
    />
  );
}

export function ArrowIcon(props) {
  return <Svg size={18} {...props}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></Svg>;
}

export function SubmitButton({ loading, loadingText, children, disabled }) {
  return (
    <button type="submit" className="btn btn-primary btn-block btn-go" disabled={loading || disabled}>
      {loading ? <><Spinner /> {loadingText}</> : <>{children} <ArrowIcon className="go-arrow" /></>}
    </button>
  );
}
