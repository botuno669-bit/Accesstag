import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { Activity, ScanLine, LogIn, LogOut, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import { API_URL } from './config';

export default function Bitacora({ session }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Scanner state
  const [nfcUid, setNfcUid] = useState('');
  const [scanStatus, setScanStatus] = useState(null); // 'idle', 'success', 'warning', 'error'
  const [scanMessage, setScanMessage] = useState('');
  const [scannedDevice, setScannedDevice] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState('Entrada');
  const inputRef = useRef(null);

  useEffect(() => {
    fetchProfileAndLogs();
    
    // Auto-focus the scanner input so it's always ready
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [session]);

  const fetchProfileAndLogs = async () => {
    try {
      // Fetch profile to get guarda_id
      const resProfile = await fetch(`${API_URL}/profiles/${session.user.id}`);
      const profileData = await resProfile.json();
      setProfile(profileData);

      // Fetch logs
      const resLogs = await fetch(`${API_URL}/access/logs`);
      const logsData = await resLogs.json();
      setLogs(logsData);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!nfcUid.trim() || !profile) return;

    try {
      setScanStatus('idle');
      
      const response = await fetch(`${API_URL}/access/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nfc_uid: nfcUid,
          guarda_id: profile.id,
          tipo_movimiento: tipoMovimiento
        })
      });

      const data = await response.json();

      if (response.ok) {
        setScanStatus('success');
        setScanMessage(data.mensaje);
        setScannedDevice(data.dispositivo);
        fetchProfileAndLogs(); // Refresh logs
      } else if (response.status === 403) {
        setScanStatus('warning');
        setScanMessage(data.error);
      } else {
        setScanStatus('error');
        setScanMessage(data.error || 'Error al procesar el escaneo');
      }
    } catch (err) {
      setScanStatus('error');
      setScanMessage('Error de conexión con el servidor');
    } finally {
      setNfcUid(''); // Clear input for next scan
      // Refocus input
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <div style={{ padding: '2rem', flex: 1, color: 'var(--text)', display: 'flex', gap: '2rem', height: '100%' }}>
      
      {/* Lado izquierdo: Escáner NFC */}
      <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Control de Acceso</h1>
        
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ScanLine size={20} color="var(--primary)" /> Lector NFC
          </h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: '0.5rem' }}>
            <button 
              onClick={() => { setTipoMovimiento('Entrada'); if(inputRef.current) inputRef.current.focus(); }}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '0.3rem', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                background: tipoMovimiento === 'Entrada' ? 'var(--primary)' : 'transparent', 
                color: tipoMovimiento === 'Entrada' ? 'white' : 'var(--text-muted)'
              }}>
              Entrada
            </button>
            <button 
              onClick={() => { setTipoMovimiento('Salida'); if(inputRef.current) inputRef.current.focus(); }}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '0.3rem', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                background: tipoMovimiento === 'Salida' ? 'var(--danger)' : 'transparent', 
                color: tipoMovimiento === 'Salida' ? 'white' : 'var(--text-muted)'
              }}>
              Salida
            </button>
          </div>

          <form onSubmit={handleScan}>
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <ScanLine size={18} color="var(--text-muted)" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Acerque la tarjeta NFC..." 
                value={nfcUid}
                onChange={e => setNfcUid(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer' }}>
              Procesar Escaneo Manual
            </button>
          </form>
        </div>

        {/* Resultado del escaneo */}
        {scanStatus && (
          <div style={{ 
            background: scanStatus === 'success' ? 'rgba(57, 169, 0, 0.1)' : scanStatus === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            border: `1px solid ${scanStatus === 'success' ? 'var(--primary)' : scanStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'}`,
            padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' 
          }}>
            <div style={{ marginBottom: '1rem' }}>
              {scanStatus === 'success' && <CheckCircle size={48} color="var(--primary)" style={{ margin: '0 auto' }} />}
              {scanStatus === 'warning' && <AlertTriangle size={48} color="var(--warning)" style={{ margin: '0 auto' }} />}
              {scanStatus === 'error' && <XCircle size={48} color="var(--danger)" style={{ margin: '0 auto' }} />}
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: scanStatus === 'success' ? 'var(--primary)' : scanStatus === 'warning' ? 'var(--warning)' : 'var(--danger)' }}>
              {scanMessage}
            </h3>
            {scannedDevice && scanStatus === 'success' && (
              <div style={{ marginTop: '1rem', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dueño: <span style={{ color: 'white', fontWeight: 'bold' }}>{scannedDevice.profile?.nombre_completo || 'Desconocido'}</span></p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Equipo: <span style={{ color: 'white' }}>{scannedDevice.marca} {scannedDevice.modelo}</span></p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lado derecho: Historial de Bitácora */}
      <div style={{ flex: 1, background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--accent)" /> Historial Reciente
          </h2>
          <div className="input-group" style={{ width: '250px', padding: '0.5rem 1rem' }}>
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Buscar..." />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <p>Cargando bitácora...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No hay registros de acceso recientes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: log.tipo_movimiento === 'Entrada' ? 'rgba(57, 169, 0, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '50%' }}>
                      {log.tipo_movimiento === 'Entrada' ? <LogIn size={18} color="var(--primary)" /> : <LogOut size={18} color="var(--danger)" />}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600' }}>{log.device?.profile?.nombre_completo || 'Usuario Desconocido'}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.device?.marca} {log.device?.modelo} • S/N: {log.device?.numero_serie}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', padding: '3px 8px', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Guarda: {log.profile?.nombre_completo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
