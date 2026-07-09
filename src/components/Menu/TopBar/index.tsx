import { Menu, X, User, LogOut, Edit, Building } from 'lucide-react'; 
import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { getEnterprises } from '../../../services/enterpriseService';

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);

  const { logout, user } = useContext(AuthContext)!;

  // Super Admin: is_admin=true e sem empresa (enterprise_id=null) — gerencia o sistema
  const isSuperAdmin = user?.is_admin === true && user?.enterprise_id === null;

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogo() {
      try {
        // Passa o timestamp para forçar o backend a enviar os dados frescos sem cache do navegador
        const data = await getEnterprises({ t: new Date().getTime() });
        const enterprise = data?.[0];
        if (enterprise?.logo_path) {
          // Adiciona timestamp para evitar cache de imagem do navegador ao atualizar logo
          setLogoUrl(`http://localhost:8080/storage/${enterprise.logo_path}?t=${new Date().getTime()}`);
        }
      } catch (error) {
        console.error("Erro ao carregar logo da empresa no TopBar:", error);
      }
    }
    fetchLogo();

    // Escuta evento customizado para atualizar a logo em tempo real
    window.addEventListener('enterpriseUpdated', fetchLogo);
    return () => {
      window.removeEventListener('enterpriseUpdated', fetchLogo);
    };
  }, []);

  const handleCloseMenus = () => {
    setOpen(false);
    setPerfilOpen(false);
  };

  return (
    <nav className='bg-red-950 text-white px-6 py-4 shadow-md'>
      <div className='flex items-center justify-between'>
        {/* Logo */}
        <div className="flex items-center h-10">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo Empresa" className="h-full w-auto object-contain" />
          ) : (
            <h1 className='text-xl font-bold text-yellow-400'>LOGO</h1>
          )}
        </div>

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

            {/* Itens visíveis para todos (exceto Super Admin que gerencia tudo pelo painel) */}
            {!isSuperAdmin && (
              <>
                <li className='hover:text-yellow-400 cursor-pointer'>
                  <Link to='/home'>Home</Link>
                </li>
                <li className='hover:text-yellow-400 cursor-pointer'>
                  <Link to='/athletes'>Atletas</Link>
                </li>
                <li className='hover:text-yellow-400 cursor-pointer'>
                  <Link to='/reports'>Relatórios</Link>
                </li>
              </>
            )}

            {/* Painel Admin — somente Super Admin */}
            {isSuperAdmin && (
              <li className='hover:text-yellow-400 cursor-pointer'>
                <Link to='/admin'>Painel Admin</Link>
              </li>
            )}
          </ul>
        </div>

        {/* Perfil alinhado à direita (DESKTOP) */}
        <div
          className='hidden md:block relative'
          onMouseEnter={() => setPerfilOpen(true)}
          onMouseLeave={() => setPerfilOpen(false)}
        >
          <button
            onClick={() => setPerfilOpen(!perfilOpen)}
            className={`flex items-center gap-2 cursor-pointer py-2 ${
              perfilOpen ? 'text-yellow-400' : 'hover:text-yellow-400'
            }`}
          >
            <User size={18} />
            {user?.name?.split(' ')[0] ?? 'Perfil'}
          </button>

          {perfilOpen && (
            <div className='absolute right-0 pt-2 w-44 z-50'>
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
                {/* NOVA OPÇÃO EMPRESA (DESKTOP) */}
                <li>
                  <Link
                    to='/enterprise'
                    onClick={() => setPerfilOpen(false)}
                    className='px-4 py-2 hover:bg-white hover:text-red-950 flex items-center gap-2'
                  >
                    <Building size={16} /> Empresa
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

          {!isSuperAdmin && (
            <>
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
            </>
          )}

          {isSuperAdmin && (
            <li className='hover:text-yellow-400 cursor-pointer text-center'>
              <Link to='/admin' onClick={() => setOpen(false)}>
                Painel Admin
              </Link>
            </li>
          )}

          {/* Submenu Perfil no mobile */}
          <li className='flex flex-col items-center border-t border-red-900 pt-4 mt-2'>
            <button
              onClick={() => setPerfilOpen(!perfilOpen)}
              className='flex items-center gap-2 hover:text-yellow-400 cursor-pointer mb-2'
            >
              <User size={18} /> {user?.name?.split(' ')[0] ?? 'Perfil'}
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
                {/* NOVA OPÇÃO EMPRESA (MOBILE) */}
                <li>
                  <Link
                    to='/enterprise'
                    onClick={handleCloseMenus}
                    className='px-4 py-2 hover:bg-red-800 cursor-pointer flex items-center justify-center gap-2'
                  >
                    <Building size={16} /> Empresa
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
