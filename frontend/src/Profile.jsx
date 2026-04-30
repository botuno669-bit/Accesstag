import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { API_URL } from './config';
import { User, CreditCard, ShieldCheck, Mail, Calendar, Upload, Camera } from 'lucide-react';

export default function Profile({ session, profile }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ devices: 0, entries: 0 });
  const [uploading, setUploading] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(profile?.foto_url);

  // Truco para obtener URL base del servidor Laravel (sin /api)
  const SERVER_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchProfileStats();
    if (profile) setFotoUrl(profile.foto_url);
  }, [session, profile]);

  const fetchProfileStats = async () => {
    try {
      if (!profile) return; // Si aún no llega de App.jsx, espera
      
      const [resDevices, resLogs, resProfile] = await Promise.all([
        fetch(`${API_URL}/devices`),
        fetch(`${API_URL}/access/logs`),
        fetch(`${API_URL}/profiles/${session.user.id}`)
      ]);

      if (resProfile.ok) {
        const freshProfile = await resProfile.json();
        setFotoUrl(freshProfile.foto_url);
        // Mutar la prop por seguridad temporal
        profile.foto_url = freshProfile.foto_url;
      }
      
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es muy grande. Máximo 2MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('foto', file);

    try {
      const res = await fetch(`${API_URL}/profiles/${profile.id}/photo`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFotoUrl(data.foto_url);
        profile.foto_url = data.foto_url; // Mutar la referencia global para que no se pierda
        alert("Foto actualizada exitosamente.");
      } else {
        alert("Error subiendo la foto.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al subir la foto.");
    } finally {
      setUploading(false);
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

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '2rem', backdropFilter: 'blur(10px)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            {fotoUrl ? (
              <img 
                src={`${SERVER_URL}${fotoUrl}`} 
                alt="Perfil" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
              />
            ) : (
              <div style={{ background: 'rgba(57, 169, 0, 0.1)', width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary)' }}>
                <User size={60} color="var(--primary)" />
              </div>
            )}
            
            <label style={{
              position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'white',
              width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer', border: '2px solid var(--bg)', transition: 'var(--transition)'
            }} title="Cambiar Foto">
              <input type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploading} />
              {uploading ? <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Camera size={18} />}
            </label>
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
