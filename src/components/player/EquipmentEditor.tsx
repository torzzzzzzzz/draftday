'use client'

const HELMETS = [
  { id: 'standard', label: 'Standard', rarity: 'common' },
  { id: 'chrome', label: 'Chrome', rarity: 'rare' },
  { id: 'matte', label: 'Matte Black', rarity: 'common' },
  { id: 'carbon', label: 'Carbon Fiber', rarity: 'epic' },
  { id: 'gold', label: 'Gold Rush', rarity: 'legendary' },
  { id: 'storm', label: 'Storm', rarity: 'epic' },
]

const VISORS = [
  { id: 'none', label: 'No Visor' },
  { id: 'clear', label: 'Clear' },
  { id: 'tinted', label: 'Tinted Dark' },
  { id: 'mirrored', label: 'Mirrored' },
  { id: 'rainbow', label: 'Rainbow' },
]

const GLOVES = [
  { id: 'none', label: 'No Gloves' },
  { id: 'standard', label: 'Standard Grip' },
  { id: 'receiver', label: 'Receiver Gloves' },
  { id: 'carbon', label: 'Carbon Fiber' },
  { id: 'gold', label: 'Gold Gloves' },
]

const CLEATS = [
  { id: 'standard', label: 'Standard' },
  { id: 'speed', label: 'Speed Cleats' },
  { id: 'lightning', label: 'Lightning Strike' },
  { id: 'galaxy', label: 'Galaxy' },
  { id: 'fire', label: 'Ring of Fire' },
]

const SLEEVES = [
  { id: 'none', label: 'None' },
  { id: 'right', label: 'Right Arm' },
  { id: 'both', label: 'Both Arms' },
  { id: 'compression', label: 'Compression' },
]

const CELEBRATIONS = [
  { id: 'spike', label: '🏈 Ball Spike' },
  { id: 'griddy', label: '🕺 The Griddy' },
  { id: 'salute', label: '✋ Salute' },
  { id: 'finger_wag', label: '☝️ Finger Wag' },
  { id: 'electric_slide', label: '⚡ Electric Slide' },
  { id: 'boat_race', label: '🚣 Boat Race' },
  { id: 'inferno', label: '🔥 Inferno' },
  { id: 'snow_angel', label: '❄️ Snow Angel' },
]

const RARITY_COLORS = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400 shimmer-legendary',
}

function EquipmentSection({ title, items, value, field, onChange, isNullable = false }: {
  title: string
  items: { id: string; label: string; rarity?: string }[]
  value: string | null
  field: string
  onChange: (updates: any) => void
  isNullable?: boolean
}) {
  return (
    <div>
      <h3 className="font-display font-700 text-lg text-white mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ id, label, rarity }) => (
          <button
            key={id}
            onClick={() => onChange({ [field]: id === 'none' ? null : id })}
            className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
              (value === id || (id === 'none' && value === null))
                ? 'border-orange-400 bg-orange-500/15 text-orange-400'
                : 'border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
            }`}
          >
            <span>{label}</span>
            {rarity && rarity !== 'common' && (
              <span className={`ml-2 text-xs ${RARITY_COLORS[rarity as keyof typeof RARITY_COLORS]}`}>
                {rarity}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

interface EquipmentEditorProps {
  build: any
  onChange: (updates: any) => void
}

export function EquipmentEditor({ build, onChange }: EquipmentEditorProps) {
  return (
    <div className="space-y-6 card p-5">
      <h2 className="font-display font-700 text-2xl text-white">Equipment</h2>

      <EquipmentSection
        title="Helmet"
        items={HELMETS}
        value={build.helmet_style}
        field="helmet_style"
        onChange={onChange}
      />

      <EquipmentSection
        title="Visor"
        items={VISORS}
        value={build.visor}
        field="visor"
        onChange={onChange}
        isNullable
      />

      <EquipmentSection
        title="Gloves"
        items={GLOVES}
        value={build.gloves}
        field="gloves"
        onChange={onChange}
        isNullable
      />

      <EquipmentSection
        title="Cleats"
        items={CLEATS}
        value={build.cleats}
        field="cleats"
        onChange={onChange}
      />

      <EquipmentSection
        title="Arm Sleeves"
        items={SLEEVES}
        value={build.sleeve}
        field="sleeve"
        onChange={onChange}
        isNullable
      />

      <EquipmentSection
        title="Celebration"
        items={CELEBRATIONS}
        value={build.celebration}
        field="celebration"
        onChange={onChange}
      />
    </div>
  )
}
