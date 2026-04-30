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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="input-group" style={{ width: '350px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder="Buscar movimientos rápidos..." />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(57, 169, 0, 0.1)', border: '1px solid rgba(57, 169, 0, 0.3)', padding: '8px 16px', borderRadius: '2rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }}></div>
            {profile?.rol || 'Cargando...'}
          </div>
          
          <div style={{ width: '40px', height: '40px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }} className="card-hover">
            <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>{profile?.nombre_completo?.charAt(0) || 'U'}</span>
          </div>
        </div>
      </header>

      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
          Hola, <span style={{ color: 'var(--primary)' }}>{profile?.nombre_completo?.split(' ')[0] || 'Usuario'}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {isAdmin ? 'Resumen general del sistema de seguridad del campus.' : 'Bienvenido a tu portal personal de equipos.'}
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {isAdmin ? (
          <>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Users size={18} color="var(--text)" /> Usuarios Activos
              </h3>
              <p style={{ fontSize: '3rem', color: 'var(--text)', fontWeight: '800', lineHeight: '1' }}>{loading ? '...' : stats.users}</p>
            </div>
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--primary)', filter: 'blur(50px)', opacity: '0.2' }}></div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Lock size={18} color="var(--primary)" /> Dispositivos Globales
              </h3>
              <p style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: '800', lineHeight: '1' }}>{loading ? '...' : stats.devices}</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Activity size={18} color="var(--accent)" /> Movimientos Hoy
              </h3>
              <p style={{ fontSize: '3rem', color: 'var(--accent)', fontWeight: '800', lineHeight: '1' }}>{loading ? '...' : stats.entries}</p>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Lock size={18} color="var(--text)" /> Mis Equipos Registrados
              </h3>
              <p style={{ fontSize: '3rem', color: 'var(--text)', fontWeight: '800', lineHeight: '1' }}>{loading ? '...' : stats.users}</p>
            </div>
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--primary)', filter: 'blur(50px)', opacity: '0.2' }}></div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <ShieldCheck size={18} color="var(--primary)" /> Equipos Activos (Validados)
              </h3>
              <p style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: '800', lineHeight: '1' }}>{loading ? '...' : stats.devices}</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Activity size={18} color="var(--accent)" /> Mis Entradas/Salidas
              </h3>
              <p style={{ fontSize: '3rem', color: 'var(--accent)', fontWeight: '800', lineHeight: '1' }}>{loading ? '...' : stats.entries}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
