import { Menu, X, User, LogOut, Edit } from 'lucide-react';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  const handleCloseMenus = () => {
    setOpen(false);
    setPerfilOpen(false);
  };

  return (
    <nav className='bg-red-950 text-white px-6 py-4 shadow-md'>
      <div className='flex items-center justify-between'>
        {/* Logo */}
        <h1 className='text-xl font-bold text-yellow-400'>LOGO</h1>

        {/* Menu mobile toggle */}
        <button
          className='md:hidden p-2'
          onClick={() => setOpen(!open)}
          aria-label='Abrir/Fechar menu'
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu desktop centralizado */}
        <div className='hidden md:flex flex-1 items-center justify-center'>
          <ul className='flex gap-8 font-medium'>
            <li className='hover:text-yellow-400 cursor-pointer'>
              <Link to='/home'>Home</Link>
            </li>
            <li className='hover:text-yellow-400 cursor-pointer'>
              <Link to='/athletes'>Atletas</Link>
            </li>
            <li className='hover:text-yellow-400 cursor-pointer'>
              <Link to='/reports'>Relatórios</Link>
            </li>
            <li className='hover:text-yellow-400 cursor-pointer'>Contato</li>
          </ul>
        </div>

        {/* Perfil alinhado à direita (DESKTOP) */}
        <div
          className='hidden md:block relative'
          onMouseEnter={() => setPerfilOpen(true)}
          onMouseLeave={() => setPerfilOpen(false)}
        >
          <button
            onClick={() => setPerfilOpen(!perfilOpen)} // Mantém o click como alternativa
            className={`flex items-center gap-2 cursor-pointer py-2 ${
              perfilOpen ? 'text-yellow-400' : 'hover:text-yellow-400'
            }`}
          >
            <User size={18} />
            Perfil
          </button>

          {perfilOpen && (
            <div className='absolute right-0 pt-2 w-40 z-50'>
              <ul className='bg-red-950 rounded-lg shadow-lg py-2 border border-red-900'>
                <li>
                  <Link
                    to='/user'
                    onClick={() => setPerfilOpen(false)}
                    className='px-4 py-2 hover:bg-white hover:text-red-950 flex items-center gap-2'
                  >
                    <Edit size={16} /> Editar Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    to='/'
                    onClick={() => {
                      logout();
                      setPerfilOpen(false);
                    }}
                    className='px-4 py-2 hover:bg-white text-red-300 hover:text-red-950 flex items-center gap-2'
                  >
                    <LogOut size={16} /> Sair
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <ul className='md:hidden mt-4 flex flex-col gap-4 font-medium animate-fadeIn'>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            <Link to='/home' onClick={() => setOpen(false)}>
              Home
            </Link>
          </li>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            <Link to='/athletes' onClick={() => setOpen(false)}>
              Atletas
            </Link>
          </li>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            <Link to='/reports' onClick={() => setOpen(false)}>
              Relatórios
            </Link>
          </li>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            Contato
          </li>

          {/* Submenu Perfil no mobile */}
          <li className='flex flex-col items-center border-t border-red-900 pt-4 mt-2'>
            <button
              onClick={() => setPerfilOpen(!perfilOpen)}
              className='flex items-center gap-2 hover:text-yellow-400 cursor-pointer mb-2'
            >
              <User size={18} /> Perfil
            </button>

            {perfilOpen && (
              <ul className='w-full max-w-[200px] py-2 text-center rounded-lg'>
                <li>
                  <Link
                    to='/user'
                    onClick={handleCloseMenus}
                    className='px-4 py-2 hover:bg-red-800 cursor-pointer flex items-center justify-center gap-2'
                  >
                    <Edit size={16} /> Editar Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    to='/'
                    onClick={() => {
                      logout();
                      handleCloseMenus();
                    }}
                    className='px-4 py-2 hover:bg-red-800 cursor-pointer flex items-center justify-center gap-2 text-red-200'
                  >
                    <LogOut size={16} /> Sair
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
