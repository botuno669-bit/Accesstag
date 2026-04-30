import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Home, Users, Lock, Activity, LogOut, Settings } from 'lucide-react';

export default function Sidebar({ onLogout, profile }) {
  const location = useLocation();
  const path = location.pathname;
  
  // Por defecto es aprendiz
  const isAdmin = profile?.rol === 'Administrador' || profile?.rol === 'Guarda';

  return (
    <aside className="sidebar-container">
      <h2 className="sidebar-logo">
        <ShieldCheck size={32} color="var(--primary)" /> <span className="nav-text">Accesstag</span>
      </h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
          <Home size={24} /> <span className="nav-text">Panel Principal</span>
        </Link>
        <Link to="/usuarios" className={`nav-item ${path === '/usuarios' ? 'active' : ''}`}>
          <Users size={24} /> <span className="nav-text">Mi Perfil</span>
        </Link>
        <Link to="/dispositivos" className={`nav-item ${path === '/dispositivos' ? 'active' : ''}`}>
          <Lock size={24} /> <span className="nav-text">Mis Dispositivos</span>
        </Link>
        
        {/* Solo los administradores y guardas ven la Bitácora */}
        {isAdmin && (
          <Link to="/bitacora" className={`nav-item ${path === '/bitacora' ? 'active' : ''}`}>
            <Activity size={24} /> <span className="nav-text">Portería</span>
          </Link>
        )}

        {/* Solo el Administrador Maestro ve el Panel */}
        {profile?.rol === 'Administrador' && (
          <Link to="/admin" className={`nav-item ${path === '/admin' ? 'active' : ''}`}>
            <Settings size={24} /> <span className="nav-text">Maestro</span>
          </Link>
        )}
      </nav>
      <div className="sidebar-logout">
        <button onClick={onLogout} className="nav-item" style={{ color: 'var(--danger)', width: '100%', justifyContent: 'flex-start' }}>
          <LogOut size={20} /> <span className="nav-text">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
