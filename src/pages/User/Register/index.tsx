/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock } from 'lucide-react';
import { createUser } from '../../../services/userService';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createUser({ name, email, password });
      alert('Usuário cadastrado com sucesso! Faça login.'); //usar modal para da alerta que conseguiu cadastrar
      navigate('/');
    } catch (err: any) {
      console.error(err); //usar o modal para mostrar o erro
      const msg =
        err?.response?.data?.message ||
        'Não foi possível realizar o cadastro. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
        {/* Cabeçalho */}
        <div className='flex items-center gap-3 mb-6'>
          <div className='bg-blue-600/10 p-2.5 rounded-lg text-blue-600'>
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Criar conta</h1>
            <p className='text-sm text-gray-500'>
              Registre-se para começar a usar o SportFlow.
            </p>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className='mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2'>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Nome */}
          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
              Nome
            </label>
            <div className='relative'>
              <input
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                className='w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                placeholder='Seu nome completo'
                required
              />
              <span className='absolute inset-y-0 left-2 flex items-center text-gray-400'>
                <UserPlus size={16} />
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
              E-mail
            </label>
            <div className='relative'>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                placeholder='seuemail@exemplo.com'
                required
              />
              <span className='absolute inset-y-0 left-2 flex items-center text-gray-400'>
                <Mail size={16} />
              </span>
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
              Senha
            </label>
            <div className='relative'>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                placeholder='Mínimo 6 caracteres'
                required
              />
              <span className='absolute inset-y-0 left-2 flex items-center text-gray-400'>
                <Lock size={16} />
              </span>
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full mt-2 bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2'
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className='mt-6 text-center text-xs text-gray-500'>
          Já tem conta?{' '}
          <button
            type='button'
            onClick={() => navigate('/')}
            className='text-blue-600 font-semibold hover:underline'
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
}
