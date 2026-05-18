export function formatarDataHora(valor) {
  if (!valor) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor));
}

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '-';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor));
}

export function normalizarPlaca(valor) {
  return String(valor || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function dataFinalExclusiva(data) {
  if (!data) {
    return '';
  }

  const dataBase = new Date(`${data}T00:00:00`);
  dataBase.setDate(dataBase.getDate() + 1);

  return dataBase.toISOString();
}
