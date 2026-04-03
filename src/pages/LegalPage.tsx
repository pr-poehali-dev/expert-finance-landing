import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/ba998b52-dcd4-4120-9d03-40b5ab1e2311";

const SLUG_MAP: Record<string, string> = {
  policy: "Политика конфиденциальности",
  complaints: "Требования к содержанию обращений",
  "personal-data": "Политика обработки персональных данных",
};

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [title, setTitle] = useState(slug ? SLUG_MAP[slug] || "" : "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    fetch(`${API_URL}?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(true); return; }
        setTitle(d.title);
        setContent(d.content);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #e63329, #c2251b)" }}>
              <Icon name="Shield" size={16} style={{ color: "white" }} />
            </div>
            <span className="font-oswald text-sm font-semibold" style={{ color: "#1a1a1a" }}>ЭКСПЕРТ ФИНАНС</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 font-manrope text-sm min-h-[44px] px-2"
            style={{ color: "#64748b" }}>
            <Icon name="ArrowLeft" size={15} />
            На главную
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#e63329", borderTopColor: "transparent" }} />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <Icon name="FileX2" size={48} style={{ color: "#e2e8f0", margin: "0 auto 16px" }} />
            <p className="font-manrope text-base" style={{ color: "#94a3b8" }}>Страница не найдена</p>
            <Link to="/" className="inline-block mt-4 font-manrope text-sm font-semibold px-5 py-2.5 rounded-xl"
              style={{ background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white" }}>
              На главную
            </Link>
          </div>
        ) : (
          <article>
            <div className="mb-6 pb-6" style={{ borderBottom: "1px solid #e2e8f0" }}>
              <h1 className="font-oswald text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "#1a1a1a" }}>
                {title}
              </h1>
            </div>
            <div
              className="font-manrope text-base leading-relaxed legal-content"
              style={{ color: "#374151" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </article>
        )}
      </main>

      <footer className="mt-16 py-8" style={{ background: "#f1f5f9", borderTop: "1px solid #e2e8f0" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="font-manrope text-xs text-center" style={{ color: "#94a3b8" }}>
            © 2008–2026 КПК «Эксперт Финанс». Деятельность по ФЗ № 190-ФЗ.
          </p>
        </div>
      </footer>
    </div>
  );
}
