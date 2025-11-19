import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createAthlete, type AthleteData } from '../../service/athletesService';

export function Athletes() {
  const [formData, setFormData] = useState<AthleteData>({
    full_name: '',
    birth_date: '',
    marital_status: '',
    gender: '',
    document: '',
    address: '',
    number: '',
    neighborhood: '',
    zip_code: '',
    state: '',
    city: '',
    mobile_phone: '',
    secondary_phone: '',
    email: '',
    mother_name: '',
    father_name: '',
    owner_id: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await createAthlete(formData);
      console.log('Salvo com sucesso:', result);
      alert('Atleta cadastrado!');
      window.location.href = '/home';
    } catch (error) {
      console.error('Erro ao cadastrar atleta:', error);
      alert('Erro ao salvar!');
    }
    console.log('Dados do atleta:', formData);

    console.log('📌 JSON enviado para API:');
    console.log(JSON.stringify(formData, null, 2));
  }

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center p-6'>
      <h1 className='text-2xl font-bold mb-6'>Cadastro de Atleta</h1>

      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Nome completo */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Nome completo
            </label>
            <input
              type='text'
              name='full_name'
              value={formData.full_name}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o nome completo'
              required
            />
          </div>

          {/* Data de nascimento */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Data de nascimento
            </label>
            <input
              type='date'
              name='birth_date'
              value={formData.birth_date}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              required
            />
          </div>

          {/* Estado civil */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Estado civil
            </label>
            <select
              name='marital_status'
              value={formData.marital_status}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
            >
              <option value=''>Selecione</option>
              <option value='single'>Solteiro(a)</option>
              <option value='married'>Casado(a)</option>
              <option value='divorced'>Divorciado(a)</option>
              <option value='widowed'>Viúvo(a)</option>
            </select>
          </div>

          {/* Gênero */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Gênero</label>
            <select
              name='gender'
              value={formData.gender}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
            >
              <option value=''>Selecione</option>
              <option value='male'>Masculino</option>
              <option value='female'>Feminino</option>
              <option value='other'>Outro</option>
            </select>
          </div>

          {/* Documento */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Documento (CPF)
            </label>
            <input
              type='text'
              name='document'
              value={formData.document}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Digite o número do documento'
            />
          </div>

          {/* Telefone principal */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Telefone principal
            </label>
            <input
              type='text'
              name='mobile_phone'
              value={formData.mobile_phone}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='(DDD) 99999-9999'
            />
          </div>

          {/* Telefone secundário */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Telefone secundário
            </label>
            <input
              type='text'
              name='secondary_phone'
              value={formData.secondary_phone}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='(DDD) 99999-9999'
            />
          </div>

          {/* E-mail */}
          <div>
            <label className='block text-sm font-semibold mb-1'>E-mail</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='exemplo@email.com'
            />
          </div>

          {/* Endereço */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-semibold mb-1'>Endereço</label>
            <input
              type='text'
              name='address'
              value={formData.address}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='Rua, avenida, etc.'
            />
          </div>

          {/* Número */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Número</label>
            <input
              type='text'
              name='number'
              value={formData.number}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
            />
          </div>

          {/* Bairro */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Bairro</label>
            <input
              type='text'
              name='neighborhood'
              value={formData.neighborhood}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
            />
          </div>

          {/* CEP */}
          <div>
            <label className='block text-sm font-semibold mb-1'>CEP</label>
            <input
              type='text'
              name='zip_code'
              value={formData.zip_code}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='00000-000'
            />
          </div>

          {/* Estado */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Estado</label>
            <input
              type='text'
              name='state'
              value={formData.state}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
            />
          </div>

          {/* Cidade */}
          <div>
            <label className='block text-sm font-semibold mb-1'>Cidade</label>
            <input
              type='text'
              name='city'
              value={formData.city}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
            />
          </div>

          {/* Nome da mãe */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Nome da mãe
            </label>
            <input
              type='text'
              name='mother_name'
              value={formData.mother_name}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
            />
          </div>

          {/* Nome do pai */}
          <div>
            <label className='block text-sm font-semibold mb-1'>
              Nome do pai
            </label>
            <input
              type='text'
              name='father_name'
              value={formData.father_name}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
            />
          </div>
        </div>

        {/* Botão de envio */}
        <div className='mt-6 text-center p-2 space-x-4 grid grid-cols-2 md:grid-cols-2'>
          <Link
            to='/'
            className='bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition'
          >
            Voltar
          </Link>
          <button
            type='submit'
            className='bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition'
          >
            Salvar Atleta
          </button>
        </div>
      </form>
    </div>
  );
}
