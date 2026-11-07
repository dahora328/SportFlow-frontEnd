import React, { useState } from 'react';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../../services/userService';
import { ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';

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
      navigate('/login', { state: { message: 'Conta criada com sucesso! Faça seu login.' } });
    } catch (err: unknown) {
      logger.error('Erro ao registrar:', err);
      setError(getErrorMessage(err, 'Erro ao criar a conta. Verifique os dados informados.'));
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'mb-1.5 block text-sm font-medium text-[#3C4742]';
  // 15px no input evita o zoom automático do iOS ao focar o campo.
  const fieldClass =
    'w-full rounded-lg border border-[#D7DEDB] bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20';

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-ground px-4 py-10 font-sans text-ink'>
      <div className='w-full max-w-md'>
        <div className='mb-6 flex flex-col items-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm'>
            <UserPlus size={26} />
          </div>
          <h1 className='mt-4 text-center font-display text-2xl font-semibold tracking-tight'>
            Crie sua conta SportFlow
          </h1>
          <p className='mt-1 text-center text-sm text-[#5C6A64]'>
            Já tem uma conta?{' '}
            <Link
              to='/login'
              className='font-semibold text-brand-700 transition-colors hover:text-brand-600'
            >
              Faça login
            </Link>
          </p>
        </div>

        <div className='rounded-2xl border border-[#E4E9E7] bg-white p-6 shadow-sm sm:p-8'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            {error && (
              <div className='rounded-lg border border-[#F0DAD8] bg-red-50 px-3 py-2 text-sm text-[#C2453D]'>
                {error}
              </div>
            )}

            <div>
              <label htmlFor='name' className={labelClass}>
                Nome completo
              </label>
              <input
                id='name'
                name='name'
                type='text'
                required
                value={formData.name}
                onChange={handleChange}
                className={fieldClass}
                placeholder='João da Silva'
              />
            </div>

            <div>
              <label htmlFor='email' className={labelClass}>
                E-mail
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                value={formData.email}
                onChange={handleChange}
                className={fieldClass}
                placeholder='joao@email.com'
              />
            </div>

            <div>
              <label htmlFor='password' className={labelClass}>
                Senha
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className={`${fieldClass} pr-11`}
                  placeholder='Mínimo de 8 caracteres'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className='absolute inset-y-0 right-2 flex items-center text-[#8A968F] transition-colors hover:text-[#3C4742]'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading ? 'Criando conta...' : 'Criar minha conta'}
            </button>
          </form>
        </div>

        <div className='mt-6 flex justify-center'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-sm text-[#5C6A64] transition-colors hover:text-brand-700'
          >
            <ArrowLeft size={16} />
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
