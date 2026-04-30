import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { Activity, ScanLine, LogIn, LogOut, CheckCircle, AlertTriangle, XCircle, Search, Laptop } from 'lucide-react';
import { API_URL } from './config';

export default function Bitacora({ session }) {
  const [logs, setLogs] = useState([]);
  const [nfcUid, setNfcUid] = useState('');
  const [scanStatus, setScanStatus] = useState('idle'); // idle, loading, success, warning, error
  const [scanMessage, setScanMessage] = useState('');
  const [scannedDevice, setScannedDevice] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState('Entrada');
  const [profile, setProfile] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchProfileAndLogs();
    
    // Auto focus the input for continuous scanning
    if (inputRef.current) inputRef.current.focus();
    
    const interval = setInterval(fetchProfileAndLogs, 10000); // Polling cada 10s
    return () => clearInterval(interval);
  }, []);

  const fetchProfileAndLogs = async () => {
    try {
      // Fetch profile to get guarda_id
      const resProfile = await fetch(`${API_URL}/profiles/${session.user.id}`);
      if(resProfile.ok) {
        const profileData = await resProfile.json();
        setProfile(profileData);
      }

      const resLogs = await fetch(`${API_URL}/access/logs`);
      if(resLogs.ok) {
        const logsData = await resLogs.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!nfcUid.trim()) return;

    try {
      setScanStatus('loading');
      
      const response = await fetch(`${API_URL}/access/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nfc_uid: nfcUid,
          tipo: tipoMovimiento,
          guarda_id: profile?.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setScanStatus('success');
        setScanMessage(data.message);
        setScannedDevice(data.device);
        
        // Refresh logs immediately
        fetchProfileAndLogs();
      } else {
        setScanStatus(data.status === 'warning' ? 'warning' : 'error');
        setScanMessage(data.message);
        if (data.device) setScannedDevice(data.device);
      }
    } catch (err) {
      setScanStatus('error');
      setScanMessage('Error de conexión con el servidor.');
    } finally {
      setNfcUid('');
      // Auto focus again for next scan
      setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
    }
  };

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={32} color="var(--primary)" /> Bitácora de Accesos
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Terminal de validación para guardas de seguridad en portería.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Panel de Escaneo (Izquierda) */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(80px)', opacity: '0.15' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <ScanLine size={20} color="var(--primary)" /> Lector NFC
            </h3>
            
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', padding: '0.3rem' }}>
              <button 
                type="button"
                onClick={() => setTipoMovimiento('Entrada')}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.3rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: tipoMovimiento === 'Entrada' ? 'var(--primary)' : 'transparent', color: tipoMovimiento === 'Entrada' ? 'white' : 'var(--text-muted)', transition: 'var(--transition)' }}>
                Entrada
              </button>
              <button 
                type="button"
                onClick={() => setTipoMovimiento('Salida')}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.3rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: tipoMovimiento === 'Salida' ? 'var(--danger)' : 'transparent', color: tipoMovimiento === 'Salida' ? 'white' : 'var(--text-muted)', transition: 'var(--transition)' }}>
                Salida
              </button>
            </div>
          </div>
          
          <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div className="input-group" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(57,169,0,0.3)', padding: '1rem' }}>
              <ScanLine size={24} color="var(--primary)" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Acerque la tarjeta o ingrese UID..." 
                value={nfcUid}
                onChange={(e) => setNfcUid(e.target.value.toUpperCase())}
                disabled={scanStatus === 'loading'}
                style={{ fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold', width: '100%' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={!nfcUid || scanStatus === 'loading'}
              style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', 
                color: 'white', 
                border: 'none', 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                fontWeight: 'bold',
                cursor: (!nfcUid || scanStatus === 'loading') ? 'not-allowed' : 'pointer',
                opacity: (!nfcUid || scanStatus === 'loading') ? 0.5 : 1,
                transition: 'var(--transition)',
                boxShadow: '0 4px 15px rgba(57,169,0,0.4)',
                fontSize: '1.1rem'
              }}
            >
              {scanStatus === 'loading' ? 'Procesando...' : 'Registrar Movimiento'}
            </button>
          </form>

          {/* Resultado Visual de la tarjeta escaneada */}
          {scanStatus !== 'idle' && scanStatus !== 'loading' && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1.5rem', 
              borderRadius: '1rem', 
              background: scanStatus === 'success' ? 'rgba(57,169,0,0.1)' : scanStatus === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239,68,68,0.1)', 
              border: `1px solid ${scanStatus === 'success' ? 'rgba(57,169,0,0.3)' : scanStatus === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239,68,68,0.3)'}`,
              textAlign: 'center'
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
                <div style={{ marginTop: '1rem', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Laptop size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dueño: <span style={{ color: 'white', fontWeight: 'bold' }}>{scannedDevice.profile?.nombre_completo || 'Desconocido'}</span></p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Equipo: <span style={{ color: 'white' }}>{scannedDevice.marca} {scannedDevice.modelo}</span></p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel de Movimientos Rápidos (Derecha) */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--accent)" /> Historial en Tiempo Real
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '1rem' }}>
              Hoy: {logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
            </span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
            {loadingLogs ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando registros...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                      <td style={{ padding: '1rem', width: '60px' }}>
                        <span style={{ 
                          width: '40px', height: '40px', 
                          borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: log.tipo === 'Entrada' ? 'rgba(57, 169, 0, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: log.tipo === 'Entrada' ? 'var(--primary)' : 'var(--danger)'
                        }}>
                          {log.tipo === 'Entrada' ? <LogIn size={18} /> : <LogOut size={18} />}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          {log.device?.profile?.nombre_completo || 'Desconocido'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {log.device?.tipo} {log.device?.marca}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No hay movimientos hoy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
