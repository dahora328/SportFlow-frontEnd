import { useState } from 'react';
import {
  formatCNPJ,
  formatCPF,
  formatDocument,
  formatPhone,
  formatZipCode,
} from '../../utils/util';

export type MaskType = 'cpf' | 'cnpj' | 'document' | 'phone' | 'cep';

// Quantidade máxima de dígitos aceita por cada máscara (mantém os limites atuais)
const MASK_MAX_DIGITS: Record<MaskType, number> = {
  cpf: 11,
  cnpj: 14,
  document: 14, // CPF (11) ou CNPJ (14)
  phone: 11,
  cep: 8,
};

const MASK_FORMATTERS: Record<MaskType, (value: string) => string> = {
  cpf: formatCPF,
  cnpj: formatCNPJ,
  document: formatDocument,
  phone: formatPhone,
  cep: formatZipCode,
};

type MaskedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'maxLength' | 'type'
> & {
  mask: MaskType;
  name: string;
  value: string | null | undefined;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

/**
 * Input com máscara que:
 * - exibe apenas os dígitos enquanto está em foco (mais fácil de editar);
 * - aplica a máscara (CPF, CNPJ, telefone, CEP) ao perder o foco;
 * - sempre entrega ao formulário apenas os dígitos, respeitando o limite de cada tipo.
 */
export function MaskedInput({
  mask,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  ...rest
}: MaskedInputProps) {
  const [focused, setFocused] = useState(false);

  const maxDigits = MASK_MAX_DIGITS[mask];
  const format = MASK_FORMATTERS[mask];

  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxDigits);

  const displayValue = focused ? digits : format(digits);

  return (
    <input
      {...rest}
      type='text'
      inputMode='numeric'
      name={name}
      value={displayValue}
      maxLength={maxDigits}
      onChange={event => {
        const raw = event.target.value.replace(/\D/g, '').slice(0, maxDigits);
        // Entrega ao formulário apenas os dígitos, mantendo o mesmo contrato de onChange
        event.target.value = raw;
        onChange(event);
      }}
      onFocus={event => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={event => {
        setFocused(false);
        onBlur?.(event);
      }}
    />
  );
}
