/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteAthlete,
  getAthleteById,
  getAthletes,
  getAthletesByName,
  type AthleteData,
} from '../../services/athletesService';
import { formatDate, formatCPF } from '../../utils/util';
import { Edit, Trash } from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { ModalBase } from '../../components/Modal/ModalBase';

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className='px-4 py-2 text-center font-medium text-white'>{children}</th>
  );
}

export function Home() {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [serachAthlete, setSearchAthlete] = useState('');

  const modal = useModal();

  useEffect(() => {
    async function loadAthletes() {
      try {
        const data = await getAthletes();
        setAthletes(data);
      } catch (error) {
        console.error('Erro ao carregar atletas:', error);
      }
    }

    loadAthletes();
  }, []);

  async function loadAthletes() {
    try {
      const data = await getAthletes();
      setAthletes(data);
    } catch (error) {
      console.error('Erro ao carregar atletas', error);
    }
  }

  async function handleSearchAthletes(name: string) {
    try {
      const data = await getAthletesByName(name);
      setAthletes(data);
    } catch (error) {
      console.error('Erro ao buscar atletas por nome: ', error);
    }
  }

  async function handleLoadAthleteData(athleteId: number) {
    try {
      const result = await getAthleteById(athleteId);

      console.log('Dados do atleta:', result);
      //window.location.href = '/home';
    } catch (error) {
      console.error('Erro ao recuperar atleta:', error);
      alert('Erro ao recuperar atleta!');
    }
  }

  async function handleDeteleAthlete(athleteId: number) {
    modal.openConfirm(
      'Excluir Atleta',
      'Deseja realmente excluir este atleta? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await deleteAthlete(athleteId);
          setAthletes(prevAthletes =>
            prevAthletes.filter(athlete => athlete.id !== athleteId),
          );
          modal.openSuccess('Sucesso', 'O atleta foi excluído corretamente.');
        } catch (error) {
          console.error('Erro ao deletar:', error);
          modal.openError(
            'Erro' + error,
            'Não foi possível excluir o atleta. Tente novamente.',
          );
        }
      },
      'Excluir',
      'Cancelar',
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold'>Time Flow</h1>
        {/* Nome do time pegar do banco de dados da tabela times ou empresa*/}
        <div className='flex flex-col gap-3 sm:flex-row'>
          <div className='relative'>
            <input
              type='search'
              placeholder='Buscar atleta...'
              className='w-64 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500'
              value={serachAthlete}
              onChange={e => {
                const value = e.target.value;
                setSearchAthlete(value);
                if (value.trim().length === 0) {
                  loadAthletes();
                } else {
                  handleSearchAthletes(value);
                }
              }}
            />
          </div>
          <div className='flex gap-2 justify-center'>
            <Link
              to='/athletes'
              className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50'
            >
              + Cadastrar atleta
            </Link>

            <button className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50'>
              Importar CSV
            </button>
          </div>
        </div>
      </header>

      <section className='rounded-lg border border-gray-200 bg-white'>
        <div className='flex border-b border-gray-200 px-4 py-3 justify-center items-center'>
          <h2 className='text-x1 font-semibold'>Atletas cadastrados</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 text-sm'>
            <thead className='bg-gray-700'>
              <tr>
                <Th>Nome</Th>
                <Th>Data Nascimento</Th>
                <Th>CPF</Th>
                <Th>Atualizado em</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {athletes.map((athlete: any) => (
                <tr key={athlete.id} className='hover:bg-gray-200'>
                  <td className='px-4 py-3'>{athlete.full_name}</td>
                  <td className='px-4 py-3'>
                    {formatDate(athlete.birth_date)}
                  </td>
                  <td className='px-4 py-3'>{formatCPF(athlete.document)}</td>
                  <td className='px-4 py-3'>
                    {formatDate(athlete.updated_at?.split('T')[0] || '')}
                  </td>
                  <td className='px-4 py-3 flex gap-4 items-center justify-center'>
                    <Link
                      key={athlete.id}
                      onClick={() => {
                        handleLoadAthleteData(athlete.id);
                      }}
                      to={`/athletes/${athlete.id}`}
                      className='cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors'
                      title='Editar Atleta'
                    >
                      <Edit
                        size={16}
                        className='cursor-pointer text-gray-700 hover:text-gray-900'
                      />
                    </Link>
                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeteleAthlete(athlete.id);
                      }}
                      title='Deletar Atleta'
                      className='cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors'
                    >
                      <Trash
                        size={16}
                        className='text-red-500 hover:text-red-700'
                      />
                    </button>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
