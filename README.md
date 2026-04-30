# AccessTag 🛡️

**AccessTag** es una plataforma institucional premium diseñada para el registro, validación y control de seguridad de dispositivos electrónicos (computadores, tablets, etc.) mediante tecnología NFC. Fue diseñada específicamente para optimizar la seguridad y los tiempos de acceso en las porterías institucionales (Ej. SENA).

---

## 🛠️ Stack Tecnológico (Arquitectura)

Este proyecto está dividido en un ecosistema robusto que separa el cliente, el servidor y la autenticación:

1. **Frontend (Cliente):** 
   - Construido con **React.js** y **Vite**.
   - Diseño moderno "Glassmorphism" y 100% Responsivo (Adaptable a celulares y tablets de guardas).
   - Iconografía por **Lucide-React**.
2. **Backend (API RESTful):** 
   - Construido con **Laravel** (PHP).
   - Maneja la lógica de negocio, validación de etiquetas NFC y almacenamiento de archivos (Fotos de perfil y equipos).
3. **Base de Datos & Autenticación:** 
   - Base de Datos relacional en **PostgreSQL**.
   - Gestión de usuarios y autenticación segura delegada a **Supabase**.

---

## 🏗️ Flujo Operativo y Roles

El sistema está estructurado jerárquicamente con distintos niveles de permisos:

### 1. El Aprendiz / Usuario Normal (`Aprendiz` / `Aprendiz No Validado`)
- **Registro:** Crea su cuenta desde la interfaz y se le asigna el rol temporal de "No Validado".
- **Gestión:** Puede subir su foto de perfil y registrar sus dispositivos (Portátiles, tablets).
- Al registrar un equipo, el sistema le asigna un código NFC virtual `TEMP-XXXXX`.

### 2. El Administrador Maestro (`Administrador`)
- **Panel Maestro:** Tiene acceso a la gestión total de la plataforma.
- **Validación NFC:** Es el único autorizado para tomar un sticker físico NFC (institucional), escanearlo y **vincularlo** al dispositivo de un aprendiz, reemplazando el código `TEMP-` por un código real y permanente.
- **Gestión Humana:** Puede cambiar los roles de los usuarios (Ascender a Guarda, Bloquear, etc.) y cambiar los estados de los equipos (Activo, Retenido, Extraviado).

### 3. El Guarda de Seguridad (`Guarda`)
- **Portería / Bitácora:** Utiliza una interfaz rápida y táctil (ideal para tablets).
- Escanea el chip NFC físico del portátil del estudiante. El sistema responde con indicadores semafóricos (Verde = Permite acceso, Rojo = Alerta/Equipo extraviado) y registra la entrada/salida en la base de datos de auditoría.

---

## 🗄️ Esquema de Base de Datos (Core)

Si una Inteligencia Artificial va a modificar este proyecto en el futuro, debe conocer estas tablas principales:

### Tabla `profiles` (Usuarios)
- `id` (PK)
- `supabase_user_id` (Conexión con Supabase Auth)
- `nombre_completo`
- `tipo_documento` / `numero_documento`
- `rol` (Administrador, Guarda, Aprendiz, Aprendiz (No Validado), Bloqueado)
- `foto_url` (Almacenado localmente en Laravel public/storage)

### Tabla `devices` (Equipos)
- `id` (PK)
- `profile_id` (FK -> profiles.id)
- `nfc_uid` (Único. Empieza con `TEMP-` hasta que el Admin lo vincula con un sticker físico)
- `tipo` / `marca` / `modelo` / `numero_serie`
- `estado` (Activo, Bloqueado, Extraviado, Retenido en CIC)
- `foto_url`

### Tabla `access_logs` (Bitácora de Portería)
- `id` (PK)
- `device_id` (FK -> devices.id)
- `guard_id` (FK -> profiles.id del guarda en turno)
- `action` (Entrada / Salida)

---

## 🚀 Guía de Ejecución Rápida

Para levantar el entorno de desarrollo local:

### 1. Levantar el Backend (Laravel)
```bash
cd backend
php artisan serve
```
El servidor escuchará en `http://127.0.0.1:8000`. Asegúrate de haber corrido `php artisan storage:link` para que las fotos subidas se vean en el frontend.

### 2. Levantar el Frontend (React)
```bash
cd frontend
npm run dev
```
La interfaz estará disponible en `http://localhost:5173`.

---

> **Nota para IAs futuras:** Este sistema ya tiene implementada la lógica de diseño responsivo (mobile-first) en el archivo `index.css` de React, utilizando el contenedor `.app-layout`. Cualquier nueva interfaz (modales, tablas) debe respetar los parámetros visuales oscuros y de "Glassmorphism" (`var(--bg)`, `var(--card-bg)`, etc.).
