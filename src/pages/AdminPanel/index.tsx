/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { logger } from '../../utils/logger';
import { useNavigate } from 'react-router-dom';
import { Building2, UserPlus, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../../services/api';
import { ModalBase } from '../../components/Modal/ModalBase';
import { MaskedInput, type MaskType } from '../../components/Form/MaskedInput';
import { useModal } from '../../hooks/useModal';

interface Enterprise {
  id: number;
  name: string;
  fantasy_name?: string;
  document?: string;
  active?: boolean;
}

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7772]';
const fieldClass =
  'w-full rounded-lg border border-[#D7DEDB] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20';

// ─── Formulário de Empresa ────────────────────────────────────────────────────
function EnterpriseForm({ onSuccess }: { onSuccess: (enterprise: Enterprise) => void }) {
  const modal = useModal();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    name: '',
    social_reason: '',
    fantasy_name: '',
    document: '',
    foundation_date: '',
    email: '',
    phone: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    owner_name: '',
    IE: '',
    complement: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const response = await api.post('/enterprises', formData);
      modal.openSuccess('Sucesso!', 'Empresa cadastrada com sucesso!');
      onSuccess(response.data.enterprise);
      setFormData({
        name: '', social_reason: '', fantasy_name: '', document: '',
        foundation_date: '', email: '', phone: '', address: '',
        number: '', neighborhood: '', city: '', state: '', zip_code: '', owner_name: '',
        IE: '', complement: '',
      });
    } catch (error: any) {
      if (error?.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        const msg = error?.response?.data?.error || 'Erro ao cadastrar empresa.';
        modal.openError('Erro', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {([
            { label: 'Nome *', name: 'name', required: true },
            { label: 'Razão Social *', name: 'social_reason', required: true },
            { label: 'Nome Fantasia', name: 'fantasy_name', required: false },
            { label: 'CNPJ *', name: 'document', required: true, mask: 'document' },
            { label: 'Data de Fundação', name: 'foundation_date', required: false, type: 'date' },
            { label: 'Email *', name: 'email', required: true, type: 'email' },
            { label: 'Telefone', name: 'phone', required: false, mask: 'phone' },
            { label: 'Nome do Responsável', name: 'owner_name', required: false },
            { label: 'Inscrição Estadual', name: 'IE', required: false },
            { label: 'CEP', name: 'zip_code', required: false, mask: 'cep' },
            { label: 'Estado (UF)', name: 'state', required: false },
            { label: 'Cidade', name: 'city', required: false },
            { label: 'Bairro', name: 'neighborhood', required: false },
            { label: 'Endereço', name: 'address', required: false },
            { label: 'Número', name: 'number', required: false },
            { label: 'Complemento', name: 'complement', required: false },
          ] as { label: string; name: string; required: boolean; type?: string; mask?: MaskType }[]).map(field => (
            <div key={field.name}>
              <label className={labelClass}>
                {field.label}
              </label>
              {field.mask ? (
                <MaskedInput
                  mask={field.mask}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  required={field.required}
                  className={fieldClass}
                />
              ) : field.name === 'state' ? (
                <select
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  required={field.required}
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
              ) : (
                <input
                  type={field.type ?? 'text'}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  required={field.required}
                  className={fieldClass}
                />
              )}
              {errors[field.name] && <p className='mt-1 text-xs text-[#C2453D]'>{errors[field.name][0]}</p>}
            </div>
          ))}
        </div>

        <button
          type='submit'
          disabled={saving}
          className='mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          <Building2 size={16} />
          {saving ? 'Cadastrando...' : 'Cadastrar empresa'}
        </button>
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
    </>
  );
}

// ─── Formulário de Usuário ────────────────────────────────────────────────────
function UserForm() {
  const [allEnterprises, setAllEnterprises] = useState<Enterprise[]>([]);

  useEffect(() => {
    async function loadAll() {
      try {
        const response = await api.get('/enterprises?all=true');
        setAllEnterprises(response.data);
      } catch (error) {
        logger.error('Erro ao carregar empresas:', error);
      }
    }
    loadAll();
  }, []);
  const modal = useModal();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    enterprise_id: '',
    is_admin: true,  // Primeiro usuário da empresa é sempre o Gestor
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.enterprise_id) {
      modal.openError('Atenção', 'Selecione a empresa para este usuário.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        enterprise_id: Number(formData.enterprise_id),
        is_admin: formData.is_admin,
      });
      modal.openSuccess('Sucesso!', 'Usuário (Gestor) criado com sucesso! Envie as credenciais para o cliente.');
      setFormData({ name: '', email: '', password: '', enterprise_id: '', is_admin: true });
    } catch (error: any) {
      const msg = error?.response?.data?.error
        || error?.response?.data?.message
        || 'Erro ao criar usuário.';
      modal.openError('Erro', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className={labelClass}>
            Empresa *
          </label>
          <select
            name='enterprise_id'
            value={formData.enterprise_id}
            onChange={handleChange}
            required
            className={fieldClass}
          >
            <option value=''>Selecione uma empresa...</option>
            {allEnterprises.map(e => (
              <option key={e.id} value={e.id}>{e.fantasy_name || e.name}</option>
            ))}
          </select>
        </div>

        {[
          { label: 'Nome do Gestor *', name: 'name', required: true, type: 'text' },
          { label: 'E-mail *', name: 'email', required: true, type: 'email' },
          { label: 'Senha *', name: 'password', required: true, type: 'password' },
        ].map(field => (
          <div key={field.name}>
            <label className={labelClass}>
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name as keyof typeof formData] as string}
              onChange={handleChange}
              required={field.required}
              minLength={field.name === 'password' ? 8 : undefined}
              placeholder={field.name === 'password' ? 'Mínimo 8 caracteres' : ''}
              className={fieldClass}
            />
          </div>
        ))}

        <p className='rounded-lg border border-brand-600/20 bg-brand-50 px-3 py-2.5 text-xs text-brand-700'>
          Este usuário será criado como <strong>Gestor</strong> da empresa selecionada.
          Envie o e-mail e senha para o cliente acessar o sistema.
        </p>

        <button
          type='submit'
          disabled={saving}
          className='mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          <UserPlus size={16} />
          {saving ? 'Criando Gestor...' : 'Criar Gestor da empresa'}
        </button>
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
    </>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'enterprise' | 'user'>('enterprise');
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingEnterprises, setLoadingEnterprises] = useState(true);

  useEffect(() => {
    async function loadEnterprises() {
      setLoadingEnterprises(true);
      try {
        const response = await api.get(`/enterprises?page=${page}`);
        setEnterprises(response.data.data);
        setTotalPages(response.data.last_page);
        setTotalItems(response.data.total);
      } catch {
        setEnterprises([]);
      } finally {
        setLoadingEnterprises(false);
      }
    }
    loadEnterprises();
  }, [page]);

  // Quando uma nova empresa é criada, adiciona à lista local (sem precisar recarregar)
  function handleEnterpriseCreated(newEnterprise: Enterprise) {
    setEnterprises(prev => [...prev, newEnterprise]);
  }

  const tabClass = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
      active
        ? 'border-b-2 border-brand-600 bg-brand-50 text-brand-700'
        : 'text-[#6B7772] hover:text-ink'
    }`;

  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
      {/* Header */}
      <header>
        <div className='mb-2 flex items-center gap-1.5 text-sm text-[#8A968F]'>
          <button onClick={() => navigate('/home')} className='transition-colors hover:text-brand-700'>
            Home
          </button>
          <ChevronRight size={14} />
          <span className='font-medium text-brand-700'>Painel Admin</span>
        </div>
        <h1 className='font-display text-2xl font-semibold tracking-tight'>
          Painel do Gestor Geral
        </h1>
        <p className='mt-1 text-sm text-[#5C6A64]'>
          Cadastre novas empresas e crie os primeiros acessos para cada cliente.
        </p>
      </header>

      {/* Empresas cadastradas */}
      <section className='rounded-2xl border border-[#E4E9E7] bg-white p-5 shadow-sm sm:p-6'>
        <h2 className='mb-4 text-xs font-semibold uppercase tracking-wide text-[#6B7772]'>
          Empresas cadastradas ({totalItems})
        </h2>
        {loadingEnterprises ? (
          <p className='text-sm text-[#8A968F]'>Carregando...</p>
        ) : enterprises.length === 0 ? (
          <p className='text-sm italic text-[#8A968F]'>Nenhuma empresa cadastrada ainda.</p>
        ) : (
          <div className='flex flex-col gap-2'>
            {enterprises.map(e => (
              <div
                key={e.id}
                className='flex items-center justify-between gap-3 rounded-xl border border-[#EEF2F0] bg-[#FAFBFB] px-4 py-3'
                title={e.active !== false ? 'Desativar empresa' : 'Ativar empresa'}
              >
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold text-ink'>{e.fantasy_name || e.name}</p>
                  {e.document && <p className='text-xs text-[#8A968F]'>CNPJ: {e.document}</p>}
                </div>
                <button
                  onClick={async () => {
                    try {
                      const newStatus = !e.active;
                      await api.put(`/enterprises/${e.id}`, { active: newStatus });
                      setEnterprises(prev => prev.map(ent => ent.id === e.id ? { ...ent, active: newStatus } : ent));
                    } catch (error) {
                      logger.error('Erro ao alterar status', error);
                      alert('Erro ao alterar o status da empresa.');
                    }
                  }}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    e.active !== false
                      ? 'bg-brand-50 text-brand-700 hover:bg-brand-600/10'
                      : 'bg-red-50 text-[#C2453D] hover:bg-red-100'
                  }`}
                >
                  {e.active !== false ? 'Ativa' : 'Inativa'}
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className='mt-4 flex items-center justify-between border-t border-[#EEF2F0] pt-3'>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className='inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition-colors hover:text-brand-600 disabled:cursor-not-allowed disabled:text-[#C3CCC8]'
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <span className='text-xs text-[#8A968F]'>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className='inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition-colors hover:text-brand-600 disabled:cursor-not-allowed disabled:text-[#C3CCC8]'
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* Abas */}
      <section className='overflow-hidden rounded-2xl border border-[#E4E9E7] bg-white shadow-sm'>
        <div className='flex border-b border-[#EEF2F0]'>
          <button onClick={() => setActiveTab('enterprise')} className={tabClass(activeTab === 'enterprise')}>
            <Building2 size={16} />
            Cadastrar empresa
          </button>
          <button onClick={() => setActiveTab('user')} className={tabClass(activeTab === 'user')}>
            <UserPlus size={16} />
            Criar Gestor
          </button>
        </div>

        <div className='p-5 sm:p-6'>
          {activeTab === 'enterprise' ? (
            <EnterpriseForm onSuccess={handleEnterpriseCreated} />
          ) : (
            <UserForm />
          )}
        </div>
      </section>
    </div>
  );
}
