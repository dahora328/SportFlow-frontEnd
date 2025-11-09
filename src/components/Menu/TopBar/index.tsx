import { Menu, X, User, LogOut, Edit } from 'lucide-react';
import { useState } from 'react';

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);

  return (
    <nav className='bg-red-950 text-white px-6 py-4 shadow-md'>
      <div className='flex items-center justify-between'>
        {/* Logo */}
        <h1 className='text-xl font-bold text-yellow-400'>LOGO</h1>

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
            <li className='hover:text-yellow-400 cursor-pointer'>Atletas</li>
            <li className='hover:text-yellow-400 cursor-pointer'>Relatórios</li>
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
            <ul className='absolute right-0 mt-2 w-40 bg-red-950 rounded-lg shadow-lg py-2'>
              <li className='px-4 py-2 hover:bg-white cursor-pointer flex items-center gap-2 hover:text-red-950'>
                <Edit size={16} /> Editar Perfil
              </li>
              <li className='px-4 py-2 hover:bg-white cursor-pointer flex items-center gap-2 text-red-300 hover:text-red-950'>
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
            Atletas
          </li>
          <li className='hover:text-yellow-400 cursor-pointer text-center'>
            Relatórios
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
                <li className=' px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center justify-center gap-2'>
                  <Edit size={16} /> Editar Perfil
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
