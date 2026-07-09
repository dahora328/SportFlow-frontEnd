/* eslint-disable @typescript-eslint/no-explicit-any */
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ModalBase } from '../../components/Modal/ModalBase';
import { useModal } from '../../hooks/useModal';
import api from '../../services/api';
export function User() {
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const modal = useModal();

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const response = await api.get('/user');
        const data = response.data.user || response.data;
        
        setFormData({
          user_name: data.name || data.user_name || '',
          email: data.email || '',
          password: '', // A senha vem em branco para edição
          gender: data.gender || '',
        });
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        modal.openError('Erro', 'Não foi possível carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
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
      
      // Cria um payload removendo a senha se ela não foi preenchida (para não resetá-la)
      const payload = { ...formData };
      if (!payload.password) {
        delete (payload as any).password;
      }

      await api.put('/user', payload);
      modal.openSuccess('Sucesso', 'Dados do usuário alterados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      modal.openError('Erro', 'Ocorreu um erro ao tentar salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='min-h-screen bg-gray-100 flex items-center justify-center'>Carregando dados...</div>;
  }

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center p-6'>
      <h1 className='text-2xl font-bold mb-6'>Editar Perfil</h1>

      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Nome do usuario */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Nome do usuario
            </label>
            <input
              type='text'
              name='user_name'
              value={formData.user_name}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o nome do usuario'
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
              placeholder='Digite o email do usuario'
              required
            />
          </div>
          {/* Senha */}
          <div className='flex flex-col gap-2'>
            <label className='font-medium'>Senha</label>

            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='Digite sua senha'
                required
                name='password'
                value={formData.password}
                onChange={handleChange}
              />

              {/* Botão de mostrar/ocultar */}
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                aria-label='Mostrar/Ocultar senha'
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800'
                title={`${showPassword ? 'Ocultar senha' : 'Mostrar senha'}`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {/* Gênero */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Gênero</label>
            <select
              name='gender'
              value={formData.gender}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 mt-2'
              required
            >
              <option value=''>Selecione</option>
              <option value='male'>Masculino</option>
              <option value='female'>Feminino</option>
              <option value='other'>Outro</option>
            </select>
          </div>
        </div>
        {/* Botão de envio */}
        <div className='mt-6 text-center p-2 space-x-4 grid grid-cols-2 md:grid-cols-2'>
          <Link
            to='/home'
            className='bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition'
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
