import { Menu, X, User, LogOut, Edit, Building, Users } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { getUserRole, type UserRole } from '../../../contexts/AuthContext';
import { getEnterprises } from '../../../services/enterpriseService';

// ---------------------------------------------------------------------------
// Configuração central de navegação
// Adicione novos itens aqui — o menu se ajusta automaticamente por papel.
// ---------------------------------------------------------------------------
interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  // Super Admin (dono do SportFlow) — só vê o painel de gerenciamento
  { label: 'Painel Admin', path: '/admin',    roles: ['superadmin'] },

  // Itens comuns ao gestor e funcionário
  { label: 'Home',        path: '/home',     roles: ['gestor', 'funcionario'] },
  { label: 'Atletas',     path: '/athletes', roles: ['gestor', 'funcionario'] },
  { label: 'Relatórios',  path: '/reports',  roles: ['gestor', 'funcionario'] },

  // Exclusivo para o Gestor da empresa
  { label: 'Usuários',    path: '/user',     icon: <Users size={14} />, roles: ['gestor'] },
];

// ---------------------------------------------------------------------------

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const { logout, user } = useContext(AuthContext)!;

  const role = getUserRole(user);

  // Filtra os itens do menu de acordo com o papel do usuário logado
  const visibleNavItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Super Admin não exibe logo de empresa — pula o fetch
    if (role === 'superadmin') return;

    async function fetchLogo() {
      try {
        const data = await getEnterprises({ t: new Date().getTime() });
        const enterprise = data?.[0];
        if (enterprise?.logo_path) {
          setLogoUrl(
            `http://localhost:8080/storage/${enterprise.logo_path}?t=${new Date().getTime()}`
          );
        }
      } catch (error) {
        console.error('Erro ao carregar logo da empresa no TopBar:', error);
      }
    }
    fetchLogo();

    window.addEventListener('enterpriseUpdated', fetchLogo);
    return () => {
      window.removeEventListener('enterpriseUpdated', fetchLogo);
    };
  }, [role]);

  const handleCloseMenus = () => {
    setOpen(false);
    setPerfilOpen(false);
  };

  // Classes reutilizáveis para NavLink (ativo vs. inativo)
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1 transition-colors duration-150 ${
      isActive ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400'
    }`;

  return (
    <nav className='bg-red-950 text-white px-6 py-4 shadow-md'>
      <div className='flex items-center justify-between'>

        {/* Logo — SportFlow para Super Admin, logo da empresa para os demais */}
        <div className='flex items-center h-10'>
          {role === 'superadmin' ? (
            // Badge do sistema — substitua por <img> quando tiver a logo oficial
            <div className='flex items-center gap-2'>
              <span className='text-yellow-400 font-black text-xl tracking-tight leading-none'>
                Sport
              </span>
              <span className='bg-yellow-400 text-red-950 font-black text-xs px-2 py-0.5 rounded-full tracking-widest uppercase'>
                Flow
              </span>
            </div>
          ) : logoUrl ? (
            <img src={logoUrl} alt='Logo Empresa' className='h-full w-auto object-contain' />
          ) : (
            <h1 className='text-xl font-bold text-yellow-400'>LOGO</h1>
          )}
        </div>

        {/* Toggle mobile */}
        <button
          className='md:hidden p-2'
          onClick={() => setOpen(!open)}
          aria-label='Abrir/Fechar menu'
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu desktop centralizado — gerado pelo navConfig */}
        <div className='hidden md:flex flex-1 items-center justify-center'>
          <ul className='flex gap-8 font-medium'>
            {visibleNavItems.map(item => (
              <li key={item.path}>
                <NavLink to={item.path} className={navLinkClass}>
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Perfil — desktop */}
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
            <div className='absolute right-0 pt-2 w-48 z-50'>
              <ul className='bg-red-950 rounded-lg shadow-lg py-2 border border-red-900'>
                {/* Editar Perfil — todos os papéis */}
                <li>
                  <Link
                    to='/user'
                    onClick={() => setPerfilOpen(false)}
                    className='px-4 py-2 hover:bg-white hover:text-red-950 flex items-center gap-2'
                  >
                    <Edit size={16} /> Editar Perfil
                  </Link>
                </li>

                {/* Empresa — apenas gestor e funcionário (não Super Admin) */}
                {role !== 'superadmin' && (
                  <li>
                    <Link
                      to='/enterprise'
                      onClick={() => setPerfilOpen(false)}
                      className='px-4 py-2 hover:bg-white hover:text-red-950 flex items-center gap-2'
                    >
                      <Building size={16} /> Empresa
                    </Link>
                  </li>
                )}

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

      {/* Menu mobile — também gerado pelo navConfig */}
      {open && (
        <ul className='md:hidden mt-4 flex flex-col gap-4 font-medium animate-fadeIn'>
          {visibleNavItems.map(item => (
            <li key={item.path} className='text-center'>
              <NavLink to={item.path} onClick={handleCloseMenus} className={navLinkClass}>
                <span className='flex items-center justify-center gap-1'>
                  {item.icon}
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}

          {/* Submenu Perfil mobile */}
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

                {role !== 'superadmin' && (
                  <li>
                    <Link
                      to='/enterprise'
                      onClick={handleCloseMenus}
                      className='px-4 py-2 hover:bg-red-800 cursor-pointer flex items-center justify-center gap-2'
                    >
                      <Building size={16} /> Empresa
                    </Link>
                  </li>
                )}

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
