import './ui/icons.js';
import { renderHeroicons } from './ui/icons.js';

if (localStorage.getItem('tema') === 'dark') {
  document.documentElement.classList.add('dark');
}

document.addEventListener('DOMContentLoaded', () => renderHeroicons());
