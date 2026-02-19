import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logotipo_hormiga.png';

export function Header() {
    const { user } = useAuth();

    return (
        <header className="header">
            <div className="header-logo">
                <img src={logoImg} alt="HormigApp" style={{ height: '32px', objectFit: 'contain' }} />
            </div>

            <nav className="header-nav">
                <NavLink id="nav-home" to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Inicio
                </NavLink>
                <NavLink id="nav-history" to="/historial" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Historial
                </NavLink>
                <NavLink id="nav-budget" to="/presupuesto" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Presupuesto
                </NavLink>
                <NavLink id="nav-shared" to="/compartidos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Compartidos
                </NavLink>
                <NavLink id="nav-categories" to="/categorias" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    Categorías
                </NavLink>
            </nav>

            <div className="header-user">
                <NavLink id="nav-profile" to="/perfil" className="user-menu-btn" style={{ textDecoration: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    {user?.username || 'Usuario'}
                </NavLink>
            </div>
        </header>
    );
}


