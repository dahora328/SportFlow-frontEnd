import { LoginModal } from '../../components/Modal/LoginModal';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/userService';
import { AuthContext } from '../../contexts/AuthContext';

export function LandingPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser(data);

      const access = response.access_token;
      const refresh = response.refresh_token;

      if (access && refresh) {
        login(access, refresh);
      } else {
        throw new Error('Tokens não recebidos do servidor');
      }

      console.log('Login realizado com sucesso:', response);
      setOpen(false);

      navigate('/home');
    } catch (err: unknown) {
      console.error('Erro no login:', err);

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          axiosError.response?.data?.message ||
          'Erro ao fazer login. Tente novamente.';
        setError(errorMessage);
      } else {
        setError('Erro ao fazer login. Verifique suas credenciais.');
      }
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
