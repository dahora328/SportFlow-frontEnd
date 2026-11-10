import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Camera,
  Image as ImageIcon,
  Upload,
  User,
  Phone,
  MapPin,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import {
  createAthlete,
  updateAthlete,
  getAthleteById,
  type AthleteData,
} from '../../services/athletesService';
import api from '../../services/api';
import { buscarCep } from '../../services/cepService';
import { MaskedInput } from '../../components/Form/MaskedInput';
import { ModalBase } from '../../components/Modal/ModalBase';
import { useModal } from '../../hooks/useModal';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/getErrorMessage';

// Casca de cada grupo de campos do formulário: ícone + título + dica e conteúdo.
function FieldSection({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className='rounded-2xl border border-[#E4E9E7] bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-5 flex items-center gap-3'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700'>
          {icon}
        </div>
        <div className='min-w-0'>
          <h2 className='font-display text-[15px] font-semibold text-ink'>
            {title}
          </h2>
          {hint && <p className='text-xs text-[#8A968F]'>{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Athletes() {
  const PHOTO_RATIO = 3 / 4;
  const PHOTO_RATIO_TOLERANCE = 0.02;

  const { id } = useParams(); // Para edição via URL /athletes/:id
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [photoPreviewFallbackUrls, setPhotoPreviewFallbackUrls] = useState<
    string[]
  >([]);
  const lastObjectUrlRef = useRef<string | null>(null);

  const modal = useModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AthleteData>({
    full_name: '',
    birth_date: '',
    marital_status: '',
    gender: '',
    position: '',
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
    observations: '',
  });

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  const normalizeImageUrl = useCallback((imagePath: string) => {
    const trimmedPath = imagePath.trim();
    if (!trimmedPath) {
      return '';
    }

    const normalizedSlashesPath = trimmedPath.replace(/\\/g, '/');

    if (/^https?:\/\//i.test(normalizedSlashesPath)) {
      return normalizedSlashesPath;
    }

    const apiBaseUrl = api.defaults.baseURL || window.location.origin;
    const baseUrlWithSlash = apiBaseUrl.endsWith('/')
      ? apiBaseUrl
      : `${apiBaseUrl}/`;
    const apiBase = new URL(baseUrlWithSlash, window.location.origin);
    const normalizedPath = normalizedSlashesPath.startsWith('/')
      ? normalizedSlashesPath.slice(1)
      : normalizedSlashesPath;

    return new URL(normalizedPath, apiBase).toString();
  }, []);

  const buildImageUrlCandidates = useCallback((imagePath: string): string[] => {
    const trimmedPath = imagePath.trim();
    if (!trimmedPath) {
      return [];
    }

    const normalizedPath = trimmedPath.replace(/\\/g, '/');

    if (/^https?:\/\//i.test(normalizedPath)) {
      return [normalizedPath];
    }

    const candidates = new Set<string>();
    const apiBaseUrl = api.defaults.baseURL || window.location.origin;
    const baseUrlWithSlash = apiBaseUrl.endsWith('/')
      ? apiBaseUrl
      : `${apiBaseUrl}/`;
    const apiBase = new URL(baseUrlWithSlash, window.location.origin);
    const baseWithApi = apiBase.toString();
    const baseOrigin = `${apiBase.origin}/`;

    const cleanPath = normalizedPath.startsWith('/')
      ? normalizedPath.slice(1)
      : normalizedPath;

    const filename = cleanPath.split('/').pop() || cleanPath;

    // 1. Caminho exato na origem ou na URL da API
    candidates.add(new URL(cleanPath, baseOrigin).toString());
    candidates.add(new URL(cleanPath, baseWithApi).toString());

    // 2. Ajustes comuns de diretório public/storage
    if (cleanPath.includes('public/')) {
      const withoutPublic = cleanPath.replace('public/', '');
      candidates.add(new URL(withoutPublic, baseOrigin).toString());
      candidates.add(
        new URL(`storage/${withoutPublic}`, baseOrigin).toString(),
      );
    }

    if (!cleanPath.includes('storage/')) {
      candidates.add(new URL(`storage/${cleanPath}`, baseOrigin).toString());
    }

    // 3. Tentativas usando apenas o nome do arquivo nas pastas mais comuns
    candidates.add(new URL(`storage/${filename}`, baseOrigin).toString());
    candidates.add(new URL(`uploads/${filename}`, baseOrigin).toString());
    candidates.add(
      new URL(`storage/uploads/${filename}`, baseOrigin).toString(),
    );
    candidates.add(new URL(`storage/${filename}`, baseWithApi).toString());
    candidates.add(new URL(`uploads/${filename}`, baseWithApi).toString());

    return Array.from(candidates);
  }, []);

  const getAthletePhotoUrl = useCallback(
    (athleteData: Record<string, unknown>): string => {
      const readNestedString = (
        source: Record<string, unknown>,
        key: string,
        nestedKey: string,
      ): string => {
        const nested = source[key];
        if (typeof nested === 'object' && nested !== null) {
          const value = (nested as Record<string, unknown>)[nestedKey];
          if (typeof value === 'string' && value.trim().length > 0) {
            return value;
          }
        }
        return '';
      };

      const candidates = [
        athleteData.photo_path,
        athleteData.photo_url,
        readNestedString(athleteData, 'photo', 'url'),
        readNestedString(athleteData, 'image', 'url'),
      ];

      const firstValidPath = candidates.find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && candidate.trim().length > 0,
      );

      return firstValidPath || '';
    },
    [],
  );

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
      setPhotoPreviewFallbackUrls([]);
    },
    [],
  );

  // Função para carregar dados do atleta
  const loadAthleteData = useCallback(
    async (athleteId: number) => {
      try {
        setLoading(true);
        const athleteData = await getAthleteById(athleteId);
        logger.log('[DEBUG] Dados brutos do atleta recuperado:', athleteData);

        setFormData({
          ...athleteData,
          // Garante que campos opcionais tenham valor padrão se forem null/undefined
          position: athleteData.position || '',
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
          observations: athleteData.observations || '',
        });

        const existingPhotoUrl = getAthletePhotoUrl(
          athleteData as unknown as Record<string, unknown>,
        );
        logger.log('[DEBUG] URL/Caminho da foto extraído:', existingPhotoUrl);

        if (existingPhotoUrl && typeof existingPhotoUrl === 'string') {
          const previewCandidates = buildImageUrlCandidates(existingPhotoUrl);
          logger.log('[DEBUG] URLs candidatas geradas:', previewCandidates);

          if (previewCandidates.length > 0) {
            setPhotoPreviewUrl(previewCandidates[0]);
            setPhotoPreviewFallbackUrls(previewCandidates.slice(1));
            logger.log(
              '[DEBUG] URL de preview definida:',
              previewCandidates[0],
            );
          } else {
            const normalizedUrl = normalizeImageUrl(existingPhotoUrl);
            updatePhotoPreview(normalizedUrl);
            logger.log(
              '[DEBUG] URL normalizada como fallback:',
              normalizedUrl,
            );
          }

          const normalizedNamePath = existingPhotoUrl.replace(/\\/g, '/');
          const fileName = normalizedNamePath.split('/').pop() || '';
          setSelectedPhotoName(fileName);
        } else {
          logger.log('[DEBUG] Nenhuma URL de foto encontrada nos dados.');
          updatePhotoPreview('');
          setSelectedPhotoName('');
        }
      } catch (error) {
        logger.error('Erro ao carregar atleta:', error);
        alert('Erro ao carregar dados do atleta!');
      } finally {
        setLoading(false);
      }
    },
    [
      buildImageUrlCandidates,
      getAthletePhotoUrl,
      normalizeImageUrl,
      updatePhotoPreview,
    ],
  );

  useEffect(() => {
    // Verifica se veio um atleta para editar via state (navegação)
    const athleteFromState = location.state?.athleteToEdit;

    // Verifica se tem ID na URL
    if (id || athleteFromState) {
      setIsEditing(true);
      loadAthleteData(Number(id || athleteFromState?.id));
    } else {
      // Modo cadastro - reseta o formulário
      setIsEditing(false);
      setFormData({
        full_name: '',
        birth_date: '',
        marital_status: '',
        gender: '',
        position: '',
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
        observations: '',
      });
      setSelectedPhotoName('');
      setPhotoPreviewUrl('');
    }
  }, [id, location.state, loadAthleteData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Ao sair do campo CEP (8 dígitos), busca o endereço e sobrescreve os campos.
  // Campos vazios no retorno (ex.: CEP de cidade inteira) preservam o que o
  // usuário já tiver digitado. Re-digitar o CEP dispara a busca novamente.
  const handleCepBlur = useCallback(async () => {
    const digits = (formData.zip_code ?? '').replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const endereco = await buscarCep(digits);
      if (endereco) {
        setFormData(prev => ({
          ...prev,
          address: endereco.address || prev.address,
          neighborhood: endereco.neighborhood || prev.neighborhood,
          city: endereco.city || prev.city,
          state: endereco.state || prev.state,
        }));
      }
    } finally {
      setCepLoading(false);
    }
  }, [formData.zip_code]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (isEditing) {
        const athleteId = Number(id || location.state?.athleteToEdit?.id);

        result = await updateAthlete(athleteId, formData);
        logger.log('Atualizado com sucesso:', result);
        modal.openSuccess(
          'Atleta atualizado!',
          'Os dados foram atualizados com sucesso.',
          () => navigate('/home'), // só navega quando clicar em "Fechar"
        );
      } else {
        result = await createAthlete(formData);
        logger.log('Cadastrado com sucesso:', result);
        modal.openSuccess(
          'Atleta cadastrado!',
          'O atleta foi cadastrado com sucesso.',
          () => navigate('/home'), // idem aqui
        );
        // window.location.href = '/home';
      }
    } catch (error: unknown) {
      // Mesmo padrão dos demais formulários: getErrorMessage agrega as
      // mensagens de validação (uma por linha) e cai para a genérica.
      modal.openError(
        'Erro',
        getErrorMessage(
          error,
          `Não foi possível ${isEditing ? 'atualizar' : 'salvar'} o atleta. Tente novamente.`,
        ),
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
        position: '',
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
        observations: '',
      });
      setSelectedPhotoName('');
      updatePhotoPreview('');
    }
  }

  // Loading durante carregamento de dados
  if (loading && isEditing) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-brand-600 border-t-transparent'></div>
          <p className='text-sm text-[#5C6A64]'>
            Carregando dados do atleta...
          </p>
        </div>
      </div>
    );
  }

  const labelClass = 'mb-1.5 block text-sm font-medium text-[#3C4742]';
  // 15px no input evita o zoom automático do iOS ao focar o campo.
  const fieldClass =
    'w-full rounded-lg border border-[#D7DEDB] bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20';
  const gridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      {/* Cabeçalho */}
      <header>
        <Link
          to='/home'
          className='mb-3 inline-flex items-center gap-1.5 text-sm text-[#5C6A64] transition-colors hover:text-brand-700'
        >
          <ArrowLeft size={16} />
          Voltar para atletas
        </Link>
        <h1 className='font-display text-2xl font-semibold tracking-tight'>
          {isEditing ? 'Editar atleta' : 'Cadastrar atleta'}
        </h1>
        <p className='mt-1 text-sm text-[#5C6A64]'>
          {isEditing
            ? 'Atualize as informações do atleta.'
            : 'Preencha os dados para cadastrar um novo atleta.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        {/* Foto */}
        <FieldSection
          icon={<Camera size={18} />}
          title='Foto do atleta'
          hint='Proporção 3x4 — ex.: 300×400 px.'
        >
          <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
            <div className='mx-auto h-48 w-36 shrink-0 overflow-hidden rounded-xl border border-[#D7DEDB] bg-[#FAFBFB] sm:mx-0'>
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt='Pré-visualização da foto do atleta'
                  className='h-full w-full object-cover'
                  onError={() => {
                    if (photoPreviewFallbackUrls.length > 0) {
                      setPhotoPreviewUrl(photoPreviewFallbackUrls[0]);
                      setPhotoPreviewFallbackUrls(prev => prev.slice(1));
                      return;
                    }

                    updatePhotoPreview('');
                  }}
                />
              ) : (
                <div className='flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center text-[#8A968F]'>
                  <ImageIcon size={26} />
                  <span className='text-xs'>Sem foto</span>
                </div>
              )}
            </div>

            <div className='w-full flex-1'>
              <label
                htmlFor='athlete-photo'
                className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D7DEDB] bg-[#FAFBFB] px-4 py-7 text-center transition-colors hover:border-brand-600 hover:bg-brand-50/50'
              >
                <span className='flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700'>
                  <Upload size={18} />
                </span>
                <span className='text-sm font-medium text-ink'>
                  {selectedPhotoName ? 'Trocar foto' : 'Selecionar foto'}
                </span>
                <span className='text-xs text-[#8A968F]'>
                  PNG ou JPG em proporção 3x4
                </span>
                <input
                  id='athlete-photo'
                  type='file'
                  accept='image/*'
                  onChange={handlePhotoChange}
                  className='hidden'
                />
              </label>
              {selectedPhotoName && (
                <p className='mt-2 truncate text-xs font-medium text-brand-700'>
                  Arquivo selecionado: {selectedPhotoName}
                </p>
              )}
            </div>
          </div>
        </FieldSection>

        {/* Dados pessoais */}
        <FieldSection
          icon={<User size={18} />}
          title='Dados pessoais'
          hint='Identificação e filiação do atleta.'
        >
          <div className={gridClass}>
            <div className='sm:col-span-2'>
              <label htmlFor='full_name' className={labelClass}>
                Nome completo
              </label>
              <input
                id='full_name'
                type='text'
                name='full_name'
                value={formData.full_name}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Digite o nome completo'
                required
              />
            </div>

            <div>
              <label htmlFor='birth_date' className={labelClass}>
                Data de nascimento
              </label>
              <input
                id='birth_date'
                type='date'
                name='birth_date'
                value={formData.birth_date}
                onChange={handleChange}
                className={fieldClass}
                required
              />
            </div>

            <div>
              <label htmlFor='document' className={labelClass}>
                Documento (CPF)
              </label>
              <MaskedInput
                mask='cpf'
                name='document'
                value={formData.document}
                onChange={handleChange}
                className={fieldClass}
                placeholder='000.000.000-00'
                required
              />
            </div>

            <div>
              <label htmlFor='marital_status' className={labelClass}>
                Estado civil
              </label>
              <select
                id='marital_status'
                name='marital_status'
                value={formData.marital_status}
                onChange={handleChange}
                className={fieldClass}
                required
              >
                <option value=''>Selecione</option>
                <option value='solteiro'>Solteiro(a)</option>
                <option value='casado'>Casado(a)</option>
                <option value='divorciado'>Divorciado(a)</option>
                <option value='viuvo'>Viúvo(a)</option>
              </select>
            </div>

            <div>
              <label htmlFor='gender' className={labelClass}>
                Gênero
              </label>
              <select
                id='gender'
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className={fieldClass}
                required
              >
                <option value=''>Selecione</option>
                <option value='masculino'>Masculino</option>
                <option value='feminino'>Feminino</option>
                <option value='outro'>Outro</option>
              </select>
            </div>

            <div>
              <label htmlFor='position' className={labelClass}>
                Posição
              </label>
              <select
                id='position'
                name='position'
                value={formData.position}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value=''>Selecione</option>
                <option value='Goleiro'>Goleiro</option>
                <option value='Zagueiro'>Zagueiro</option>
                <option value='Lateral'>Lateral</option>
                <option value='Volante'>Volante</option>
                <option value='Meia'>Meia</option>
                <option value='Atacante'>Atacante</option>
                <option value='Outro'>Outro</option>
              </select>
            </div>

            <div>
              <label htmlFor='mother_name' className={labelClass}>
                Nome da mãe
              </label>
              <input
                id='mother_name'
                type='text'
                name='mother_name'
                value={formData.mother_name}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor='father_name' className={labelClass}>
                Nome do pai
              </label>
              <input
                id='father_name'
                type='text'
                name='father_name'
                value={formData.father_name}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>
          </div>
        </FieldSection>

        {/* Contato */}
        <FieldSection
          icon={<Phone size={18} />}
          title='Contato'
          hint='Telefones e e-mail para comunicação.'
        >
          <div className={gridClass}>
            <div>
              <label htmlFor='mobile_phone' className={labelClass}>
                Telefone principal
              </label>
              <MaskedInput
                mask='phone'
                name='mobile_phone'
                value={formData.mobile_phone}
                onChange={handleChange}
                className={fieldClass}
                placeholder='(DD) 99999-9999'
                required
              />
            </div>

            <div>
              <label htmlFor='secondary_phone' className={labelClass}>
                Telefone secundário
              </label>
              <MaskedInput
                mask='phone'
                name='secondary_phone'
                value={formData.secondary_phone}
                onChange={handleChange}
                className={fieldClass}
                placeholder='(DD) 99999-9999'
              />
            </div>

            <div className='sm:col-span-2'>
              <label htmlFor='email' className={labelClass}>
                E-mail
              </label>
              <input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className={fieldClass}
                placeholder='exemplo@email.com'
              />
            </div>
          </div>
        </FieldSection>

        {/* Endereço */}
        <FieldSection
          icon={<MapPin size={18} />}
          title='Endereço'
          hint='Preencha o CEP para completar automaticamente.'
        >
          <div className={gridClass}>
            {/* CEP (primeiro: ao preencher, busca e completa os demais campos) */}
            <div>
              <label htmlFor='zip_code' className={labelClass}>
                CEP
              </label>
              <MaskedInput
                mask='cep'
                name='zip_code'
                value={formData.zip_code}
                onChange={handleChange}
                onBlur={handleCepBlur}
                className={fieldClass}
                placeholder='00000-000'
                required
              />
              {cepLoading && (
                <p className='mt-1 text-xs text-[#8A968F]'>
                  Buscando endereço…
                </p>
              )}
            </div>

            {/* Número */}
            <div>
              <label htmlFor='number' className={labelClass}>
                Número
              </label>
              <input
                id='number'
                type='text'
                name='number'
                value={formData.number}
                onChange={handleChange}
                className={fieldClass}
                required
              />
            </div>

            {/* Endereço */}
            <div className='sm:col-span-2'>
              <label htmlFor='address' className={labelClass}>
                Endereço
              </label>
              <input
                id='address'
                type='text'
                name='address'
                value={formData.address}
                onChange={handleChange}
                className={fieldClass}
                placeholder='Rua, avenida, etc.'
                required
              />
            </div>

            {/* Bairro */}
            <div>
              <label htmlFor='neighborhood' className={labelClass}>
                Bairro
              </label>
              <input
                id='neighborhood'
                type='text'
                name='neighborhood'
                value={formData.neighborhood}
                onChange={handleChange}
                className={fieldClass}
                required
              />
            </div>

            {/* Cidade */}
            <div>
              <label htmlFor='city' className={labelClass}>
                Cidade
              </label>
              <input
                id='city'
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
                className={fieldClass}
                required
              />
            </div>

            {/* Estado */}
            <div className='sm:col-span-2'>
              <label htmlFor='state' className={labelClass}>
                Estado
              </label>
              <select
                id='state'
                name='state'
                value={formData.state}
                onChange={handleChange}
                className={fieldClass}
                required
              >
                <option value=''>Selecione o estado</option>
                <option value='AC'>Acre</option>
                <option value='AL'>Alagoas</option>
                <option value='AP'>Amapá</option>
                <option value='AM'>Amazonas</option>
                <option value='BA'>Bahia</option>
                <option value='CE'>Ceará</option>
                <option value='DF'>Distrito Federal</option>
                <option value='ES'>Espírito Santo</option>
                <option value='GO'>Goiás</option>
                <option value='MA'>Maranhão</option>
                <option value='MT'>Mato Grosso</option>
                <option value='MS'>Mato Grosso do Sul</option>
                <option value='MG'>Minas Gerais</option>
                <option value='PA'>Pará</option>
                <option value='PB'>Paraíba</option>
                <option value='PR'>Paraná</option>
                <option value='PE'>Pernambuco</option>
                <option value='PI'>Piauí</option>
                <option value='RJ'>Rio de Janeiro</option>
                <option value='RN'>Rio Grande do Norte</option>
                <option value='RS'>Rio Grande do Sul</option>
                <option value='RO'>Rondônia</option>
                <option value='RR'>Roraima</option>
                <option value='SC'>Santa Catarina</option>
                <option value='SP'>São Paulo</option>
                <option value='SE'>Sergipe</option>
                <option value='TO'>Tocantins</option>
              </select>
            </div>
          </div>
        </FieldSection>

        {/* Observações */}
        <FieldSection
          icon={<FileText size={18} />}
          title='Observações'
          hint='Informações adicionais (opcional).'
        >
          <textarea
            name='observations'
            value={formData.observations}
            onChange={handleChange}
            className={`${fieldClass} h-28 resize-y`}
            placeholder='Informações adicionais, histórico, etc.'
          />
        </FieldSection>

        {/* Barra fixa de ações */}
        <div className='sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-[#E4E9E7] bg-white/95 px-4 py-3.5 shadow-[0_-2px_14px_rgba(14,32,27,0.06)] backdrop-blur'>
          <button
            type='button'
            onClick={handleCancel}
            className='rounded-lg border border-[#D7DEDB] bg-white px-4 py-2.5 text-sm font-medium text-[#3C4742] transition-colors hover:bg-gray-50'
          >
            {isEditing ? 'Cancelar' : 'Limpar'}
          </button>
          <button
            type='submit'
            disabled={loading}
            className='inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {loading
              ? 'Salvando...'
              : isEditing
                ? 'Atualizar atleta'
                : 'Salvar atleta'}
          </button>
        </div>

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
      </form>
    </div>
  );
}
