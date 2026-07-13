//função para formatar data
export function formatDate(dateString: string) {
  if (!dateString) return '-';

  // Se a string for exatamente YYYY-MM-DD, a formatação manual evita bugs de fuso horário (UTC) do JS
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-');
    return `${day}/${month}/${year}`;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  // Se for um timestamp do banco (Laravel) em UTC marcado à meia-noite
  if (dateString.includes('00:00:00.000000Z') || dateString.includes('00:00:00.000Z')) {
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  return date.toLocaleDateString('pt-BR');
}

export function formatCPF(cpf: string): string {
  if (!cpf) return '';

  const numbers = cpf.replace(/\D/g, '').slice(0, 11);

  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatPhone(phone: string): string {
  if (!phone) return '';

  const numbers = phone.replace(/\D/g, '');

  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else {
    return phone;
  }
}

export function formatZipCode(zip: string): string {
  if (!zip) return '';

  const numbers = zip.replace(/\D/g, '').slice(0, 8);

  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function formatDocument(document: string): string {
  if (!document) return '';

  const numbers = document.replace(/\D/g, '');

  if (numbers.length === 11) {
    return formatCPF(numbers);
  } else if (numbers.length === 14) {
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  } else {
    return document;
  }
}
