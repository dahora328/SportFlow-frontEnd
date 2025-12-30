import { useState } from 'react';
import {
  Trophy,
  Users,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  LogIn,
} from 'lucide-react';
// Importe aqui o SEU modal de Login que você já tem pronto
// Ex: import { LoginModal } from '../components/LoginModal';

export function LandingPage() {
  // Estado para controlar se o modal de login/cadastro está aberto
  // Se você usa um contexto global (useModal), substitua isso pela chamada do contexto
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Estado para saber qual aba abrir no modal (Login ou Cadastro)
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register'>(
    'login',
  );

  const openLogin = () => {
    setInitialAuthMode('login');
    setIsLoginModalOpen(true);
  };

  const openRegister = () => {
    setInitialAuthMode('register');
    setIsLoginModalOpen(true);
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col lg:flex-row'>
      {/* --- SEÇÃO DA ESQUERDA: Hero / Marketing (Mantive igual, pois estava ótimo) --- */}
      <div className='flex-1 bg-blue-600 px-8 py-12 lg:flex lg:items-center lg:justify-center lg:px-16 text-white relative overflow-hidden'>
        {/* Elementos decorativos */}
        <div className='absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2'></div>
        <div className='absolute bottom-0 right-0 w-96 h-96 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 translate-y-1/3'></div>

        <div className='relative z-10 max-w-xl'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='bg-white/20 p-2.5 rounded-lg backdrop-blur-sm items-center flex'>
              <Trophy size={32} className='text-yellow-300' />
            </div>
            <span className='text-2xl font-bold text-center tracking-tight'>
              SportFlow
            </span>
          </div>

          <h1 className='text-4xl lg:text-5xl font-extrabold leading-tight mb-6'>
            A gestão de atletas que o seu time merece.
          </h1>

          <p className='text-lg text-blue-100 mb-8 leading-relaxed'>
            Centralize cadastros, monitore desempenho e organize campeonatos em
            um único lugar. Simples, rápido e feito para vencedores.
          </p>

          <div className='space-y-4'>
            <FeatureItem
              icon={Users}
              text='Gestão completa de elenco e staff'
            />
            <FeatureItem
              icon={TrendingUp}
              text='Métricas e relatórios de desempenho'
            />
            <FeatureItem
              icon={ShieldCheck}
              text='Dados seguros e acesso por permissão'
            />
          </div>

          <div className='mt-12 flex items-center gap-4 text-sm text-blue-200'>
            <div className='flex -space-x-2'>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className='w-8 h-8 rounded-full bg-gray-300 border-2 border-blue-600 flex items-center justify-center text-xs text-gray-600 font-bold bg-white'
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p>Junte-se a +500 gestores esportivos</p>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO DA DIREITA: Botões de Ação --- */}
      <div className='flex-1 flex flex-col items-center justify-center p-8 bg-gray-50'>
        <div className='w-full max-w-md text-center space-y-8'>
          <div className='mb-8'>
            <h2 className='text-3xl font-bold text-gray-900 mb-3'>
              Bem-vindo ao SportFlow
            </h2>
            <p className='text-gray-500'>
              A plataforma definitiva para clubes, escolinhas e times
              profissionais.
            </p>
          </div>

          <div className='space-y-4'>
            {/* Botão de Login */}
            <button
              onClick={openLogin}
              className='w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-bold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm hover:shadow-md group'
            >
              <LogIn
                size={20}
                className='text-gray-400 group-hover:text-blue-600 transition-colors'
              />
              <span>Já tenho uma conta</span>
            </button>

            {/* Divisor "ou" */}
            <div className='relative flex py-2 items-center'>
              <div className='flex-grow border-t border-gray-300'></div>
              <span className='flex-shrink-0 mx-4 text-gray-400 text-sm'>
                ou comece agora
              </span>
              <div className='flex-grow border-t border-gray-300'></div>
            </div>

            {/* Botão de Cadastro (Destaque) */}
            <button
              onClick={openRegister}
              className='w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]'
            >
              <span>Criar minha conta grátis</span>
              <ArrowRight size={20} />
            </button>
          </div>

          <p className='text-xs text-gray-400 mt-8'>
            Ao criar uma conta, você concorda com nossos{' '}
            <a href='#' className='underline hover:text-blue-600'>
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href='#' className='underline hover:text-blue-600'>
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>

      {/* 
          AQUI ENTRA O SEU MODAL 
          Renderize o componente do seu modal aqui, controlando a visibilidade com 'isLoginModalOpen'.
          Passe a prop 'initialMode' (ou similar) para ele saber se abre em login ou cadastro.
      */}

      {/* Exemplo de uso (descomente e ajuste para o nome do seu componente): */}
      {/* 
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        initialTab={initialAuthMode} 
      /> 
      */}
    </div>
  );
}

// Componente auxiliar
function FeatureItem({ text }: { icon: any; text: string }) {
  return (
    <div className='flex items-center gap-3'>
      <div className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center'>
        <CheckCircle2 size={14} className='text-blue-200' />
      </div>
      <span className='font-medium text-blue-50'>{text}</span>
    </div>
  );
}
