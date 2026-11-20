'use client'

const SKIN_TONES = [
  { id: 'very_light', label: 'Very Light', hex: '#f5d5b8' },
  { id: 'light', label: 'Light', hex: '#e8b88a' },
  { id: 'medium_light', label: 'Medium Light', hex: '#d4956a' },
  { id: 'medium', label: 'Medium', hex: '#b8743a' },
  { id: 'medium_dark', label: 'Medium Dark', hex: '#8b4513' },
  { id: 'dark', label: 'Dark', hex: '#5c2e0a' },
  { id: 'very_dark', label: 'Very Dark', hex: '#3d1a05' },
]

const HAIR_STYLES = [
  { id: 'short_fade', label: 'Short Fade' },
  { id: 'buzz', label: 'Buzz Cut' },
  { id: 'taper', label: 'Taper' },
  { id: 'dreads_short', label: 'Short Dreads' },
  { id: 'dreads_long', label: 'Long Dreads' },
  { id: 'cornrows', label: 'Cornrows' },
  { id: 'afro', label: 'Afro' },
  { id: 'curly', label: 'Curly' },
  { id: 'waves', label: 'Waves' },
  { id: 'long', label: 'Long Flow' },
  { id: 'mohawk', label: 'Mohawk' },
  { id: 'bald', label: 'Bald' },
]

const HAIR_COLORS = [
  { id: 'black', label: 'Black', hex: '#1a1a1a' },
  { id: 'dark_brown', label: 'Dark Brown', hex: '#3b1f0a' },
  { id: 'brown', label: 'Brown', hex: '#6b3a2a' },
  { id: 'light_brown', label: 'Light Brown', hex: '#8b6050' },
  { id: 'blonde', label: 'Blonde', hex: '#d4a845' },
  { id: 'red', label: 'Red', hex: '#8b2520' },
  { id: 'gray', label: 'Gray', hex: '#888' },
  { id: 'white', label: 'White', hex: '#e8e8e8' },
  { id: 'platinum', label: 'Platinum', hex: '#d8d8c0' },
]

const FACE_STYLES = [
  { id: 'face_1', label: 'Face 1' },
  { id: 'face_2', label: 'Face 2' },
  { id: 'face_3', label: 'Face 3' },
  { id: 'face_4', label: 'Face 4' },
  { id: 'face_5', label: 'Face 5' },
  { id: 'face_6', label: 'Face 6' },
]

interface AppearanceEditorProps {
  build: any
  onChange: (updates: Partial<any>) => void
}

export function AppearanceEditor({ build, onChange }: AppearanceEditorProps) {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="font-display font-700 text-xl text-white mb-4">Appearance</h2>

        {/* Skin Tone */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">Skin Tone</label>
          <div className="flex flex-wrap gap-2">
            {SKIN_TONES.map(({ id, label, hex }) => (
              <button
                key={id}
                title={label}
                onClick={() => onChange({ skin_tone: id })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  build.skin_tone === id ? 'border-brand-400 scale-110' : 'border-transparent hover:border-white/30'
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {/* Hair Style */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">Hair Style</label>
          <div className="grid grid-cols-3 gap-2">
            {HAIR_STYLES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onChange({ hair_style: id })}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  build.hair_style === id
                    ? 'border-brand-400 bg-brand-500/15 text-brand-400'
                    : 'border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Hair Color */}
        {build.hair_style !== 'bald' && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-3">Hair Color</label>
            <div className="flex flex-wrap gap-2">
              {HAIR_COLORS.map(({ id, label, hex }) => (
                <button
                  key={id}
                  title={label}
                  onClick={() => onChange({ hair_color: id })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    build.hair_color === id ? 'border-brand-400 scale-110' : 'border-transparent hover:border-white/30'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Face Style */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">Face Style</label>
          <div className="grid grid-cols-3 gap-2">
            {FACE_STYLES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onChange({ face_style: id })}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  build.face_style === id
                    ? 'border-brand-400 bg-brand-500/15 text-brand-400'
                    : 'border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Uniform Colors */}
      <div className="card p-5">
        <h3 className="font-display font-700 text-lg text-white mb-4">Uniform Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={build.primary_color}
                onChange={(e) => onChange({ primary_color: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <span className="text-sm text-gray-400 font-mono">{build.primary_color}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={build.secondary_color}
                onChange={(e) => onChange({ secondary_color: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <span className="text-sm text-gray-400 font-mono">{build.secondary_color}</span>
            </div>
          </div>
        </div>

        {/* Quick team presets */}
        <div className="mt-4">
          <label className="block text-sm text-gray-500 mb-2">Quick presets:</label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'KC', p: '#e31837', s: '#ffb81c' },
              { label: 'DAL', p: '#003594', s: '#c0c0c0' },
              { label: 'GB', p: '#203731', s: '#ffb612' },
              { label: 'SF', p: '#aa0000', s: '#b3995d' },
              { label: 'PHI', p: '#004c54', s: '#a5acaf' },
              { label: 'BUF', p: '#00338d', s: '#c60c30' },
            ].map(({ label, p, s }) => (
              <button
                key={label}
                onClick={() => onChange({ primary_color: p, secondary_color: s })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 transition-all"
              >
                <div className="flex gap-0.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: p }} />
                  <div className="w-3 h-3 rounded-sm" style={{ background: s }} />
                </div>
                <span className="text-xs text-gray-400">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
