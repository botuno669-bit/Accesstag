import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabase';
import { API_URL } from './config';
import Auth from './Auth';
import Devices from './Devices';
import Bitacora from './Bitacora';
import Profile from './Profile';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import AdminPanel from './AdminPanel';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar el perfil una vez que tenemos la sesión
  useEffect(() => {
    if (session?.user?.id) {
      setProfileError(false);
      let isMounted = true;
      let retries = 5; // Reintentos largos por si Laravel está lento

      const fetchProfile = async () => {
        if (!isMounted) return;
        try {
          const res = await fetch(`${API_URL}/profiles/${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted) setProfile(data);
          } else {
            if (retries > 0) {
              retries--;
              setTimeout(fetchProfile, 1500);
            } else {
              if (isMounted) setProfileError(true);
            }
          }
        } catch (err) {
          if (retries > 0) {
            retries--;
            setTimeout(fetchProfile, 1500);
          } else {
            if (isMounted) setProfileError(true);
          }
        }
      };
      
      // Dar un milisegundo extra para asegurar que el Auth hizo el POST
      setTimeout(fetchProfile, 500);

      return () => { isMounted = false; };
    } else {
      setProfile(null);
      setProfileError(false);
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Si no hay sesión, mostramos la pantalla de Auth
  if (!session) {
    return <Auth onAuthenticated={setSession} />;
  }

  // Si falló catastróficamente al cargar el perfil
  if (session && profileError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'white', gap: '1rem' }}>
        <h2>Error al sincronizar tu perfil.</h2>
        <p style={{ color: 'var(--text-muted)' }}>Parece que tu registro se interrumpió o hubo un problema de conexión con el servidor.</p>
        <button onClick={handleLogout} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
          Volver e intentar de nuevo
        </button>
      </div>
    );
  }

  // Pantalla de carga mientras se sincroniza con Laravel
  if (session && !profile) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'white' }}>
      <h2>Configurando tu perfil en la base de datos...</h2>
    </div>;
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar onLogout={handleLogout} profile={profile} />
        <div className="main-scroll">
          <Routes>
            <Route path="/" element={<Dashboard session={session} profile={profile} />} />
            <Route path="/usuarios" element={<Profile session={session} profile={profile} />} />
            <Route path="/dispositivos" element={<Devices session={session} profile={profile} />} />
            <Route path="/bitacora" element={<Bitacora session={session} profile={profile} />} />
            <Route path="/admin" element={<AdminPanel profile={profile} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
