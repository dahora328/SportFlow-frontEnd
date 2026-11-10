import { BarChart3 } from 'lucide-react';

export function Reports() {
  return (
    <div className='flex flex-col gap-6'>
      <header>
        <h1 className='font-display text-2xl font-semibold tracking-tight'>
          Relatórios
        </h1>
        <p className='mt-1 text-sm text-[#5C6A64]'>
          Acompanhe indicadores e exporte dados dos atletas.
        </p>
      </header>

      <section className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E4E9E7] bg-white px-6 py-16 text-center shadow-sm'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700'>
          <BarChart3 size={24} />
        </div>
        <h2 className='font-display text-lg font-semibold text-ink'>
          Em breve
        </h2>
        <p className='max-w-md text-sm text-[#5C6A64]'>
          Os relatórios ainda estão em desenvolvimento. Em breve você poderá
          visualizar e exportar indicadores por aqui.
        </p>
      </section>
    </div>
  );
}
