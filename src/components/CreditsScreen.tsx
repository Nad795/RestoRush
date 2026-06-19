import { useRestaurantStore } from '../store/useRestaurantStore';
import nadineImg from '../assets/images/Nadine.jpeg';
import bastenImg from '../assets/images/Basten.jpeg';

const TEAM = [
  { name: 'Nadine Angela Joelita Irawan', email: 'nadineirawan2005@gmail.com', image: nadineImg },
  { name: 'Basten Andika Salim', email: 'salimbasten@gmail.com', image: bastenImg },
];

export function CreditsScreen() {
  const setScreen = (screen: 'menu') =>
    useRestaurantStore.setState({ screen });

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white px-4 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-10 animate-pulse">⭐</div>
        <div className="absolute top-20 right-16 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}>🎬</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>🎮</div>
        <div className="absolute bottom-16 right-10 text-6xl opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }}>🏆</div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400 tracking-tight mb-2">
          Credits
        </h1>
        <p className="text-gray-400 text-sm mb-2">The team behind RestoRush</p>
        <p className="text-gray-500 text-xs mb-10 text-center">
          Game Edukasi dan Simulasi Informatika ITS 2026
        </p>

        <div className="flex flex-col gap-6 w-full mb-10">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-5 bg-gray-800/80 border border-gray-700 rounded-xl p-5"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-yellow-500 shrink-0"
              />
              <div>
                <h2 className="text-xl font-bold text-white">{member.name}</h2>
                <p className="text-gray-400 text-sm">{member.email}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setScreen('menu')}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-semibold rounded-xl transition-all hover:scale-105"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}
