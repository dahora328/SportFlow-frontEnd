/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteAthlete,
  getAthleteById,
  getAthletes,
  type AthleteData,
} from '../../service/athletesService';
import { formatDate, formatCPF } from '../../utils/util';
import { Edit, Trash } from 'lucide-react';

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className='px-4 py-2 text-center font-medium text-white'>{children}</th>
  );
}

export function Home() {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);

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
    try {
      const result = await deleteAthlete(athleteId);
      setAthletes(prevAthletes =>
        prevAthletes.filter(athlete => athlete.id !== athleteId),
      );
      console.log('Atleta deletado com sucesso:', result);
    } catch (error) {
      console.error('Erro ao tentar deletar atleta:', error);
      alert('Erro ao deletar atleta!');
    }
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
                      className='cursor-pointer text-blue-500 hover:text-blue-700'
                      title='Editar Atleta'
                    >
                      <Edit
                        size={16}
                        className='cursor-pointer text-gray-700 hover:text-gray-900'
                      />
                    </Link>
                    <button
                      onClick={() => {
                        handleDeteleAthlete(athlete.id);
                      }}
                      title='Deletar Atleta'
                    >
                      <Trash
                        size={16}
                        className='cursor-pointer text-red-500 hover:text-red-700'
                      />
                    </button>
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
