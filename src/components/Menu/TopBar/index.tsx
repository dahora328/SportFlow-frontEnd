import { Menu, X, User, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const theme = 'light';

  const toggleTheme = () => {
    // alternar tema
  };

  return (
    <nav className='bg-gray-900 text-white px-6 py-4 shadow-md'>
      <div className='flex items-center justify-between'>
        {/* Logo */}
        <h1 className='text-xl font-bold text-yellow-400'>MeuSite</h1>

        {/* Menu mobile */}
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
            <li className='hover:text-yellow-400 cursor-pointer'>Home</li>
            <li className='hover:text-yellow-400 cursor-pointer'>Sobre</li>
            <li className='hover:text-yellow-400 cursor-pointer'>Serviços</li>
            <li className='hover:text-yellow-400 cursor-pointer'>Contato</li>
          </ul>
        </div>

        {/* Perfil alinhado à direita */}
        <div className='hidden md:block relative'>
          <button
            onClick={() => setPerfilOpen(!perfilOpen)}
            className='flex items-center gap-2 hover:text-yellow-400 cursor-pointer'
          >
            <User size={18} />
            Perfil
          </button>

          {perfilOpen && (
            <ul className='absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg py-2'>
              <li className='px-4 py-2 hover:bg-gray-700 cursor-pointer'>
                Editar Perfil
              </li>
              <li
                onClick={toggleTheme}
                className='px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2'
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={16} /> Modo Escuro
                  </>
                ) : (
                  <>
                    <Sun size={16} /> Modo Claro
                  </>
                )}
              </li>
              <li className='px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-red-400'>
                <LogOut size={16} /> Sair
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <ul className='md:hidden mt-4 flex flex-col gap-4 font-medium'>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            Home
          </li>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            Sobre
          </li>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            Serviços
          </li>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            Contato
          </li>

          {/* Submenu Perfil no mobile */}
          <li className='flex flex-col items-center'>
            <button
              onClick={() => setPerfilOpen(!perfilOpen)}
              className='flex items-center gap-2 hover:text-yellow-400 cursor-pointer'
            >
              <User size={18} /> Perfil
            </button>

            {perfilOpen && (
              <ul className='mt-2 w-full max-w-[200px] py-2 text-center'>
                <li className='px-4 py-2 hover:bg-gray-700 cursor-pointer'>
                  Editar Perfil
                </li>
                <li
                  onClick={toggleTheme}
                  className='px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center justify-center gap-2'
                >
                  {theme === 'light' ? (
                    <>
                      <Moon size={16} /> Modo Escuro
                    </>
                  ) : (
                    <>
                      <Sun size={16} /> Modo Claro
                    </>
                  )}
                </li>
                <li className='px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center justify-center gap-2 text-red-400'>
                  <LogOut size={16} /> Sair
                </li>
              </ul>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
