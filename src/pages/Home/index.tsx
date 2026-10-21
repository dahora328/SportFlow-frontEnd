/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteAthlete,
  getAthleteById,
  getAthletes,
  exportAthletes,
  importAthletes,
  downloadImportTemplate,
  type AthleteData,
} from '../../services/athletesService';
import { getEnterprises } from '../../services/enterpriseService';
import { formatDate, formatCPF } from '../../utils/util';
import {
  Edit,
  Trash,
  Printer,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { ModalBase } from '../../components/Modal/ModalBase';
import { usePrint } from '../../hooks/usePrint';
import { PrintContainer } from '../../components/Print/PrintContainer';
import { AthletePrintCard } from '../Athletes/AthletePrintCard';
import { logger } from '../../utils/logger';
import { useAuth, getUserRole } from '../../contexts/AuthContext';

type PageMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className='px-4 py-2 text-center font-medium text-white'>{children}</th>
  );
}

export function Home() {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [searchAthlete, setSearchAthlete] = useState('');
  const [companyName, setCompanyName] = useState('Time Flow');

  // Paginação
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);

  // Exportação / Importação
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const role = getUserRole(user);
  const canManageData = role === 'gestor' || role === 'superadmin';

  const modal = useModal();

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = usePrint({
    contentRef: printRef,
    documentTitle: 'ficha-atleta',
  });

  const [selectedAthlete, setSelectedAthlete] = useState<AthleteData | null>(
    null,
  );
  const [isReadyToPrint, setIsReadyToPrint] = useState(false);
  const isPrintingRef = useRef(false);

  // Sequência para descartar respostas obsoletas (busca fora de ordem)
  const searchSeqRef = useRef(0);
  // Evita disparar a busca com debounce logo na montagem
  const didMountRef = useRef(false);

  const handlePrintReady = useCallback(() => {
    setIsReadyToPrint(true);
  }, []);

  async function handlePrintAthlete(athlete: AthleteData) {
    isPrintingRef.current = true;
    setIsReadyToPrint(false); // Reseta o status
    setSelectedAthlete(null); // Força a desmontagem para limpar dados antigos

    try {
      const fullAthleteData = await getAthleteById((athlete as any).id);
      setSelectedAthlete(fullAthleteData);
    } catch (error) {
      logger.error('Erro ao buscar dados do atleta para impressão:', error);
      setSelectedAthlete(athlete);
    }
  }

  useEffect(() => {
    if (isReadyToPrint && isPrintingRef.current) {
      setTimeout(() => {
        handlePrint();
        isPrintingRef.current = false;
      }, 100); // Reduzido de 300 para 100. Aguarda o DOM exibir a foto renderizada antes de tirar a cópia para o PDF
    }
  }, [isReadyToPrint, handlePrint]);

  const loadAthletes = useCallback(async (term = '', pageArg = 1) => {
    const seq = ++searchSeqRef.current;
    setLoading(true);
    try {
      const trimmed = term.trim();
      const params: Record<string, unknown> = { page: pageArg };
      if (trimmed) params.search = trimmed;

      const data = await getAthletes(params);

      // Ignora respostas que chegaram fora de ordem (busca antiga)
      if (seq !== searchSeqRef.current) return;

      // Fallback de segurança para suportar vários formatos de resposta da API
      const athletesList =
        data.athletes ||
        (data as any).data ||
        (Array.isArray(data) ? data : []);

      setAthletes(athletesList);
      setMeta((data.meta as PageMeta) ?? null);
      setPage(pageArg);
    } catch (error) {
      if (seq !== searchSeqRef.current) return;
      logger.error('Erro ao carregar atletas', error);
    } finally {
      if (seq === searchSeqRef.current) setLoading(false);
    }
  }, []);

  function goToPage(targetPage: number) {
    if (loading) return;
    const lastPage = meta?.last_page ?? 1;
    if (targetPage < 1 || targetPage > lastPage || targetPage === page) return;
    loadAthletes(searchAthlete, targetPage);
  }

  async function loadEnterpriseName() {
    try {
      const enterprises = await getEnterprises();
      if (enterprises && enterprises.length > 0) {
        const enterprise = enterprises[0];
        setCompanyName(enterprise.fantasy_name || enterprise.name || 'Time Flow');
      }
    } catch (error) {
      logger.error('Erro ao carregar dados da empresa:', error);
    }
  }

  useEffect(() => {
    loadAthletes();
    loadEnterpriseName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Busca com debounce: aguarda o usuário parar de digitar antes de chamar a API
  useEffect(() => {
    // Pula a primeira execução — a lista já foi carregada na montagem
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const handler = setTimeout(() => {
      // Sempre volta para a página 1 ao mudar a busca, para não ficar numa
      // "página 3" de um filtro que só tem 1 página.
      loadAthletes(searchAthlete, 1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchAthlete, loadAthletes]);

  async function handleLoadAthleteData(athleteId: number) {
    try {
      const result = await getAthleteById(athleteId);

      logger.log('Dados do atleta:', result);
      //window.location.href = '/home';
    } catch (error) {
      logger.error('Erro ao recuperar atleta:', error);
      alert('Erro ao recuperar atleta!');
    }
  }

  async function handleDeteleAthlete(athleteId: number) {
    modal.openConfirm(
      'Excluir Atleta',
      'Deseja realmente excluir este atleta? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await deleteAthlete(athleteId);
          // Recarrega a página atual para manter o total e a paginação corretos.
          // Se a página ficou vazia (era o último registro dela), volta uma página.
          const nextPage =
            athletes.length === 1 && page > 1 ? page - 1 : page;
          await loadAthletes(searchAthlete, nextPage);
          modal.openSuccess('Sucesso', 'O atleta foi excluído corretamente.');
        } catch (error) {
          logger.error('Erro ao deletar:', error);
          modal.openError(
            'Erro' + error,
            'Não foi possível excluir o atleta. Tente novamente.',
          );
        }
      },
      'Excluir',
      'Cancelar',
    );
  }

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      await exportAthletes(searchAthlete.trim() || undefined);
    } catch (error: any) {
      logger.error('Erro ao exportar:', error);
      modal.openError(
        'Erro ao exportar',
        error?.message || 'Não foi possível exportar os atletas.',
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      await downloadImportTemplate();
    } catch (error: any) {
      logger.error('Erro ao baixar modelo:', error);
      modal.openError(
        'Erro',
        error?.message || 'Não foi possível baixar o modelo.',
      );
    }
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Permite reimportar o mesmo arquivo em seguida, limpando o input.
    event.target.value = '';
    if (!file) return;

    setImporting(true);
    try {
      const result = await importAthletes(file);

      // Monta um resumo legível (o ModalBase respeita quebras de linha).
      let summary = `Importados: ${result.imported}\nCom erros/ignorados: ${result.skipped}`;
      if (result.errors?.length) {
        const shown = result.errors
          .slice(0, 10)
          .map(e => `Linha ${e.line}: ${e.errors.join('; ')}`)
          .join('\n');
        summary += `\n\nDetalhes:\n${shown}`;
        if (result.errors.length > 10) {
          summary += `\n... e mais ${result.errors.length - 10} linha(s).`;
        }
      }

      await loadAthletes(searchAthlete, 1);

      if (result.imported > 0) {
        modal.openSuccess('Importação concluída', summary);
      } else {
        modal.openError('Nenhum atleta importado', summary);
      }
    } catch (error: any) {
      logger.error('Erro ao importar:', error);
      modal.openError(
        'Erro na importação',
        error?.message || 'Não foi possível importar o arquivo.',
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className='p-6 space-y-6'>
      <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold'>{companyName}</h1>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <div className='relative'>
            <input
              type='search'
              placeholder='Buscar atleta...'
              className='w-64 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500'
              value={searchAthlete}
              onChange={e => setSearchAthlete(e.target.value)}
            />
          </div>
          <div className='flex flex-wrap gap-2 justify-center'>
            <Link
              to='/athletes'
              className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50'
            >
              + Cadastrar atleta
            </Link>

            {canManageData && (
              <>
                <button
                  type='button'
                  onClick={handleExport}
                  disabled={exporting}
                  title='Exportar lista para Excel (.xlsx)'
                  className='inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60'
                >
                  <Download size={16} />
                  {exporting ? 'Exportando...' : 'Exportar (Excel)'}
                </button>

                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  title='Importar atletas de um arquivo .csv ou .xlsx'
                  className='inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60'
                >
                  <Upload size={16} />
                  {importing ? 'Importando...' : 'Importar'}
                </button>

                <button
                  type='button'
                  onClick={handleDownloadTemplate}
                  title='Baixar o modelo de planilha para importação'
                  className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50'
                >
                  Baixar modelo
                </button>

                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.csv,.xlsx,.xls'
                  className='hidden'
                  onChange={handleImportFile}
                />
              </>
            )}
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
              {athletes?.map((athlete: any) => {
                logger.log(athlete);
                return (
                  <tr key={athlete.id} className='hover:bg-gray-200'>
                    <td className='px-4 py-3'>{athlete.full_name}</td>
                    <td className='px-4 py-3'>
                      {formatDate(athlete.birth_date)}
                    </td>
                    <td className='px-4 py-3'>{formatCPF(athlete.document)}</td>
                    <td className='px-4 py-3'>
                      {athlete.updated_at
                        ? formatDate(athlete.updated_at)
                        : '-'}
                    </td>
                    <td className='px-4 py-3 flex gap-4 items-center justify-center'>
                      <Link
                        key={athlete.id}
                        onClick={() => {
                          handleLoadAthleteData(athlete.id);
                        }}
                        to={`/athletes/${athlete.id}`}
                        className='cursor-pointer p-1  rounded-full transition-colors'
                        title='Editar Atleta'
                      >
                        <Edit
                          size={16}
                          className='cursor-pointer text-gray-700 hover:text-gray-900'
                        />
                      </Link>
                      <button
                        type='button'
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeteleAthlete(athlete.id);
                        }}
                        title='Deletar Atleta'
                        className='cursor-pointer p-1  rounded-full transition-colors'
                      >
                        <Trash
                          size={16}
                          className='text-red-500 hover:text-red-700'
                        />
                      </button>
                      <button
                        onClick={() => handlePrintAthlete(athlete)}
                        className='cursor-pointer p-1 rounded-full transition-colors'
                        title='Imprimir Ficha'
                      >
                        <Printer size={16}
                        className='text-black'/>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && athletes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-4 py-8 text-center text-gray-500'
                  >
                    Nenhum atleta encontrado.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-4 py-8 text-center text-gray-500'
                  >
                    Carregando...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com paginação */}
        {meta && meta.total > 0 && (
          <div className='flex flex-col gap-3 border-t border-gray-200 px-4 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between'>
            <span>
              Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total} atleta
              {meta.total === 1 ? '' : 's'}
            </span>

            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => goToPage(page - 1)}
                disabled={loading || page <= 1}
                className='inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <span className='px-2'>
                Página {meta.current_page} de {meta.last_page}
              </span>

              <button
                type='button'
                onClick={() => goToPage(page + 1)}
                disabled={loading || page >= meta.last_page}
                className='inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modal único (fora do map) — usado por exclusão, exportação e importação */}
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

      {/* O Container de impressão DEVE ficar fora da tabela (fora do map) */}
      <PrintContainer innerRef={printRef}>
        {selectedAthlete && (
          <AthletePrintCard
            athlete={selectedAthlete}
            onReady={handlePrintReady}
          />
        )}
      </PrintContainer>
    </div>
  );
}
