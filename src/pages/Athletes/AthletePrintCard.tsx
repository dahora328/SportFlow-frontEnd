import { useState, useEffect, type ReactNode } from 'react';
import { logger } from '../../utils/logger';
import api from '../../services/api';
import { getEnterprises } from '../../services/enterpriseService';
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
  photo_path?: string | File | null;
  position?: string;
  observations?: string;
}

interface Props {
  athlete: Athlete;
  onReady?: () => void;
}

export function AthletePrintCard({ athlete, onReady }: Props) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);
  const [enterpriseLogo, setEnterpriseLogo] = useState<string>('');
  const [enterpriseName, setEnterpriseName] = useState<string>('');
  
  const [logoReady, setLogoReady] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);

  useEffect(() => {
    if (logoReady && photoReady && onReady) {
      onReady();
    }
  }, [logoReady, photoReady, onReady]);

  useEffect(() => {
    async function fetchLogo() {
      try {
        const enterprises = await getEnterprises({ t: new Date().getTime() });
        if (enterprises.length > 0) {
          const ent = enterprises[0];
          setEnterpriseName(ent.fantasy_name || ent.name || '');
          if (ent.logo_path) {
            const apiBaseUrl = api.defaults.baseURL || window.location.origin;
            const baseUrlWithSlash = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
            const baseOrigin = `${new URL(baseUrlWithSlash, window.location.origin).origin}/`;
            
            setEnterpriseLogo(`${baseOrigin}storage/${ent.logo_path}?t=${new Date().getTime()}`);
          } else {
            setLogoReady(true);
          }
        } else {
          setLogoReady(true);
        }
      } catch (error) {
        logger.error('Erro ao buscar logo da empresa', error);
        setLogoReady(true);
      }
    }
    fetchLogo();
  }, []);

  useEffect(() => {
    const photo = athlete.photo_url || athlete.photo_path;
    if (!photo || typeof photo !== 'string') {
      setPhotoReady(true);
      return;
    }

    const normalizedPath = photo.replace(/\\/g, '/');
    if (/^https?:\/\//i.test(normalizedPath)) {
      setImgSrc(normalizedPath);
      return;
    }

    const apiBaseUrl = api.defaults.baseURL || window.location.origin;
    const baseUrlWithSlash = apiBaseUrl.endsWith('/')
      ? apiBaseUrl
      : `${apiBaseUrl}/`;
    const baseOrigin = `${new URL(baseUrlWithSlash, window.location.origin).origin}/`;
    const cleanPath = normalizedPath.startsWith('/')
      ? normalizedPath.slice(1)
      : normalizedPath;
    const filename = cleanPath.split('/').pop() || cleanPath;

    const candidates = new Set<string>();

    candidates.add(new URL(cleanPath, baseOrigin).toString());
    candidates.add(new URL(cleanPath, baseUrlWithSlash).toString());

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

    candidates.add(new URL(`storage/${filename}`, baseOrigin).toString());
    candidates.add(new URL(`uploads/${filename}`, baseOrigin).toString());
    candidates.add(
      new URL(`storage/uploads/${filename}`, baseOrigin).toString(),
    );
    candidates.add(new URL(`storage/${filename}`, baseUrlWithSlash).toString());
    candidates.add(new URL(`uploads/${filename}`, baseUrlWithSlash).toString());

    const urls = Array.from(candidates);

    setImgSrc(urls[0]);
    setFallbackUrls(urls.slice(1));
  }, [athlete]);

  const now = new Date();
  const printDate = now.toLocaleDateString('pt-BR');
  const printTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className='
        w-[210mm]
        min-h-[297mm]
        bg-white
        text-[#3C4742]
        mx-auto
        relative
        flex
        flex-col
      '
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* Marca d'água */}
      {enterpriseLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src={enterpriseLogo}
            alt="Marca d'água"
            className="w-3/4 max-w-[500px] object-contain opacity-[0.06]"
            onLoad={() => setLogoReady(true)}
            onError={() => setLogoReady(true)}
          />
        </div>
      )}

      {/* Conteúdo (z-10 para ficar acima da marca d'água) */}
      <div className='relative z-10 flex flex-1 flex-col px-10 pt-6 pb-5'>
        {/* Cabeçalho */}
        <header className='flex items-center justify-between border-b-2 border-[#3C4742] pb-3'>
          <div className='flex items-center gap-4'>
            {enterpriseLogo && (
              <img
                src={enterpriseLogo}
                alt='Logo da Empresa'
                className='h-14 w-14 object-contain'
              />
            )}
            <div>
              {enterpriseName && (
                <h2 className='text-xl font-bold uppercase tracking-wide text-[#3C4742]'>
                  {enterpriseName}
                </h2>
              )}
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-[#8A968F]'>
                Ficha de Cadastro do Atleta
              </p>
            </div>
          </div>
          <div className='text-right text-xs text-[#8A968F]'>
            <p className='font-semibold text-[#5C6A64]'>Gerado por SportFlow</p>
            <p>
              Emitido em {printDate} às {printTime}
            </p>
          </div>
        </header>

        {/* Identificação: Foto + dados principais */}
        <section className='mt-4 flex gap-6'>
          {/* Foto */}
          <div className='flex w-32 shrink-0 flex-col items-center'>
            <div className='h-40 w-32 overflow-hidden rounded-lg border border-[#D7DEDB] bg-[#F1F4F3] flex items-center justify-center'>
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={athlete.full_name}
                  className='h-full w-full object-cover'
                  onLoad={() => setPhotoReady(true)}
                  onError={() => {
                    if (fallbackUrls.length > 0) {
                      setImgSrc(fallbackUrls[0]);
                      setFallbackUrls(prev => prev.slice(1));
                    } else {
                      setImgSrc('');
                      setPhotoReady(true);
                    }
                  }}
                />
              ) : (
                <span className='text-sm text-[#8A968F]'>Sem foto</span>
              )}
            </div>
          </div>

          {/* Nome + destaque */}
          <div className='flex flex-1 flex-col justify-center'>
            <p className='text-xs font-semibold uppercase tracking-wider text-[#8A968F]'>
              Atleta
            </p>
            <h1 className='text-2xl font-bold leading-tight text-[#3C4742]'>
              {athlete.full_name}
            </h1>
            <div className='mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5'>
              <InfoItem label='CPF' value={formatDocument(athlete.document)} />
              <InfoItem label='Posição' value={athlete.position} />
              <InfoItem
                label='Data de nascimento'
                value={formatDate(athlete.birth_date)}
              />
              <InfoItem label='Gênero' value={athlete.gender} />
              <InfoItem label='Estado civil' value={athlete.marital_status} />
            </div>
          </div>
        </section>

        {/* Contato */}
        <Section title='Contato'>
          <InfoItem
            label='Telefone principal'
            value={formatPhone(athlete.mobile_phone)}
          />
          <InfoItem
            label='Telefone secundário'
            value={
              athlete.secondary_phone
                ? formatPhone(athlete.secondary_phone)
                : '—'
            }
          />
          <InfoItem label='E-mail' value={athlete.email} className='col-span-2' />
        </Section>

        {/* Endereço */}
        <Section title='Endereço'>
          <InfoItem
            label='Logradouro'
            value={`${athlete.address}, ${athlete.number}`}
            className='col-span-2'
          />
          <InfoItem label='Bairro' value={athlete.neighborhood} />
          <InfoItem label='CEP' value={formatZipCode(athlete.zip_code)} />
          <InfoItem label='Cidade' value={athlete.city} />
          <InfoItem label='Estado' value={athlete.state} />
        </Section>

        {/* Filiação */}
        <Section title='Filiação'>
          <InfoItem label='Nome da mãe' value={athlete.mother_name} />
          <InfoItem label='Nome do pai' value={athlete.father_name} />
        </Section>

        {/* Observações */}
        {athlete.observations && (
          <Section title='Observações'>
            <div className='col-span-2'>
              <p className='whitespace-pre-line font-medium text-[#3C4742]'>
                {athlete.observations}
              </p>
            </div>
          </Section>
        )}

      </div>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value?: string;
  className?: string;
}

function InfoItem({ label, value, className = '' }: InfoItemProps) {
  return (
    <div className={className}>
      <p className='text-xs font-medium uppercase tracking-wide text-[#8A968F]'>
        {label}
      </p>
      <p className='font-semibold text-[#3C4742]'>{value || '—'}</p>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className='mt-6'>
      <h3 className='mb-3 text-sm font-bold uppercase tracking-wider text-[#3C4742]'>
        <span className='inline-block border-b-2 border-[#5C6A64] pb-1'>
          {title}
        </span>
      </h3>
      <div className='grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-[#E4E9E7] bg-[#FAFBFB] p-4'>
        {children}
      </div>
    </section>
  );
}
