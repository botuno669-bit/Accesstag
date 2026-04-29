import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { API_URL } from './config';
import { User, CreditCard, ShieldCheck, Mail, Calendar } from 'lucide-react';

export default function Profile({ session, profile }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ devices: 0, entries: 0 });

  useEffect(() => {
    fetchProfileStats();
  }, [session, profile]);

  const fetchProfileStats = async () => {
    try {
      if (!profile) return; // Si aún no llega de App.jsx, espera
      
      const [resDevices, resLogs] = await Promise.all([
        fetch(`${API_URL}/devices`),
        fetch(`${API_URL}/access/logs`)
      ]);
      
      if (resDevices.ok) {
          const allDevices = await resDevices.json();
          const myDevices = allDevices.filter(d => d.profile_id === profile.id);
          setStats(s => ({ ...s, devices: myDevices.length }));
      }
      
      if (resLogs.ok) {
          const logsData = await resLogs.json();
          const myLogs = logsData.filter(log => log.device?.profile_id === profile.id);
          setStats(s => ({ ...s, entries: myLogs.length }));
      }

    } catch (err) {
      console.error("Error cargando perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', flex: 1 }}>Cargando información...</div>;
  }

  if (!profile) {
    return <div style={{ padding: '2rem', flex: 1 }}>Error al cargar el perfil.</div>;
  }

  return (
    <div style={{ padding: '2rem', flex: 1, color: 'var(--text)', display: 'flex', justifyContent: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Mi Perfil Institucional</h1>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '2rem', backdropFilter: 'blur(10px)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(57, 169, 0, 0.1)', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary)' }}>
            <User size={60} color="var(--primary)" />
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{profile.nombre_completo}</h2>
            <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.3rem 1rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Rol: {profile.rol}
            </div>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Mail size={16} /> {session.user.email}
            </p>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} /> {profile.tipo_documento}: {profile.numero_documento}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} /> Equipos Vinculados
            </h3>
            <p style={{ fontSize: '2.5rem', color: 'white', fontWeight: 'bold' }}>{stats.devices}</p>
          </div>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> Accesos Registrados
            </h3>
            <p style={{ fontSize: '2.5rem', color: 'white', fontWeight: 'bold' }}>{stats.entries}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
