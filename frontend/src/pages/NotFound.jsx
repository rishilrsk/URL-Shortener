import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state">
      <p className="code">404</p>
      <h1>This link doesn't exist</h1>
      <p>
        It may have been typed wrong, or it has expired. Short links are removed 14 days after they're created.
      </p>
      <Link to="/" className="btn btn-primary">Shorten a new link</Link>
    </div>
  );
}
