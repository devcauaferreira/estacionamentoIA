import Swal from 'sweetalert2';

export function sucesso(titulo, texto = '') {
  return Swal.fire({ icon: 'success', title: titulo, text: texto, confirmButtonColor: '#a855f7' });
}

export function erro(titulo, mensagem) {
  return Swal.fire({ icon: 'error', title: titulo, text: mensagem || 'Não foi possível concluir a operação.', confirmButtonColor: '#a855f7' });
}

export function aviso(titulo, texto = '') {
  return Swal.fire({ icon: 'warning', title: titulo, text: texto, confirmButtonColor: '#a855f7' });
}

export function confirmar({ titulo, texto, confirmText = 'Confirmar' }) {
  return Swal.fire({
    icon: 'question',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#a855f7',
    cancelButtonColor: '#64748B',
  });
}
