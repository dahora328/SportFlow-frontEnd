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
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-lg p-6 w-96 animate-fadeIn'>
        <h2 className='text-xl font-bold mb-4 text-center'>Login</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Mensagem de erro */}
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}

          {/* E-mail */}
          <div>
            <label className='block text-sm mb-1 font-medium'>E-mail</label>
            <input
              type='email'
              className='w-full border rounded-lg px-3 py-2'
              placeholder='Digite seu e-mail'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Senha */}
          <div>
            <label className='block text-sm mb-1 font-medium'>Senha</label>
            <div className='flex items-center border rounded-lg px-2'>
              <input
                type={showPassword ? 'text' : 'password'}
                className='w-full py-2 outline-none'
                placeholder='Digite sua senha'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <button
                type='button'
                className='text-sm text-blue-600'
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {/* Esqueci a senha */}
          <div className='text-right'>
            <button
              type='button'
              className='text-sm text-blue-600 hover:underline'
              disabled={loading}
            >
              Esqueci minha senha
            </button>
          </div>

          {/* Botões */}
          <div className='flex justify-between mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              Fechar
            </button>

            <button
              type='submit'
              className='px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
