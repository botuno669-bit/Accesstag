import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Laptop, Plus, Trash2, Shield, Info, Camera } from 'lucide-react';
import { API_URL } from './config';

const SERVER_URL = API_URL.replace('/api', '');

export default function Devices({ session, profile }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadingDevice, setUploadingDevice] = useState(null);

  // Formulario de nuevo dispositivo
  const [formData, setFormData] = useState({
    tipo: 'Portátil',
    marca: '',
    modelo: '',
    color: '',
    numero_serie: ''
  });

  useEffect(() => {
    fetchProfileAndDevices();
  }, [session, profile]);

  const fetchProfileAndDevices = async () => {
    try {
      if (!profile) return;

      // 1. Obtener sus dispositivos
      const resDevices = await fetch(`${API_URL}/devices`);
      const allDevices = await resDevices.json();
      
      // Filtrar por el ID de perfil local
      const myDevices = allDevices.filter(d => d.profile_id === profile.id);
      setDevices(myDevices);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!profile) return;

    try {
      // Generamos un UID temporal para el NFC (esto lo asignará el guarda luego, pero el sistema lo requiere)
      const tempNfc = `TEMP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const response = await fetch(`${API_URL}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profile_id: profile.id,
          nfc_uid: tempNfc
        })
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ tipo: 'Portátil', marca: '', modelo: '', color: '', numero_serie: '' });
        fetchProfileAndDevices();
      }
    } catch (err) {
      alert("Error al registrar dispositivo");
    }
  };

  const handlePhotoUpload = async (e, deviceId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es muy grande. Máximo 2MB.");
      return;
    }

    setUploadingDevice(deviceId);
    const formData = new FormData();
    formData.append('foto', file);

    try {
      const res = await fetch(`${API_URL}/devices/${deviceId}/photo`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setDevices(devices.map(d => d.id === deviceId ? { ...d, foto_url: data.foto_url } : d));
        alert("Foto del dispositivo actualizada.");
      } else {
        alert("Error subiendo la foto.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al subir la foto.");
    } finally {
      setUploadingDevice(null);
    }
  };

  return (
    <div style={{ padding: '2rem', flex: 1, color: 'var(--text)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Mis Dispositivos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona tus equipos registrados para ingreso al SENA</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <Plus size={20} /> Registrar Equipo
        </button>
      </header>

      {loading ? (
        <p>Cargando dispositivos...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {devices.map(device => (
            <div key={device.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '0.8rem', background: 'rgba(57, 169, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {device.foto_url ? (
                    <img src={`${SERVER_URL}${device.foto_url}`} alt="Device" style={{ width: '100%', height: '100%', borderRadius: '0.8rem', objectFit: 'cover' }} />
                  ) : (
                    <Laptop size={32} color="var(--primary)" />
                  )}
                  
                  <label style={{
                    position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--primary)', color: 'white',
                    width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: uploadingDevice === device.id ? 'not-allowed' : 'pointer', border: '2px solid var(--card-bg)', boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                  }} title="Subir Foto">
                    <input type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, device.id)} disabled={uploadingDevice === device.id} />
                    {uploadingDevice === device.id ? <div style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Camera size={14} />}
                  </label>
                </div>
                <span style={{ 
                  fontSize: '0.8rem', padding: '4px 12px', borderRadius: '1rem', 
                  background: device.estado === 'Activo' ? 'rgba(57, 169, 0, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: device.estado === 'Activo' ? 'var(--primary)' : 'var(--danger)',
                  border: `1px solid ${device.estado === 'Activo' ? 'var(--primary)' : 'var(--danger)'}`
                }}>
                  {device.estado}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{device.marca} {device.modelo}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>S/N: {device.numero_serie || 'No registrado'}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                <Shield size={14} color="var(--primary)" />
                <span>NFC: {device.nfc_uid.startsWith('TEMP-') ? 'Pendiente vinculación' : device.nfc_uid}</span>
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
              <Info size={48} style={{ marginBottom: '1rem' }} />
              <p>No tienes equipos registrados todavía.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Registro */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Nuevo Dispositivo</h2>
            <form onSubmit={handleCreateDevice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select 
                value={formData.tipo} 
                onChange={e => setFormData({...formData, tipo: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'white' }}
              >
                <option value="Portátil">Portátil</option>
                <option value="Tablet">Tablet</option>
                <option value="Otro">Otro</option>
              </select>
              <input 
                placeholder="Marca (Ej: Lenovo, Dell)" 
                required 
                value={formData.marca}
                onChange={e => setFormData({...formData, marca: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'white' }}
              />
              <input 
                placeholder="Modelo" 
                required 
                value={formData.modelo}
                onChange={e => setFormData({...formData, modelo: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'white' }}
              />
              <input 
                placeholder="Color" 
                value={formData.color}
                onChange={e => setFormData({...formData, color: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'white' }}
              />
              <input 
                placeholder="Número de Serie" 
                value={formData.numero_serie}
                onChange={e => setFormData({...formData, numero_serie: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'white' }}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', borderRadius: '0.5rem', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
