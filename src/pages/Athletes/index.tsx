import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  createAthlete,
  updateAthlete,
  getAthleteById,
  type AthleteData,
} from '../../services/athletesService';
import api from '../../services/api';
import { formatDocument, formatPhone, formatZipCode } from '../../utils/util';
import { ModalBase } from '../../components/Modal/ModalBase';
import { useModal } from '../../hooks/useModal';

export function Athletes() {
  const PHOTO_RATIO = 3 / 4;
  const PHOTO_RATIO_TOLERANCE = 0.02;

  const { id } = useParams(); // Para edição via URL /athletes/:id
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const lastObjectUrlRef = useRef<string | null>(null);

  const modal = useModal();
  const navigate = useNavigate();

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
    owner_id: localStorage.getItem('user_id')?.toString() as unknown as number,
    photo_path: '',
  });

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  const normalizeImageUrl = useCallback((imagePath: string) => {
    if (/^https?:\/\//i.test(imagePath)) {
      return imagePath;
    }

    const apiBaseUrl = api.defaults.baseURL || window.location.origin;
    const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '/');
    const normalizedPath = imagePath.startsWith('/')
      ? imagePath.slice(1)
      : imagePath;

    return new URL(normalizedPath, apiOrigin).toString();
  }, []);

  const updatePhotoPreview = useCallback(
    (nextUrl: string, isObjectUrl = false) => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = null;
      }

      if (isObjectUrl) {
        lastObjectUrlRef.current = nextUrl;
      }

      setPhotoPreviewUrl(nextUrl);
    },
    [],
  );

  // Função para carregar dados do atleta
  const loadAthleteData = useCallback(
    async (athleteId: number) => {
      try {
        setLoading(true);
        const athleteData = await getAthleteById(athleteId);

        setFormData({
          ...athleteData,
          // Garante que campos opcionais tenham valor padrão se forem null/undefined
          mobile_phone: athleteData.mobile_phone || '',
          secondary_phone: athleteData.secondary_phone || '',
          email: athleteData.email || '',
          number: athleteData.number || '',
          neighborhood: athleteData.neighborhood || '',
          zip_code: athleteData.zip_code || '',
          state: athleteData.state || '',
          city: athleteData.city || '',
          mother_name: athleteData.mother_name || '',
          father_name: athleteData.father_name || '',
          photo_path: athleteData.photo_path || '',
        });

        const existingPhotoPath = athleteData.photo_path;
        if (existingPhotoPath && typeof existingPhotoPath === 'string') {
          updatePhotoPreview(normalizeImageUrl(existingPhotoPath));
        } else {
          updatePhotoPreview('');
        }

        setSelectedPhotoName('');
      } catch (error) {
        console.error('Erro ao carregar atleta:', error);
        alert('Erro ao carregar dados do atleta!');
      } finally {
        setLoading(false);
      }
    },
    [normalizeImageUrl, updatePhotoPreview],
  );

  useEffect(() => {
    // Verifica se veio um atleta para editar via state (navegação)
    const athleteFromState = location.state?.athleteToEdit;

    // Verifica se tem ID na URL
    if (id || athleteFromState) {
      setIsEditing(true);
      loadAthleteData(id || athleteFromState?.id);
    } else {
      // Modo cadastro - reseta o formulário
      setIsEditing(false);
      setFormData({
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
        owner_id: localStorage
          .getItem('user_id')
          ?.toString() as unknown as number,
        photo_path: '',
      });
      setSelectedPhotoName('');
      setPhotoPreviewUrl('');
    }
  }, [id, location.state, loadAthleteData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFormData(prev => ({ ...prev, photo_path: null }));
      setSelectedPhotoName('');
      updatePhotoPreview('');
      return;
    }

    const image = new Image();
    const imageUrl = URL.createObjectURL(file);

    image.onload = () => {
      const ratio = image.width / image.height;
      URL.revokeObjectURL(imageUrl);

      if (Math.abs(ratio - PHOTO_RATIO) > PHOTO_RATIO_TOLERANCE) {
        modal.openError(
          'Formato inválido',
          'A foto deve estar no formato 3x4 (ex.: 300x400 px).',
        );
        setFormData(prev => ({ ...prev, photo_path: null }));
        setSelectedPhotoName('');
        updatePhotoPreview('');
        e.target.value = '';
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photo_path: file }));
      updatePhotoPreview(previewUrl, true);
      setSelectedPhotoName(file.name);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      modal.openError(
        'Arquivo inválido',
        'Não foi possível ler a imagem selecionada.',
      );
      setFormData(prev => ({ ...prev, photo_path: null }));
      setSelectedPhotoName('');
      updatePhotoPreview('');
      e.target.value = '';
    };

    image.src = imageUrl;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (isEditing) {
        const athleteId = id || location.state?.athleteToEdit?.id;

        result = await updateAthlete(athleteId, formData);
        console.log('Atualizado com sucesso:', result);
        modal.openSuccess(
          'Atleta atualizado!',
          'Os dados foram atualizados com sucesso.',
          () => navigate('/home'), // só navega quando clicar em "Fechar"
        );
      } else {
        result = await createAthlete(formData);
        console.log('Cadastrado com sucesso:', result);
        modal.openSuccess(
          'Atleta cadastrado!',
          'O atleta foi cadastrado com sucesso.',
          () => navigate('/home'), // idem aqui
        );
        // window.location.href = '/home';
      }
    } catch (error) {
      modal.openError(
        'Erro' + error,
        'Não foi possível ' +
          (isEditing ? 'atualizar' : 'salvar') +
          ' o atleta. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (isEditing) {
      window.location.href = '/home';
    } else {
      setFormData({
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
        owner_id: localStorage
          .getItem('user_id')
          ?.toString() as unknown as number,
        photo_path: '',
      });
      setSelectedPhotoName('');
      updatePhotoPreview('');
    }
  }

  // Loading durante carregamento de dados
  if (loading && isEditing) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p>Carregando dados do atleta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center p-6'>
      <h1 className='text-2xl font-bold mb-6'>
        {isEditing ? 'Editar Atleta' : 'Cadastro de Atleta'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl'
      >
        <div className='mb-6 rounded-lg border border-gray-200 p-4 bg-gray-50'>
          <h2 className='text-sm font-semibold mb-3'>Foto do atleta (3x4)</h2>
          <div className='flex flex-col md:flex-row gap-4 items-start'>
            <div className='w-36 h-48 rounded-lg border border-gray-300 overflow-hidden bg-white flex items-center justify-center'>
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt='Pré-visualização da foto do atleta'
                  className='w-full h-full object-cover'
                />
              ) : (
                <span className='text-xs text-gray-400 px-2 text-center'>
                  Sem foto selecionada
                </span>
              )}
            </div>

            <div className='flex-1 w-full'>
              <input
                type='file'
                accept='image/*'
                onChange={handlePhotoChange}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 bg-white'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Envie uma imagem com proporção 3x4 (ex.: 300x400 px).
              </p>
              {selectedPhotoName && (
                <p className='text-xs text-green-600 mt-1'>
                  Arquivo selecionado: {selectedPhotoName}
                </p>
              )}
            </div>
          </div>
        </div>

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
              <option value='solteiro'>Solteiro(a)</option>
              <option value='casado'>Casado(a)</option>
              <option value='divorciado'>Divorciado(a)</option>
              <option value='viuvo'>Viúvo(a)</option>
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
              <option value='masculino'>Masculino</option>
              <option value='feminino'>Feminino</option>
              <option value='outro'>Outro</option>
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
              value={formatDocument(formData.document)}
              maxLength={11}
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
              maxLength={11}
              value={formData.mobile_phone}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='(DD) 99999-9999'
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
              value={formatPhone(formData.secondary_phone)}
              maxLength={11}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2'
              placeholder='(DD) 99999-9999'
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
              value={formatZipCode(formData.zip_code)}
              onChange={handleChange}
              maxLength={8}
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

        <div className='mt-6 text-center p-2 space-x-4 grid grid-cols-2 md:grid-cols-2'>
          <button
            type='button'
            onClick={handleCancel}
            className='bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-500 transition'
          >
            {isEditing ? 'Cancelar' : 'Limpar'}
          </button>
          <button
            type='submit'
            disabled={loading}
            className='bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading
              ? 'Salvando...'
              : isEditing
                ? 'Atualizar Atleta'
                : 'Salvar Atleta'}
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
        </div>
      </form>
    </div>
  );
}
