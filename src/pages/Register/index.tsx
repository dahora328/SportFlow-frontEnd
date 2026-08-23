/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../../services/userService';
import { Trophy, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      // Após o sucesso do cadastro, navega para a página inicial
      navigate('/', { state: { message: 'Conta criada com sucesso! Faça seu login.' } });
    } catch (err: any) {
      console.error('Erro ao registrar:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao criar a conta. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='flex justify-center'>
          <div className='bg-blue-600 p-3 rounded-xl shadow-lg'>
            <Trophy size={40} className='text-yellow-300' />
          </div>
        </div>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Crie sua conta SportFlow
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600'>
          Ou{' '}
          <Link to='/' className='font-medium text-blue-600 hover:text-blue-500'>
            já tem uma conta? Faça login
          </Link>
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center'>
                {error}
              </div>
            )}
            
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Nome completo
              </label>
              <div className='mt-1'>
                <input
                  name='name'
                  type='text'
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='João da Silva'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                E-mail
              </label>
              <div className='mt-1'>
                <input
                  name='email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='joao@email.com'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Senha
              </label>
              <div className='mt-1 relative'>
                <input
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Mínimo de 6 caracteres'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={loading}
                className='w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all'
              >
                {loading ? 'Criando conta...' : 'Criar minha conta'}
              </button>
            </div>
          </form>

          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>
                  Voltar para o início
                </span>
              </div>
            </div>

            <div className='mt-6'>
              <Link
                to='/'
                className='w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all'
              >
                <ArrowLeft size={16} />
                Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
