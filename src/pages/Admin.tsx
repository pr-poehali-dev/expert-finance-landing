import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/7cfc3d1e-2f04-4728-a6a6-a1d225adb303";
const LEGAL_API_URL = "https://functions.poehali.dev/ba998b52-dcd4-4120-9d03-40b5ab1e2311";
const ADMIN_PASSWORD = "Aa346500";

const LEGAL_PAGES = [
  { slug: "policy", label: "Политика конфиденциальности" },
  { slug: "complaints", label: "Требования к содержанию обращений" },
  { slug: "personal-data", label: "Политика обработки персональных данных" },
];

const ICON_OPTIONS = [
  "FileText", "Shield", "FileCheck", "FileLock2", "Scale",
  "BookOpen", "UserCheck", "AlertCircle", "File", "Folder",
];

const ICON_LABELS: Record<string, string> = {
  FileText: "Документ",
  Shield: "Защита",
  FileCheck: "Принят",
  FileLock2: "Закрытый",
  Scale: "Закон",
  BookOpen: "Устав",
  UserCheck: "Членство",
  AlertCircle: "Важно",
  File: "Файл",
  Folder: "Папка",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconName = any;

interface Doc {
  id: number;
  title: string;
  file_url: string;
  file_size: string;
  file_type: string;
  icon: string;
  sort_order: number;
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);

  const [legalTab, setLegalTab] = useState("policy");
  const [legalTitle, setLegalTitle] = useState("");
  const [legalContent, setLegalContent] = useState("");
  const [legalLoading, setLegalLoading] = useState(false);
  const [legalSaving, setLegalSaving] = useState(false);
  const [legalMsg, setLegalMsg] = useState("");

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("FileText");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setLoading(true);
    const res = await fetch(API_URL);
    const data = await res.json();
    setDocs(data.documents || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchDocs();
  }, [authed]);

  const loadLegalPage = (slug: string) => {
    setLegalLoading(true);
    setLegalMsg("");
    fetch(`${LEGAL_API_URL}?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => { setLegalTitle(d.title || ""); setLegalContent(d.content || ""); })
      .finally(() => setLegalLoading(false));
  };

  useEffect(() => {
    if (authed) loadLegalPage(legalTab);
  }, [authed, legalTab]);

  const saveLegalPage = async () => {
    setLegalSaving(true);
    setLegalMsg("");
    const res = await fetch(LEGAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: legalTab, title: legalTitle, content: legalContent, admin_token: ADMIN_PASSWORD }),
    });
    const data = await res.json();
    setLegalMsg(data.ok ? "Сохранено!" : "Ошибка сохранения");
    setLegalSaving(false);
  };

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const uploadDoc = async () => {
    if (!file || !title.trim()) {
      setUploadMsg("Заполните название и выберите файл");
      return;
    }
    setUploading(true);
    setUploadMsg("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = (e.target?.result as string).split(",")[1];
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          file_base64: b64,
          file_name: file.name,
          file_type: file.name.split(".").pop()?.toUpperCase() || "PDF",
          icon,
          admin_token: ADMIN_PASSWORD,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setUploadMsg("Документ успешно загружен!");
        setTitle("");
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        fetchDocs();
      } else {
        setUploadMsg("Ошибка загрузки");
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const deleteDoc = async (id: number) => {
    if (!confirm("Удалить документ?")) return;
    await fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, admin_token: ADMIN_PASSWORD }),
    });
    fetchDocs();
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="w-full max-w-sm p-8 rounded-3xl shadow-xl" style={{ background: "white" }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e63329, #c2251b)" }}>
              <Icon name="Lock" size={18} style={{ color: "white" }} />
            </div>
            <div>
              <div className="font-oswald font-bold text-lg" style={{ color: "#1a1a1a" }}>Админ-панель</div>
              <div className="font-manrope text-xs" style={{ color: "#94a3b8" }}>КПК «Эксперт Финанс»</div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-manrope text-xs mb-2" style={{ color: "#64748b" }}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Введите пароль"
              className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none"
              style={{ border: `1.5px solid ${pwError ? "#e63329" : "#e2e8f0"}`, color: "#1a1a1a" }}
            />
            {pwError && <p className="font-manrope text-xs mt-1" style={{ color: "#e63329" }}>Неверный пароль</p>}
          </div>
          <button
            onClick={login}
            className="w-full py-3 rounded-xl font-manrope font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white" }}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e63329, #c2251b)" }}>
              <Icon name="FolderOpen" size={18} style={{ color: "white" }} />
            </div>
            <div>
              <div className="font-oswald font-bold text-xl" style={{ color: "#1a1a1a" }}>Управление документами</div>
              <div className="font-manrope text-xs" style={{ color: "#94a3b8" }}>КПК «Эксперт Финанс»</div>
            </div>
          </div>
          <a href="/" className="font-manrope text-sm flex items-center gap-1" style={{ color: "#c2251b" }}>
            <Icon name="ArrowLeft" size={14} /> На сайт
          </a>
        </div>

        {/* Форма загрузки */}
        <div className="p-6 rounded-2xl mb-8" style={{ background: "white", border: "1px solid #e2e8f0" }}>
          <h2 className="font-oswald font-bold text-lg mb-5" style={{ color: "#1a1a1a" }}>Загрузить новый документ</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-manrope text-xs mb-1.5" style={{ color: "#64748b" }}>Название документа</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Устав КПК «Эксперт Финанс»"
                className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none"
                style={{ border: "1.5px solid #e2e8f0", color: "#1a1a1a" }}
              />
            </div>
            <div>
              <label className="block font-manrope text-xs mb-1.5" style={{ color: "#64748b" }}>Иконка документа</label>
              <div className="flex flex-wrap gap-2 p-3 rounded-xl" style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}>
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    title={ICON_LABELS[ic] || ic}
                    onClick={() => setIcon(ic)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
                    style={{
                      background: icon === ic ? "rgba(194,37,27,0.12)" : "white",
                      border: `1.5px solid ${icon === ic ? "#c2251b" : "#e2e8f0"}`,
                      minWidth: 52,
                    }}
                  >
                    <Icon name={ic as IconName} size={20} style={{ color: icon === ic ? "#c2251b" : "#64748b" }} />
                    <span className="font-manrope text-xs leading-none" style={{ color: icon === ic ? "#c2251b" : "#94a3b8", fontSize: 10 }}>
                      {ICON_LABELS[ic] || ic}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-manrope text-xs mb-1.5" style={{ color: "#64748b" }}>Файл (PDF, DOC и др.)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl px-4 py-2.5 font-manrope text-sm"
              style={{ border: "1.5px solid #e2e8f0", color: "#475569" }}
            />
          </div>
          {uploadMsg && (
            <p className="font-manrope text-sm mb-3" style={{ color: uploadMsg.includes("успешно") ? "#16a34a" : "#e63329" }}>
              {uploadMsg}
            </p>
          )}
          <button
            onClick={uploadDoc}
            disabled={uploading}
            className="px-6 py-3 rounded-xl font-manrope font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white", opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? "Загрузка..." : "Загрузить документ"}
          </button>
        </div>

        {/* Юридические страницы */}
        <div className="p-6 rounded-2xl mb-8" style={{ background: "white", border: "1px solid #e2e8f0" }}>
          <h2 className="font-oswald font-bold text-lg mb-5" style={{ color: "#1a1a1a" }}>Юридические страницы</h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {LEGAL_PAGES.map((p) => (
              <button
                key={p.slug}
                onClick={() => setLegalTab(p.slug)}
                className="px-4 py-2 rounded-xl font-manrope text-sm font-semibold transition-all"
                style={legalTab === p.slug
                  ? { background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white" }
                  : { background: "#f1f5f9", color: "#475569", border: "1.5px solid #e2e8f0" }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {legalLoading ? (
            <p className="font-manrope text-sm" style={{ color: "#94a3b8" }}>Загрузка...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-manrope text-xs mb-1.5 font-semibold" style={{ color: "#64748b" }}>Заголовок страницы</label>
                <input
                  type="text"
                  value={legalTitle}
                  onChange={(e) => setLegalTitle(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none"
                  style={{ border: "1.5px solid #e2e8f0", color: "#1a1a1a" }}
                />
              </div>
              <div>
                <label className="block font-manrope text-xs mb-1.5 font-semibold" style={{ color: "#64748b" }}>
                  Содержимое (HTML)
                  <span className="ml-2 font-normal" style={{ color: "#94a3b8" }}>— можно использовать &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;</span>
                </label>
                <textarea
                  value={legalContent}
                  onChange={(e) => setLegalContent(e.target.value)}
                  rows={14}
                  className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none resize-y"
                  style={{ border: "1.5px solid #e2e8f0", color: "#1a1a1a", fontFamily: "monospace", fontSize: "13px" }}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={saveLegalPage}
                  disabled={legalSaving}
                  className="px-6 py-3 rounded-xl font-manrope font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #e63329, #c2251b)", color: "white", opacity: legalSaving ? 0.7 : 1 }}
                >
                  {legalSaving ? "Сохраняем..." : "Сохранить"}
                </button>
                <a
                  href={`/legal/${legalTab}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-manrope text-sm flex items-center gap-1.5"
                  style={{ color: "#64748b" }}
                >
                  <Icon name="ExternalLink" size={13} /> Открыть страницу
                </a>
                {legalMsg && (
                  <p className="font-manrope text-sm" style={{ color: legalMsg === "Сохранено!" ? "#16a34a" : "#e63329" }}>
                    {legalMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Список документов */}
        <div className="p-6 rounded-2xl" style={{ background: "white", border: "1px solid #e2e8f0" }}>
          <h2 className="font-oswald font-bold text-lg mb-5" style={{ color: "#1a1a1a" }}>
            Документы на сайте ({docs.length})
          </h2>
          {loading ? (
            <p className="font-manrope text-sm" style={{ color: "#94a3b8" }}>Загрузка...</p>
          ) : docs.length === 0 ? (
            <p className="font-manrope text-sm" style={{ color: "#94a3b8" }}>Документы ещё не загружены</p>
          ) : (
            <div className="space-y-3">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#fff5f5" }}>
                    <Icon name={doc.icon as IconName} size={16} style={{ color: "#c2251b" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-manrope font-semibold text-sm truncate" style={{ color: "#1a1a1a" }}>{doc.title}</p>
                    <p className="font-manrope text-xs" style={{ color: "#94a3b8" }}>{doc.file_type} · {doc.file_size}</p>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Открыть">
                    <Icon name="ExternalLink" size={14} style={{ color: "#64748b" }} />
                  </a>
                  <button onClick={() => deleteDoc(doc.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Удалить">
                    <Icon name="Trash2" size={14} style={{ color: "#e63329" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}