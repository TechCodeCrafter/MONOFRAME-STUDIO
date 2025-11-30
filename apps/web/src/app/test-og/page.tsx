import Image from 'next/image';

export default function TestOGPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        🧪 Testing Placeholder Assets
      </h1>
      
      <div className="space-y-8">
        {/* Logo SVG */}
        <div className="border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Logo SVG</h2>
          <img src="/logo.svg" alt="MonoFrame Logo" className="w-32 h-32" />
          <p className="text-sm text-white/60 mt-2">
            Expected: Black square with white "M"
          </p>
        </div>

        {/* OG Images */}
        <div className="border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            OpenGraph Images (1200x630)
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/80 mb-2">og-monoframe.png</p>
              <img 
                src="/og-monoframe.png" 
                alt="OG MonoFrame" 
                className="border border-white/20 max-w-md"
              />
              <p className="text-xs text-white/60 mt-2">
                Expected: 1x1 black pixel (placeholder)
              </p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-2">og-monoframe-demo.png</p>
              <img 
                src="/og-monoframe-demo.png" 
                alt="OG MonoFrame Demo" 
                className="border border-white/20 max-w-md"
              />
              <p className="text-xs text-white/60 mt-2">
                Expected: 1x1 black pixel (placeholder)
              </p>
            </div>
          </div>
        </div>

        {/* Icon */}
        <div className="border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Icon (512x512)
          </h2>
          <img 
            src="/icon.png" 
            alt="MonoFrame Icon" 
            className="w-16 h-16 border border-white/20"
          />
          <p className="text-xs text-white/60 mt-2">
            Expected: 1x1 black pixel (placeholder)
          </p>
        </div>

        {/* Metadata Check */}
        <div className="border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            ✅ Metadata References
          </h2>
          <ul className="text-sm text-white/80 space-y-2">
            <li>• layout.tsx → <code className="text-green-400">/og-monoframe.png</code></li>
            <li>• demo/layout.tsx → <code className="text-green-400">/og-monoframe-demo.png</code></li>
            <li>• Future favicon → <code className="text-green-400">/icon.png</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

