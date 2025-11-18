import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <nav className='bg-red-950 text-white px-6 py-4 shadow-md'>
      <div className='flex items-center justify-between'>
        {/* Logo */}
        <h1 className='text-xl font-bold text-yellow-400'>LOGO</h1>
        {/* Perfil alinhado à direita */}
        <div>
          <button className='flex items-center gap-2 hover:text-yellow-400 cursor-pointer'>
            <LogIn size={18} />
            <Link to='/login'>Login</Link>
          </button>
        </div>
      </div>
    </nav>
  );
}
