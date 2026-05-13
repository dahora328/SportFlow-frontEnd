import {
  formatDate,
  formatDocument,
  formatPhone,
  formatZipCode,
} from '../../utils/util';

interface Athlete {
  full_name: string;
  birth_date: string;
  marital_status: string;
  gender: string;
  document: string;
  address: string;
  number: string;
  neighborhood: string;
  zip_code: string;
  state: string;
  city: string;
  mobile_phone: string;
  secondary_phone: string;
  email: string;
  mother_name: string;
  father_name: string;
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
              alt={athlete.full_name}
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

            <p className='font-semibold'>{athlete.full_name}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>CPF</p>

            <p className='font-semibold'>{formatDocument(athlete.document)}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Data de nascimento</p>

            <p className='font-semibold'>{formatDate(athlete.birth_date)}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Gênero</p>

            <p className='font-semibold'>{athlete.gender}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Estado civil</p>

            <p className='font-semibold'>{athlete.marital_status}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Telefone</p>

            <p className='font-semibold'>{formatPhone(athlete.mobile_phone)}</p>
          </div>

          <div className='col-span-2'>
            <p className='text-sm text-gray-500'>E-mail</p>

            <p className='font-semibold'>{athlete.email}</p>
          </div>
          <div className='col-span-2'>
            <p className='text-sm text-gray-500'>Endereço</p>

            <p className='font-semibold'>
              {athlete.address}, {athlete.number} <br />
              Bairro: {athlete.neighborhood} <br />
              Cidade: {athlete.city} <br />
              Estado: {athlete.state} <br />
              CEP: {formatZipCode(athlete.zip_code)}
            </p>
          </div>

          <div className='col-span-2'>
            <p className='text-sm text-gray-500'>Pais</p>

            <p className='font-semibold'>
              Mãe: {athlete.mother_name} - Pai: {athlete.father_name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
