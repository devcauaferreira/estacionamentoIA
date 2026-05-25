import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        movimentacoes: resolve(__dirname, 'pages/movimentacoes.html'),
        patio: resolve(__dirname, 'pages/patio.html'),
        historico: resolve(__dirname, 'pages/historico.html'),
        usuarios: resolve(__dirname, 'pages/usuarios.html'),
        veiculos: resolve(__dirname, 'pages/veiculos.html'),
        dashboardCliente: resolve(__dirname, 'cliente/dashboard-cliente.html'),
      },
    },
  },
});
