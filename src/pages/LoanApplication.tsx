import { useEffect } from "react";

const LoanApplication = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://mykpk.ru/loan-widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: "#1a5c2a" }}>
          Заявка на займ
        </h1>
        <div id="loan-widget"></div>
      </div>
    </div>
  );
};

export default LoanApplication;
