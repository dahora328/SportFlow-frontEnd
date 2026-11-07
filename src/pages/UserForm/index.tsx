import React, { useEffect, useState } from 'react';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserById, createUser, updateUser, type UserData } from '../../services/usersService';
import { useModal } from '../../hooks/useModal';
import { ModalBase } from '../../components/Modal/ModalBase';
import { ArrowLeft, Eye, EyeOff, UserCog } from 'lucide-react';

export function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const modal = useModal();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_admin: false,
  });

  useEffect(() => {
    if (isEditing) {
      async function loadUser() {
        try {
          const user = await getUserById(id as string);
          setFormData({
            name: user.name,
            email: user.email,
            password: '',
            is_admin: user.is_admin || false,
          });
        } catch (error: unknown) {
          logger.error('Erro ao buscar usuário', error);
          modal.openError('Erro', 'Não foi possível carregar os dados do usuário.');
        } finally {
          setLoading(false);
        }
      }
      loadUser();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        const payload: Partial<UserData> = { name: formData.name, email: formData.email, is_admin: formData.is_admin };
        if (formData.password) {
          payload.password = formData.password;
        }
        await updateUser(Number(id), payload);
        modal.openSuccess('Sucesso', 'Usuário atualizado com sucesso.', () => {
          navigate('/users');
        });
      } else {
        if (!formData.password) {
           modal.openError('Erro', 'A senha é obrigatória para novos usuários.');
           setSaving(false);
           return;
        }
        await createUser({ ...formData });
        modal.openSuccess('Sucesso', 'Usuário criado com sucesso.', () => {
          navigate('/users');
        });
      }
    } catch (error: unknown) {
      modal.openError('Erro', getErrorMessage(error, 'Ocorreu um erro ao salvar o usuário.'));
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
          to='/users'
          className='mb-3 inline-flex items-center gap-1.5 text-sm text-[#5C6A64] transition-colors hover:text-brand-700'
        >
          <ArrowLeft size={16} />
          Voltar para usuários
        </Link>
        <h1 className='font-display text-2xl font-semibold tracking-tight'>
          {isEditing ? 'Editar usuário' : 'Novo usuário'}
        </h1>
        <p className='mt-1 text-sm text-[#5C6A64]'>
          {isEditing
            ? 'Atualize os dados de acesso do usuário.'
            : 'Preencha os dados para criar um novo usuário.'}
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
                Identificação, credenciais e permissão.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <label htmlFor='name' className={labelClass}>
                Nome
              </label>
              <input
                id='name'
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o nome do usuário'
                required
              />
            </div>

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
                placeholder='Digite o e-mail'
                required
              />
            </div>

            <div>
              <label htmlFor='password' className={labelClass}>
                Senha{' '}
                {isEditing && (
                  <span className='text-xs font-normal text-[#8A968F]'>
                    (deixe em branco para manter a atual)
                  </span>
                )}
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                  minLength={8}
                  className={`${fieldClass} pr-11`}
                  placeholder='Mínimo de 8 caracteres'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center text-[#8A968F] transition-colors hover:text-[#3C4742]'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className='flex items-center sm:pt-7'>
              <label
                htmlFor='is_admin_checkbox'
                className='flex cursor-pointer items-center gap-2.5 text-sm text-[#3C4742]'
              >
                <input
                  type='checkbox'
                  id='is_admin_checkbox'
                  name='is_admin'
                  checked={formData.is_admin}
                  onChange={handleChange}
                  className='h-4 w-4 rounded border-[#D7DEDB] text-brand-600 focus:ring-brand-600/30'
                />
                <span className='font-medium'>Este usuário é um Gestor da empresa?</span>
              </label>
            </div>
          </div>
        </section>

        {/* Barra fixa de ações */}
        <div className='sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-[#E4E9E7] bg-white/95 px-4 py-3.5 shadow-[0_-2px_14px_rgba(14,32,27,0.06)] backdrop-blur'>
          <Link
            to='/users'
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
