import { useState } from "react";

const PASSWORD = "nfo2024";

const PasswordGate = ({ children }: { children: React.ReactNode }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("gate") === "1"
  );

  if (unlocked) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem("gate", "1");
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md w-full">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Временно на обслуживании
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Сайт временно недоступен. Мы уже работаем над этим и скоро вернёмся.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Введите пароль для доступа"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm">Неверный пароль</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
