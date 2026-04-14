import { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";

const CBR_RATE_URL = "https://functions.poehali.dev/eef9deed-19ca-4467-9a4f-0337f1ca72fb";

const PROGRAMS = [
  { title: "Потребительский займ",     maxAmount: 300_000,   maxMonths: 60  },
  { title: "Под залог недвижимости",   maxAmount: 3_000_000, maxMonths: 180 },
  { title: "Ипотечный займ",           maxAmount: 3_000_000, maxMonths: 180 },
  { title: "Займ на авто",             maxAmount: 2_000_000, maxMonths: 84  },
  { title: "Рефинансирование",         maxAmount: 3_000_000, maxMonths: 180 },
  { title: "Займ для самозанятых",     maxAmount: 1_000_000, maxMonths: 60  },
];

const MIN_MONTHS = 12;
const MIN_AMOUNT = 50_000;

function annuityPayment(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

interface Props {
  openModal: (title: string, subtitle: string, buttonLabel: string, source: string) => void;
}

export default function LoanCalculator({ openModal }: Props) {
  const [keyRate, setKeyRate] = useState<number | null>(null);
  const [programIdx, setProgramIdx] = useState(0);
  const [amount, setAmount] = useState(300_000);
  const [months, setMonths] = useState(24);

  useEffect(() => {
    fetch(CBR_RATE_URL)
      .then((r) => r.json())
      .then((d) => setKeyRate(d.key_rate ?? 21))
      .catch(() => setKeyRate(21));
  }, []);

  const program = PROGRAMS[programIdx];

  const clampedAmount = Math.min(Math.max(amount, MIN_AMOUNT), program.maxAmount);
  const clampedMonths = Math.min(Math.max(months, MIN_MONTHS), program.maxMonths);

  useEffect(() => {
    setAmount((a) => Math.min(a, program.maxAmount));
    setMonths((m) => Math.min(Math.max(m, MIN_MONTHS), program.maxMonths));
  }, [programIdx, program.maxAmount, program.maxMonths]);

  const rate = keyRate !== null ? keyRate + 20 : null;

  const result = useMemo(() => {
    if (rate === null) return null;
    const payment = annuityPayment(clampedAmount, rate, clampedMonths);
    const total = payment * clampedMonths;
    const overpay = total - clampedAmount;
    return { payment, total, overpay };
  }, [rate, clampedAmount, clampedMonths]);

  const amountPct = ((clampedAmount - MIN_AMOUNT) / (program.maxAmount - MIN_AMOUNT)) * 100;
  const monthsPct = ((clampedMonths - MIN_MONTHS) / (program.maxMonths - MIN_MONTHS)) * 100;

  return (
    <div className="fade-in-up mt-10 rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
      <div className="px-6 py-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #c2251b, #e63329)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
          <Icon name="Calculator" size={18} style={{ color: "white" }} />
        </div>
        <div>
          <div className="font-oswald text-lg font-bold text-white leading-tight">Калькулятор предварительного расчёта</div>
          <div className="font-manrope text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Расчёт носит информационный характер и не является офертой</div>
        </div>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8" style={{ background: "white" }}>
        <div className="space-y-6">
          <div>
            <label className="block font-manrope text-xs font-semibold mb-2" style={{ color: "#64748b" }}>Программа займа</label>
            <div className="grid grid-cols-1 gap-2">
              {PROGRAMS.map((p, i) => (
                <button
                  key={p.title}
                  onClick={() => setProgramIdx(i)}
                  className="text-left px-4 py-2.5 rounded-xl font-manrope text-sm font-medium transition-all duration-150"
                  style={{
                    background: programIdx === i ? "linear-gradient(135deg, #16a34a, #15803d)" : "#f8fafc",
                    color: programIdx === i ? "white" : "#475569",
                    border: programIdx === i ? "none" : "1px solid #e2e8f0",
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-manrope text-xs font-semibold" style={{ color: "#64748b" }}>Сумма займа</label>
              <span className="font-oswald text-xl font-bold" style={{ color: "#1a1a1a" }}>{fmt(clampedAmount)} ₽</span>
            </div>
            <input
              type="range"
              min={MIN_AMOUNT}
              max={program.maxAmount}
              step={10_000}
              value={clampedAmount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #c2251b ${amountPct}%, #e2e8f0 ${amountPct}%)`,
                accentColor: "#c2251b",
              }}
            />
            <div className="flex justify-between font-manrope text-xs mt-1" style={{ color: "#94a3b8" }}>
              <span>{fmt(MIN_AMOUNT)} ₽</span>
              <span>{fmt(program.maxAmount)} ₽</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-manrope text-xs font-semibold" style={{ color: "#64748b" }}>Срок займа</label>
              <span className="font-oswald text-xl font-bold" style={{ color: "#1a1a1a" }}>{clampedMonths} мес.</span>
            </div>
            <input
              type="range"
              min={MIN_MONTHS}
              max={program.maxMonths}
              step={1}
              value={clampedMonths}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #c2251b ${monthsPct}%, #e2e8f0 ${monthsPct}%)`,
                accentColor: "#c2251b",
              }}
            />
            <div className="flex justify-between font-manrope text-xs mt-1" style={{ color: "#94a3b8" }}>
              <span>{MIN_MONTHS} мес.</span>
              <span>{program.maxMonths} мес.</span>
            </div>
          </div>

          {result !== null ? (
            <div className="rounded-2xl p-5 space-y-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="flex items-center justify-between">
                <span className="font-manrope text-sm" style={{ color: "#64748b" }}>Ежемесячный платёж</span>
                <span className="font-oswald text-2xl font-bold" style={{ color: "#16a34a" }}>{fmt(Math.round(result.payment))} ₽</span>
              </div>
              <div className="h-px" style={{ background: "#e2e8f0" }} />
              <div className="flex items-center justify-between">
                <span className="font-manrope text-sm" style={{ color: "#64748b" }}>Общая сумма выплат</span>
                <span className="font-manrope text-sm font-bold" style={{ color: "#1a1a1a" }}>{fmt(Math.round(result.total))} ₽</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-manrope text-sm" style={{ color: "#64748b" }}>Переплата</span>
                <span className="font-manrope text-sm font-bold" style={{ color: "#475569" }}>{fmt(Math.round(result.overpay))} ₽</span>
              </div>
              <div className="h-px" style={{ background: "#e2e8f0" }} />
              <p className="font-manrope text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                Расчёт носит информационный характер. Фактические условия определяются индивидуально при оформлении займа.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl p-5 flex items-center justify-center" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", minHeight: 120 }}>
              <span className="font-manrope text-sm" style={{ color: "#94a3b8" }}>Загрузка данных...</span>
            </div>
          )}

          <button
            onClick={() => openModal("Подать заявку", `Заявка на программу: ${program.title}`, "Подать заявку", `Калькулятор займов — программа «${program.title}»`)}
            className="w-full py-3.5 rounded-xl font-manrope font-bold text-sm transition-all duration-200 hover:opacity-90 min-h-[48px]"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", boxShadow: "0 4px 16px rgba(22,163,74,0.3)" }}
          >
            Подать заявку
          </button>
        </div>
      </div>
    </div>
  );
}