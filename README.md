# Proyecto Accesstag

Este proyecto est estructurado en dos partes principales: **Backend** (Laravel) y **Frontend** (React + Vite). Utilizamos **Supabase** para la base de datos y autenticacin.

## Estructura del Proyecto

```text
Accesstag/
├── backend/            # Lgica del servidor y API (Laravel)
├── frontend/           # Interfaz de usuario (React + Vite)
├── docs/               # Documentacin del proyecto
└── README.md           # Estas instrucciones
```

## Gua para el Equipo

Para que trabajemos en conjunto de forma organizada, seguiremos estas reglas:

### 1. Flujo de Trabajo en Git (GitHub)
*   **Rama `main`**: Solo para cdigo estable y listo para produccin.
*   **Rama `develop`**: Donde se integran las nuevas funcionalidades.
*   **Ramas `feature/nombre-tarea`**: Crea una rama para cada tarea que realices.
*   **Pull Requests (PRs)**: Antes de subir algo a `develop`, abre un PR para que otro compaero lo revise.

### 2. Configuracin Inicial

#### Backend (Laravel)
1. Entra a la carpeta: `cd backend`
2. Instala dependencias: `composer install`
3. Copia el archivo de entorno: `cp .env.example .env`
4. Genera la clave: `php artisan key:generate`

#### Frontend (React)
1. Entra a la carpeta: `cd frontend`
2. Instala dependencias: `npm install`
3. Ejecuta en desarrollo: `npm run dev`

### 3. Integracin con Supabase
Necesitaremos configurar las credenciales de Supabase en los archivos `.env` de ambas carpetas once tengamos el proyecto creado en el dashboard de Supabase.

---

**Nota:** Por favor, revisa el archivo de documentacin IEEE 830 para entender los requisitos detallados del sistema.
