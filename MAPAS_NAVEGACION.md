# Mapa de Navegación — Plaindaber (prototipo)

Ruta base del sitio: `plaindaber-prototype/`
Todas las páginas están en `src/pages/`. La barra lateral (sidebar) es el menú principal de las vistas autenticadas.

## 1. Diagrama general

```
index.html
   └─ (redirige automático) ──► login.html

login.html ──────────────► registro.html
   │                       (formulario registro)
   ├─► recuperar_password.html ──► login.html
   │
   └─ (login OK) ──► según rol ──► dashboard.html | dashboard_instructor.html | dashboard_admin.html

registro.html (submit)
   ├─ Estudiante ─────────────────► dashboard.html
   ├─ Administrador ──────────────► dashboard_admin.html
   └─ Profesor (INSTRUCTOR) ────────► dashboard_instructor.html

┌─────────────── ZONA AUTENTICADA (Sidebar compartido) ───────────────┐
│                                                                     │
│   dashboard.html  ◄───►  cursos.html  ◄──► foro.html                │
│      ▲                    │              ◄──► videollamada.html     │
│      │ (fin llamada)      │  seleccionar curso                      │
│      │                    ▼                                        │
│ videollamada.html     curso_huerta.html?id=N                        │
│                          │  "Abrir módulo interactivo"              │
│                          ▼                                          │
│                        modulo.html?id=N                             │
│                          (módulos encadenados)                      │
│                          └──► volver a curso_huerta.html            │
│                                                                     │
│   dashboard_admin.html (Administrador: propuestas y reportes)       │
│                                                                     │
│   Cualquier página ──(logout)──► login.html                         │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Detalle por página

### Inicio / No autenticado

| Página | Ruta | Enlaces salientes |
|---|---|---|
| `index.html` | raíz | Redirige a `src/pages/login.html` (meta refresh + JS) |
| `login.html` | Iniciar sesión | `recuperar_password.html` · `registro.html` · login OK → `dashboard.html` (redirige por rol: estudiante/instructor/administrador) |
| `registro.html` | Registro | Al enviar: `dashboard.html` (estudiante), `dashboard_admin.html` (administrador) o `dashboard_instructor.html` (instructor) según rol |
| `recuperar_password.html` | Recuperar contraseña | Al completar OK → `login.html` · enlaces a `login.html` |

### Autenticados (sidebar común)

Sidebar: Dashboard · Cursos · Foro · Videollamadas · (admin: Reportes) · Configuración · Cerrar sesión.

| Página | Ruta | Enlaces únicos |
|---|---|---|
| `dashboard.html` | Vista estudiante | Sidebar → `cursos.html`, `foro.html`, `videollamada.html`; "Continuar" curso → `curso_huerta.html`; rol instructor → redirige a `dashboard_instructor.html`; rol administrador → redirige a `dashboard_admin.html`; logout → `login.html` |
| `dashboard_instructor.html` | Vista instructor | Sidebar → `cursos.html`, `foro.html`, `videollamada.html`; logout → `login.html` |
| `dashboard_admin.html` | Vista administrador | Sidebar → `cursos.html`, `foro.html`, `videollamada.html`; aprobar/rechazar propuestas de instructores (modal de estado); logout → `login.html` |
| `cursos.html` | Catálogo de cursos | Tarjeta de curso → `curso_huerta.html?id=N`; sidebar → `dashboard.html`, `foro.html`, `videollamada.html`; logout |
| `curso_huerta.html` | Detalle de curso | "← Volver a cursos" → `cursos.html`; "Abrir módulo interactivo" → `modulo.html?id=N`; sidebar + logout |
| `modulo.html` | Módulo interactivo | "← Volver al curso" → `curso_huerta.html`; siguiente/otro módulo → `modulo.html?id=N`; sidebar + logout |
| `foro.html` | Foro | Sidebar → `dashboard.html`, `cursos.html`, `videollamada.html`; logout |
| `videollamada.html` | Videollamadas | Al terminar la llamada → `dashboard.html` (tras 2.5 s); sidebar + logout |

### Sin uso actual
| Página | Estado |
|---|---|
| `curso.html` | Placeholder estático, no enlazado desde ninguna página |

## 3. Reglas de redirección en código

| Origen | Condición | Destino | Archivo |
|---|---|---|---|
| Login exitoso | email/password válidos | `dashboard.html` / `dashboard_instructor.html` / `dashboard_admin.html` según rol | `src/js/auth.js:221-227` |
| Registro | rol INSTRUCTOR | `dashboard_instructor.html` | `src/js/auth.js:320` |
| Registro | rol ADMINISTRADOR | `dashboard_admin.html` | `src/js/auth.js:321` |
| Registro | rol ESTUDIANTE | `dashboard.html` | `src/js/auth.js:322-324` |
| Login erróneo ("No") | alerta | `registro.html` | `src/js/auth.js:335-337` |
| Recuperar OK | — | `login.html` | `src/js/auth.js:446` |
| Auth (dashboard.view) | rol INSTRUCTOR | `dashboard_instructor.html` | `src/pages/dashboard.html:305` |
| Auth (dashboard.view) | rol ADMINISTRADOR | `dashboard_admin.html` | `src/pages/dashboard.html:307` |
| Auth (dashboard.view) | Cerrar sesión | `login.html` | `src/pages/dashboard.html:445` |
| Auth | logout en sidebars | `login.html` | `foro.html`, `cursos.html`, `modulo.html`, `videollamada.html`, `dashboard_instructor.js`, `curso_huerta.js` |
| Catálogo | tarjeta click | `curso_huerta.html?id=N` | `src/js/cursos.js:227,249` |
| Curso estudiante | "Continuar" | `curso_huerta.html` | `src/pages/dashboard.html:440` |
| Módulo | siguiente módulo | `modulo.html?id=N` | `src/js/modulo.js:716` |
| Videollamada | al terminar | `dashboard.html` (tras 2.5 s) | `src/js/videollamada.js:340` |

## 4. Roles y accesos

- **Estudiante**: login → `dashboard.html`, cursos, módulos, foro, videollamadas.
- **Instructor**: registro/login → `dashboard_instructor.html`, gestiona cursos/link a catálogo, foro, videollamadas.
- **Administrador**: registro/login → `dashboard_admin.html` (vista admin con propuestas de cursos de instructores), reportes.

## 5. Rutas de salida directa al navegador (sin clicks)

Si se accede a cualquier página autenticada sin sesión válida, no hay guard: las páginas cargan igual (los datos vienen de mock/localStorage).