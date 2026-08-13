import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser, type UserData } from '../../services/usersService';
import { Edit, Trash, Plus } from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { ModalBase } from '../../components/Modal/ModalBase';
import { Link } from 'react-router-dom';

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className='px-4 py-2 text-center font-medium text-white'>{children}</th>
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
      console.error('Erro ao carregar usuários:', error);
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
        } catch (error: any) {
          console.error('Erro ao deletar:', error);
          modal.openError('Erro', error.response?.data?.error || 'Não foi possível excluir o usuário.');
        }
      },
      'Excluir',
      'Cancelar',
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold'>Usuários da Empresa</h1>
        <div className='flex gap-2 justify-center'>
          <Link
            to='/users/new'
            className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2'
          >
            <Plus size={16} /> Novo Usuário
          </Link>
        </div>
      </header>

      <section className='rounded-lg border border-gray-200 bg-white'>
        <div className='flex border-b border-gray-200 px-4 py-3 justify-center items-center'>
          <h2 className='text-x1 font-semibold'>Usuários cadastrados</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 text-sm'>
            <thead className='bg-gray-700'>
              <tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Função</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {loading ? (
                <tr>
                  <td colSpan={4} className='px-4 py-8 text-center text-gray-500'>
                    Carregando usuários...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-4 py-8 text-center text-gray-500'>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className='hover:bg-gray-200'>
                    <td className='px-4 py-3 text-center'>{user.name}</td>
                    <td className='px-4 py-3 text-center'>{user.email}</td>
                    <td className='px-4 py-3 text-center'>
                      {user.is_admin ? (
                         <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium'>Gestor</span>
                      ) : (
                         <span className='bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium'>Funcionário</span>
                      )}
                    </td>
                    <td className='px-4 py-3 flex gap-4 items-center justify-center'>
                      <Link
                        to={`/users/${user.id}`}
                        className='cursor-pointer p-1 rounded-full transition-colors'
                        title='Editar Usuário'
                      >
                        <Edit size={16} className='text-gray-700 hover:text-gray-900' />
                      </Link>
                      <button
                        onClick={() => user.id && handleDeleteUser(user.id)}
                        title='Deletar Usuário'
                        className='cursor-pointer p-1 rounded-full transition-colors'
                      >
                        <Trash size={16} className='text-red-500 hover:text-red-700' />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
