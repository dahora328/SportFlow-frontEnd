//função para formatar data
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);

  const d = new Date(Date.UTC(year, month - 1, day));

  const dayStr = String(d.getUTCDate()).padStart(2, '0');
  const monthStr = String(d.getUTCMonth() + 1).padStart(2, '0');

  return `${dayStr}/${monthStr}/${year}`;
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
