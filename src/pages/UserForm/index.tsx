import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserById, createUser, updateUser, type UserData } from '../../services/usersService';
import { useModal } from '../../hooks/useModal';
import { ModalBase } from '../../components/Modal/ModalBase';
import { Eye, EyeOff } from 'lucide-react';

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
        } catch (error: any) {
          console.error('Erro ao buscar usuário', error);
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
    } catch (error: any) {
      modal.openError('Erro', error.response?.data?.error || 'Ocorreu um erro ao salvar o usuário.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='min-h-screen bg-gray-100 flex items-center justify-center'>Carregando dados...</div>;
  }

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center p-6'>
      <h1 className='text-2xl font-bold mb-6'>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h1>

      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-semibold mb-1'>Nome</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-900'
              placeholder='Digite o nome do usuário'
              required
            />
          </div>
          
          <div>
            <label className='block text-sm font-semibold mb-1'>E-mail</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-900'
              placeholder='Digite o e-mail'
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='block text-sm font-semibold mb-1'>
              Senha {isEditing && <span className='text-gray-400 font-normal text-xs'>(deixe em branco para manter a atual)</span>}
            </label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                minLength={6}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-900'
                placeholder='Digite a senha'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className='flex items-center gap-2 mt-4 md:mt-8'>
            <input
              type='checkbox'
              id='is_admin_checkbox'
              name='is_admin'
              checked={formData.is_admin}
              onChange={handleChange}
              className='rounded border-gray-300 text-red-900 focus:ring-red-900 w-4 h-4'
            />
            <label htmlFor='is_admin_checkbox' className='text-sm text-gray-700 font-medium'>
              Este usuário é um Gestor da empresa?
            </label>
          </div>
        </div>

        <div className='mt-6 text-center pt-4 border-t border-gray-100 flex gap-4 justify-center md:justify-end'>
          <Link
            to='/users'
            className='px-6 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition'
          >
            Voltar
          </Link>
          <button
            type='submit'
            disabled={saving}
            className='bg-red-950 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50'
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
