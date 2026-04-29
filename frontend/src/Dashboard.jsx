import React, { useState, useEffect } from 'react';
import { Search, Users, Lock, Activity, ShieldCheck } from 'lucide-react';
import { API_URL } from './config';

export default function Dashboard({ session, profile }) {
  const [stats, setStats] = useState({ users: 0, devices: 0, entries: 0 });
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.rol === 'Administrador' || profile?.rol === 'Guarda';

  useEffect(() => {
    async function loadStats() {
      try {
        // Lanzamos ambas peticiones al mismo tiempo (Paralelo) para reducir el tiempo a la mitad
        const [resDevices, resLogs] = await Promise.all([
          fetch(`${API_URL}/devices`),
          fetch(`${API_URL}/access/logs`)
        ]);

        if (resDevices.ok && resLogs.ok) {
          const allDevices = await resDevices.json();
          const allLogs = await resLogs.json();
          
          if (isAdmin) {
            // Stats globales para Admin
            setStats({
              users: new Set(allDevices.map(d => d.profile_id)).size,
              devices: allDevices.filter(d => d.estado === 'Activo').length,
              entries: allLogs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length
            });
          } else {
            // Stats personales para Aprendiz
            const myDevices = allDevices.filter(d => d.profile_id === profile?.id);
            const myLogs = allLogs.filter(l => l.device?.profile_id === profile?.id);
            
            setStats({
              users: myDevices.length, // Usamos esta variable para "Mis Dispositivos"
              devices: myDevices.filter(d => d.estado === 'Activo').length,
              entries: myLogs.length
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (profile) loadStats();
  }, [profile, isAdmin]);

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', width: '350px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder="Buscar..." style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }} />
        </div>
        <div style={{ background: 'var(--primary)', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
          {profile?.rol || 'Cargando...'}
        </div>
      </header>

      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Hola, {profile?.nombre_completo || 'Usuario'}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {isAdmin ? 'Resumen general del sistema de accesos del SENA.' : 'Bienvenido a tu portal personal de equipos.'}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {isAdmin ? (
          <>
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Usuarios Activos</h3>
              <p style={{ fontSize: '2.5rem', color: 'var(--text)', fontWeight: 'bold' }}>{loading ? '...' : stats.users}</p>
            </div>
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={16} /> Dispositivos Globales</h3>
              <p style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>{loading ? '...' : stats.devices}</p>
            </div>
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Movimientos Hoy</h3>
              <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>{loading ? '...' : stats.entries}</p>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={16} /> Mis Equipos Registrados</h3>
              <p style={{ fontSize: '2.5rem', color: 'var(--text)', fontWeight: 'bold' }}>{loading ? '...' : stats.users}</p>
            </div>
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={16} /> Equipos Activos (Validados)</h3>
              <p style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>{loading ? '...' : stats.devices}</p>
            </div>
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Mis Entradas/Salidas</h3>
              <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>{loading ? '...' : stats.entries}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
