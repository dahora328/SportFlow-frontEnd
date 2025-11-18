import { LoginModal } from '../../components/Modal/LoginModal';
import { useState } from 'react';

export function LandingPage() {
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = (data: any) => {
    console.log('Enviando para a API:', data);
    alert('Login enviado! Veja no console.');
    setOpen(false);
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
          onClose={() => setOpen(false)}
          onSubmit={handleLogin}
        />
      </div>
    </>
  );
}
