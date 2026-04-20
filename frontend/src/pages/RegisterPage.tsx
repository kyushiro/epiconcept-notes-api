import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ email, password, tenantId, role });
      navigate('/notes');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Create Account</h1>
        <p style={styles.subtitle}>Epiconcept Notes API</p>
        {error && <div data-testid="error-message" style={styles.error}>{error}</div>}
        <form data-testid="register-form" onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Tenant ID</label>
            <input
              data-testid="tenant-id-input"
              style={styles.input}
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
              autoComplete="off"
            />
            <span style={styles.hint}>UUID of your tenant (sent as X-Tenant-Id header)</span>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              data-testid="email-input"
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              data-testid="password-input"
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select
              data-testid="role-select"
              style={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button data-testid="submit-btn" type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.footerLink}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  heading: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
  },
  hint: {
    fontSize: '11px',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: '4px',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '15px',
  },
  error: {
    marginBottom: '16px',
    padding: '10px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '14px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b',
  },
  footerLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
