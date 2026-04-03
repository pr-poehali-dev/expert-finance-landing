import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/e26c970b-1482-4b9c-9b6a-f48a7072e5ae";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  source?: string;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  let d = digits;
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ") " + d.slice(4, 7);
  if (d.length >= 7) result += "-" + d.slice(7, 9);
  if (d.length >= 9) result += "-" + d.slice(9, 11);
  return result;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function MemberModal({
  open,
  onClose,
  title = "Стать пайщиком",
  subtitle = "Заполните форму — мы свяжемся с вами",
  buttonLabel = "Отправить заявку",
  source = "",
}: Props) {
  const [fio, setFio] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ fio?: string; phone?: string; email?: string }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setFio(""); setPhone(""); setEmail(""); setErrors({}); setStatus("idle");
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === "+") { setPhone(""); return; }
    setPhone(formatPhone(raw));
  };

  const validate = () => {
    const err: typeof errors = {};
    if (!fio.trim() || fio.trim().split(" ").length < 2) err.fio = "Введите полное ФИО";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 11) err.phone = "Введите полный номер телефона";
    if (!validateEmail(email)) err.email = "Введите корректный email";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setStatus("loading");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fio,
          phone,
          email,
          source_url: window.location.href,
          button_label: title,
          button_source: source,
        }),
      });
      const data = await res.json();
      if (data.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: "white" }}>
        <div className="p-6" style={{ background: "linear-gradient(135deg, #e63329, #c2251b)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-oswald text-2xl font-bold text-white">{title}</h2>
              <p className="font-manrope text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                {subtitle}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
              <Icon name="X" size={18} style={{ color: "white" }} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {status === "success" ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#f0fdf4" }}>
                <Icon name="CheckCircle2" size={36} style={{ color: "#16a34a" }} />
              </div>
              <h3 className="font-oswald text-xl font-bold mb-2" style={{ color: "#1a1a1a" }}>Заявка отправлена!</h3>
              <p className="font-manrope text-sm mb-6" style={{ color: "#64748b" }}>
                Наш специалист свяжется с вами в ближайшее рабочее время
              </p>
              <button onClick={onClose} className="px-6 py-3 rounded-xl font-manrope font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white" }}>
                Закрыть
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-manrope text-xs mb-1.5 font-semibold" style={{ color: "#64748b" }}>
                  ФИО <span style={{ color: "#e63329" }}>*</span>
                </label>
                <input
                  type="text"
                  value={fio}
                  onChange={(e) => { setFio(e.target.value); setErrors((p) => ({ ...p, fio: undefined })); }}
                  placeholder="Иванов Иван Иванович"
                  className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none transition-all"
                  style={{ border: `1.5px solid ${errors.fio ? "#e63329" : "#e2e8f0"}`, color: "#1a1a1a" }}
                />
                {errors.fio && <p className="font-manrope text-xs mt-1" style={{ color: "#e63329" }}>{errors.fio}</p>}
              </div>

              <div>
                <label className="block font-manrope text-xs mb-1.5 font-semibold" style={{ color: "#64748b" }}>
                  Телефон <span style={{ color: "#e63329" }}>*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhone}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none transition-all"
                  style={{ border: `1.5px solid ${errors.phone ? "#e63329" : "#e2e8f0"}`, color: "#1a1a1a" }}
                />
                {errors.phone && <p className="font-manrope text-xs mt-1" style={{ color: "#e63329" }}>{errors.phone}</p>}
              </div>

              <div>
                <label className="block font-manrope text-xs mb-1.5 font-semibold" style={{ color: "#64748b" }}>
                  Email <span style={{ color: "#e63329" }}>*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="example@mail.ru"
                  className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none transition-all"
                  style={{ border: `1.5px solid ${errors.email ? "#e63329" : "#e2e8f0"}`, color: "#1a1a1a" }}
                />
                {errors.email && <p className="font-manrope text-xs mt-1" style={{ color: "#e63329" }}>{errors.email}</p>}
              </div>

              {status === "error" && (
                <p className="font-manrope text-xs p-3 rounded-xl" style={{ background: "#fff5f5", color: "#e63329" }}>
                  Не удалось отправить заявку. Позвоните нам: +7 (800) 700-89-09
                </p>
              )}

              <button
                onClick={submit}
                disabled={status === "loading"}
                className="w-full py-3.5 rounded-xl font-manrope font-bold text-sm mt-2 transition-opacity"
                style={{ background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white", opacity: status === "loading" ? 0.7 : 1 }}
              >
                {status === "loading" ? "Отправляем..." : buttonLabel}
              </button>
              <p className="font-manrope text-xs text-center" style={{ color: "#94a3b8" }}>
                Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
