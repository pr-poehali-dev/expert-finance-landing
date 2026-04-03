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
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
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

// ─── Stat counter component ──────────────────────────────────────────────────
function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(target);
  return (
    <div ref={ref} className="text-center">
      <div className="font-oswald text-5xl md:text-6xl font-bold leading-none mb-2" style={{
        background: "linear-gradient(135deg, #00C896, #00dba8)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        {count.toLocaleString("ru")}{suffix}
      </div>
      <div className="text-white/60 text-sm font-manrope mt-1">{label}</div>
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
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10, 22, 40, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,200,150,0.15)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #00C896, #00a87e)" }}>
              <Icon name="Shield" size={18} style={{ color: "#0A1628" }} />
            </div>
            <div>
              <div className="font-oswald text-white text-base font-semibold leading-tight tracking-wide">ЭКСПЕРТ ФИНАНС</div>
              <div className="text-white/40 text-xs font-manrope leading-none">Кредитный кооператив</div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}
                className="font-manrope text-sm font-medium transition-colors duration-200 hover:opacity-100"
                style={{ color: "rgba(255,255,255,0.65)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#00C896")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button className="btn-outline-white px-4 py-2 text-sm font-manrope">Личный кабинет</button>
            <button className="btn-emerald pulse-ring px-5 py-2 text-sm font-manrope" style={{ color: "#0A1628" }}>
              Стать пайщиком
            </button>
          </div>

          {/* Mobile menu */}
          <button className="lg:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden py-4" style={{ borderTop: "1px solid rgba(0,200,150,0.2)" }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}
                className="block py-3 font-manrope text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.7)" }}
                onClick={() => setMenuOpen(false)}
              >{l.label}</a>
            ))}
            <div className="flex gap-3 mt-4">
              <button className="btn-outline-white px-4 py-2 text-sm font-manrope flex-1">Личный кабинет</button>
              <button className="btn-emerald px-4 py-2 text-sm font-manrope flex-1" style={{ color: "#0A1628" }}>Стать пайщиком</button>
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
    <section className="hero-bg relative min-h-screen flex items-center overflow-hidden" style={{ paddingTop: "80px" }}>
      {/* Orbs */}
      <div className="orb w-96 h-96 animate-float" style={{ background: "#00C896", top: "10%", right: "5%", animationDelay: "0s" }} />
      <div className="orb w-64 h-64 animate-float" style={{ background: "#0066ff", bottom: "20%", left: "10%", animationDelay: "3s" }} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(rgba(0,200,150,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,150,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-6"
              style={{ background: "rgba(0,200,150,0.12)", border: "1px solid rgba(0,200,150,0.3)", color: "#00C896" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00C896" }} />
              Работаем с 2015 года · г. Шахты, Ростовская область
            </div>

            <h1 className="font-oswald text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              ДЕНЬГИ{" "}
              <span style={{ background: "linear-gradient(135deg, #00C896, #00dba8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                РАБОТАЮТ
              </span>
              <br />НА ВАС
            </h1>

            <p className="font-manrope text-lg md:text-xl leading-relaxed mb-8 max-w-xl" style={{ color: "rgba(255,255,255,0.65)" }}>
              Займы от <span className="text-white font-semibold">9,9% годовых</span> и сбережения
              до <span className="text-white font-semibold">18% годовых</span> для пайщиков кооператива.
              Без скрытых комиссий.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#loans">
                <button className="btn-emerald pulse-ring px-8 py-4 text-base font-manrope font-bold w-full sm:w-auto" style={{ color: "#0A1628" }}>
                  Получить займ
                </button>
              </a>
              <a href="#savings">
                <button className="btn-outline-white px-8 py-4 text-base font-manrope font-semibold w-full sm:w-auto flex items-center justify-center gap-2">
                  <Icon name="TrendingUp" size={18} />
                  Сберечь и приумножить
                </button>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-10">
              {[
                { icon: "CheckCircle2", text: "Регулятор — Банк России" },
                { icon: "Lock", text: "Гарантии по закону" },
                { icon: "Users", text: "900+ пайщиков" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm font-manrope" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Icon name={badge.icon as IconName} size={15} style={{ color: "#00C896", flexShrink: 0 }} />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div className="hidden lg:block relative">
            <div className="glass-card p-1.5 relative">
              <img
                src="https://cdn.poehali.dev/projects/33c1de75-9e48-4c11-87d3-f9b410f3f164/files/d0a43f13-107a-4150-80cf-8ffd2c5b9626.jpg"
                alt="Эксперт Финанс"
                className="w-full h-80 object-cover rounded-2xl"
              />
              <div className="absolute -bottom-6 -left-8 glass-card px-5 py-4"
                style={{ background: "rgba(10,22,40,0.9)", backdropFilter: "blur(20px)" }}>
                <div className="font-oswald text-3xl font-bold" style={{ background: "linear-gradient(135deg, #00C896, #00dba8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>9,9%</div>
                <div className="font-manrope text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>мин. ставка по займам</div>
              </div>
              <div className="absolute -top-5 -right-5 glass-card px-5 py-4"
                style={{ background: "rgba(10,22,40,0.9)", backdropFilter: "blur(20px)" }}>
                <div className="font-oswald text-3xl font-bold" style={{ background: "linear-gradient(135deg, #00C896, #00dba8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>18%</div>
                <div className="font-manrope text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>доход по сбережениям</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="glass-card grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-8 mb-8"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <StatCounter target={900} suffix="+" label="Пайщиков" />
          <StatCounter target={9} suffix=" лет" label="На рынке" />
          <StatCounter target={250} suffix=" млн" label="Выдано займов (руб.)" />
          <StatCounter target={18} suffix="%" label="Макс. доход по сбережениям" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to bottom, transparent, white)" }} />
    </section>
  );
}

// ─── LOANS ────────────────────────────────────────────────────────────────────
function Loans() {
  const products = [
    {
      title: "Потребительский займ",
      rate: "9,9",
      period: "до 36 мес.",
      amount: "до 500 000 ₽",
      icon: "CreditCard",
      features: ["Без залога", "Досрочное погашение", "Без скрытых комиссий"],
      badge: "Популярный",
      color: "#00C896",
    },
    {
      title: "Займ под залог недвижимости",
      rate: "11",
      period: "до 60 мес.",
      amount: "до 3 000 000 ₽",
      icon: "Home",
      features: ["Крупные суммы", "Длительный срок", "Индивидуальный подход"],
      badge: "Выгодно",
      color: "#00a8e0",
    },
    {
      title: "Пенсионный займ",
      rate: "10,5",
      period: "до 24 мес.",
      amount: "до 200 000 ₽",
      icon: "Heart",
      features: ["Для пенсионеров", "Упрощённый пакет", "Без справок"],
      badge: "Льготный",
      color: "#a78bfa",
    },
    {
      title: "Экспресс займ",
      rate: "14",
      period: "до 6 мес.",
      amount: "до 50 000 ₽",
      icon: "Zap",
      features: ["Решение за 1 час", "Минимум документов", "Онлайн заявка"],
      badge: "Быстрый",
      color: "#fbbf24",
    },
  ];

  return (
    <section id="loans" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-4"
            style={{ background: "rgba(0,200,150,0.1)", border: "1px solid rgba(0,200,150,0.3)", color: "#00a87e" }}>
            <Icon name="Percent" size={13} />
            Кредитные продукты
          </div>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#0A1628" }}>
            ЗАЙМЫ ОТ{" "}
            <span style={{ background: "linear-gradient(135deg, #00C896, #00a87e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              9,9% ГОДОВЫХ
            </span>
          </h2>
          <p className="font-manrope text-gray-500 text-lg max-w-2xl mx-auto">
            Выберите подходящую программу. Все условия прозрачны — никаких скрытых платежей и комиссий.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <div key={p.title}
              className="fade-in-up glass-card-light p-6 flex flex-col group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${p.color}18` }}>
                  <Icon name={p.icon as IconName} size={22} style={{ color: p.color }} />
                </div>
                <span className="text-xs font-manrope font-bold px-3 py-1 rounded-full"
                  style={{ background: `${p.color}18`, color: p.color }}>{p.badge}</span>
              </div>
              <h3 className="font-manrope font-bold text-base mb-3 leading-snug" style={{ color: "#0A1628" }}>{p.title}</h3>
              <div className="mb-4">
                <span className="font-oswald text-5xl font-bold leading-none" style={{ color: p.color }}>{p.rate}%</span>
                <span className="font-manrope text-gray-400 text-sm ml-1">годовых</span>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="text-xs bg-gray-100 text-gray-600 font-manrope px-3 py-1 rounded-full">{p.period}</span>
                <span className="text-xs bg-gray-100 text-gray-600 font-manrope px-3 py-1 rounded-full">{p.amount}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-manrope text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl font-manrope font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`, color: "#0A1628", boxShadow: `0 4px 20px ${p.color}33` }}>
                Подать заявку
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 fade-in-up rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #0A1628, #142244)", border: "1px solid rgba(0,200,150,0.2)" }}>
          <div>
            <h3 className="font-oswald text-2xl font-bold text-white mb-1">Не знаете, какой займ выбрать?</h3>
            <p className="font-manrope text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Наши специалисты бесплатно подберут оптимальные условия</p>
          </div>
          <button className="btn-emerald px-8 py-3.5 font-manrope font-bold text-sm whitespace-nowrap flex-shrink-0" style={{ color: "#0A1628" }}>
            Получить консультацию
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── SAVINGS ─────────────────────────────────────────────────────────────────
function Savings() {
  const plans = [
    {
      title: "Стандарт",
      rate: 12,
      term: "6 месяцев",
      minAmount: "от 30 000 ₽",
      desc: "Базовая программа сбережений для начинающих пайщиков",
      icon: "PiggyBank",
      highlight: false,
    },
    {
      title: "Оптимал",
      rate: 15,
      term: "12 месяцев",
      minAmount: "от 50 000 ₽",
      desc: "Оптимальное соотношение доходности и срока вклада",
      icon: "TrendingUp",
      highlight: true,
    },
    {
      title: "Максимум",
      rate: 18,
      term: "24 месяца",
      minAmount: "от 100 000 ₽",
      desc: "Максимальная доходность для долгосрочных вложений",
      icon: "Star",
      highlight: false,
    },
  ];

  return (
    <section id="savings" className="py-20 md:py-28" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-4"
            style={{ background: "rgba(0,200,150,0.1)", border: "1px solid rgba(0,200,150,0.3)", color: "#00a87e" }}>
            <Icon name="TrendingUp" size={13} />
            Программы накопления
          </div>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#0A1628" }}>
            СБЕРЕЖЕНИЯ ДО{" "}
            <span style={{ background: "linear-gradient(135deg, #00C896, #00a87e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              18% ГОДОВЫХ
            </span>
          </h2>
          <p className="font-manrope text-gray-500 text-lg max-w-2xl mx-auto">
            Ваши сбережения работают эффективно. Доход начисляется ежемесячно — вы видите результат уже через 30 дней.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div key={plan.title} className="fade-in-up relative" style={{ transitionDelay: `${i * 100}ms` }}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-5 py-1 rounded-full text-xs font-manrope font-bold"
                  style={{ background: "linear-gradient(135deg, #00C896, #00a87e)", color: "#0A1628" }}>
                  Самый популярный
                </div>
              )}
              <div className="p-8 rounded-2xl h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: plan.highlight ? "linear-gradient(160deg, #0A1628 0%, #0d2040 100%)" : "white",
                  border: plan.highlight ? "1px solid rgba(0,200,150,0.3)" : "1px solid #e5e7eb",
                  boxShadow: plan.highlight ? "0 20px 60px rgba(0,200,150,0.15)" : "0 4px 20px rgba(0,0,0,0.06)",
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: plan.highlight ? "rgba(0,200,150,0.15)" : "rgba(0,200,150,0.08)" }}>
                  <Icon name={plan.icon as IconName} size={24} style={{ color: "#00C896" }} />
                </div>
                <h3 className="font-oswald text-xl font-bold mb-2" style={{ color: plan.highlight ? "white" : "#0A1628" }}>
                  {plan.title}
                </h3>
                <div className="mb-4">
                  <span className="font-oswald font-bold leading-none" style={{ fontSize: "3.5rem", color: "#00C896" }}>
                    {plan.rate}%
                  </span>
                  <span className="font-manrope text-sm ml-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>
                    годовых
                  </span>
                </div>
                <p className="font-manrope text-sm leading-relaxed mb-5 flex-1"
                  style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
                  {plan.desc}
                </p>
                <div className="space-y-2 mb-6">
                  {[
                    { icon: "Clock", text: `Срок: ${plan.term}` },
                    { icon: "Wallet", text: plan.minAmount },
                    { icon: "RefreshCw", text: "Ежемесячная выплата" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5 text-sm font-manrope"
                      style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "#374151" }}>
                      <Icon name={item.icon as IconName} size={14} style={{ color: "#00C896", flexShrink: 0 }} />
                      {item.text}
                    </div>
                  ))}
                </div>
                <button className="w-full py-3.5 rounded-xl font-manrope font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                  style={plan.highlight
                    ? { background: "linear-gradient(135deg, #00C896, #00a87e)", color: "#0A1628", boxShadow: "0 8px 25px rgba(0,200,150,0.35)" }
                    : { background: "#0A1628", color: "white" }
                  }>
                  Открыть сбережение
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 fade-in-up rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 max-w-3xl mx-auto"
          style={{ background: "rgba(0,200,150,0.06)", border: "1px solid rgba(0,200,150,0.2)" }}>
          <Icon name="Calculator" size={28} style={{ color: "#00C896", flexShrink: 0 }} />
          <div className="flex-1">
            <p className="font-manrope font-semibold text-sm" style={{ color: "#0A1628" }}>
              Пример расчёта: вложите 100 000 ₽ на 12 месяцев — получите{" "}
              <span style={{ color: "#00C896" }}>115 000 ₽</span> по программе «Оптимал»
            </p>
          </div>
          <button className="btn-emerald px-6 py-2.5 text-sm font-manrope font-bold whitespace-nowrap" style={{ color: "#0A1628" }}>
            Рассчитать доход
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
function About() {
  const advantages = [
    { icon: "ShieldCheck", title: "Надёжность и законность", text: "Деятельность регулируется Банком России. Членство в СРО «Союзмикрофинанс». Полный надзор государства." },
    { icon: "Users", title: "Пайщики — совладельцы", text: "Каждый пайщик — полноправный участник кооператива. Вы участвуете в управлении и распределении прибыли." },
    { icon: "MapPin", title: "Рядом с вами", text: "Офис в центре г. Шахты. Работаем с 2015 года, знаем каждого клиента лично." },
    { icon: "Handshake", title: "Индивидуальный подход", text: "Рассматриваем каждую ситуацию отдельно. Не шаблонные решения — живой диалог с человеком." },
    { icon: "FileCheck", title: "Прозрачные условия", text: "Все документы открыты. Полная стоимость займа указана в договоре. Никаких скрытых платежей." },
    { icon: "Clock", title: "Быстрое решение", text: "Рассматриваем заявку от 1 часа. Деньги — в день обращения. Минимум документов для постоянных пайщиков." },
  ];

  return (
    <section id="about" className="py-20 md:py-28" style={{ background: "#0A1628" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-6"
              style={{ background: "rgba(0,200,150,0.12)", border: "1px solid rgba(0,200,150,0.3)", color: "#00C896" }}>
              <Icon name="Info" size={13} />О кооперативе
            </div>
            <h2 className="font-oswald text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
              9 ЛЕТ ПОМОГАЕМ<br />
              <span style={{ background: "linear-gradient(135deg, #00C896, #00dba8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ЖИТЕЛЯМ ШАХТ
              </span>
            </h2>
            <p className="font-manrope text-lg leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
              КПК «Эксперт Финанс» основан в 2015 году в г. Шахты Ростовской области. Мы — не банк и не МФО.
              Мы кооператив, где каждый пайщик — совладелец и участник.
            </p>
            <p className="font-manrope leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
              Кооперативная модель позволяет предлагать условия значительно лучше банковских: займы дешевле,
              доход по сбережениям выше. При этом деятельность полностью регулируется ФЗ № 190-ФЗ.
            </p>
            <div className="flex flex-wrap gap-6 p-5 rounded-2xl"
              style={{ background: "rgba(0,200,150,0.07)", border: "1px solid rgba(0,200,150,0.15)" }}>
              {[
                { value: "2015", label: "Год основания" },
                { value: "ФЗ № 190", label: "Правовая основа" },
                { value: "СРО", label: "Союзмикрофинанс" },
              ].map((item, idx) => (
                <div key={item.value} className="flex items-center gap-4">
                  {idx > 0 && <div className="w-px h-8 bg-white/10" />}
                  <div>
                    <div className="font-oswald text-2xl font-bold" style={{ background: "linear-gradient(135deg, #00C896, #00dba8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{item.value}</div>
                    <div className="font-manrope text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-in-up hidden lg:block">
            <div className="glass-card p-2">
              <img
                src="https://cdn.poehali.dev/projects/33c1de75-9e48-4c11-87d3-f9b410f3f164/files/dbfa0296-b71f-45ed-974d-fe558fcfadd8.jpg"
                alt="Офис Эксперт Финанс"
                className="w-full h-72 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advantages.map((adv, i) => (
            <div key={adv.title}
              className="fade-in-up glass-card p-6 transition-all duration-300"
              style={{ transitionDelay: `${i * 70}ms`, borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(0,200,150,0.12)" }}>
                <Icon name={adv.icon as IconName} size={20} style={{ color: "#00C896" }} />
              </div>
              <h4 className="font-manrope font-bold text-white text-sm mb-2">{adv.title}</h4>
              <p className="font-manrope text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{adv.text}</p>
            </div>
          ))}
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
    <section id="documents" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-4"
            style={{ background: "rgba(0,200,150,0.1)", border: "1px solid rgba(0,200,150,0.3)", color: "#00a87e" }}>
            <Icon name="FolderOpen" size={13} />
            Правовые документы
          </div>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#0A1628" }}>
            ПРОЗРАЧНОСТЬ —<br />
            <span style={{ background: "linear-gradient(135deg, #00C896, #00a87e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              НАШ ПРИНЦИП
            </span>
          </h2>
          <p className="font-manrope text-gray-500 text-lg max-w-xl mx-auto">
            Все уставные и нормативные документы в открытом доступе. Изучите их до вступления в кооператив.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {docs.map((doc, i) => (
            <div key={doc.title}
              className="fade-in-up group flex items-start gap-3.5 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transitionDelay: `${i * 50}ms` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,150,0.4)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,200,150,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(0,200,150,0.08)" }}>
                <Icon name={doc.icon as IconName} size={18} style={{ color: "#00C896" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-manrope font-semibold text-sm leading-snug mb-1" style={{ color: "#0A1628" }}>{doc.title}</p>
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
          style={{ background: "#f8fafc", border: "1px solid #e5e7eb" }}>
          <Icon name="Info" size={18} style={{ color: "#00C896", flexShrink: 0, marginTop: "2px" }} />
          <p className="font-manrope text-gray-500 text-sm leading-relaxed">
            КПК «Эксперт Финанс» состоит в СРО «Союзмикрофинанс» и осуществляет деятельность в соответствии с
            Федеральным законом от 18.07.2009 № 190-ФЗ «О кредитной кооперации». Деятельность кооператива
            находится под надзором Банка России.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACTS ─────────────────────────────────────────────────────────────────
function Contacts() {
  return (
    <section id="contacts" className="py-20 md:py-28" style={{ background: "linear-gradient(180deg, #f0f4f8 0%, #e8edf3 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold mb-4"
            style={{ background: "rgba(0,200,150,0.1)", border: "1px solid rgba(0,200,150,0.3)", color: "#00a87e" }}>
            <Icon name="MapPin" size={13} />
            Контакты
          </div>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#0A1628" }}>
            МЫ НАХОДИМСЯ<br />
            <span style={{ background: "linear-gradient(135deg, #00C896, #00a87e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              В ШАХТАХ
            </span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4 fade-in-up">
            {[
              { icon: "MapPin", title: "Адрес офиса", value: "г. Шахты, ул. Советская, д. 1", sub: "Ростовская область, 346500" },
              { icon: "Phone", title: "Телефон", value: "+7 (8636) 00-00-00", sub: "Пн–Пт: 9:00–18:00, Сб: 9:00–14:00" },
              { icon: "Mail", title: "Электронная почта", value: "info@expert-finance.ru", sub: "Ответим в течение рабочего дня" },
              { icon: "MessageCircle", title: "WhatsApp / Telegram", value: "+7 (900) 000-00-00", sub: "Онлайн консультация" },
            ].map((item) => (
              <div key={item.title} className="glass-card-light p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0A1628, #142244)" }}>
                  <Icon name={item.icon as IconName} size={20} style={{ color: "#00C896" }} />
                </div>
                <div>
                  <div className="font-manrope text-xs text-gray-400 mb-0.5">{item.title}</div>
                  <div className="font-manrope font-bold" style={{ color: "#0A1628" }}>{item.value}</div>
                  <div className="font-manrope text-sm text-gray-400">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="fade-in-up rounded-2xl p-8"
            style={{ background: "linear-gradient(160deg, #0A1628 0%, #0d2040 100%)", border: "1px solid rgba(0,200,150,0.2)" }}>
            <h3 className="font-oswald text-2xl font-bold text-white mb-2">Оставьте заявку</h3>
            <p className="font-manrope text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              Перезвоним в течение 30 минут в рабочее время
            </p>
            <div className="space-y-4">
              {[
                { label: "Ваше имя", type: "text", placeholder: "Иван Иванов" },
                { label: "Телефон", type: "tel", placeholder: "+7 (___) ___-__-__" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block font-manrope text-xs mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder}
                    className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,200,150,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                  />
                </div>
              ))}
              <div>
                <label className="block font-manrope text-xs mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>Меня интересует</label>
                <select className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
                  <option style={{ background: "#0d2040" }} value="">Выберите тему</option>
                  <option style={{ background: "#0d2040" }} value="loan">Получить займ</option>
                  <option style={{ background: "#0d2040" }} value="savings">Открыть сбережение</option>
                  <option style={{ background: "#0d2040" }} value="member">Вступить в кооператив</option>
                  <option style={{ background: "#0d2040" }} value="other">Другой вопрос</option>
                </select>
              </div>
              <button className="btn-emerald w-full py-4 font-manrope font-bold text-base mt-2" style={{ color: "#0A1628" }}>
                Отправить заявку
              </button>
              <p className="font-manrope text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#060e1a", borderTop: "1px solid rgba(0,200,150,0.1)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00C896, #00a87e)" }}>
                <Icon name="Shield" size={18} style={{ color: "#0A1628" }} />
              </div>
              <div>
                <div className="font-oswald text-white text-sm font-semibold leading-tight">ЭКСПЕРТ ФИНАНС</div>
                <div className="font-manrope text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Кредитный кооператив</div>
              </div>
            </div>
            <p className="font-manrope text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              КПК «Эксперт Финанс» — надёжный кооператив для жителей г. Шахты с 2015 года.
            </p>
          </div>
          {[
            { title: "Продукты", links: ["Займы", "Сбережения", "Стать пайщиком", "Калькулятор"] },
            { title: "О нас", links: ["История", "Руководство", "Документы", "Отчётность"] },
            { title: "Поддержка", links: ["Контакты", "Вопросы и ответы", "Офис", "Режим работы"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-manrope font-bold text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-manrope text-sm transition-colors duration-200"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-manrope text-xs text-center md:text-left" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2015–2026 КПК «Эксперт Финанс». Деятельность по ФЗ № 190-ФЗ. Под надзором Банка России.
          </p>
          <p className="font-manrope text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>Не является банком. Не является МФО.</p>
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