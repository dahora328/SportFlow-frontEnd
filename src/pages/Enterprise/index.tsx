import { useEffect, useState } from 'react';
import { ModalBase } from '../../components/Modal/ModalBase';
import { useModal } from '../../hooks/useModal';
import api from '../../services/api';
import { getEnterprises, type EnterpriseData } from '../../services/enterpriseService';
import { Link } from 'react-router-dom';

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

  const modal = useModal();

  useEffect(() => {
    async function loadEnterpriseData() {
      try {
        setLoading(true);
        const data = await getEnterprises();
        const enterprise = data?.[0]; // Pega a primeira empresa vinculada ao usuário
        
        if (enterprise) {
          if (enterprise.logo_path) {
            // Ajuste a URL base se sua API estiver em outro endereço/porta
            setLogoPreview(`http://localhost:8080/storage/${enterprise.logo_path}`);
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
        console.error('Erro ao buscar dados da empresa:', error);
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
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      modal.openError('Erro', 'Ocorreu um erro ao tentar salvar os dados.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='min-h-screen bg-gray-100 flex items-center justify-center'>Carregando dados...</div>;
  }

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center p-6'>
      <h1 className='text-2xl font-bold mb-6'>Dados da Empresa</h1>

      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl'
      >
        {/* Logo Upload Section */}
        <div className='flex flex-col items-center mb-8'>
          <label className='block text-sm font-semibold mb-3 text-gray-700'>Logo da Empresa</label>
          <div 
            className='w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center relative cursor-pointer group hover:border-yellow-400 transition-colors'
            onClick={() => document.getElementById('logoInput')?.click()}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm font-medium text-center px-2">Clique para adicionar</span>
            )}
            <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
              <span className='text-white text-xs font-semibold'>Alterar Logo</span>
            </div>
          </div>
          <input 
            type="file" 
            id="logoInput" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
              }
            }} 
          />
          <p className='text-xs text-gray-500 mt-3'>Tamanho recomendado: 256x256. Máximo: 2MB.</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Nome */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Nome
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o nome'
              required
            />
          </div>
          
          {/* Razão Social */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Razão Social
            </label>
            <input
              type='text'
              name='social_reason'
              value={formData.social_reason}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite a razão social'
              required
            />
          </div>

          {/* Nome Fantasia */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Nome Fantasia
            </label>
            <input
              type='text'
              name='fantasy_name'
              value={formData.fantasy_name}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o nome fantasia'
              required
            />
          </div>

          {/* CNPJ / Documento */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              CNPJ / Documento
            </label>
            <input
              type='text'
              name='document'
              value={formData.document}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o documento'
              required
            />
          </div>

          {/* Inscrição Estadual (IE) */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Inscrição Estadual (IE)
            </label>
            <input
              type='text'
              name='IE'
              value={formData.IE}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite a inscrição estadual'
            />
          </div>

          {/* Data de Fundação */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Data de Fundação
            </label>
            <input
              type='date'
              name='foundation_date'
              value={formData.foundation_date}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Email</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o email da empresa'
              required
            />
          </div>

          {/* Telefone */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Telefone</label>
            <input
              type='text'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o telefone'
              required
            />
          </div>

          {/* CEP */}
          <div>
            <label className='block text-sm font-semibold mb-1'>CEP</label>
            <input
              type='text'
              name='zip_code'
              value={formData.zip_code}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o CEP'
              required
            />
          </div>

          {/* Estado */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Estado</label>
            <input
              type='text'
              name='state'
              value={formData.state}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='UF'
              maxLength={2}
              required
            />
          </div>

          {/* Cidade */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Cidade</label>
            <input
              type='text'
              name='city'
              value={formData.city}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite a cidade'
              required
            />
          </div>

          {/* Bairro */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Bairro</label>
            <input
              type='text'
              name='neighborhood'
              value={formData.neighborhood}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o bairro'
              required
            />
          </div>

          {/* Endereço */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-semibold mb-1'>Endereço</label>
            <input
              type='text'
              name='address'
              value={formData.address}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o endereço'
              required
            />
          </div>

          {/* Número */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Número</label>
            <input
              type='text'
              name='number'
              value={formData.number}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o número'
              required
            />
          </div>

          {/* Complemento */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Complemento</label>
            <input
              type='text'
              name='complement'
              value={formData.complement}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o complemento (Opcional)'
            />
          </div>

        </div>

        {/* Botões */}
        <div className='mt-6 text-center p-2 space-x-4 grid grid-cols-2 md:grid-cols-2'>
          <Link
            to='/home'
            className='bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition flex items-center justify-center'
          >
            Voltar
          </Link>
          <button
            type='submit'
            disabled={saving}
            className='bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition disabled:opacity-50'
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
