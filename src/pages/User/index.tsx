/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft, Eye, EyeOff, UserCog } from 'lucide-react';
import { logger } from '../../utils/logger';
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
        logger.error('Erro ao buscar dados do usuário:', error);
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
      logger.error('Erro ao atualizar usuário:', error);
      modal.openError('Erro', 'Ocorreu um erro ao tentar salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const labelClass = 'mb-1.5 block text-sm font-medium text-[#3C4742]';
  const fieldClass =
    'w-full rounded-lg border border-[#D7DEDB] bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20';

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
        <Link
          to='/home'
          className='mb-3 inline-flex items-center gap-1.5 text-sm text-[#5C6A64] transition-colors hover:text-brand-700'
        >
          <ArrowLeft size={16} />
          Voltar para atletas
        </Link>
        <h1 className='font-display text-2xl font-semibold tracking-tight'>
          Editar perfil
        </h1>
        <p className='mt-1 text-sm text-[#5C6A64]'>
          Atualize seus dados de acesso ao sistema.
        </p>
      </header>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <section className='rounded-2xl border border-[#E4E9E7] bg-white p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700'>
              <UserCog size={18} />
            </div>
            <div className='min-w-0'>
              <h2 className='font-display text-[15px] font-semibold text-ink'>
                Dados do usuário
              </h2>
              <p className='text-xs text-[#8A968F]'>
                Identificação e credenciais de acesso.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {/* Nome do usuario */}
            <div>
              <label htmlFor='user_name' className={labelClass}>
                Nome do usuário
              </label>
              <input
                id='user_name'
                type='text'
                name='user_name'
                value={formData.user_name}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o nome do usuário'
                required
              />
            </div>
            {/* Email */}
            <div>
              <label htmlFor='email' className={labelClass}>
                E-mail
              </label>
              <input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o e-mail do usuário'
                required
              />
            </div>
            {/* Senha */}
            <div>
              <label htmlFor='password' className={labelClass}>
                Senha
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  className={`${fieldClass} pr-11`}
                  placeholder='Digite sua senha'
                  required
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label='Mostrar/Ocultar senha'
                  className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center text-[#8A968F] transition-colors hover:text-[#3C4742]'
                  title={`${showPassword ? 'Ocultar senha' : 'Mostrar senha'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* Gênero */}
            <div>
              <label htmlFor='gender' className={labelClass}>
                Gênero
              </label>
              <select
                id='gender'
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className={fieldClass}
                required
              >
                <option value=''>Selecione</option>
                <option value='male'>Masculino</option>
                <option value='female'>Feminino</option>
                <option value='other'>Outro</option>
              </select>
            </div>
          </div>
        </section>

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
