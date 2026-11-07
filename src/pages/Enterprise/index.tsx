import { useEffect, useState, type ReactNode } from 'react';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ModalBase } from '../../components/Modal/ModalBase';
import { useModal } from '../../hooks/useModal';
import api from '../../services/api';
import { buscarCep } from '../../services/cepService';
import { getEnterprises, type EnterpriseData } from '../../services/enterpriseService';
import { MaskedInput } from '../../components/Form/MaskedInput';
import { Link } from 'react-router-dom';
import { storageUrl } from '../../utils/storage';
import { Building2, MapPin, ImagePlus } from 'lucide-react';

// Casca de cada grupo de campos: ícone + título + dica e conteúdo.
function FieldSection({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className='rounded-2xl border border-[#E4E9E7] bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-5 flex items-center gap-3'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700'>
          {icon}
        </div>
        <div className='min-w-0'>
          <h2 className='font-display text-[15px] font-semibold text-ink'>{title}</h2>
          {hint && <p className='text-xs text-[#8A968F]'>{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Enterprise() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<EnterpriseData>({
    id: undefined,
    name: '',
    social_reason: '',
    fantasy_name: '',
    document: '',
    foundation_date: '',
    IE: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const modal = useModal();

  useEffect(() => {
    async function loadEnterpriseData() {
      try {
        setLoading(true);
        const data = await getEnterprises({ t: new Date().getTime() });
        const enterprise = data?.[0]; // Pega a primeira empresa vinculada ao usuário

        if (enterprise) {
          if (enterprise.logo_path) {
            setLogoPreview(storageUrl(enterprise.logo_path));
          }

          setFormData({
            id: enterprise.id,
            name: enterprise.name || '',
            social_reason: enterprise.social_reason || '',
            fantasy_name: enterprise.fantasy_name || '',
            document: enterprise.document || '',
            foundation_date: enterprise.foundation_date || '',
            IE: enterprise.IE || '',
            address: enterprise.address || '',
            number: enterprise.number || '',
            complement: enterprise.complement || '',
            neighborhood: enterprise.neighborhood || '',
            city: enterprise.city || '',
            state: enterprise.state || '',
            zip_code: enterprise.zip_code || '',
            phone: enterprise.phone || '',
            email: enterprise.email || '',
          });
        }
      } catch (error) {
        logger.error('Erro ao buscar dados da empresa:', error);
        modal.openError('Erro', 'Não foi possível carregar os dados da empresa.');
      } finally {
        setLoading(false);
      }
    }
    loadEnterpriseData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Ao sair do campo CEP (8 dígitos), busca o endereço e sobrescreve os campos.
  // Campos vazios no retorno preservam o que o usuário já tiver digitado.
  // Re-digitar o CEP dispara a busca novamente.
  const handleCepBlur = async () => {
    const digits = (formData.zip_code ?? '').replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const endereco = await buscarCep(digits);
      if (endereco) {
        setFormData(prev => ({
          ...prev,
          address: endereco.address || prev.address,
          neighborhood: endereco.neighborhood || prev.neighborhood,
          city: endereco.city || prev.city,
          state: endereco.state || prev.state,
        }));
      }
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        const val = formData[key as keyof EnterpriseData];
        if (val !== undefined && val !== null) {
            submitData.append(key, String(val));
        }
      });

      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      if (formData.id) {
        // No Laravel, envio de arquivos via PUT exige _method = PUT no FormData via POST
        submitData.append('_method', 'PUT');
        await api.post(`/enterprises/${formData.id}`, submitData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/enterprises', submitData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      modal.openSuccess('Sucesso', 'Dados da empresa salvos com sucesso!');

      // Dispara um evento para a Sidebar saber que deve recarregar a logo
      window.dispatchEvent(new Event('enterpriseUpdated'));
      setLogoFile(null); // Limpa o arquivo para não reenviar à toa em futuros "Salvar"

    } catch (error: unknown) {
      logger.error('Erro ao salvar empresa:', error);
      // Mesmo padrão dos demais formulários: erros de validação no modal,
      // um por linha, com fallback genérico.
      modal.openError(
        'Erro',
        getErrorMessage(error, 'Ocorreu um erro ao tentar salvar os dados.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const labelClass = 'mb-1.5 block text-sm font-medium text-[#3C4742]';
  const fieldClass =
    'w-full rounded-lg border border-[#D7DEDB] bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20';
  const gridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

  if (loading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-brand-600 border-t-transparent'></div>
          <p className='text-sm text-[#5C6A64]'>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <header>
        <h1 className='font-display text-2xl font-semibold tracking-tight'>
          Dados da empresa
        </h1>
        <p className='mt-1 text-sm text-[#5C6A64]'>
          Mantenha as informações e a identidade visual da empresa atualizadas.
        </p>
      </header>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        {/* Identificação */}
        <FieldSection
          icon={<Building2 size={18} />}
          title='Identificação'
          hint='Logo e dados cadastrais da empresa.'
        >
          {/* Logo */}
          <div className='mb-6 flex flex-col items-center gap-3 sm:flex-row sm:items-center'>
            <button
              type='button'
              onClick={() => document.getElementById('logoInput')?.click()}
              className='group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D7DEDB] bg-[#FAFBFB] transition-colors hover:border-brand-600'
            >
              {logoPreview ? (
                <img src={logoPreview} alt='Logo da empresa' className='h-full w-full object-cover' />
              ) : (
                <span className='flex flex-col items-center gap-1 px-2 text-center text-[#8A968F]'>
                  <ImagePlus size={22} />
                  <span className='text-[11px]'>Adicionar</span>
                </span>
              )}
              <span className='absolute inset-0 flex items-center justify-center bg-pine-950/55 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100'>
                Alterar logo
              </span>
            </button>
            <input
              type='file'
              id='logoInput'
              className='hidden'
              accept='image/png, image/jpeg, image/jpg, image/webp, image/*'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    modal.openError('Erro', 'A imagem selecionada é muito grande. O tamanho máximo permitido é 5MB.');
                    e.target.value = '';
                    return;
                  }
                  setLogoFile(file);
                  setLogoPreview(URL.createObjectURL(file));
                }
                e.target.value = ''; // Limpa o valor para permitir selecionar a mesma imagem novamente se necessário
              }}
            />
            <div className='text-center sm:text-left'>
              <p className='text-sm font-medium text-ink'>Logo da empresa</p>
              <p className='mt-0.5 text-xs text-[#8A968F]'>
                Tamanho recomendado: 256×256. Máximo: 5MB.
              </p>
            </div>
          </div>

          <div className={gridClass}>
            {/* Nome */}
            <div>
              <label htmlFor='name' className={labelClass}>Nome</label>
              <input
                id='name'
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o nome'
                required
              />
            </div>

            {/* Razão Social */}
            <div>
              <label htmlFor='social_reason' className={labelClass}>Razão social</label>
              <input
                id='social_reason'
                type='text'
                name='social_reason'
                value={formData.social_reason}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite a razão social'
                required
              />
            </div>

            {/* Nome Fantasia */}
            <div>
              <label htmlFor='fantasy_name' className={labelClass}>Nome fantasia</label>
              <input
                id='fantasy_name'
                type='text'
                name='fantasy_name'
                value={formData.fantasy_name}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o nome fantasia'
                required
              />
            </div>

            {/* CNPJ / Documento */}
            <div>
              <label htmlFor='document' className={labelClass}>CNPJ / Documento</label>
              <MaskedInput
                mask='document'
                name='document'
                value={formData.document}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o documento'
                required
              />
            </div>

            {/* Inscrição Estadual (IE) */}
            <div>
              <label htmlFor='IE' className={labelClass}>Inscrição Estadual (IE)</label>
              <input
                id='IE'
                type='text'
                name='IE'
                value={formData.IE}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite a inscrição estadual'
              />
            </div>

            {/* Data de Fundação */}
            <div>
              <label htmlFor='foundation_date' className={labelClass}>Data de fundação</label>
              <input
                id='foundation_date'
                type='date'
                name='foundation_date'
                value={formData.foundation_date}
                onChange={handleChange}
                className={fieldClass}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor='email' className={labelClass}>E-mail</label>
              <input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o e-mail da empresa'
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor='phone' className={labelClass}>Telefone</label>
              <MaskedInput
                mask='phone'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o telefone'
                required
              />
            </div>
          </div>
        </FieldSection>

        {/* Endereço */}
        <FieldSection
          icon={<MapPin size={18} />}
          title='Endereço'
          hint='Preencha o CEP para completar automaticamente.'
        >
          <div className={gridClass}>
            {/* CEP */}
            <div>
              <label htmlFor='zip_code' className={labelClass}>CEP</label>
              <MaskedInput
                mask='cep'
                name='zip_code'
                value={formData.zip_code}
                onChange={handleChange}
                onBlur={handleCepBlur}
                className={fieldClass}
                placeholder='00000-000'
                required
              />
              {cepLoading && (
                <p className='mt-1 text-xs text-[#8A968F]'>Buscando endereço…</p>
              )}
            </div>

            {/* Número */}
            <div>
              <label htmlFor='number' className={labelClass}>Número</label>
              <input
                id='number'
                type='text'
                name='number'
                value={formData.number}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o número'
                required
              />
            </div>

            {/* Endereço */}
            <div className='sm:col-span-2'>
              <label htmlFor='address' className={labelClass}>Endereço</label>
              <input
                id='address'
                type='text'
                name='address'
                value={formData.address}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Rua, avenida, etc.'
                required
              />
            </div>

            {/* Complemento */}
            <div>
              <label htmlFor='complement' className={labelClass}>Complemento</label>
              <input
                id='complement'
                type='text'
                name='complement'
                value={formData.complement}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Complemento (opcional)'
              />
            </div>

            {/* Bairro */}
            <div>
              <label htmlFor='neighborhood' className={labelClass}>Bairro</label>
              <input
                id='neighborhood'
                type='text'
                name='neighborhood'
                value={formData.neighborhood}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o bairro'
                required
              />
            </div>

            {/* Cidade */}
            <div>
              <label htmlFor='city' className={labelClass}>Cidade</label>
              <input
                id='city'
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite a cidade'
                required
              />
            </div>

            {/* Estado */}
            <div>
              <label htmlFor='state' className={labelClass}>Estado</label>
              <select
                id='state'
                name='state'
                value={formData.state}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value=''>Selecione o estado</option>
                <option value='AC'>Acre</option>
                <option value='AL'>Alagoas</option>
                <option value='AP'>Amapá</option>
                <option value='AM'>Amazonas</option>
                <option value='BA'>Bahia</option>
                <option value='CE'>Ceará</option>
                <option value='DF'>Distrito Federal</option>
                <option value='ES'>Espírito Santo</option>
                <option value='GO'>Goiás</option>
                <option value='MA'>Maranhão</option>
                <option value='MT'>Mato Grosso</option>
                <option value='MS'>Mato Grosso do Sul</option>
                <option value='MG'>Minas Gerais</option>
                <option value='PA'>Pará</option>
                <option value='PB'>Paraíba</option>
                <option value='PR'>Paraná</option>
                <option value='PE'>Pernambuco</option>
                <option value='PI'>Piauí</option>
                <option value='RJ'>Rio de Janeiro</option>
                <option value='RN'>Rio Grande do Norte</option>
                <option value='RS'>Rio Grande do Sul</option>
                <option value='RO'>Rondônia</option>
                <option value='RR'>Roraima</option>
                <option value='SC'>Santa Catarina</option>
                <option value='SP'>São Paulo</option>
                <option value='SE'>Sergipe</option>
                <option value='TO'>Tocantins</option>
              </select>
            </div>
          </div>
        </FieldSection>

        {/* Barra fixa de ações */}
        <div className='sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-[#E4E9E7] bg-white/95 px-4 py-3.5 shadow-[0_-2px_14px_rgba(14,32,27,0.06)] backdrop-blur'>
          <Link
            to='/home'
            className='rounded-lg border border-[#D7DEDB] bg-white px-4 py-2.5 text-sm font-medium text-[#3C4742] transition-colors hover:bg-gray-50'
          >
            Voltar
          </Link>
          <button
            type='submit'
            disabled={saving}
            className='inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>

      <ModalBase
        isOpen={modal.isOpen}
        title={modal.config.title}
        description={modal.config.description}
        variant={modal.config.variant}
        confirmText={modal.config.confirmText}
        cancelText={modal.config.cancelText}
        hideCancel={modal.config.hideCancel}
        onConfirm={modal.config.onConfirm}
        onClose={modal.closeModal}
      />
    </div>
  );
}
