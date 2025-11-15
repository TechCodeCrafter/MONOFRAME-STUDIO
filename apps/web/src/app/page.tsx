export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            MonoFrame Studio
          </h1>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-xl mb-8 text-gray-300">
          Cinematic AI video studio – auto-detects the best moments, generates edits,
        </p>
        <p className="text-xl mb-8 text-gray-300">
          and exports creator-ready clips for every platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
            <h3 className="text-xl font-semibold mb-2">🎬 AI Detection</h3>
            <p className="text-gray-400">Auto-detects the best moments in your footage</p>
          </div>

          <div className="border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
            <h3 className="text-xl font-semibold mb-2">✨ Smart Editing</h3>
            <p className="text-gray-400">Generates professional edits automatically</p>
          </div>

          <div className="border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
            <h3 className="text-xl font-semibold mb-2">📱 Multi-Platform</h3>
            <p className="text-gray-400">Export for YouTube, TikTok, Instagram, and more</p>
          </div>
        </div>

        <div className="mt-12">
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105">
            Get Started
          </button>
        </div>
      </div>
    </main>
  );
}
