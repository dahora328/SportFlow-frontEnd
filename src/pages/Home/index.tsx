/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAthletes, type AthleteData } from '../../service/athletesService';

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className='px-4 py-2 text-center font-medium text-gray-600'>
      {children}
    </th>
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
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
          <h2 className='text-sm font-semibold'>Recentes</h2>
          <a href='#' className='text-sm text-blue-600 hover:underline'>
            Ver todos
          </a>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 text-sm'>
            <thead className='bg-gray-50'>
              <tr>
                <Th>Nome</Th>
                <Th>Esporte</Th>
                <Th>Status</Th>
                <Th>Atualizado em</Th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {athletes.map((athlete: any) => (
                <tr key={athlete.id}>
                  <td className='px-4 py-3'>{athlete.full_name}</td>
                  <td className='px-4 py-3'>{athlete.birth_date}</td>
                  <td className='px-4 py-3'>{athlete.document}</td>
                  <td className='px-4 py-3'>{athlete.updated_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
