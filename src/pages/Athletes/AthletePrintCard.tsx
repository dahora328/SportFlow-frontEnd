interface Athlete {
  name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  photo_url?: string;
}

interface Props {
  athlete: Athlete;
}

export function AthletePrintCard({ athlete }: Props) {
  return (
    <div
      className='
        w-[210mm]
        min-h-[297mm]
        bg-white
        text-black
        p-8
        mx-auto
      '
    >
      {/* Cabeçalho */}
      <div className='border-b pb-4 mb-6'>
        <h1 className='text-3xl font-bold'>Ficha do Atleta</h1>
      </div>

      {/* Dados principais */}
      <div className='flex gap-6'>
        {/* Foto */}
        <div
          className='
            w-32
            h-40
            border
            rounded-md
            overflow-hidden
            flex
            items-center
            justify-center
            bg-gray-100
          '
        >
          {athlete.photo_url ? (
            <img
              src={athlete.photo_url}
              alt={athlete.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <span className='text-sm text-gray-500'>Sem foto</span>
          )}
        </div>

        {/* Informações */}
        <div className='flex-1 grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Nome</p>

            <p className='font-semibold'>{athlete.name}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>CPF</p>

            <p className='font-semibold'>{athlete.cpf}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Data de nascimento</p>

            <p className='font-semibold'>{athlete.birth_date}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Telefone</p>

            <p className='font-semibold'>{athlete.phone}</p>
          </div>

          <div className='col-span-2'>
            <p className='text-sm text-gray-500'>E-mail</p>

            <p className='font-semibold'>{athlete.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
