import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Users, Lock, LogOut, Search, DesktopComputer, Home, Activity
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside style={{ width: '250px', background: 'var(--card-bg)', borderRight: '1px solid var(--border)', padding: '1.5rem', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
        <ShieldCheck size={28} /> Accesstag
      </h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
        <Link to="/" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: path === '/' ? 'var(--primary)' : 'transparent', color: path === '/' ? 'white' : 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}><Home size={20} /> Dashboard</Link>
        <Link to="/usuarios" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: path === '/usuarios' ? 'var(--primary)' : 'transparent', color: path === '/usuarios' ? 'white' : 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Usuarios</Link>
        <Link to="/dispositivos" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: path === '/dispositivos' ? 'var(--primary)' : 'transparent', color: path === '/dispositivos' ? 'white' : 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={20} /> Dispositivos</Link>
        <Link to="/bitacora" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: path === '/bitacora' ? 'var(--primary)' : 'transparent', color: path === '/bitacora' ? 'white' : 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20} /> Bitácora (Logs)</Link>
      </nav>
      <div>
        <button style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'transparent', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', border: 'none', cursor: 'pointer' }}><LogOut size={20} /> Salir</button>
      </div>
    </aside>
  );
};

const Dashboard = () => (
  <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', width: '350px' }}>
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Buscar dispositivos..." style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }} />
      </div>
      <div style={{ background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AD</div>
    </header>

    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Hola, Admin</h1>
    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Resumen del sistema de accesos del SENA.</p>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
      <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Usuarios Registrados</h3>
        <p style={{ fontSize: '2rem', color: 'var(--text)', fontWeight: 'bold' }}>342</p>
      </div>
      <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={16} /> Dispositivos Activos</h3>
        <p style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>128</p>
      </div>
      <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Entradas Hoy</h3>
        <p style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>45</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg)', color: 'var(--text)' }}>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/usuarios" element={<div style={{ padding: '2rem', flex: 1 }}><h1 style={{fontSize: '2rem'}}>Gestión de Usuarios</h1></div>} />
          <Route path="/dispositivos" element={<div style={{ padding: '2rem', flex: 1 }}><h1 style={{fontSize: '2rem'}}>Equipos y NFC</h1></div>} />
          <Route path="/bitacora" element={<div style={{ padding: '2rem', flex: 1 }}><h1 style={{fontSize: '2rem'}}>Bitácora de Entradas/Salidas</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
