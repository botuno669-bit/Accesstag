import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Home, Users, Lock, Activity, LogOut } from 'lucide-react';

export default function Sidebar({ onLogout, profile }) {
  const location = useLocation();
  const path = location.pathname;
  
  // Por defecto es aprendiz
  const isAdmin = profile?.rol === 'Administrador' || profile?.rol === 'Guarda';

  return (
    <aside style={{ width: '250px', background: 'var(--card-bg)', borderRight: '1px solid var(--border)', padding: '1.5rem', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
        <ShieldCheck size={28} /> Accesstag
      </h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
        <Link to="/" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: path === '/' ? 'var(--primary)' : 'transparent', color: path === '/' ? 'white' : 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}><Home size={20} /> Inicio</Link>
        <Link to="/usuarios" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: path === '/usuarios' ? 'var(--primary)' : 'transparent', color: path === '/usuarios' ? 'white' : 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Mi Perfil</Link>
        <Link to="/dispositivos" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: path === '/dispositivos' ? 'var(--primary)' : 'transparent', color: path === '/dispositivos' ? 'white' : 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={20} /> Mis Dispositivos</Link>
        
        {/* Solo los administradores y guardas ven la Bitácora */}
        {isAdmin && (
          <Link to="/bitacora" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: path === '/bitacora' ? 'var(--primary)' : 'transparent', color: path === '/bitacora' ? 'white' : 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20} /> Bitácora (Portería)</Link>
        )}
      </nav>
      <div>
        <button onClick={onLogout} style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'transparent', color: 'var(--danger)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} /> Salir
        </button>
      </div>
    </aside>
  );
}
