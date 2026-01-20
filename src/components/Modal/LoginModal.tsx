import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string | null;
}

export function LoginModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  error,
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div
      className='
        fixed inset-0 z-50 
        pointer-events-none   /* não bloqueia cliques no fundo */
      '
    >
      <div
        className='
          flex justify-center mt-8 sm:mt-12
          pointer-events-auto   /* só o card recebe clique */
        '
      >
        <div
          className='
            w-full max-w-md mx-4
            bg-white rounded-2xl shadow-2xl border border-gray-100
            p-6 sm:p-8
            animate-slideDown
          '
        >
          {/* Cabeçalho */}
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>
              Entrar no SportFlow
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 text-xl leading-none'
              type='button'
            >
              ✕
            </button>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className='mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2'>
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                E-mail
              </label>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none'
                required
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                Senha
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none pr-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(v => !v)}
                  className='absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='
                w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md
                hover:bg-blue-700 transition-colors
                disabled:opacity-60
              '
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

      {/* animação CSS */}
      <style>
        {`
          @keyframes slideDown {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}
