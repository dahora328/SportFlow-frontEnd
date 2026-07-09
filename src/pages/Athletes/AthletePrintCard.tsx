import { useState, useEffect } from 'react';
import api from '../../services/api';
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
}

interface Props {
  athlete: Athlete;
  onReady?: () => void;
}

export function AthletePrintCard({ athlete, onReady }: Props) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);

  useEffect(() => {
    const photo = athlete.photo_url || athlete.photo_path;
    if (!photo || typeof photo !== 'string') {
      if (onReady) onReady();
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
  }, [athlete, onReady]);

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
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
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
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={athlete.full_name}
              className='w-full h-full object-cover'
              onLoad={() => onReady && onReady()}
              onError={() => {
                if (fallbackUrls.length > 0) {
                  setImgSrc(fallbackUrls[0]);
                  setFallbackUrls(prev => prev.slice(1));
                } else {
                  setImgSrc('');
                  if (onReady) onReady();
                }
              }}
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
