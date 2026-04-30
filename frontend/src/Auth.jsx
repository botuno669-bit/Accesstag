import React, { useState } from 'react';
import { supabase } from './supabase';
import { API_URL } from './config';
import { ShieldCheck, Mail, Lock, User, Hash, FileText, Eye, EyeOff } from 'lucide-react';

export default function Auth({ onAuthenticated }) {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Perfil Extra
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [numeroDocumento, setNumeroDocumento] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const traduccionesErrores = {
    "Invalid login credentials": "Las credenciales son incorrectas. Verifica tu correo y contraseña.",
    "User already registered": "Este correo ya está registrado en el sistema.",
    "Password should be at least 6 characters": "La contraseña es muy débil (Mínimo 6 caracteres).",
    "Email not confirmed": "Tu cuenta existe pero no ha sido confirmada."
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email, password,
        });
        if (error) throw error;
        if (data.session) onAuthenticated(data.session);

      } else {
        const { data, error: registerError } = await supabase.auth.signUp({
          email, password,
        });
        if (registerError) throw registerError;

        if (data.user) {
          try {
            const response = await fetch(`${API_URL}/profiles`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                supabase_user_id: data.user.id,
                nombre_completo: nombreCompleto,
                tipo_documento: tipoDocumento,
                numero_documento: numeroDocumento
              })
            });

            if (!response.ok) {
              throw new Error("No se pudo guardar el perfil, puede que el documento ya exista.");
            }
            
            setSuccessMsg("¡Registro Exitoso! Configurando tu cuenta...");
            
          } catch (profileError) {
            throw profileError; 
          }
        }
      }
    } catch (err) {
      const msjIngles = err.message;
      const msjEspanol = traduccionesErrores[msjIngles] || msjIngles;
      setErrorMsg(msjEspanol);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      
      {/* Columna Izquierda - Imagen Corporativa */}
      <div className="auth-image-col">
        {/* Usamos un div como imagen de fondo por si queremos ajustar el cover fácilmente */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/bg-sena.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        
        {/* Capa de oscurecimiento general y degradados para contraste perfecto */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'rgba(0, 0, 0, 0.4)' // Oscurece toda la foto parejo
        }}></div>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, rgba(9,9,11,0) 50%)' // Sombra fuerte abajo para leer
        }}></div>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to right, rgba(9,9,11,0) 70%, rgba(9,9,11,1) 100%)' // Fusión con la columna derecha
        }}></div>

        {/* Contenedor de Texto Adaptable */}
        <div style={{ 
          position: 'absolute', 
          top: '50%',
          transform: 'translateY(-50%)',
          left: '12%', 
          right: '5%',
          maxWidth: '650px',
          zIndex: 2
        }}>
          <div style={{ 
            background: 'rgba(57, 169, 0, 0.15)', 
            backdropFilter: 'blur(12px)', 
            padding: '0.4rem 1.2rem', 
            borderRadius: '2rem', 
            display: 'inline-block', 
            marginBottom: '1.5rem', 
            color: '#4ade80', // Verde más brillante para contraste
            fontWeight: '600', 
            fontSize: '0.9rem',
            border: '1px solid rgba(57, 169, 0, 0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            letterSpacing: '0.5px'
          }}>
            Plataforma Institucional
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 3.5vw, 3.5rem)', // Ligeramente más pequeño para que no invada
            fontWeight: 800, 
            color: '#ffffff', 
            lineHeight: '1.1', 
            marginBottom: '1.2rem',
            textShadow: '0 4px 25px rgba(0,0,0,0.8)' // Sombra más fuerte
          }}>
            Protegiendo<br />Nuestra Comunidad.
          </h1>
          <p style={{ 
            fontSize: '1.15rem', 
            color: 'rgba(255, 255, 255, 0.95)', 
            lineHeight: '1.6',
            textShadow: '0 2px 15px rgba(0,0,0,0.8)',
            maxWidth: '90%',
            fontWeight: '400'
          }}>
            Accesstag es la plataforma inteligente del SENA para el registro, validación y control de seguridad de dispositivos electrónicos institucionales.
          </p>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="auth-form-col">
        
        {/* Luces sutiles de fondo (Glows) */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(150px)', opacity: '0.15', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '300px', height: '300px', background: 'var(--accent)', borderRadius: '50%', filter: 'blur(150px)', opacity: '0.1', zIndex: 0 }}></div>

        <div style={{
          width: '100%',
          maxWidth: '420px',
          zIndex: 10
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <ShieldCheck size={36} color="var(--primary)" />
              <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Accesstag</h2>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: '600' }}>
              {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta institucional'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {isLogin ? 'Ingresa tus credenciales para continuar.' : 'Registra tus datos reales para evitar bloqueos en portería.'}
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {!isLogin && (
              <>
                <div className="input-group">
                  <User size={18} color="var(--text-muted)" />
                  <input type="text" placeholder="Nombre Completo" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <FileText size={18} color="var(--text-muted)" />
                    <select style={{ background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', width: '100%' }} value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)}>
                      <option value="CC" style={{ background: 'var(--bg)' }}>CC</option>
                      <option value="TI" style={{ background: 'var(--bg)' }}>TI</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ flex: 2 }}>
                    <Hash size={18} color="var(--text-muted)" />
                    <input type="text" placeholder="No. Documento" value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <Mail size={18} color="var(--text-muted)" />
              <input type="email" placeholder="Correo Electrónico" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <Lock size={18} color="var(--text-muted)" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
              </button>
            </div>

            {!isLogin && (
              <div className="input-group" style={{ borderColor: confirmPassword && password !== confirmPassword ? 'var(--danger)' : 'var(--border)' }}>
                <Lock size={18} color="var(--text-muted)" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirmar Contraseña" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
            )}

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div style={{ background: 'rgba(57, 169, 0, 0.1)', color: 'var(--primary)', padding: '0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem', border: '1px solid rgba(57, 169, 0, 0.2)' }}>
                {successMsg}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? 'var(--border)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
              color: 'white',
              padding: '0.9rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              transition: 'var(--transition)',
              boxShadow: '0 4px 14px 0 rgba(57, 169, 0, 0.39)'
            }}>
              {loading ? 'Procesando...' : (isLogin ? 'Acceder al Sistema' : 'Crear Cuenta')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLogin ? "¿Eres nuevo en el SENA? " : "¿Ya tienes una cuenta validada? "}
            <span 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }} 
              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
