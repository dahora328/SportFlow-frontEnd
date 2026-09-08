import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from '../../components/Modal/LoginModal';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/images/SportFlow/Logo completa png.png';
import { logger } from '../../utils/logger';

export function LandingPage() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openLogin = () => setIsLoginModalOpen(true);
  const closeLogin = () => setIsLoginModalOpen(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleLoginSubmit(data: { email: string; password: string }) {
    setLoading(true);
    setError(null);
    try {
      const userData = await login(data.email, data.password);
      logger.log('Login realizado com sucesso:', userData);
      
      setIsLoginModalOpen(false);

      if (userData) {
        if (userData.is_admin === true && userData.enterprise_id === null) {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        navigate('/home');
      }
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      setError('Login ou senha inválidos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Efeitos de luz no fundo (Glow) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl px-6 z-10 text-center">
        
        {/* LOGO */}
        <div className="flex items-center justify-center">
          <img 
            src={logoImg}
            alt="SportFlow Logo" 
            className="h-32 md:h-48 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] object-contain"
          />
        </div>

        {/* BREVE EXPLICAÇÃO */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Gestão de Atletas <br/> Simplificada.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed">
          Centralize as informações, mantenha o cadastro dos seus atletas sempre atualizado e organize sua base com facilidade e segurança.
        </p>

        {/* BOTÃO DE ENTRAR NO SISTEMA */}
        <button 
          onClick={openLogin}
          className="group relative px-1 py-1 bg-transparent border-none rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative flex items-center justify-center gap-3 bg-slate-900 border border-slate-700/50 px-8 py-4 rounded-full text-white font-semibold text-lg tracking-wide hover:bg-slate-800 transition">
            <LogIn size={20} className="text-blue-400 group-hover:text-green-400 transition-colors" />
            Entrar no Sistema
          </div>
        </button>

        {/* Modal de Login (mantém a lógica existente do sistema) */}
        <LoginModal
          open={isLoginModalOpen}
          onClose={closeLogin}
          onSubmit={handleLoginSubmit}
          loading={loading}
          error={error}
        />
      </main>

      {/* RODAPÉ (COPYRIGHT) */}
      <footer className="w-full py-6 text-center z-10 border-t border-slate-800/50 backdrop-blur-sm">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} SportFlow. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
