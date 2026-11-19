import { useNavigate } from 'react-router-dom';
import markImg from '../../assets/images/SportFlow/Logo sem fundo1.png';

/* Marca SportFlow: seta ascendente com rastro de movimento (núcleo do logo). */
function FlowMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <path
        d="M7 25 L25 7"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <path
        d="M16 7 H25 V16"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="20" r="1.5" fill="currentColor" />
      <circle cx="12.5" cy="17.5" r="1.1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/* Dados de amostra: pré-visualização do elenco (não são dados reais do usuário). */
const ROSTER = [
  { name: 'Lucas Andrade', position: 'Zagueiro', age: 19, initials: 'LA' },
  { name: 'Mateus Ribeiro', position: 'Meia', age: 17, initials: 'MR' },
  { name: 'Gabriel Fontes', position: 'Atacante', age: 21, initials: 'GF' },
  { name: 'Rafael Nunes', position: 'Goleiro', age: 18, initials: 'RN' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing relative flex min-h-screen flex-col overflow-hidden bg-ground text-left font-sans text-ink">
      <style>{landingCss}</style>

      {/* Marca d'água: trajetória ascendente, discreta, atrás do conteúdo. */}
      <svg
        className="pointer-events-none absolute -right-24 -top-16 hidden h-[640px] w-[640px] text-brand-600/[0.05] md:block"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <path d="M12 92 L84 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M60 20 H84 V44" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Barra superior */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-950">
            <img src={markImg} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">SportFlow</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
        >
          Entrar
          <span aria-hidden="true">&rarr;</span>
        </button>
      </header>

      {/* Conteúdo principal */}
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-4">
        {/* Coluna de texto */}
        <div className="max-w-xl text-left">
          <p className="landing-rise mb-5 flex items-center gap-2 text-sm font-medium text-brand-700" style={{ animationDelay: '0ms' }}>
            <FlowMark className="h-4 w-4" />
            Sistema de gerenciamento de atletas
          </p>

          <h1 className="landing-rise font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]" style={{ animationDelay: '60ms' }}>
            A base de atletas do seu clube,
            <br className="hidden sm:block" /> sempre em movimento.
          </h1>

          <p className="landing-rise mt-6 max-w-[52ch] text-lg leading-relaxed text-ink/70" style={{ animationDelay: '120ms' }}>
            Centralize o cadastro, importe planilhas e emita as fichas dos seus
            atletas num só lugar — tudo atualizado, organizado e seguro.
          </p>

          <div className="landing-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animationDelay: '180ms' }}>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ground active:translate-y-0"
            >
              Entrar no sistema
              <FlowMark className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Coluna do painel — elenco em pinho profundo (o conteúdo real do produto) */}
        <div className="landing-panel relative">
          {/* Seta ascendente que sobe ao lado do painel */}
          <svg
            className="pointer-events-none absolute -left-4 bottom-6 top-6 hidden w-10 text-brand-600 lg:block"
            viewBox="0 0 40 320"
            fill="none"
            aria-hidden="true"
          >
            <path className="landing-draw" d="M20 300 L20 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path className="landing-draw" d="M9 55 L20 36 L31 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle className="landing-dot" cx="20" cy="230" r="2.5" fill="currentColor" />
            <circle className="landing-dot" cx="20" cy="175" r="2.5" fill="currentColor" style={{ animationDelay: '0.5s' }} />
            <circle className="landing-dot" cx="20" cy="120" r="2.5" fill="currentColor" style={{ animationDelay: '1s' }} />
          </svg>

          <div className="overflow-hidden rounded-2xl bg-pine-950 shadow-xl shadow-pine-950/20 ring-1 ring-pine-900">
            {/* Cabeçalho do painel */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <div className="flex items-center gap-2 text-pine-300">
                <FlowMark className="h-4 w-4 text-brand-50" />
                <span className="font-display text-sm font-medium text-white">Elenco</span>
              </div>
              <span className="text-xs font-medium text-pine-400">sportflow</span>
            </div>

            {/* Cabeçalho das colunas */}
            <div className="grid grid-cols-[1fr_auto] gap-4 px-5 pb-2 pt-4 text-xs font-medium text-pine-400">
              <span>Atleta</span>
              <span className="pr-1">Idade</span>
            </div>

            {/* Linhas do elenco */}
            <ul className="px-3 pb-3">
              {ROSTER.map((a, i) => (
                <li
                  key={a.name}
                  className={`landing-row grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl px-2.5 py-2.5 ${
                    i === 0 ? 'bg-brand-600/15 ring-1 ring-brand-600/40' : ''
                  }`}
                  style={{ animationDelay: `${260 + i * 90}ms` }}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
                      i === 0 ? 'bg-brand-600 text-white' : 'bg-white/10 text-pine-300'
                    }`}
                  >
                    {a.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">{a.name}</span>
                    <span className="block text-xs text-pine-400">{a.position}</span>
                  </span>
                  <span className="pr-1 text-sm tabular-nums text-pine-300">{a.age}</span>
                </li>
              ))}
            </ul>

            {/* Rodapé do painel */}
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3.5">
              <span className="text-sm text-pine-300">
                <span className="font-semibold text-white">248</span> atletas cadastrados
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-50">
                <FlowMark className="h-3.5 w-3.5" />
                atualizado agora
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6">
        <p className="text-sm text-ink/45">
          &copy; {new Date().getFullYear()} SportFlow &middot; Sistema de gerenciamento de atletas
        </p>
      </footer>
    </div>
  );
}

const landingCss = `
.landing-rise, .landing-row { opacity: 0; }
@keyframes landingRise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes landingRowIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.landing-rise { animation: landingRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.landing-row  { animation: landingRowIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
.landing-panel { animation: landingRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: 140ms; opacity: 0; }

.landing-draw { stroke-dasharray: 320; stroke-dashoffset: 320; animation: landingDraw 1.1s ease-out 0.5s forwards; }
@keyframes landingDraw { to { stroke-dashoffset: 0; } }

.landing-dot { opacity: 0; animation: landingDot 2.4s ease-in-out 1.4s infinite; }
@keyframes landingDot {
  0%   { opacity: 0; transform: translateY(8px); }
  20%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-8px); }
}

@media (prefers-reduced-motion: reduce) {
  .landing-rise, .landing-row, .landing-panel { animation: none; opacity: 1; }
  .landing-draw { stroke-dashoffset: 0; animation: none; }
  .landing-dot { animation: none; opacity: 1; }
}
`;
