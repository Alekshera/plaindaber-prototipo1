import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/plaindaber-prototipo1/',
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        login: 'src/pages/login.html',
        recuperar_password: 'src/pages/recuperar_password.html',
        registro: 'src/pages/registro.html',
        dashboard: 'src/pages/dashboard.html',
        dashboard_instructor: 'src/pages/dashboard_instructor.html',
        dashboard_admin: 'src/pages/dashboard_admin.html',
        curso: 'src/pages/curso.html',
        cursos: 'src/pages/cursos.html',
        curso_huerta: 'src/pages/curso_huerta.html',
        foro: 'src/pages/foro.html',
        modulo: 'src/pages/modulo.html',
        videollamada: 'src/pages/videollamada.html',
      },
    },
  },
})
