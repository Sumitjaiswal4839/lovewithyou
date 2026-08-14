export default function MaintenanceScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F1014] text-white p-6 text-center">
      <div className="bg-[#1A1C23] p-8 rounded-2xl shadow-xl border border-gray-800">
        <span className="text-5xl mb-4 block">🛠️</span>
        <h1 className="text-2xl font-bold text-pink-500 mb-2">We'll Be Right Back!</h1>
        <p className="text-gray-400 mb-6">
          LoveWithYou is currently undergoing scheduled maintenance to bring you exciting new features and a better experience.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-semibold hover:opacity-90"
        >
          Check Again
        </button>
      </div>
    </div>
  );
}
