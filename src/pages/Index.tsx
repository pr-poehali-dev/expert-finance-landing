import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconName = any;

// ─── Scroll animation hook ───────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".fade-in-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Counter hook ────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, stepTime);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

// ─── Stat counter ─────────────────────────────────────────────────────────────
function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(target);
  return (
    <div ref={ref} className="text-center">
      <div className="font-oswald text-4xl md:text-5xl font-bold leading-none mb-1" style={{
        background: "linear-gradient(135deg, #c2251b, #e63329)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        {count.toLocaleString("ru")}{suffix}
      </div>
      <div className="text-sm font-manrope mt-1" style={{ color: "#64748b" }}>{label}</div>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Займы", href: "#loans" },
    { label: "Сбережения", href: "#savings" },
    { label: "О нас", href: "#about" },
    { label: "Документы", href: "#documents" },
    { label: "Контакты", href: "#contacts" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid rgba(226,232,240,0.5)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #e63329, #c2251b)" }}>
              <Icon name="Shield" size={18} style={{ color: "white" }} />
            </div>
            <div>
              <div className="font-oswald text-base font-semibold leading-tight tracking-wide" style={{ color: "#1a1a1a" }}>ЭКСПЕРТ ФИНАНС</div>
              <div className="font-manrope text-xs leading-none" style={{ color: "#94a3b8" }}>Кредитный кооператив</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}
                className="font-manrope text-sm font-medium transition-colors duration-200"
                style={{ color: "#475569" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c2251b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
              >{l.label}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="font-manrope text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
              style={{ border: "1.5px solid #e2e8f0", color: "#1a1a1a", background: "white" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e63329"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}>
              Личный кабинет
            </button>
            <button className="btn-emerald pulse-ring px-5 py-2 text-sm font-manrope font-bold" style={{ color: "white" }}>
              Стать пайщиком
            </button>
          </div>

          <button className="lg:hidden p-2" style={{ color: "#1a1a1a" }} onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden py-4 bg-white" style={{ borderTop: "1px solid #e2e8f0" }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}
                className="block py-3 font-manrope text-sm font-medium"
                style={{ color: "#475569" }}
                onClick={() => setMenuOpen(false)}
              >{l.label}</a>
            ))}
            <div className="flex gap-3 mt-4">
              <button className="font-manrope text-sm font-semibold px-4 py-2 rounded-xl flex-1"
                style={{ border: "1.5px solid #e2e8f0", color: "#1a1a1a" }}>Личный кабинет</button>
              <button className="btn-emerald px-4 py-2 text-sm font-manrope font-bold flex-1" style={{ color: "white" }}>Стать пайщиком</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{
      paddingTop: "80px",
      background: "linear-gradient(160deg, #fff5f5 0%, #fff0f0 30%, #f8faff 70%, #eff6ff 100%)",
    }}>
      {/* Soft orbs */}
      <div className="absolute rounded-full" style={{
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(230,51,41,0.12) 0%, transparent 70%)",
        top: "-100px", right: "-100px", pointerEvents: "none",
      }} />
      <div className="absolute rounded-full" style={{
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(0,100,255,0.06) 0%, transparent 70%)",
        bottom: "0", left: "-80px", pointerEvents: "none",
      }} />
      {/* Dot grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle, rgba(230,51,41,0.18) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: 0.4,
        pointerEvents: "none",
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 md:py-20">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-6"
              style={{ background: "rgba(230,51,41,0.1)", border: "1px solid rgba(194,37,27,0.25)", color: "#c2251b" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e63329" }} />
              Работаем с 2015 года · г. Шахты, Ростовская область
            </div>

            <h1 className="font-oswald text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ color: "#1a1a1a" }}>
              РАБОТАЕМ С{" "}
              <span style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ФИНАНСАМИ,
              </span>
              <br />ДУМАЕМ О ЛЮДЯХ
            </h1>

            <p className="font-manrope text-lg md:text-xl leading-relaxed mb-8 max-w-xl" style={{ color: "#475569" }}>
              Финансовые решения для людей, которые считают деньги.<br />
              <span className="font-bold" style={{ color: "#1a1a1a" }}>Займы выгоднее банков. Сбережения — тоже!</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#loans">
                <button className="btn-emerald pulse-ring px-8 py-4 text-base font-manrope font-bold w-full sm:w-auto" style={{ color: "white" }}>
                  Получить займ
                </button>
              </a>
              <a href="#savings">
                <button className="px-8 py-4 text-base font-manrope font-semibold w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl transition-all duration-200"
                  style={{ border: "2px solid #1a1a1a", color: "#1a1a1a", background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1a1a1a"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#1a1a1a"; }}>Открыть сберегательный счет</button>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-10">
              {[
                { icon: "CheckCircle2", text: "Регулятор — Банк России" },
                { icon: "Lock", text: "Гарантии по закону" },
                { icon: "Users", text: "900+ пайщиков" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm font-manrope" style={{ color: "#64748b" }}>
                  <Icon name={badge.icon as IconName} size={15} style={{ color: "#c2251b", flexShrink: 0 }} />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-visible" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.1)" }}>
              <img
                src="https://cdn.poehali.dev/projects/33c1de75-9e48-4c11-87d3-f9b410f3f164/bucket/6a6c57fe-c64e-40ce-99a1-dd74a0e7e4f8.png"
                alt="Эксперт Финанс"
                className="w-full h-80 object-cover rounded-2xl"
              />

            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-8 py-8 mb-8 rounded-2xl"
          style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <StatCounter target={900} suffix="+" label="Пайщиков" />
          <StatCounter target={new Date().getFullYear() - 2008} suffix=" лет" label="На рынке" />
          <StatCounter target={290} suffix=" млн" label="Выдано займов (руб.)" />
        </div>
      </div>
    </section>
  );
}

// ─── LOANS ────────────────────────────────────────────────────────────────────
function Loans() {
  const products = [
    { title: "Потребительский займ", period: "до 60 мес.", amount: "до 300 000 ₽", icon: "CreditCard", features: ["Без залога", "Досрочное погашение", "Без скрытых комиссий"], badge: "Популярный", color: "#c2251b", bg: "#fff5f5" },
    { title: "Под залог недвижимости", period: "до 180 мес.", amount: "до 3 000 000 ₽", icon: "Home", features: ["Крупные суммы", "Длительный срок", "Индивидуальный подход"], badge: "Выгодно", color: "#0284c7", bg: "#f0f9ff" },
    { title: "Ипотечный займ", period: "до 180 мес.", amount: "до 3 000 000 ₽", icon: "Building2", features: ["Покупка жилья", "Длительный срок", "Гибкие условия"], badge: "Ипотека", color: "#7c3aed", bg: "#faf5ff" },
    { title: "Займ на авто", period: "до 84 мес.", amount: "до 2 000 000 ₽", icon: "Car", features: ["Покупка авто", "Под залог своего авто", "Быстрое решение"], badge: "Авто", color: "#d97706", bg: "#fffbeb" },
    { title: "Рефинансирование", period: "до 180 мес.", amount: "до 3 000 000 ₽", icon: "RefreshCcw", features: ["Снижение ставки", "Объединение займов", "Уменьшение платежа"], badge: "Выгодно", color: "#0891b2", bg: "#fff5f5" },
    { title: "Займ для самозанятых", period: "до 60 мес.", amount: "до 1 000 000 ₽", icon: "Briefcase", features: ["Для самозанятых", "На развитие бизнеса", "Справка о доходах НПД"], badge: "Бизнес", color: "#be185d", bg: "#fff1f2" },
  ];

  return (
    <section id="loans" className="py-20 md:py-28" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-4"
            style={{ background: "#fff5f5", border: "1px solid rgba(194,37,27,0.3)", color: "#c2251b" }}>
            <Icon name="Percent" size={13} />Кредитные продукты
          </div>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#1a1a1a" }}>
            ЗАЙМЫ БЕЗ{" "}
            <span style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ЛИШНИХ УСЛОВИЙ
            </span>
          </h2>
          <p className="font-manrope text-gray-500 text-lg max-w-2xl mx-auto">
            Выберите подходящую программу. Все условия прозрачны — никаких скрытых платежей.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div key={p.title}
              className="fade-in-up p-6 flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: p.bg, border: `1px solid ${p.color}22`, transitionDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15` }}>
                  <Icon name={p.icon as IconName} size={22} style={{ color: p.color }} />
                </div>
                <span className="text-xs font-manrope font-bold px-3 py-1 rounded-full"
                  style={{ background: `${p.color}15`, color: p.color }}>{p.badge}</span>
              </div>
              <h3 className="font-manrope font-bold text-base mb-3 leading-snug" style={{ color: "#1a1a1a" }}>{p.title}</h3>
              <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${p.color}10` }}>
                <Icon name="Info" size={14} style={{ color: p.color, flexShrink: 0 }} />
                <span className="font-manrope text-sm font-semibold" style={{ color: p.color }}>Ставка индивидуальна</span>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="text-xs font-manrope px-3 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "#475569" }}>{p.period}</span>
                <span className="text-xs font-manrope px-3 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "#475569" }}>{p.amount}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-manrope" style={{ color: "#475569" }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl font-manrope font-bold text-sm transition-all duration-200 hover:opacity-90"
                style={{ background: p.color, color: "white", boxShadow: `0 4px 16px ${p.color}40` }}>
                Подать заявку
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 fade-in-up rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #e63329 0%, #c2251b 100%)", border: "none" }}>
          <div>
            <h3 className="font-oswald text-2xl font-bold text-white mb-1">Вам не подходят стандартные кредитные программы? Позвоните или напишите нам, мы найдем индивидуальное решение для вас!</h3>
            <p className="font-manrope text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Наши специалисты бесплатно подберут оптимальные условия</p>
          </div>
          <button className="btn-emerald px-8 py-3.5 font-manrope font-bold text-sm whitespace-nowrap flex-shrink-0" style={{ color: "white" }}>
            Получить консультацию
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── SAVINGS ─────────────────────────────────────────────────────────────────
const CBR_RATE_URL = "https://functions.poehali.dev/eef9deed-19ca-4467-9a4f-0337f1ca72fb";

const TERM_OPTIONS = [
  { months: "3 мес.", monthsNum: 3, bonus: 0 },
  { months: "6 мес.", monthsNum: 6, bonus: 1, highlight: true },
  { months: "12 мес.", monthsNum: 12, bonus: 2, highlight: true },
  { months: "18 мес.", monthsNum: 18, bonus: 3 },
];

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

function Savings() {
  const [keyRate, setKeyRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState("");
  const [amount, setAmount] = useState("100000");
  const [selectedTerm, setSelectedTerm] = useState(TERM_OPTIONS[2]);
  const [payAtEnd, setPayAtEnd] = useState(false);

  useEffect(() => {
    fetch(CBR_RATE_URL)
      .then((r) => r.json())
      .then((d) => {
        setKeyRate(d.key_rate);
        if (d.date) setRateDate(d.date.slice(0, 10));
      })
      .catch(() => setKeyRate(21));
  }, []);

  const getRate = (term: typeof TERM_OPTIONS[0], atEnd: boolean) => {
    if (keyRate === null) return null;
    return keyRate + term.bonus + (atEnd ? 0.5 : 0);
  };

  const calcIncome = () => {
    const rate = getRate(selectedTerm, payAtEnd);
    if (rate === null) return null;
    const sum = parseFloat(amount.replace(/\s/g, "")) || 0;
    const months = selectedTerm.monthsNum;
    const income = sum * (rate / 100) * (months / 12);
    return { income, total: sum + income, rate };
  };

  const result = calcIncome();
  const amountNum = parseFloat(amount.replace(/\s/g, "")) || 0;

  return (
    <section id="savings" className="py-20 md:py-28" style={{ background: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-4"
            style={{ background: "#fff5f5", border: "1px solid rgba(194,37,27,0.3)", color: "#c2251b" }}>
            <Icon name="TrendingUp" size={13} />Программы накопления
          </div>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#1a1a1a" }}>
            СБЕРЕЖЕНИЯ ДО{" "}
            <span style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {keyRate !== null ? `${keyRate + 3.5}% ГОДОВЫХ` : "…% ГОДОВЫХ"}
            </span>
          </h2>
          <p className="font-manrope text-gray-500 text-lg max-w-2xl mx-auto">
            Одна программа — гибкий выбор срока и способа выплаты процентов.
            {rateDate && (
              <span className="block text-sm mt-1" style={{ color: "#94a3b8" }}>
                Ключевая ставка ЦБ РФ: <strong style={{ color: "#c2251b" }}>{keyRate}%</strong> (актуально на {rateDate})
              </span>
            )}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Program card */}
          <div className="fade-in-up rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
            {/* Header */}
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{ background: "linear-gradient(160deg, #e63329 0%, #c2251b 100%)" }}>
              <div>
                <div className="font-oswald text-2xl font-bold text-white mb-1">«Динамичный доход»</div>
                <div className="font-manrope text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Сумма: от 10 000 до 30 000 000 ₽ &nbsp;·&nbsp; Расходные операции не предусмотрены
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                <Icon name="PiggyBank" size={18} style={{ color: "white" }} />
                <span className="font-manrope text-sm font-semibold" style={{ color: "white" }}>Ставка растёт вместе с ключевой, но не снижается при её уменьшении</span>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-3 px-8 py-3 text-xs font-manrope font-semibold uppercase tracking-wide"
              style={{ background: "#f1f5f9", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>
              <div>Срок</div>
              <div className="text-center">При ежемесячной выплате</div>
              <div className="text-center">При выплате в конце срока</div>
            </div>

            {/* Rows */}
            {TERM_OPTIONS.map((t, i) => {
              const rM = getRate(t, false);
              const rE = getRate(t, true);
              return (
                <div key={t.months} className="grid grid-cols-3 px-8 py-4 items-center transition-colors duration-150"
                  style={{
                    background: t.highlight ? "#fff5f5" : "white",
                    borderBottom: i < TERM_OPTIONS.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}>
                  <div>
                    <div className="font-oswald text-lg font-bold" style={{ color: "#1a1a1a" }}>{t.months}</div>
                    <div className="font-manrope text-xs" style={{ color: "#94a3b8" }}>
                      ключевая {t.bonus > 0 ? `+${t.bonus}%` : ""}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="font-oswald text-2xl font-bold" style={{ color: "#c2251b" }}>
                      {rM !== null ? `${rM}%` : "…"}
                    </span>
                    <span className="font-manrope text-xs ml-1" style={{ color: "#94a3b8" }}>годовых</span>
                  </div>
                  <div className="text-center flex flex-col items-center gap-0.5">
                    <div>
                      <span className="font-oswald text-2xl font-bold" style={{ color: "#e63329" }}>
                        {rE !== null ? `${rE}%` : "…"}
                      </span>
                      <span className="font-manrope text-xs ml-1" style={{ color: "#94a3b8" }}>годовых</span>
                    </div>
                    <span className="font-manrope text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(230,51,41,0.1)", color: "#c2251b" }}>
                      +0,5% бонус
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div className="px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{ background: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm font-manrope" style={{ color: "#475569" }}>
                  <Icon name="Wallet" size={15} style={{ color: "#c2251b" }} />
                  Минимальная сумма: <strong>50 000 ₽</strong>
                </div>
                <div className="flex items-center gap-2 text-sm font-manrope" style={{ color: "#475569" }}>
                  <Icon name="CalendarClock" size={15} style={{ color: "#c2251b" }} />
                  Выплата: ежемесячно или в конце срока
                </div>
              </div>
              <button className="btn-emerald px-6 py-3 text-sm font-manrope font-bold whitespace-nowrap" style={{ color: "white" }}>Открыть сберегательный счет</button>
            </div>
          </div>

          {/* Calculator */}
          <div className="fade-in-up rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
            <div className="px-8 py-5 flex items-center gap-3"
              style={{ background: "white", borderBottom: "1px solid #f1f5f9" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#fff5f5" }}>
                <Icon name="Calculator" size={20} style={{ color: "#c2251b" }} />
              </div>
              <div>
                <div className="font-oswald text-lg font-bold" style={{ color: "#1a1a1a" }}>Калькулятор дохода</div>
                <div className="font-manrope text-xs" style={{ color: "#94a3b8" }}>Расчёт на основе актуальной ключевой ставки ЦБ РФ</div>
              </div>
            </div>

            <div className="p-8 bg-white">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Amount */}
                <div>
                  <label className="block font-manrope text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                    Сумма вложения (₽)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={10000}
                    max={30000000}
                    className="w-full px-4 py-3 rounded-xl font-manrope text-base outline-none transition-all"
                    style={{ border: "1.5px solid #e5e7eb", color: "#1a1a1a" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#e63329")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                  />
                  {amountNum > 0 && amountNum < 10000 && (
                    <p className="font-manrope text-xs mt-1" style={{ color: "#ef4444" }}>Минимум 10 000 ₽</p>
                  )}
                </div>

                {/* Term */}
                <div>
                  <label className="block font-manrope text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                    Срок
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TERM_OPTIONS.map((t) => (
                      <button
                        key={t.months}
                        onClick={() => setSelectedTerm(t)}
                        className="py-2.5 rounded-xl font-manrope text-sm font-semibold transition-all duration-150"
                        style={selectedTerm.months === t.months
                          ? { background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white", border: "1.5px solid transparent" }
                          : { background: "white", color: "#374151", border: "1.5px solid #e5e7eb" }
                        }
                      >
                        {t.months}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pay type */}
                <div>
                  <label className="block font-manrope text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                    Выплата процентов
                  </label>
                  <div className="space-y-2">
                    {[
                      { label: "Ежемесячно", value: false },
                      { label: "В конце срока (+0,5%)", value: true },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setPayAtEnd(opt.value)}
                        className="w-full py-3 px-4 rounded-xl font-manrope text-sm font-semibold text-left transition-all duration-150"
                        style={payAtEnd === opt.value
                          ? { background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white", border: "1.5px solid transparent" }
                          : { background: "white", color: "#374151", border: "1.5px solid #e5e7eb" }
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result */}
              {result && amountNum >= 10000 ? (
                <div className="rounded-2xl p-6 grid sm:grid-cols-3 gap-4"
                  style={{ background: "linear-gradient(135deg, #e63329 0%, #c2251b 100%)" }}>
                  <div className="text-center">
                    <div className="font-manrope text-xs mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Ставка</div>
                    <div className="font-oswald text-3xl font-bold text-white">{result.rate}%</div>
                    <div className="font-manrope text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>годовых</div>
                  </div>
                  <div className="text-center">
                    <div className="font-manrope text-xs mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Доход за {selectedTerm.months}</div>
                    <div className="font-oswald text-3xl font-bold text-white">+{fmt(Math.round(result.income))} ₽</div>
                    <div className="font-manrope text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>чистая прибыль</div>
                  </div>
                  <div className="text-center">
                    <div className="font-manrope text-xs mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Итого получите</div>
                    <div className="font-oswald text-3xl font-bold text-white">{fmt(Math.round(result.total))} ₽</div>
                    <div className="font-manrope text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>вложение + доход</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center"
                  style={{ background: "#f8fafc", border: "1.5px dashed #e5e7eb" }}>
                  <p className="font-manrope text-sm" style={{ color: "#94a3b8" }}>
                    {keyRate === null ? "Загружаем ставку ЦБ РФ…" : "Введите сумму от 10 000 ₽, чтобы увидеть расчёт"}
                  </p>
                </div>
              )}

              <p className="font-manrope text-xs mt-3" style={{ color: "#cbd5e1" }}>
                * Расчёт ориентировочный. Ставки привязаны к ключевой ставке ЦБ РФ и могут меняться. Точные условия — в договоре.
              </p>
            </div>
          </div>

          {/* Bonus note */}
          <div className="rounded-xl px-6 py-4 flex items-start gap-3 fade-in-up"
            style={{ background: "rgba(230,51,41,0.08)", border: "1px solid rgba(194,37,27,0.2)" }}>
            <Icon name="Info" size={18} style={{ color: "#c2251b", flexShrink: 0, marginTop: 2 }} />
            <p className="font-manrope text-sm" style={{ color: "#475569" }}>
              <strong style={{ color: "#1a1a1a" }}>Бонус +0,5%</strong> к ставке начисляется при выборе выплаты процентов в конце срока. Досрочное расторжение договора не предусмотрено.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
function About() {
  const values = [
    { icon: "Handshake", title: "Взаимопомощь", text: "Поддерживаем членов кооператива в решении финансовых задач." },
    { icon: "FileCheck", title: "Прозрачность", text: "Все условия, тарифы и правила чётко прописаны в Уставе и договорах." },
    { icon: "Unlock", title: "Доступность", text: "Простые требования к вступлению, понятные процедуры без лишней бюрократии." },
    { icon: "ShieldCheck", title: "Безопасность", text: "Строгое соблюдение ФЗ № 190 «О кредитной кооперации» и контроль Банка России." },
    { icon: "Scale", title: "Ответственность", text: "Каждый член участвует в формировании общих фондов и несёт солидарную ответственность." },
    { icon: "TrendingUp", title: "Доходность выше рынка", text: "Сбережения размещаются под процент выше банковских депозитов." },
  ];

  const membership = [
    { icon: "Heart", title: "Займы на личные нужды", text: "Лечение, образование, ремонт, покупка техники и другие цели." },
    { icon: "PiggyBank", title: "Финансовые накопления", text: "Размещайте сбережения под процент выше банковских депозитов." },
    { icon: "MessageCircle", title: "Консультации", text: "Помощь в планировании бюджета и управлении долгами." },
    { icon: "BookOpen", title: "Обучение", text: "Семинары и материалы по финансовой грамотности." },
    { icon: "Briefcase", title: "Поддержка бизнеса", text: "Займы для малого предпринимательства и самозанятых." },
    { icon: "Vote", title: "Участие в управлении", text: "Право голоса на общих собраниях и влияние на развитие кооператива." },
  ];

  return (
    <section id="about" className="py-20 md:py-28" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Hero block */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-6"
              style={{ background: "#fff5f5", border: "1px solid rgba(194,37,27,0.3)", color: "#c2251b" }}>
              <Icon name="Info" size={13} />О кооперативе
            </div>
            <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-6" style={{ color: "#1a1a1a" }}>
              ФИНАНСЫ,{" "}
              <span style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                КОТОРЫЕ РАБОТАЮТ
              </span>
              <br />НА ВАС
            </h2>
            <p className="font-manrope text-lg leading-relaxed mb-4" style={{ color: "#475569" }}>
              КПК «Эксперт Финанс» — надёжная финансовая организация, созданная для взаимной поддержки своих членов. Мы объединяем людей и предприятия, которые ценят прозрачность, взаимопомощь и выгодные условия финансового сотрудничества.
            </p>
            <p className="font-manrope leading-relaxed mb-8" style={{ color: "#64748b" }}>
              В отличие от банков, мы работаем исключительно в интересах своих членов, а не акционеров. Наша главная цель — финансовая взаимопомощь, а не максимизация прибыли.
            </p>
            <div className="flex flex-wrap gap-0 rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              {[
                { value: "2008", label: "Год основания", href: null },
                { value: "ФЗ № 190", label: "Правовая основа", href: null },
                { value: "Банк России", label: "Регулятор", href: "https://cbr.ru/finorg/foinfo/?ogrn=1084307001041" },
                { value: "СРО", label: "Кооперативные финансы", href: "https://coopfin.ru/cpage/6200" },
              ].map((item, idx) => (
                <div key={item.value} className="flex-1 min-w-[120px] px-5 py-4 text-center"
                  style={{ background: idx % 2 === 0 ? "#f8fafc" : "white", borderRight: idx < 3 ? "1px solid #e2e8f0" : "none" }}>
                  <div className="font-oswald text-xl font-bold mb-0.5" style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{item.value}</div>
                  <div className="font-manrope text-xs" style={{ color: "#94a3b8" }}>{item.label}</div>
                  {item.href && (
                    <a href={item.href} target="_blank" rel="noopener noreferrer"
                      className="font-manrope text-xs underline underline-offset-2 mt-0.5 inline-block"
                      style={{ color: "#c2251b" }}>
                      Реестр →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What is KPK */}
          <div className="fade-in-up">
            <div className="rounded-2xl p-8" style={{ background: "#f4f4f5", border: "1px solid #e4e4e7", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(230,51,41,0.1)" }}>
                  <Icon name="HelpCircle" size={20} style={{ color: "#e63329" }} />
                </div>
                <h3 className="font-oswald text-xl font-bold" style={{ color: "#1a1a1a" }}>Что такое КПК?</h3>
              </div>
              <p className="font-manrope text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>
                Кредитный потребительский кооператив — некоммерческая организация, где участники:
              </p>
              <div className="space-y-3 mb-6">
                {[
                  "Вносят паевые взносы",
                  "Получают доступ к займам на льготных условиях",
                  "Участвуют в управлении кооперативом",
                  "Имеют право на долю прибыли (кооперативные выплаты)",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(230,51,41,0.15)" }}>
                      <Icon name="Check" size={12} style={{ color: "#e63329" }} />
                    </div>
                    <span className="font-manrope text-sm" style={{ color: "#475569" }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ background: "rgba(230,51,41,0.06)", border: "1px solid rgba(230,51,41,0.15)" }}>
                <p className="font-manrope text-xs leading-relaxed" style={{ color: "#64748b" }}>
                  Для вступления: подать заявление → оплатить вступительный взнос → внести паевой взнос (возвращается при выходе).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20 fade-in-up">
          <div className="text-center mb-10">
            <div className="font-oswald text-2xl md:text-3xl font-bold" style={{ color: "#1a1a1a" }}>
              НАШИ <span style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ЦЕННОСТИ</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <div key={v.title}
                className="fade-in-up p-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", transitionDelay: `${i * 60}ms` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "#fff5f5" }}>
                  <Icon name={v.icon as IconName} size={20} style={{ color: "#c2251b" }} />
                </div>
                <h4 className="font-manrope font-bold text-sm mb-2" style={{ color: "#1a1a1a" }}>{v.title}</h4>
                <p className="font-manrope text-sm leading-relaxed" style={{ color: "#64748b" }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What we offer */}
        <div className="mb-16 fade-in-up">
          <div className="text-center mb-10">
            <div className="font-oswald text-2xl md:text-3xl font-bold" style={{ color: "#1a1a1a" }}>
              ЧЕМ МЫ <span style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ПОМОГАЕМ</span>
            </div>
            <p className="font-manrope text-sm mt-2" style={{ color: "#94a3b8" }}>Для членов кооператива доступны</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {membership.map((m, i) => (
              <div key={m.title}
                className="fade-in-up flex gap-4 p-5 rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{ background: "white", border: "1px solid #e2e8f0", transitionDelay: `${i * 60}ms` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fff5f5" }}>
                  <Icon name={m.icon as IconName} size={20} style={{ color: "#c2251b" }} />
                </div>
                <div>
                  <h4 className="font-manrope font-bold text-sm mb-1" style={{ color: "#1a1a1a" }}>{m.title}</h4>
                  <p className="font-manrope text-sm leading-relaxed" style={{ color: "#64748b" }}>{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership conditions */}
        <div className="fade-in-up mb-8 rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
          <div className="px-6 py-5 flex items-center gap-3" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fff5f5" }}>
              <Icon name="UserCheck" size={18} style={{ color: "#c2251b" }} />
            </div>
            <h3 className="font-oswald text-lg font-bold" style={{ color: "#1a1a1a" }}>Условия членства в кооперативе</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-0">
            <div className="px-6 py-5" style={{ borderRight: "1px solid #e2e8f0" }}>
              <p className="font-manrope text-sm leading-relaxed mb-4" style={{ color: "#475569" }}>
                Чтобы получить финансовую услугу в КПК, необходимо стать членом кооператива (пайщиком). Членство оформляется после оплаты вступительного и обязательного паевого взноса —{" "}
                <strong style={{ color: "#1a1a1a" }}>всего 2 500 ₽</strong>.
              </p>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(230,51,41,0.08)", border: "1px solid rgba(194,37,27,0.2)" }}>
                <Icon name="CreditCard" size={18} style={{ color: "#c2251b", flexShrink: 0 }} />
                <span className="font-manrope text-sm font-semibold" style={{ color: "#1a1a1a" }}>Вступительный + паевой взнос = 2 500 ₽</span>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="font-manrope text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#94a3b8" }}>Обязательные условия</p>
              <div className="space-y-2.5">
                {[
                  "Участие в кооперативе — обязательное",
                  "Услуги предоставляются только пайщикам",
                  "Каждый член несёт субсидиарную ответственность в пределах невнесённого доп. взноса",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <Icon name="AlertCircle" size={15} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                    <span className="font-manrope text-sm leading-relaxed" style={{ color: "#475569" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission CTA */}
        <div className="fade-in-up rounded-2xl p-8 md:p-12 text-center"
          style={{ background: "#f4f4f5", border: "1px solid #e4e4e7" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(230,51,41,0.1)" }}>
            <Icon name="Target" size={28} style={{ color: "#e63329" }} />
          </div>
          <h3 className="font-oswald text-2xl md:text-3xl font-bold mb-4" style={{ color: "#1a1a1a" }}>Наша миссия</h3>
          <p className="font-manrope text-base leading-relaxed max-w-2xl mx-auto mb-8" style={{ color: "#64748b" }}>
            Мы создаём сообщество людей и предприятий, которые доверяют друг другу и совместно решают финансовые задачи. Помогаем получать выгодные займы, накапливать сбережения с доходностью выше рынка, развивать финансовую культуру и поддерживать локальный бизнес.
          </p>
          <div className="flex justify-center">
            <button className="btn-emerald px-8 py-4 font-manrope font-bold text-base" style={{ color: "white" }}>
              Стать членом кооператива
            </button>
          </div>
          <p className="font-oswald text-sm mt-6" style={{ color: "#94a3b8" }}>
            «КПК Эксперт Финанс»: вместе к финансовой устойчивости!
          </p>
        </div>

      </div>
    </section>
  );
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
function Documents() {
  const docs = [
    { icon: "FileText", title: "Устав КПК «Эксперт Финанс»", type: "PDF", size: "1.2 МБ" },
    { icon: "Shield", title: "Свидетельство о членстве в СРО", type: "PDF", size: "0.8 МБ" },
    { icon: "FileCheck", title: "Правила займов пайщикам", type: "PDF", size: "2.1 МБ" },
    { icon: "FileLock2", title: "Правила привлечения сбережений", type: "PDF", size: "1.8 МБ" },
    { icon: "Scale", title: "Положение о паевых взносах", type: "PDF", size: "0.9 МБ" },
    { icon: "BookOpen", title: "Финансовая отчётность 2024 г.", type: "PDF", size: "3.4 МБ" },
    { icon: "UserCheck", title: "Политика обработки персональных данных", type: "PDF", size: "0.6 МБ" },
    { icon: "AlertCircle", title: "Базовый стандарт СРО", type: "PDF", size: "4.2 МБ" },
  ];

  return (
    <section id="documents" className="py-20 md:py-28" style={{ background: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-4"
            style={{ background: "#fff5f5", border: "1px solid rgba(194,37,27,0.3)", color: "#c2251b" }}>
            <Icon name="FolderOpen" size={13} />Правовые документы
          </div>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#1a1a1a" }}>
            ПРОЗРАЧНОСТЬ —<br />
            <span style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              НАШ ПРИНЦИП
            </span>
          </h2>
          <p className="font-manrope text-gray-500 text-lg max-w-xl mx-auto">
            Все уставные и нормативные документы в открытом доступе.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {docs.map((doc, i) => (
            <div key={doc.title}
              className="fade-in-up group flex items-start gap-3.5 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transitionDelay: `${i * 50}ms` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(194,37,27,0.4)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(194,37,27,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#fff5f5" }}>
                <Icon name={doc.icon as IconName} size={18} style={{ color: "#c2251b" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-manrope font-semibold text-sm leading-snug mb-1" style={{ color: "#1a1a1a" }}>{doc.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-manrope">{doc.type}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400 font-manrope">{doc.size}</span>
                </div>
              </div>
              <Icon name="Download" size={15} style={{ color: "#d1d5db", flexShrink: 0 }} />
            </div>
          ))}
        </div>

        <div className="fade-in-up mt-8 p-5 rounded-2xl flex items-start gap-4"
          style={{ background: "#fff5f5", border: "1px solid rgba(194,37,27,0.15)" }}>
          <Icon name="Info" size={18} style={{ color: "#c2251b", flexShrink: 0, marginTop: "2px" }} />
          <p className="font-manrope text-gray-500 text-sm leading-relaxed">
            КПК «Эксперт Финанс» состоит в СРО «Союзмикрофинанс» и осуществляет деятельность в соответствии с
            Федеральным законом от 18.07.2009 № 190-ФЗ «О кредитной кооперации». Надзор — Банк России.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACTS ─────────────────────────────────────────────────────────────────
function Contacts() {
  return (
    <section id="contacts" className="py-20 md:py-28" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-4"
            style={{ background: "#fff5f5", border: "1px solid rgba(194,37,27,0.3)", color: "#c2251b" }}>
            <Icon name="MapPin" size={13} />Контакты
          </div>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#1a1a1a" }}>
            МЫ НАХОДИМСЯ<br />
            <span style={{ background: "linear-gradient(135deg, #c2251b, #e63329)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              В ШАХТАХ
            </span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4 fade-in-up">
            {[
              { icon: "MapPin", title: "Адрес офиса", value: "Ростовская обл., г. Шахты, пр-кт Пушкина 29А", sub: "" },
              { icon: "Phone", title: "Телефон", value: "+7 (800) 700-89-09", sub: "Бесплатный звонок" },
              { icon: "Clock", title: "Режим работы", value: "Пн–Пт: 9:00–18:00", sub: "Перерыв 13:00–14:00 · Сб, Вс — выходной" },
              { icon: "Mail", title: "Электронная почта", value: "info@sll-expert.ru", sub: "Ответим в течение рабочего дня" },
              { icon: "MessageCircle", title: "Макс / Telegram", value: "+7 (961) 303-27-56", sub: "Онлайн консультация" },
            ].map((item) => (
              <div key={item.title} className="p-5 flex items-center gap-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #e63329, #c2251b)" }}>
                  <Icon name={item.icon as IconName} size={20} style={{ color: "white" }} />
                </div>
                <div>
                  <div className="font-manrope text-xs mb-0.5" style={{ color: "#94a3b8" }}>{item.title}</div>
                  <div className="font-manrope font-bold" style={{ color: "#1a1a1a" }}>{item.value}</div>
                  {item.sub && <div className="font-manrope text-sm" style={{ color: "#64748b" }}>{item.sub}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="fade-in-up rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0", minHeight: "420px" }}>
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Af051c9f453cc82a4f69ba35eb217752100a9a5c087d814a95b316978e226c567&source=constructorLink"
              width="100%"
              height="100%"
              style={{ minHeight: "420px", border: "none", display: "block" }}
              allowFullScreen
              title="Карта офисов КПК"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#f4f4f5", borderTop: "1px solid #e4e4e7" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #e63329, #c2251b)" }}>
                <Icon name="Shield" size={18} style={{ color: "white" }} />
              </div>
              <div>
                <div className="font-oswald text-sm font-semibold leading-tight" style={{ color: "#1a1a1a" }}>ЭКСПЕРТ ФИНАНС</div>
                <div className="font-manrope text-xs" style={{ color: "#94a3b8" }}>Кредитный кооператив</div>
              </div>
            </div>
            <p className="font-manrope text-sm leading-relaxed" style={{ color: "#64748b" }}>
              КПК «Эксперт Финанс» — надёжный кооператив для жителей г. Шахты с 2008 года.
            </p>
          </div>
          {[
            { title: "Продукты", links: ["Займы", "Сбережения", "Стать пайщиком", "Калькулятор"] },
            { title: "О нас", links: ["История", "Руководство", "Документы", "Отчётность"] },
            { title: "Поддержка", links: ["Контакты", "Вопросы и ответы", "Офис", "Режим работы"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-manrope font-bold text-xs uppercase tracking-widest mb-4" style={{ color: "#94a3b8" }}>
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-manrope text-sm transition-colors duration-200"
                      style={{ color: "#64748b" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#e63329")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid #e2e8f0" }}>
          <p className="font-manrope text-xs text-center md:text-left" style={{ color: "#94a3b8" }}>
            © 2008–2026 КПК «Эксперт Финанс». Деятельность по ФЗ № 190-ФЗ. Под надзором Банка России.
          </p>
          <p className="font-manrope text-xs" style={{ color: "#94a3b8" }}>Не является банком. Не является МФО.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Index() {
  useScrollReveal();
  return (
    <div className="font-manrope">
      <Header />
      <Hero />
      <Loans />
      <Savings />
      <About />
      <Documents />
      <Contacts />
      <Footer />
    </div>
  );
}