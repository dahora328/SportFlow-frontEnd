import { useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Home as HomeIcon,
  UserPlus,
  BarChart3,
  Users,
  Building2,
  ShieldCheck,
  UserCog,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { AuthContext, getUserRole, type UserRole } from '../../contexts/AuthContext';
import { getEnterprises } from '../../services/enterpriseService';
import { storageUrl } from '../../utils/storage';
import { logger } from '../../utils/logger';

// ---------------------------------------------------------------------------
// Navegação central (mesmos papéis e rotas do antigo TopBar).
// ---------------------------------------------------------------------------
interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Painel Admin', path: '/admin', icon: <ShieldCheck size={18} />, roles: ['superadmin'] },
  { label: 'Home', path: '/home', icon: <HomeIcon size={18} />, roles: ['gestor', 'funcionario'] },
  { label: 'Atletas', path: '/athletes', icon: <UserPlus size={18} />, roles: ['gestor', 'funcionario'] },
  { label: 'Relatórios', path: '/reports', icon: <BarChart3 size={18} />, roles: ['gestor', 'funcionario'] },
  { label: 'Empresa', path: '/enterprise', icon: <Building2 size={18} />, roles: ['gestor'] },
  { label: 'Usuários', path: '/users', icon: <Users size={18} />, roles: ['gestor'] },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useContext(AuthContext)!;
  const role = getUserRole(user);
  const items = NAV_ITEMS.filter(item => item.roles.includes(role));

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (role === 'superadmin' || !user) return;

    async function fetchLogo() {
      try {
        const data = await getEnterprises({ t: new Date().getTime() });
        const enterprise = data?.[0];
        if (enterprise?.logo_path) {
          setLogoUrl(storageUrl(enterprise.logo_path));
        }
      } catch (error) {
        logger.error('Erro ao carregar logo da empresa na Sidebar:', error);
      }
    }
    fetchLogo();

    window.addEventListener('enterpriseUpdated', fetchLogo);
    return () => window.removeEventListener('enterpriseUpdated', fetchLogo);
  }, [role, user]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
      isActive
        ? 'bg-white/10 text-white font-semibold'
        : 'text-pine-300 hover:bg-white/5 hover:text-white'
    }`;

  const firstName = user?.name?.split(' ')[0] ?? 'Perfil';
  const roleLabel =
    role === 'superadmin' ? 'Super Admin' : role === 'gestor' ? 'Gestor' : 'Funcionário';

  const Brand = (
    <div className='flex items-center gap-3'>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt='Logo da empresa'
          className='h-10 w-10 rounded-lg object-cover'
        />
      ) : (
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white'>
          <UserPlus size={20} />
        </div>
      )}
      <div className='min-w-0'>
        <div className='font-display text-[15px] font-semibold leading-tight text-white'>
          SportFlow
        </div>
        <div className='text-[11.5px] text-pine-400'>Gestão de atletas</div>
      </div>
    </div>
  );

  const Nav = (
    <nav className='flex flex-col gap-1'>
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => setOpen(false)}
          className={navLinkClass}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  const Footer = (
    <div className='mt-auto border-t border-white/10 pt-3'>
      <div className='flex items-center gap-3 px-1 pb-2'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine-900 font-display text-sm font-semibold text-brand-50'>
          {firstName.charAt(0).toUpperCase()}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='truncate text-[13px] font-medium text-white'>{firstName}</div>
          <div className='text-[11.5px] text-pine-400'>{roleLabel}</div>
        </div>
      </div>
      <Link
        to='/user'
        onClick={() => setOpen(false)}
        className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-pine-300 transition-colors hover:bg-white/5 hover:text-white'
      >
        <UserCog size={18} />
        <span>Editar perfil</span>
      </Link>
      <button
        type='button'
        onClick={() => {
          setOpen(false);
          logout();
        }}
        className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-pine-300 transition-colors hover:bg-white/5 hover:text-red-300'
      >
        <LogOut size={18} />
        <span>Sair</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Barra superior (mobile) */}
      <header className='flex items-center justify-between bg-pine-950 px-4 py-3 text-white md:hidden'>
        {Brand}
        <button
          type='button'
          onClick={() => setOpen(o => !o)}
          aria-label='Abrir menu'
          aria-expanded={open}
          className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/10'
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Drawer (mobile) */}
      {open && (
        <div className='flex flex-col gap-3 bg-pine-950 px-4 pb-4 text-white md:hidden'>
          {Nav}
          {Footer}
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside className='sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-pine-950 p-4 text-white md:flex'>
        <div className='px-1 pb-5'>{Brand}</div>
        {Nav}
        {Footer}
      </aside>
    </>
  );
}
