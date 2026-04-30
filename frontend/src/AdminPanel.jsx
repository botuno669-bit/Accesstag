import React, { useState, useEffect } from 'react';
import { API_URL } from './config';
import { Users, ShieldCheck, Laptop, AlertTriangle, UserX, CheckCircle, Search, Settings, FileSpreadsheet, Download, Link as LinkIcon, X } from 'lucide-react';

export default function AdminPanel({ profile }) {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'dispositivos' | 'auditoria'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el Modal de Vinculación NFC
  const [linkingDevice, setLinkingDevice] = useState(null);
  const [newNfcUid, setNewNfcUid] = useState('');
  const [linkStatus, setLinkStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resDevices, resLogs] = await Promise.all([
        fetch(`${API_URL}/profiles`),
        fetch(`${API_URL}/devices`),
        fetch(`${API_URL}/access/logs`)
      ]);

      if (resUsers.ok && resDevices.ok && resLogs.ok) {
        setUsers(await resUsers.json());
        setDevices(await resDevices.json());
        setLogs(await resLogs.json());
      }
    } catch (error) {
      console.error("Error cargando panel admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_URL}/profiles/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: newRole })
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, rol: newRole } : u));
      }
    } catch (error) {
      console.error("Error cambiando rol:", error);
    }
  };

  const handleDeviceStatusChange = async (deviceId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/devices/${deviceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      if (response.ok) {
        setDevices(devices.map(d => d.id === deviceId ? { ...d, estado: newStatus } : d));
      }
    } catch (error) {
      console.error("Error cambiando estado de dispositivo:", error);
    }
  };

  const handleLinkNfc = async (e) => {
    e.preventDefault();
    if (!linkingDevice || !newNfcUid.trim()) return;
    
    setLinkStatus('loading');
    try {
      const response = await fetch(`${API_URL}/devices/${linkingDevice.id}/link-nfc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfc_uid: newNfcUid.toUpperCase() })
      });
      
      const data = await response.json();
      if (response.ok) {
        setDevices(devices.map(d => d.id === linkingDevice.id ? { ...d, nfc_uid: newNfcUid.toUpperCase() } : d));
        setLinkingDevice(null);
        setNewNfcUid('');
        alert("¡Etiqueta NFC vinculada exitosamente!");
      } else {
        alert(data.message || "Error vinculando NFC");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLinkStatus('');
    }
  };

  const exportToCSV = () => {
    const headers = ["Fecha y Hora", "Tipo de Movimiento", "Usuario", "Documento", "Equipo", "Serie", "Guarda en Turno"];
    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.tipo,
      log.device?.profile?.nombre_completo || 'Desconocido',
      log.device?.profile?.numero_documento || 'N/A',
      `${log.device?.tipo} ${log.device?.marca} ${log.device?.modelo}`.trim(),
      log.device?.numero_serie || 'N/A',
      log.guarda?.nombre_completo || 'Sistema'
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `auditoria_accesos_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (profile?.rol !== 'Administrador') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <AlertTriangle size={48} style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden ver esta sección.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.numero_documento.includes(searchTerm)
  );

  const filteredDevices = devices.filter(d => 
    (d.profile?.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.nfc_uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={28} color="var(--primary)" /> Panel de Control Maestro
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Gestión centralizada de usuarios, permisos y dispositivos.</p>
      </header>

      {/* Controles: Tabs y Buscador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('usuarios')}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'usuarios' ? 'var(--primary)' : 'transparent', color: activeTab === 'usuarios' ? 'white' : 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'var(--transition)' }}
          >
            <Users size={18} /> Usuarios ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('dispositivos')}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'dispositivos' ? 'var(--primary)' : 'transparent', color: activeTab === 'dispositivos' ? 'white' : 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'var(--transition)' }}
          >
            <Laptop size={18} /> Equipos ({devices.length})
          </button>
          <button 
            onClick={() => setActiveTab('auditoria')}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'auditoria' ? 'var(--primary)' : 'transparent', color: activeTab === 'auditoria' ? 'white' : 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'var(--transition)' }}
          >
            <FileSpreadsheet size={18} /> Auditoría
          </button>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', width: '350px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, documento o NFC..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }} 
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Cargando datos...</div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          
          {/* TABLA USUARIOS */}
          {activeTab === 'usuarios' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Nombre y Documento</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Rol Actual</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones (Cambiar Rol)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{u.nombre_completo}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.tipo_documento} {u.numero_documento}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          background: u.rol === 'Administrador' ? 'rgba(59, 130, 246, 0.2)' : u.rol === 'Guarda' ? 'rgba(57, 169, 0, 0.2)' : u.rol === 'Bloqueado' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: u.rol === 'Administrador' ? '#3b82f6' : u.rol === 'Guarda' ? 'var(--primary)' : u.rol === 'Bloqueado' ? 'var(--danger)' : 'var(--text-muted)'
                        }}>
                          {u.rol}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <select 
                          value={u.rol} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{ background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.5rem', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="Aprendiz (No Validado)">Aprendiz (No Validado)</option>
                          <option value="Aprendiz">Aprendiz Validado</option>
                          <option value="Guarda">Guarda de Seguridad</option>
                          <option value="Administrador">Administrador</option>
                          <option value="Bloqueado">Bloquear Usuario</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLA DISPOSITIVOS */}
          {activeTab === 'dispositivos' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Equipo y Propietario</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>UID (NFC)</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Estado Actual</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', textAlign: 'right' }}>Cambiar Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{d.tipo} {d.marca} {d.modelo}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dueño: {d.profile?.nombre_completo || 'Desconocido'}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <code style={{ background: 'var(--bg)', padding: '0.2rem 0.5rem', borderRadius: '0.2rem', color: 'var(--accent)' }}>{d.nfc_uid}</code>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          background: d.estado === 'Activo' ? 'rgba(57, 169, 0, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: d.estado === 'Activo' ? 'var(--primary)' : 'var(--danger)'
                        }}>
                          {d.estado}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {d.nfc_uid.startsWith('TEMP-') && (
                          <button 
                            onClick={() => setLinkingDevice(d)}
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                          >
                            <LinkIcon size={14} /> Vincular
                          </button>
                        )}
                        <select 
                          value={d.estado} 
                          onChange={(e) => handleDeviceStatusChange(d.id, e.target.value)}
                          style={{ background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.5rem', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="Activo">Activo (Permitir Entrada)</option>
                          <option value="Bloqueado">Bloqueado</option>
                          <option value="Extraviado">Reportar Extraviado</option>
                          <option value="Retenido en CIC">Retenido en CIC</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLA AUDITORÍA */}
          {activeTab === 'auditoria' && (
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Registro Global de Movimientos</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Historial completo de todas las entradas y salidas registradas en portería.</p>
                </div>
                <button 
                  onClick={exportToCSV}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'var(--transition)' }}
                >
                  <Download size={18} /> Exportar Excel (CSV)
                </button>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', border: '1px solid var(--border)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Fecha y Hora</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Movimiento</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Usuario y Documento</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Equipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 100).map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold',
                            background: log.tipo === 'Entrada' ? 'rgba(57, 169, 0, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: log.tipo === 'Entrada' ? 'var(--primary)' : 'var(--danger)'
                          }}>
                            {log.tipo}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{log.device?.profile?.nombre_completo || 'Desconocido'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {log.device?.profile?.numero_documento || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>{log.device?.tipo} {log.device?.marca}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay movimientos registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>Mostrando los últimos 100 registros. Exporta a Excel para ver el historial completo.</p>
            </div>
          )}

        </div>
      )}

      {/* Modal de Vinculación NFC */}
      {linkingDevice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '500px', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LinkIcon color="var(--primary)" /> Vincular Etiqueta Física</h2>
              <button onClick={() => setLinkingDevice(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Estás a punto de asignarle un sticker físico oficial al equipo <strong>{linkingDevice.tipo} {linkingDevice.marca}</strong> del usuario <strong>{linkingDevice.profile?.nombre_completo}</strong>.
            </p>

            <form onSubmit={handleLinkNfc}>
              <div className="input-group" style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem' }}>
                <Laptop size={20} color="var(--primary)" />
                <input 
                  type="text" 
                  placeholder="Escanea el sticker aquí..." 
                  value={newNfcUid}
                  onChange={e => setNewNfcUid(e.target.value)}
                  autoFocus
                  required
                  style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setLinkingDevice(null)} style={{ flex: 1, padding: '1rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" disabled={linkStatus === 'loading'} style={{ flex: 1, padding: '1rem', borderRadius: '0.5rem', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 'bold', cursor: linkStatus === 'loading' ? 'not-allowed' : 'pointer' }}>
                  {linkStatus === 'loading' ? 'Vinculando...' : 'Guardar Vinculación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
