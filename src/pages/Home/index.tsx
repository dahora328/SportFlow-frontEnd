/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback, type ChangeEvent } from 'react';
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
  Plus,
  Search,
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

// Iniciais para o avatar (até 2 letras do nome).
function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
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

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
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

  const actionBtn =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E9E7] bg-white text-[#5C6A64] transition-colors hover:bg-gray-50';

  return (
    <div className='flex flex-col gap-6'>
      {/* Cabeçalho */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='font-display text-2xl font-semibold tracking-tight'>Atletas</h1>
          <p className='mt-1 text-sm text-[#5C6A64]'>
            Gerencie os atletas cadastrados na {companyName}.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {canManageData && (
            <>
              <button
                type='button'
                onClick={handleExport}
                disabled={exporting}
                title='Exportar lista para Excel (.xlsx)'
                className='inline-flex items-center gap-2 rounded-lg border border-[#D7DEDB] bg-white px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60'
              >
                <Download size={16} />
                {exporting ? 'Exportando...' : 'Exportar'}
              </button>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                title='Importar atletas de um arquivo .csv ou .xlsx'
                className='inline-flex items-center gap-2 rounded-lg border border-[#D7DEDB] bg-white px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60'
              >
                <Upload size={16} />
                {importing ? 'Importando...' : 'Importar CSV'}
              </button>
              <button
                type='button'
                onClick={handleDownloadTemplate}
                title='Baixar o modelo de planilha para importação'
                className='inline-flex items-center rounded-lg border border-[#D7DEDB] bg-white px-3.5 py-2.5 text-sm font-medium text-[#5C6A64] transition-colors hover:bg-gray-50'
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
          <Link
            to='/athletes'
            className='inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700'
          >
            <Plus size={17} />
            Cadastrar atleta
          </Link>
        </div>
      </header>

      {/* Indicador */}
      <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-3'>
        <div className='rounded-xl border border-[#E4E9E7] bg-white px-4 py-4'>
          <div className='text-xs text-[#6B7772]'>Total de atletas</div>
          <div className='mt-2 font-display text-2xl font-semibold leading-none'>
            {meta?.total ?? athletes.length}
          </div>
        </div>
        <div className='rounded-xl border border-[#E4E9E7] bg-white px-4 py-4'>
          <div className='text-xs text-[#6B7772]'>Resultados nesta página</div>
          <div className='mt-2 font-display text-2xl font-semibold leading-none'>
            {athletes.length}
          </div>
        </div>
        <div className='rounded-xl border border-[#E4E9E7] bg-white px-4 py-4'>
          <div className='text-xs text-[#6B7772]'>Página</div>
          <div className='mt-2 font-display text-2xl font-semibold leading-none'>
            {meta?.current_page ?? 1}
            <span className='text-sm font-medium text-[#8A968F]'> / {meta?.last_page ?? 1}</span>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <section className='overflow-hidden rounded-2xl border border-[#E4E9E7] bg-white shadow-sm'>
        <div className='border-b border-[#EEF2F0] p-4'>
          <div className='relative max-w-sm'>
            <Search
              size={17}
              className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A968F]'
            />
            <input
              type='search'
              placeholder='Buscar por nome ou CPF'
              aria-label='Buscar atleta'
              className='w-full rounded-lg border border-[#D7DEDB] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20'
              value={searchAthlete}
              onChange={e => setSearchAthlete(e.target.value)}
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full border-collapse text-sm'>
            <thead>
              <tr className='bg-[#FAFBFB] text-left'>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-xs font-semibold text-[#6B7772]'>Atleta</th>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-xs font-semibold text-[#6B7772]'>Data de nascimento</th>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-xs font-semibold text-[#6B7772]'>CPF</th>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-xs font-semibold text-[#6B7772]'>Atualizado em</th>
                <th className='border-b border-[#EEF2F0] px-4 py-3 text-right text-xs font-semibold text-[#6B7772]'>Ações</th>
              </tr>
            </thead>
            <tbody>
              {athletes?.map((athlete: any) => (
                <tr key={athlete.id} className='transition-colors hover:bg-[#FAFBFB]'>
                  <td className='border-b border-[#F1F4F3] px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-700'>
                        {getInitials(athlete.full_name)}
                      </div>
                      <span className='font-medium text-ink'>{athlete.full_name}</span>
                    </div>
                  </td>
                  <td className='border-b border-[#F1F4F3] px-4 py-3 text-[#3C4742]'>
                    {formatDate(athlete.birth_date)}
                  </td>
                  <td className='border-b border-[#F1F4F3] px-4 py-3 text-[#3C4742] tabular-nums'>
                    {formatCPF(athlete.document)}
                  </td>
                  <td className='border-b border-[#F1F4F3] px-4 py-3 text-[#3C4742]'>
                    {athlete.updated_at ? formatDate(athlete.updated_at) : '-'}
                  </td>
                  <td className='border-b border-[#F1F4F3] px-4 py-3'>
                    <div className='flex justify-end gap-1.5'>
                      <Link
                        onClick={() => handleLoadAthleteData(athlete.id)}
                        to={`/athletes/${athlete.id}`}
                        className={actionBtn}
                        title='Editar atleta'
                        aria-label={`Editar ${athlete.full_name}`}
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handlePrintAthlete(athlete)}
                        className={actionBtn}
                        title='Imprimir ficha'
                        aria-label={`Imprimir ficha de ${athlete.full_name}`}
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        type='button'
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeteleAthlete(athlete.id);
                        }}
                        title='Excluir atleta'
                        aria-label={`Excluir ${athlete.full_name}`}
                        className='flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0DAD8] bg-white text-[#C2453D] transition-colors hover:bg-red-50'
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && athletes.length === 0 && (
                <tr>
                  <td colSpan={5} className='px-4 py-10 text-center text-[#8A968F]'>
                    Nenhum atleta encontrado.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={5} className='px-4 py-10 text-center text-[#8A968F]'>
                    Carregando...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com paginação */}
        {meta && meta.total > 0 && (
          <div className='flex flex-col gap-3 border-t border-[#EEF2F0] px-4 py-3 text-sm text-[#5C6A64] sm:flex-row sm:items-center sm:justify-between'>
            <span>
              Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total} atleta
              {meta.total === 1 ? '' : 's'}
            </span>

            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => goToPage(page - 1)}
                disabled={loading || page <= 1}
                className='inline-flex items-center gap-1 rounded-lg border border-[#E4E9E7] bg-white px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
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
                className='inline-flex items-center gap-1 rounded-lg border border-[#E4E9E7] bg-white px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
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
