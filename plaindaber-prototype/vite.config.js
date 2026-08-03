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
        registro: 'src/pages/registro.html',
        dashboard: 'src/pages/dashboard.html',
        curso: 'src/pages/curso.html',
        foro: 'src/pages/foro.html',
        modulo: 'src/pages/modulo.html',
        videollamada: 'src/pages/videollamada.html',
      },
    },
  },
})
