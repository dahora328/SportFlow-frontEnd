import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserPlus, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { ModalBase } from '../../components/Modal/ModalBase';
import { useModal } from '../../hooks/useModal';

interface Enterprise {
  id: number;
  name: string;
  fantasy_name?: string;
  document?: string;
}

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
      <form onSubmit={handleSubmit} className='space-y-3'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {[
            { label: 'Nome *', name: 'name', required: true },
            { label: 'Razão Social *', name: 'social_reason', required: true },
            { label: 'Nome Fantasia', name: 'fantasy_name', required: false },
            { label: 'CNPJ *', name: 'document', required: true },
            { label: 'Data de Fundação', name: 'foundation_date', required: false, type: 'date' },
            { label: 'Email *', name: 'email', required: true, type: 'email' },
            { label: 'Telefone', name: 'phone', required: false },
            { label: 'Nome do Responsável', name: 'owner_name', required: false },
            { label: 'Inscrição Estadual', name: 'IE', required: false },
            { label: 'CEP', name: 'zip_code', required: false },
            { label: 'Estado (UF)', name: 'state', required: false },
            { label: 'Cidade', name: 'city', required: false },
            { label: 'Bairro', name: 'neighborhood', required: false },
            { label: 'Endereço', name: 'address', required: false },
            { label: 'Número', name: 'number', required: false },
            { label: 'Complemento', name: 'complement', required: false },
          ].map(field => (
            <div key={field.name}>
              <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
                {field.label}
              </label>
              {field.name === 'state' ? (
                <select
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  required={field.required}
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none bg-white'
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
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none'
                />
              )}
              {errors[field.name] && <p className='text-red-500 text-xs mt-1'>{errors[field.name][0]}</p>}
            </div>
          ))}
        </div>

        <button
          type='submit'
          disabled={saving}
          className='w-full mt-2 bg-red-950 text-white font-semibold py-2.5 rounded-lg hover:bg-red-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2'
        >
          <Building2 size={16} />
          {saving ? 'Cadastrando...' : 'Cadastrar Empresa'}
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
      } catch (err) {}
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
      <form onSubmit={handleSubmit} className='space-y-3'>
        <div>
          <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
            Empresa *
          </label>
          <select
            name='enterprise_id'
            value={formData.enterprise_id}
            onChange={handleChange}
            required
            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white'
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
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name as keyof typeof formData] as string}
              onChange={handleChange}
              required={field.required}
              minLength={field.name === 'password' ? 6 : undefined}
              placeholder={field.name === 'password' ? 'Mínimo 6 caracteres' : ''}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none'
            />
          </div>
        ))}

        <p className='text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2'>
          ℹ️ Este usuário será criado como <strong>Gestor</strong> da empresa selecionada.
          Envie o e-mail e senha para o cliente acessar o sistema.
        </p>

        <button
          type='submit'
          disabled={saving}
          className='w-full mt-2 bg-red-950 text-white font-semibold py-2.5 rounded-lg hover:bg-red-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2'
        >
          <UserPlus size={16} />
          {saving ? 'Criando Gestor...' : 'Criar Gestor da Empresa'}
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

  return (
    <div className='min-h-screen bg-gray-100 p-6'>
      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-2 text-sm text-gray-500 mb-2'>
            <button onClick={() => navigate('/home')} className='hover:text-red-950'>Home</button>
            <ChevronRight size={14} />
            <span className='text-red-950 font-semibold'>Painel Admin</span>
          </div>
          <h1 className='text-2xl font-bold text-gray-800'>Painel do Gestor Geral</h1>
          <p className='text-gray-500 mt-1'>
            Cadastre novas empresas e crie os primeiros acessos para cada cliente.
          </p>
        </div>

        {/* Empresas cadastradas */}
        <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
          <h2 className='text-sm font-semibold text-gray-600 uppercase mb-3'>
            Empresas cadastradas ({totalItems})
          </h2>
          {loadingEnterprises ? (
            <p className='text-sm text-gray-400'>Carregando...</p>
          ) : enterprises.length === 0 ? (
            <p className='text-sm text-gray-400 italic'>Nenhuma empresa cadastrada ainda.</p>
          ) : (
            <div className='space-y-2'>
              {enterprises.map(e => (
                <div key={e.id} className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2'>
                  <div>
                    <p className='font-semibold text-gray-800 text-sm'>{e.fantasy_name || e.name}</p>
                    {e.document && <p className='text-xs text-gray-400'>CNPJ: {e.document}</p>}
                  </div>
                  <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium'>Ativa</span>
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className='mt-4 flex justify-between items-center border-t pt-3'>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className='text-sm text-red-950 font-medium disabled:text-gray-300'
              >
                Anterior
              </button>
              <span className='text-xs text-gray-500'>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='text-sm text-red-950 font-medium disabled:text-gray-300'
              >
                Próxima
              </button>
            </div>
          )}
        </div>

        {/* Abas */}
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('enterprise')}
              className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'enterprise'
                  ? 'text-red-950 border-b-2 border-red-950 bg-red-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={16} />
              Cadastrar Empresa
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'user'
                  ? 'text-red-950 border-b-2 border-red-950 bg-red-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus size={16} />
              Criar Gestor
            </button>
          </div>

          <div className='p-6'>
            {activeTab === 'enterprise' ? (
              <EnterpriseForm onSuccess={handleEnterpriseCreated} />
            ) : (
              <UserForm />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
