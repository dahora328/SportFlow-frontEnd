import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const successMessage = (location.state as { message?: string } | null)?.message;

  // Usuário já autenticado não precisa ver a tela de login
  if (isAuthenticated && !loading) {
    const isSuperAdmin = user?.is_admin === true && user?.enterprise_id === null;
    return <Navigate to={isSuperAdmin ? '/admin' : '/home'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = await login(email, password);
      logger.log('Login realizado com sucesso:', userData);

      if (userData?.is_admin === true && userData.enterprise_id === null) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err: unknown) {
      logger.error('Erro no login:', err);
      setError('Login ou senha inválidos. Verifique suas credenciais.');
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
        <div className='mb-6 flex items-center justify-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm'>
            <UserPlus size={24} />
          </div>
          <span className='font-display text-2xl font-semibold tracking-tight text-ink'>
            SportFlow
          </span>
        </div>

        <div className='rounded-2xl border border-[#E4E9E7] bg-white p-6 shadow-sm sm:p-8'>
          <h1 className='text-center font-display text-2xl font-semibold tracking-tight'>
            Entrar no SportFlow
          </h1>
          <p className='mb-6 mt-1 text-center text-sm text-[#5C6A64]'>
            Acesse sua conta para continuar
          </p>

          {successMessage && !error && (
            <div className='mb-4 rounded-lg border border-brand-600/20 bg-brand-50 px-3 py-2 text-sm text-brand-700'>
              {successMessage}
            </div>
          )}

          {error && (
            <div
              role='alert'
              className='mb-4 rounded-lg border border-[#F0DAD8] bg-red-50 px-3 py-2 text-sm text-[#C2453D]'
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
              <label htmlFor='email' className={labelClass}>
                E-mail
              </label>
              <input
                id='email'
                type='email'
                autoComplete='email'
                autoFocus
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={fieldClass}
                placeholder='seu@email.com'
              />
            </div>

            <div>
              <label htmlFor='password' className={labelClass}>
                Senha
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${fieldClass} pr-11`}
                  placeholder='Sua senha'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(v => !v)}
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
              <LogIn size={18} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-[#5C6A64]'>
            Não tem uma conta?{' '}
            <Link
              to='/register'
              className='font-semibold text-brand-700 transition-colors hover:text-brand-600'
            >
              Cadastre-se
            </Link>
          </p>
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
