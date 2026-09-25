import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoImg from '../../assets/images/SportFlow/Logo completa png.png';
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
      console.error('Erro no login:', err);
      setError('Login ou senha inválidos. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans px-4 py-10'>
      {/* Efeitos de luz no fundo (mesmo estilo da landing page) */}
      <div className='absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none' />

      <div className='w-full max-w-md z-10'>
        <div className='flex justify-center mb-6'>
          <img
            src={logoImg}
            alt='SportFlow Logo'
            className='h-24 md:h-32 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] object-contain'
          />
        </div>

        <div className='bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8'>
          <h1 className='text-2xl font-bold text-white text-center'>
            Entrar no SportFlow
          </h1>
          <p className='mt-1 mb-6 text-sm text-slate-400 text-center'>
            Acesse sua conta para continuar
          </p>

          {successMessage && !error && (
            <div className='mb-4 text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2'>
              {successMessage}
            </div>
          )}

          {error && (
            <div
              role='alert'
              className='mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2'
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-xs font-semibold text-slate-300 uppercase mb-1'
              >
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
                className='w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                placeholder='seu@email.com'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-xs font-semibold text-slate-300 uppercase mb-1'
              >
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
                  className='w-full px-3 py-2 pr-10 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                  placeholder='Sua senha'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className='absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-200'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold py-2.5 rounded-md hover:opacity-90 transition disabled:opacity-60'
            >
              <LogIn size={18} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-slate-400'>
            Não tem uma conta?{' '}
            <Link
              to='/register'
              className='font-medium text-blue-400 hover:text-blue-300'
            >
              Cadastre-se
            </Link>
          </p>
        </div>

        <div className='mt-6 flex justify-center'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors'
          >
            <ArrowLeft size={16} />
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
