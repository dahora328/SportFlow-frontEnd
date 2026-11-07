import { useEffect, useState } from 'react';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getUsers, deleteUser, type UserData } from '../../services/usersService';
import { Edit, Trash, Plus } from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { ModalBase } from '../../components/Modal/ModalBase';
import { Link } from 'react-router-dom';

// Iniciais para o avatar (até 2 letras do nome).
function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters =
    parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}

function RoleBadge({ isAdmin }: { isAdmin?: boolean }) {
  return isAdmin ? (
    <span className='inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700'>
      Gestor
    </span>
  ) : (
    <span className='inline-flex rounded-full bg-[#EEF2F0] px-2.5 py-1 text-xs font-medium text-[#5C6A64]'>
      Funcionário
    </span>
  );
}

export function UsersList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const modal = useModal();

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsers(1, { all: true });
      setUsers(data.data || []);
    } catch (error) {
      logger.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDeleteUser(id: number) {
    modal.openConfirm(
      'Excluir Usuário',
      'Deseja realmente excluir este usuário? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await deleteUser(id);
          setUsers(prev => prev.filter(u => u.id !== id));
          modal.openSuccess('Sucesso', 'O usuário foi excluído com sucesso.');
        } catch (error: unknown) {
          logger.error('Erro ao deletar:', error);
          modal.openError('Erro', getErrorMessage(error, 'Não foi possível excluir o usuário.'));
        }
      },
      'Excluir',
      'Cancelar',
    );
  }

  const actionBtn =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E9E7] bg-white text-[#5C6A64] transition-colors hover:bg-gray-50';
  const deleteBtn =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0DAD8] bg-white text-[#C2453D] transition-colors hover:bg-red-50';

  return (
    <div className='flex flex-col gap-6'>
      {/* Cabeçalho */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='font-display text-2xl font-semibold tracking-tight'>Usuários</h1>
          <p className='mt-1 text-sm text-[#5C6A64]'>
            Gerencie os usuários com acesso ao sistema.
          </p>
        </div>
        <Link
          to='/users/new'
          className='inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700'
        >
          <Plus size={17} />
          Novo usuário
        </Link>
      </header>

      {/* Tabela / Cartões */}
      <section className='overflow-hidden rounded-2xl border border-[#E4E9E7] bg-white shadow-sm'>
        <div className='hidden overflow-x-auto md:block'>
          <table className='min-w-full border-collapse text-sm'>
            <thead>
              <tr className='bg-[#FAFBFB] text-left'>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-xs font-semibold text-[#6B7772]'>
                  Usuário
                </th>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-xs font-semibold text-[#6B7772]'>
                  E-mail
                </th>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-xs font-semibold text-[#6B7772]'>
                  Função
                </th>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-right text-xs font-semibold text-[#6B7772]'>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                users.map(user => (
                  <tr key={user.id} className='transition-colors hover:bg-[#FAFBFB]'>
                    <td className='border-b border-[#F1F4F3] px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-700'>
                          {getInitials(user.name)}
                        </div>
                        <span className='font-medium text-ink'>{user.name}</span>
                      </div>
                    </td>
                    <td className='border-b border-[#F1F4F3] px-4 py-3 text-[#3C4742]'>
                      {user.email}
                    </td>
                    <td className='border-b border-[#F1F4F3] px-4 py-3'>
                      <RoleBadge isAdmin={user.is_admin} />
                    </td>
                    <td className='border-b border-[#F1F4F3] px-4 py-3'>
                      <div className='flex justify-end gap-1.5'>
                        <Link
                          to={`/users/${user.id}`}
                          className={actionBtn}
                          title='Editar usuário'
                          aria-label={`Editar ${user.name}`}
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          type='button'
                          onClick={() => user.id && handleDeleteUser(user.id)}
                          title='Excluir usuário'
                          aria-label={`Excluir ${user.name}`}
                          className={deleteBtn}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={4} className='px-4 py-10 text-center text-[#8A968F]'>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={4} className='px-4 py-10 text-center text-[#8A968F]'>
                    Carregando...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cartões (mobile) */}
        <div className='divide-y divide-[#F1F4F3] md:hidden'>
          {!loading &&
            users.map(user => (
              <article key={user.id} className='flex gap-3 p-4'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-700'>
                  {getInitials(user.name)}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='truncate font-medium text-ink'>{user.name}</h3>
                    <RoleBadge isAdmin={user.is_admin} />
                  </div>
                  <p className='mt-1 truncate text-sm text-[#5C6A64]'>{user.email}</p>
                  <div className='mt-3 flex gap-2'>
                    <Link
                      to={`/users/${user.id}`}
                      className='flex h-11 w-11 items-center justify-center rounded-lg border border-[#E4E9E7] bg-white text-[#5C6A64] transition-colors hover:bg-gray-50'
                      title='Editar usuário'
                      aria-label={`Editar ${user.name}`}
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      type='button'
                      onClick={() => user.id && handleDeleteUser(user.id)}
                      title='Excluir usuário'
                      aria-label={`Excluir ${user.name}`}
                      className='flex h-11 w-11 items-center justify-center rounded-lg border border-[#F0DAD8] bg-white text-[#C2453D] transition-colors hover:bg-red-50'
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}

          {!loading && users.length === 0 && (
            <p className='px-4 py-10 text-center text-[#8A968F]'>
              Nenhum usuário encontrado.
            </p>
          )}

          {loading && (
            <p className='px-4 py-10 text-center text-[#8A968F]'>Carregando...</p>
          )}
        </div>
      </section>

      <ModalBase
        isOpen={modal.isOpen}
        title={modal.config.title}
        description={modal.config.description}
        variant={modal.config.variant}
        confirmText={modal.config.confirmText}
        cancelText={modal.config.cancelText}
        hideCancel={modal.config.hideCancel}
        onConfirm={modal.config.onConfirm}
        onClose={modal.closeModal}
      />
    </div>
  );
}
