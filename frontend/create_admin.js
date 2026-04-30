import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://htdwxysqdmfrlpmupozk.supabase.co';
const supabaseAnonKey = 'sb_publishable_OdvViAyQYkgujk3uVDxeCg_oHBE1rh-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  const email = 'senaadmin.101@gmail.com';
  const password = 'SenaSecure#2026!';

  console.log(`Registrando en Supabase: ${email}`);
  
  const { data, error } = await supabase.auth.signUp({
    email, password
  });

  if (error) {
    if (error.message.includes('User already registered')) {
        console.log("El usuario ya existe en Supabase. Intentando login para obtener ID...");
        const resLogin = await supabase.auth.signInWithPassword({ email, password });
        if (resLogin.data?.user) {
            data.user = resLogin.data.user;
        } else {
            console.error("Error al loguear usuario existente:", resLogin.error);
            return;
        }
    } else {
        console.error("Error de Supabase:", error);
        return;
    }
  }

  if (data?.user) {
    console.log(`Usuario creado/obtenido en Supabase con ID: ${data.user.id}`);
    
    console.log("Creando perfil en Laravel...");
    try {
        const response = await fetch('http://localhost:8000/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            supabase_user_id: data.user.id,
            nombre_completo: 'Administrador Maestro',
            tipo_documento: 'CC',
            numero_documento: '1000000000'
        })
        });

        const text = await response.text();
        console.log("Respuesta de Laravel:", text);
    } catch (e) {
        console.error("Error contactando Laravel. Quizás ya exista el perfil.", e.message);
    }
  }
}

createAdmin();
