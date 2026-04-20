import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user, tenantId, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.brandText}>Epiconcept Notes</span>
        {tenantId && <span style={styles.tenant}>Tenant: {tenantId.slice(0, 8)}…</span>}
      </div>
      <div style={styles.links}>
        <Link data-testid="nav-notes-link" to="/notes" style={styles.link}>
          Notes
        </Link>
        <Link data-testid="nav-meetings-link" to="/meetings" style={styles.link}>
          Meetings
        </Link>
      </div>
      <div style={styles.user}>
        {user && (
          <>
            <span data-testid="user-email" style={styles.email}>
              {user.email}
              <span style={styles.role}> ({user.role})</span>
            </span>
            <button data-testid="logout-btn" onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandText: {
    fontWeight: 700,
    fontSize: '18px',
    color: '#38bdf8',
  },
  tenant: {
    fontSize: '12px',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  links: {
    display: 'flex',
    gap: '16px',
  },
  link: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'color 0.2s',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  email: {
    fontSize: '14px',
    color: '#cbd5e1',
  },
  role: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
};
