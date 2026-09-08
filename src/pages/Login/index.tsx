import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from '../../components/Modal/LoginModal';
import { logger } from '../../utils/logger';

export function Login() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const userData = await login(data.email, data.password);
      logger.log('Login realizado com sucesso:', userData);

      setOpen(false);

      if (userData) {
        if (userData.is_admin === true && userData.enterprise_id === null) {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        navigate('/home');
      }
    } catch (err: unknown) {
      console.error('Erro no login:', err);
      setError('Login ou senha inválidos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='h-screen flex items-center justify-center'>
        <button
          onClick={() => setOpen(true)}
          className='px-6 py-3 bg-yellow-400 rounded-lg font-bold hover:bg-yellow-500'
        >
          Abrir Login
        </button>

        <LoginModal
          open={open}
          onClose={() => {
            setOpen(false);
            setError(null);
          }}
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </div>
    </>
  );
}
