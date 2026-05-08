const Maintenance = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Временно на обслуживании
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Сайт временно недоступен. Мы уже работаем над этим и скоро вернёмся.
        </p>
        <p className="text-gray-400 text-sm">
          НФО «Финанс» · nfofinans.ru
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
