import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Eye,
  FileWarning,
  Link2,
  LockKeyhole,
  Maximize2,
  Mail,
  Minimize2,
  Menu,
  Moon,
  Paperclip,
  Printer,
  RotateCcw,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  X,
} from 'lucide-react';
import { getDomain as getPublicSuffixDomain } from 'tldts';
import {
  b,
  learnCases,
  quizBank,
  techniqueCards,
  translations,
  urlExamples,
  type EmailData,
  type Language,
  type Localized,
  type Pin,
  type QuizQuestion,
} from '@/data';

const STORAGE_LANGUAGE = 'phishwise-language';
const STORAGE_THEME = 'phishwise-theme';
const STORAGE_BEST_SCORE = 'phishwise-best-score';

type Theme = 'dark' | 'light';
type QuizMode = 'intro' | 'playing' | 'complete';

type EmailCardProps = {
  email: EmailData;
  language: Language;
  pins?: Pin[];
  reviewState?: boolean;
  isPhishing?: boolean;
  compact?: boolean;
};

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  text: string;
  accent?: 'blue' | 'red' | 'green';
};

const getSavedValue = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const saveValue = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
};

const getInitialLanguage = (): Language => {
  const saved = getSavedValue(STORAGE_LANGUAGE);
  if (saved === 'ar' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en';
};

const getInitialTheme = (): Theme => {
  const saved = getSavedValue(STORAGE_THEME);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

const createQuizSet = (previousIds: string[]): QuizQuestion[] => {
  const previous = new Set(previousIds);
  const available = quizBank.filter((question) => !previous.has(question.id));
  const pool = available.length >= 10 ? available : quizBank;
  const phishing = shuffle(pool.filter((question) => question.isPhishing));
  const legitimate = shuffle(pool.filter((question) => !question.isPhishing));
  const phishingCount = 4 + Math.floor(Math.random() * 3);
  const selected = [...phishing.slice(0, phishingCount), ...legitimate.slice(0, 10 - phishingCount)];
  return shuffle(selected);
};

const getLocalized = (value: Localized, language: Language): string => value[language];

const SectionHeading = ({ eyebrow, title, text, accent = 'blue' }: SectionHeadingProps) => (
  <div className={`section-heading accent-${accent}`}>
    <div className="section-kicker"><span className="kicker-dot" />{eyebrow}</div>
    <h2>{title}</h2>
    <p>{text}</p>
  </div>
);

const EmailCard = ({ email, language, pins = [], reviewState = false, isPhishing = false, compact = false }: EmailCardProps) => {
  const [activePin, setActivePin] = useState<number | null>(pins[0]?.id ?? null);
  const copy = translations[language];
  const active = pins.find((pin) => pin.id === activePin);
  const classForTarget = (target: Pin['target']): string => {
    if (!reviewState) return '';
    if (isPhishing && ['sender', 'subject', 'body', 'link', 'attachment'].includes(target)) return 'email-highlight';
    if (!isPhishing && ['sender', 'footer'].includes(target)) return 'email-positive';
    return '';
  };

  return (
    <div className={`email-shell ${compact ? 'email-shell-compact' : ''}`}>
      <div className="email-toolbar">
        <div className="email-toolbar-left"><span className="traffic-dot red" /><span className="traffic-dot yellow" /><span className="traffic-dot green" /><span className="email-toolbar-label"><Mail size={14} />{copy.emailClient}</span></div>
        <div className="email-toolbar-right"><LockKeyhole size={14} /><span>SIMULATION</span></div>
      </div>
      <div className="email-content">
        {pins.length > 0 && (
          <div className="hotspot-row" aria-label={language === 'ar' ? 'علامات التحليل' : 'Analysis markers'}>
            {pins.map((pin) => (
              <button
                className={`hotspot ${activePin === pin.id ? 'is-active' : ''}`}
                key={pin.id}
                type="button"
                aria-label={`${pin.id}. ${getLocalized(pin.label, language)}`}
                aria-pressed={activePin === pin.id}
                onClick={() => setActivePin(pin.id)}
                onMouseEnter={() => setActivePin(pin.id)}
              >
                <span>{pin.id}</span>{getLocalized(pin.label, language)}
              </button>
            ))}
          </div>
        )}
        {active && (
          <div className="hotspot-tooltip" role="status">
            <div className="tooltip-number">{active.id}</div>
            <div><strong>{getLocalized(active.label, language)}</strong><span>{getLocalized(active.detail, language)}</span></div>
          </div>
        )}
        <div className={`email-meta ${classForTarget('sender')}`}>
          <div className="avatar">{getLocalized(email.senderName, language).slice(0, 1)}</div>
          <div className="sender-stack">
            <strong>{getLocalized(email.senderName, language)}</strong>
            <span dir="ltr" className="technical">&lt;{email.senderAddress}&gt;</span>
            <span className="email-to">{copy.to}: <span dir="ltr" className="technical">you@example.com</span></span>
          </div>
          <time>{email.date}</time>
        </div>
        <div className={`email-subject ${classForTarget('subject')}`}>
          <span>{copy.subject}</span><strong>{getLocalized(email.subject, language)}</strong>
        </div>
        <div className={`email-body ${classForTarget('body')}`}>
          <p>{getLocalized(email.body, language)}</p>
          {email.links && email.links.length > 0 && (
            <div className={`email-links ${classForTarget('link')}`}>
              {email.links.map((link) => (
                <a href="#" key={link.url} onClick={(event) => event.preventDefault()} dir="ltr" className="technical email-link">
                  <Link2 size={15} />{link.text}
                </a>
              ))}
            </div>
          )}
          {email.cta && (
            <a href="#" className="email-cta" onClick={(event) => event.preventDefault()}>{getLocalized(email.cta, language)}<ArrowUpRight size={16} /></a>
          )}
          {email.attachment && (
            <div className={`attachment-chip ${classForTarget('attachment')}`} dir="ltr"><Paperclip size={15} /><span>{email.attachment}</span><span className="attachment-size">SIM</span></div>
          )}
        </div>
        <div className={`email-footer ${classForTarget('footer')}`}>
          <span>{getLocalized(email.footer ?? b('هذه محاكاة تعليمية.', 'This is an educational simulation.'), language)}</span>
        </div>
      </div>
    </div>
  );
};

const StatusList = ({ items, language, positive }: { items: Localized[]; language: Language; positive: boolean }) => (
  <ul className={`signal-list ${positive ? 'signal-positive' : 'signal-negative'}`}>
    {items.map((item, index) => (
      <li key={`${item.en}-${index}`}><span className="signal-icon">{positive ? <Check size={14} /> : <AlertTriangle size={14} />}</span><span>{getLocalized(item, language)}</span></li>
    ))}
  </ul>
);

const LearnSection = ({ language, onQuiz }: { language: Language; onQuiz: () => void }) => {
  const copy = translations[language];
  return (
    <section className="section section-learn" id="learn">
      <SectionHeading eyebrow={copy.learnEyebrow} title={copy.learnTitle} text={copy.learnText} accent="red" />
      <div className="case-grid">
        {learnCases.map((item) => (
          <article className="case-card" key={item.id}>
            <div className="case-card-header">
              <div className="case-number">{item.caseNumber}</div>
              <div className="case-heading"><span>{copy.phishingLabel} / {copy.legitLabel}</span><h3>{getLocalized(item.title, language)}</h3></div>
              <div className={`classification-pill ${item.isPhishing ? 'pill-danger' : 'pill-safe'}`}>{item.isPhishing ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}{item.isPhishing ? copy.phishingLabel : copy.legitLabel}</div>
            </div>
            <EmailCard email={item} language={language} pins={item.pins} />
            <div className="case-analysis">
              <div className="analysis-column">
                <div className="analysis-label"><span className={item.isPhishing ? 'label-icon danger' : 'label-icon safe'}>{item.isPhishing ? <AlertTriangle size={14} /> : <Check size={14} />}</span>{item.isPhishing ? copy.redFlags : copy.legitimacy}</div>
                <StatusList items={item.flags} language={language} positive={!item.isPhishing} />
              </div>
              <div className="lesson-box"><LightbulbIcon /><div><strong>{copy.keyLesson}</strong><p>{getLocalized(item.lesson, language)}</p></div></div>
            </div>
          </article>
        ))}
      </div>
      <div className="section-cta"><div><strong>{language === 'ar' ? 'هل لاحظت النمط؟' : 'Seeing the pattern?'}</strong><span>{language === 'ar' ? 'اختبر نفسك برسائل لم ترها من قبل.' : 'Test yourself on messages you have not seen before.'}</span></div><button className="button button-primary" type="button" onClick={onQuiz}>{copy.startQuiz}<ArrowUpRight size={17} /></button></div>
    </section>
  );
};

const LightbulbIcon = () => <span className="lesson-icon"><Sparkles size={17} /></span>;

const HomeSection = ({ language, onLearn, onQuiz }: { language: Language; onLearn: () => void; onQuiz: () => void }) => {
  const copy = translations[language];
  const highlights = [
    { icon: <Eye size={19} />, title: copy.impersonation, text: copy.impersonationText },
    { icon: <Clock3 size={19} />, title: copy.urgency, text: copy.urgencyText },
    { icon: <Link2 size={19} />, title: copy.maliciousLinks, text: copy.maliciousLinksText },
  ];
  return (
    <section className="hero-section" id="home">
      <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
      <div className="hero-grid-lines" />
      <div className="hero-content">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><span className="pulse-dot" />{copy.heroEyebrow}</div>
          <h1>{copy.heroTitle}</h1>
          <p className="hero-text">{copy.heroText}</p>
          <div className="hero-actions"><button className="button button-primary" type="button" onClick={onLearn}>{copy.heroPrimary}<ArrowUpRight size={18} /></button><button className="button button-ghost" type="button" onClick={onQuiz}><ScanLine size={18} />{copy.heroSecondary}</button></div>
          <div className="hero-note"><ShieldCheck size={16} />{copy.heroNote}</div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="radar-card"><div className="radar-card-top"><span className="radar-label">{copy.radarLabel}</span><span className="radar-status"><span />{copy.radarStatus}</span></div><div className="radar"><div className="radar-ring ring-one" /><div className="radar-ring ring-two" /><div className="radar-ring ring-three" /><div className="radar-sweep" /><div className="radar-center"><ShieldCheck size={26} /></div><span className="radar-mark mark-one" /><span className="radar-mark mark-two" /><span className="radar-mark mark-three" /></div><div className="radar-card-bottom"><span>{copy.radarDomain}</span><strong>{copy.radarAction}</strong><span className="radar-score">03 / 03</span></div></div>
          <div className="floating-chip chip-top"><span className="chip-icon blue"><Link2 size={14} /></span><span><small>{copy.radarChipLink}</small><strong>{copy.radarChipLinkStatus}</strong></span></div>
          <div className="floating-chip chip-bottom"><span className="chip-icon green"><Check size={14} /></span><span><small>{copy.radarChipResult}</small><strong>{copy.radarChipSafe}</strong></span></div>
        </div>
      </div>
      <div className="impact-row"><div className="impact-intro"><span className="eyebrow">{copy.impactEyebrow}</span><h2>{copy.impactTitle}</h2><p>{copy.impactText}</p></div><div className="principle-grid">{highlights.map((item) => <div className="principle-card" key={item.title}><span className="principle-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></div>
    </section>
  );
};

const InspectResult = ({ input, language }: { input: string; language: Language }) => {
  const copy = translations[language];
  if (!input.trim()) return null;
  try {
    const normalized = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Unsupported protocol');
    const host = parsed.hostname.toLowerCase();
    const registrableDomain = getPublicSuffixDomain(host);
    const registrable = registrableDomain ?? host;
    const shortenerDomains = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly'];
    const knownBrands = [
      { name: 'amazon', domains: ['amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de'] },
      { name: 'apple', domains: ['apple.com'] },
      { name: 'docusign', domains: ['docusign.com', 'docusign.net'] },
      { name: 'dropbox', domains: ['dropbox.com'] },
      { name: 'github', domains: ['github.com'] },
      { name: 'google', domains: ['google.com', 'google.co.uk', 'google.ca', 'google.de', 'google.com.au'] },
      { name: 'linkedin', domains: ['linkedin.com'] },
      { name: 'microsoft', domains: ['microsoft.com', 'microsoft365.com', 'microsoftonline.com', 'office.com', 'outlook.com'] },
      { name: 'paypal', domains: ['paypal.com', 'paypal.co.uk', 'paypal.ca', 'paypal.de'] },
    ];
    const labels = host.split('.');
    const isShortened = shortenerDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
    const hasCredentials = Boolean(parsed.username || parsed.password);
    const hasPunycode = labels.some((label) => label.startsWith('xn--'));
    const brandMismatch = knownBrands.find(({ name, domains }) => host.includes(name) && !domains.includes(registrable));
    const isIpOrLocal = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[') || host === 'localhost' || host.endsWith('.local');
    const hasUnusualPort = Boolean(parsed.port && parsed.port !== (parsed.protocol === 'https:' ? '443' : '80'));
    const redirectTarget = [...parsed.searchParams.values()].find((value) => {
      try {
        const target = new URL(value);
        return ['http:', 'https:'].includes(target.protocol) && getPublicSuffixDomain(target.hostname) !== registrableDomain;
      } catch {
        return false;
      }
    });
    const signals: Localized[] = [];
    if (hasCredentials) signals.push(b('يحتوي الرابط على اسم مستخدم أو كلمة مرور قبل المضيف.', 'The URL embeds a username or password before the hostname.'));
    if (isShortened) signals.push(b('هذا نطاق مختصر يخفي الوجهة النهائية للرابط.', 'This is a URL shortener that hides the link’s final destination.'));
    if (brandMismatch) signals.push(b(`يذكر المضيف ${brandMismatch.name} لكن النطاق المسجل هو ${registrable}.`, `The hostname mentions ${brandMismatch.name}, but the registered domain is ${registrable}.`));
    if (hasPunycode) signals.push(b('يحتوي اسم المضيف على أحرف دولية مشفّرة قد تخفي شكلاً مشابهاً.', 'The hostname contains encoded international characters that may disguise a look-alike.'));
    if (isIpOrLocal) signals.push(b('هذا عنوان IP أو مضيف محلي، وليس نطاقاً عاماً مسجلاً.', 'This is an IP address or local host, not a public registered domain.'));
    if (!registrableDomain && !isIpOrLocal) signals.push(b('تعذر تحديد نطاق عام مسجل لهذا المضيف.', 'A public registered domain could not be identified for this hostname.'));
    if (hasUnusualPort) signals.push(b('يستخدم الرابط منفذاً غير معتاد.', 'The URL uses a non-standard port.'));
    if (parsed.protocol === 'http:') signals.push(b('الاتصال يستخدم HTTP غير المشفّر.', 'The connection uses unencrypted HTTP.'));
    if (redirectTarget) signals.push(b(`يتضمن الرابط وجهة تحويل مختلفة: ${new URL(redirectTarget).hostname}.`, `The URL contains a redirect target on a different domain: ${new URL(redirectTarget).hostname}.`));
    const isSuspicious = signals.length > 0;
    const hostPrefix = registrable === host ? '' : host.slice(0, -registrable.length);
    return <div className={`inspect-result ${isSuspicious ? 'is-suspicious' : ''}`} aria-live="polite"><div className="result-domain"><span className="result-label">{copy.realDomain}</span><strong dir="ltr" className="technical">{registrable}</strong>{isSuspicious ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}</div><div className="scan-summary">{isSuspicious ? copy.urlScanWarning : copy.urlScanNoSignals}</div><div className="result-url" dir="ltr"><span>{parsed.protocol}//{hostPrefix}</span><mark>{registrable}</mark>{parsed.port && <span>:{parsed.port}</span>}<span>{parsed.pathname || '/'}{parsed.search}{parsed.hash}</span></div>{signals.length > 0 && <ul className="scan-signals">{signals.map((signal, index) => <li key={`${signal.en}-${index}`}><AlertTriangle size={14} /><span>{getLocalized(signal, language)}</span></li>)}</ul>}<div className="result-explanation"><span className="result-label">{copy.urlExplanation}</span><p>{getLocalized(b('هذا فحص إرشادي للنص فقط، وليس خدمة سمعة أو تأكيداً بأن الموقع آمن.', 'This is a text-based heuristic, not a reputation service or confirmation that a site is safe.'), language)}</p></div><div className="result-safe"><ShieldCheck size={15} />{copy.urlSafety}</div></div>;
  } catch {
    return <div className="inspect-error" aria-live="polite"><AlertTriangle size={17} />{language === 'ar' ? 'تعذر قراءة النص كرابط HTTP أو HTTPS. جرّب عنواناً مثل example.com/path.' : 'Could not read this as an HTTP or HTTPS URL. Try an address such as example.com/path.'}</div>;
  }
};

const TechniquesSection = ({ language }: { language: Language }) => {
  const copy = translations[language];
  const [openTechnique, setOpenTechnique] = useState<string>('domains');
  const [urlInput, setUrlInput] = useState('microsoft365.com-aboracorp.net/share');
  const [inspectedUrl, setInspectedUrl] = useState(urlInput);
  return (
    <section className="section section-techniques" id="techniques">
      <SectionHeading eyebrow={copy.techniquesEyebrow} title={copy.techniquesTitle} text={copy.techniquesText} />
      <div className="technique-layout"><div className="technique-list">{techniqueCards.map((technique, index) => { const open = openTechnique === technique.id; return <article className={`technique-card ${open ? 'is-open' : ''}`} key={technique.id}><button type="button" className="technique-toggle" onClick={() => setOpenTechnique(open ? '' : technique.id)} aria-expanded={open}><span className="technique-index">{String(index + 1).padStart(2, '0')}</span><span className="technique-name"><strong>{getLocalized(technique.title, language)}</strong><small>{getLocalized(technique.definition, language)}</small></span><span className="technique-chevron"><ChevronDown size={19} /></span></button>{open && <div className="technique-detail"><div className="tiny-example"><span>{copy.tinyExample}</span><code dir="ltr">{getLocalized(technique.example, language)}</code></div><div className="detect-copy"><span>{copy.detectIt}</span><p>{getLocalized(technique.detect, language)}</p></div></div>}</article>; })}</div><div className="inspector-panel"><div className="inspector-header"><div className="inspector-icon"><Search size={20} /></div><div><h3>{copy.urlInspectorTitle}</h3><p>{copy.urlInspectorText}</p></div></div><label className="input-label" htmlFor="url-input">{copy.chooseExample}</label><div className="url-examples">{urlExamples.map((example) => <button key={example.url} type="button" onClick={() => { setUrlInput(example.label); setInspectedUrl(example.label); }}>{example.label}</button>)}</div><form className="url-input-wrap" onSubmit={(event) => { event.preventDefault(); setInspectedUrl(urlInput); }}><Link2 size={17} /><input id="url-input" type="text" value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder={copy.urlPlaceholder} dir="ltr" /><button type="submit" aria-label={copy.inspect}><Search size={17} /><span>{copy.inspect}</span></button></form><InspectResult input={inspectedUrl} language={language} /></div></div>
    </section>
  );
};

const QuizSection = ({ language, quizMode, quizSet, currentIndex, answers, score, onStart, onAnswer, onNext, onRetry, onBackToLearn }: { language: Language; quizMode: QuizMode; quizSet: QuizQuestion[]; currentIndex: number; answers: Record<string, boolean>; score: number; onStart: () => void; onAnswer: (value: boolean) => void; onNext: () => void; onRetry: () => void; onBackToLearn: () => void }) => {
  const copy = translations[language];
  const [simulationExpanded, setSimulationExpanded] = useState(false);
  const [simulationClosing, setSimulationClosing] = useState(false);
  const current = quizSet[currentIndex];
  const answered = current ? Object.prototype.hasOwnProperty.call(answers, current.id) : false;
  const userAnswer = current ? answers[current.id] : undefined;
  const isCorrect = current && userAnswer === current.isPhishing;
  const incorrectCategories = quizSet.filter((question) => Object.prototype.hasOwnProperty.call(answers, question.id) && answers[question.id] !== question.isPhishing).map((question) => question.category);
  const categoryLabels: Record<string, string> = { categoryUrl: copy.categoryUrl, categoryUrgency: copy.categoryUrgency, categoryAttachment: copy.categoryAttachment, categoryIdentity: copy.categoryIdentity, categoryContext: copy.categoryContext };
  const missedCategories = [...new Set(incorrectCategories)].map((category) => categoryLabels[category]).filter(Boolean);
  const rating = score >= 8 ? copy.ratingExcellent : score >= 5 ? copy.ratingGood : copy.ratingPractice;

  useEffect(() => {
    if (!simulationExpanded) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setSimulationClosing(true);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [simulationExpanded]);

  useEffect(() => {
    if (!simulationClosing) return;
    const closeTimer = window.setTimeout(() => {
      setSimulationExpanded(false);
      setSimulationClosing(false);
    }, 320);
    return () => window.clearTimeout(closeTimer);
  }, [simulationClosing]);

  useEffect(() => {
    if (quizMode !== 'playing') {
      setSimulationExpanded(false);
      setSimulationClosing(false);
    }
  }, [quizMode]);

  return (
    <section className={`section section-quiz ${simulationExpanded ? 'is-expanded' : ''} ${simulationClosing ? 'is-closing' : ''}`} id="quiz" role={simulationExpanded ? 'dialog' : undefined} aria-modal={simulationExpanded || undefined} aria-label={simulationExpanded ? (language === 'ar' ? 'اختبار المحاكاة' : 'Simulation quiz') : undefined}>
      <SectionHeading eyebrow={copy.quizEyebrow} title={copy.quizTitle} text={copy.quizText} accent="green" />
      {quizMode === 'playing' && <div className="quiz-size-control"><button className="quiz-size-toggle" type="button" aria-label={simulationExpanded ? (language === 'ar' ? 'تصغير المحاكاة' : 'Make simulation smaller') : (language === 'ar' ? 'تكبير المحاكاة' : 'Make simulation bigger')} aria-pressed={simulationExpanded} onClick={() => { if (simulationExpanded) setSimulationClosing(true); else setSimulationExpanded(true); }}>{simulationExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}<span>{simulationExpanded ? (language === 'ar' ? 'تصغير المحاكاة' : 'Smaller simulation') : (language === 'ar' ? 'تكبير المحاكاة' : 'Bigger simulation')}</span></button></div>}
      {quizMode === 'intro' && <div className="quiz-intro"><div className="quiz-intro-visual"><div className="quiz-target"><CircleHelp size={42} /><span>10</span></div><div className="quiz-mini-stat"><strong>05 / 05</strong><span>{language === 'ar' ? 'تقريباً شرعي / تصيد' : 'Approx. legit / phish'}</span></div></div><div className="quiz-intro-copy"><span className="eyebrow">{copy.chooseAnswer}</span><h3>{language === 'ar' ? 'افحص البريد، ثم اتخذ قراراً هادئاً.' : 'Inspect the inbox, then make a calm call.'}</h3><p>{language === 'ar' ? 'كل جولة تعرض رسالة محاكاة. بعد إجابتك سترى سبب التصنيف والدرس الذي يستحق الاحتفاظ به.' : 'Each round shows a simulated email. After your answer, you will see the reasoning and the lesson worth keeping.'}</p><button className="button button-primary" type="button" onClick={onStart}>{copy.startQuiz}<ArrowUpRight size={17} /></button></div></div>}
      {quizMode === 'playing' && current && <div className="quiz-play"><div className="quiz-progress-row"><div><span>{copy.question} {currentIndex + 1} / {quizSet.length}</span><div className="progress-track"><div className="progress-fill" style={{ width: `${((currentIndex + (answered ? 1 : 0)) / quizSet.length) * 100}%` }} /></div></div><div className="score-badge"><Trophy size={16} /><span>{copy.score}</span><strong>{score}</strong></div></div><div className="quiz-email-heading"><span className="eyebrow">{copy.chooseAnswer}</span><h3>{getLocalized(current.subject, language)}</h3></div><EmailCard email={current} language={language} reviewState={answered} isPhishing={current.isPhishing} compact />{answered && <div className={`feedback-card ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}><div className="feedback-title"><span className="feedback-icon">{isCorrect ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}</span><strong>{isCorrect ? copy.correct : copy.incorrect}</strong><span className="answer-chip">{current.isPhishing ? copy.phishing : copy.legit}</span></div><div className="feedback-columns"><div><span className="feedback-label">{copy.explanation}</span><p>{getLocalized(current.explanation, language)}</p></div><div><span className="feedback-label">{current.isPhishing ? copy.redFlags : copy.legitimacy}</span><StatusList items={current.flags} language={language} positive={!current.isPhishing} /></div></div><div className="lesson-box"><LightbulbIcon /><div><strong>{copy.keyLesson}</strong><p>{getLocalized(current.lesson, language)}</p></div></div><button className="button button-primary feedback-next" type="button" onClick={onNext}>{currentIndex === quizSet.length - 1 ? copy.quizComplete : copy.nextQuestion}<ArrowUpRight size={17} /></button></div>}{!answered && <div className="answer-actions"><span>{copy.chooseAnswer}</span><div><button className="answer-button phishing-button" type="button" onClick={() => onAnswer(true)}><AlertTriangle size={19} />{copy.phishing}</button><button className="answer-button legit-button" type="button" onClick={() => onAnswer(false)}><CheckCircle2 size={19} />{copy.legit}</button></div></div>}</div>}
      {quizMode === 'complete' && <div className="quiz-results"><div className="results-hero"><div className="trophy-ring"><Trophy size={32} /></div><span className="eyebrow">{copy.quizComplete}</span><h3>{copy.yourScore} <strong>{score}<small> / {quizSet.length}</small></strong></h3><p>{rating}</p></div><div className="results-grid"><div className="review-panel"><div className="panel-title"><span>{copy.review}</span><span>{score} / {quizSet.length}</span></div><div className="review-list">{quizSet.map((question, index) => { const correct = answers[question.id] === question.isPhishing; return <div className={`review-item ${correct ? 'review-correct' : 'review-wrong'}`} key={question.id}><span className="review-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{getLocalized(question.subject, language)}</strong><span>{copy.yourAnswer}: {answers[question.id] ? copy.phishing : copy.legit} · {copy.correctAnswer}: {question.isPhishing ? copy.phishing : copy.legit}</span></div><span className="review-status">{correct ? <Check size={15} /> : <X size={15} />}</span></div>; })}</div></div><div className="weak-panel"><div className="panel-title"><span>{copy.missedSkills}</span><FileWarning size={17} /></div>{missedCategories.length > 0 ? <ul>{missedCategories.map((category) => <li key={category}><span />{category}</li>)}</ul> : <div className="all-clear"><CheckCircle2 size={22} /><p>{copy.noMissedSkills}</p></div>}<div className="results-actions"><button className="button button-primary" type="button" onClick={onRetry}><RotateCcw size={17} />{copy.retry}</button><button className="button button-ghost" type="button" onClick={onBackToLearn}>{copy.backToLearn}<ArrowUpRight size={17} /></button></div></div></div></div>}
    </section>
  );
};

const CheatSheet = ({ language }: { language: Language }) => {
  const copy = translations[language];
  const checks = [copy.checkSender, copy.hoverLinks, copy.slowUrgency, copy.verifyChannel, copy.noMacros, copy.doubleExtensions, copy.noCredentials, copy.report];
  return (
    <section className="section section-cheat" id="cheat">
      <SectionHeading eyebrow={copy.cheatEyebrow} title={copy.cheatTitle} text={copy.cheatText} accent="blue" />
      <div className="cheat-card">
        <div className="cheat-top">
          <div className="cheat-mark"><ShieldCheck size={23} /></div>
          <div><span className="eyebrow">PHISHPROOF / QUICK CHECK</span><h3>{language === 'ar' ? 'قبل أن تثق، تحقّق.' : 'Before you trust, verify.'}</h3></div>
          <button className="button button-ghost print-button" type="button" onClick={() => window.print()}><Printer size={17} />{copy.print}</button>
        </div>
        <div className="check-grid">
          {checks.map((check, index) => <div className="check-row" key={check}><span>{String(index + 1).padStart(2, '0')}</span><CheckCircle2 size={18} /><p>{check}</p></div>)}
        </div>
        <div className="cheat-footer"><span><LockKeyhole size={14} />{copy.disclaimer}</span><span>PHISHPROOF / 2026</span></div>
      </div>
    </section>
  );
};

const App = () => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>('intro');
  const [quizSet, setQuizSet] = useState<QuizQuestion[]>(() => createQuizSet([]));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(() => {
    const saved = getSavedValue(STORAGE_BEST_SCORE);
    const parsed = saved ? Number(saved) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  });
  const copy = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = theme;
    saveValue(STORAGE_LANGUAGE, language);
    saveValue(STORAGE_THEME, theme);
  }, [language, theme]);

  const scrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const startQuiz = (): void => {
    setQuizMode('playing');
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    requestAnimationFrame(() => scrollTo('quiz'));
  };

  const answerQuestion = (value: boolean): void => {
    const question = quizSet[currentIndex];
    if (!question || Object.prototype.hasOwnProperty.call(answers, question.id)) return;
    setAnswers((current) => ({ ...current, [question.id]: value }));
    if (value === question.isPhishing) setScore((current) => current + 1);
  };

  const nextQuestion = (): void => {
    if (currentIndex >= quizSet.length - 1) {
      const finalScore = score;
      if (finalScore > (bestScore ?? -1)) {
        setBestScore(finalScore);
        saveValue(STORAGE_BEST_SCORE, String(finalScore));
      }
      setQuizMode('complete');
      return;
    }
    setCurrentIndex((current) => current + 1);
  };

  const retryQuiz = (): void => {
    const ids = quizSet.map((question) => question.id);
    const nextSet = createQuizSet(ids);
    setQuizSet(nextSet);
    setQuizMode('playing');
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    requestAnimationFrame(() => scrollTo('quiz'));
  };

  const quizProgressBest = useMemo(() => bestScore === null ? null : `${bestScore}/10`, [bestScore]);

  return (
    <div className="app-shell">
      <header className="site-nav">
        <div className="nav-inner"><button className="brand" type="button" onClick={() => scrollTo('home')}><span className="brand-icon"><ShieldCheck size={20} /></span><span><strong>{copy.brand}</strong><small>{copy.brandTag}</small></span></button><nav className={`nav-links ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation"><button type="button" onClick={() => scrollTo('home')}>{copy.navHome}</button><button type="button" onClick={() => scrollTo('learn')}>{copy.navLearn}</button><button type="button" onClick={() => scrollTo('techniques')}>{copy.navTechniques}</button><button type="button" onClick={() => scrollTo('quiz')}>{copy.navQuiz}</button><button type="button" onClick={() => scrollTo('cheat')}>{copy.navCheat}</button></nav><div className="nav-actions"><button className="icon-button language-button" type="button" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} aria-label={copy.languageLabel}><span>{language === 'ar' ? 'AR' : 'EN'}</span><span className="language-divider">/</span><span className="muted-lang">{language === 'ar' ? 'EN' : 'AR'}</span></button><button className="icon-button theme-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? copy.themeDark : copy.themeLight}>{theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}</button><button className="mobile-menu-button" type="button" onClick={() => setMobileOpen((current) => !current)} aria-label={mobileOpen ? copy.menuClose : copy.menuOpen} aria-expanded={mobileOpen}>{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button></div></div>
      </header>
      <main>
        <HomeSection language={language} onLearn={() => scrollTo('learn')} onQuiz={() => { startQuiz(); scrollTo('quiz'); }} />
        <LearnSection language={language} onQuiz={() => { startQuiz(); scrollTo('quiz'); }} />
        <TechniquesSection language={language} />
        <QuizSection language={language} quizMode={quizMode} quizSet={quizSet} currentIndex={currentIndex} answers={answers} score={score} onStart={startQuiz} onAnswer={answerQuestion} onNext={nextQuestion} onRetry={retryQuiz} onBackToLearn={() => scrollTo('learn')} />
        <CheatSheet language={language} />
      </main>
      <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><span className="brand-icon"><ShieldCheck size={20} /></span><div><strong>{copy.brand}</strong><p>{copy.footerBuilt}</p></div></div><div className="footer-disclaimer"><LockKeyhole size={15} /><span>{copy.disclaimer}</span></div><button className="back-top" type="button" onClick={() => scrollTo('home')}>{copy.backToTop}<ArrowUpRight size={15} /></button></div><div className="footer-credits"><span>{copy.footerCredits}</span><div><strong>Mohamed Sameh</strong><strong>Fares Badr</strong><strong>Abdulrahman Mohamed</strong><strong>Youssef Samuel</strong><strong>Youssef Ahmed</strong></div></div></footer>
      {quizProgressBest && <div className="best-score"><Trophy size={14} /><span>{language === 'ar' ? 'أفضل نتيجة' : 'Best score'} {quizProgressBest}</span></div>}
    </div>
  );
};

export default App;
