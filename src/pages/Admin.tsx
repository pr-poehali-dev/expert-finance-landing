import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/7cfc3d1e-2f04-4728-a6a6-a1d225adb303";
const ADMIN_PASSWORD = "Aa346500";

const ICON_OPTIONS = [
  "FileText", "Shield", "FileCheck", "FileLock2", "Scale",
  "BookOpen", "UserCheck", "AlertCircle", "File", "Folder",
];

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
        headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_PASSWORD },
        body: JSON.stringify({
          title,
          file_base64: b64,
          file_name: file.name,
          file_type: file.name.split(".").pop()?.toUpperCase() || "PDF",
          icon,
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
      headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_PASSWORD },
      body: JSON.stringify({ id }),
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
              <label className="block font-manrope text-xs mb-1.5" style={{ color: "#64748b" }}>Иконка</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-xl px-4 py-3 font-manrope text-sm outline-none"
                style={{ border: "1.5px solid #e2e8f0", color: "#475569" }}
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
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
