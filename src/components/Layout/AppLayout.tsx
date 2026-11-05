import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

/**
 * Casca das páginas autenticadas: sidebar fixa (desktop) / barra + drawer
 * (mobile) + área de conteúdo. As páginas renderizam apenas seu conteúdo via
 * <Outlet/>; o padding e o fundo ficam por conta do layout.
 */
export function AppLayout() {
  return (
    <div className='min-h-screen bg-ground text-ink md:flex'>
      <Sidebar />
      <main className='min-w-0 flex-1 p-4 sm:p-6 md:p-8'>
        <Outlet />
      </main>
    </div>
  );
}
