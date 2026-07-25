export const WORLD_THEMES = {
  planta: {
    key: 'forest',
    label: 'Kanto Wald',
    icon: 'leaf',
    accent: '#8bd36b',
    accent2: '#ffd36a',
    panel: '#183425',
    panel2: '#245039',
    berries: [
      { name: 'Waldbeere', description: 'Süß, weich und frisch gepflückt', className: 'berry-forest' },
      { name: 'Blattbeere', description: 'Knackig mit einem Hauch Minze', className: 'berry-leaf' },
      { name: 'Sonnenbeere', description: 'Warm, golden und besonders saftig', className: 'berry-sun' }
    ],
    candy: { name: 'Honigbonbon', description: 'Sehr süß – macht glücklich und schwerer', className: 'candy-honey' },
    mini: {
      title: 'Beerenregen',
      hint: 'Fange reife Beeren und weiche Dornenkugeln aus.',
      collectible: 'berry',
      hazard: 'thorn',
      resultWord: 'Beeren'
    },
    training: {
      title: 'Ranken-Training',
      hint: 'Triff den umrankten Holzstamm im richtigen Rhythmus.',
      target: 'vine'
    }
  },
  fuego: {
    key: 'volcano',
    label: 'Vulkan-Ebene',
    icon: 'flame',
    accent: '#ff9d46',
    accent2: '#ffdf72',
    panel: '#3b2020',
    panel2: '#653026',
    berries: [
      { name: 'Glutbeere', description: 'Warm, würzig und leicht rauchig', className: 'berry-ember' },
      { name: 'Funkenbeere', description: 'Prickelt angenehm auf der Zunge', className: 'berry-spark' },
      { name: 'Lavabeere', description: 'Sehr scharf und voller Energie', className: 'berry-lava' }
    ],
    candy: { name: 'Karamellkohle', description: 'Knusprig-süß – macht glücklich und schwerer', className: 'candy-coal' },
    mini: {
      title: 'Funkenfänger',
      hint: 'Sammle goldene Funken und meide die dunklen Rauchwolken.',
      collectible: 'spark',
      hazard: 'smoke',
      resultWord: 'Funken'
    },
    training: {
      title: 'Glutstein-Training',
      hint: 'Zertrümmere den heißen Obsidianblock mit schnellen Treffern.',
      target: 'obsidian'
    }
  },
  agua: {
    key: 'lagoon',
    label: 'Azurbucht',
    icon: 'drop',
    accent: '#65d5ef',
    accent2: '#b7f3ff',
    panel: '#163449',
    panel2: '#215875',
    berries: [
      { name: 'Wellenbeere', description: 'Saftig und angenehm erfrischend', className: 'berry-wave' },
      { name: 'Perlenbeere', description: 'Mild, glatt und leicht süß', className: 'berry-pearl' },
      { name: 'Korallenbeere', description: 'Fruchtig mit einer salzigen Note', className: 'berry-coral' }
    ],
    candy: { name: 'Muschelbonbon', description: 'Zuckersüß – macht glücklich und schwerer', className: 'candy-shell' },
    mini: {
      title: 'Blasenjagd',
      hint: 'Fange schimmernde Blasen und weiche dem Seegras aus.',
      collectible: 'bubble',
      hazard: 'seaweed',
      resultWord: 'Blasen'
    },
    training: {
      title: 'Wellen-Training',
      hint: 'Halte die Trainingsboje mit gleichmäßigen Treffern in Bewegung.',
      target: 'buoy'
    }
  },
  default: {
    key: 'meadow',
    label: 'Pokémon-Wiese',
    icon: 'star',
    accent: '#ffd04a',
    accent2: '#66ccff',
    panel: '#1c2743',
    panel2: '#253253',
    berries: [
      { name: 'Rote Beere', description: 'Kräftig und süß', className: 'berry-red' },
      { name: 'Blaue Beere', description: 'Frisch und saftig', className: 'berry-blue' },
      { name: 'Grüne Beere', description: 'Mild und knackig', className: 'berry-green' }
    ],
    candy: { name: 'Tama-Bonbon', description: 'Viel Freude, aber auch mehr Gewicht', className: 'candy-star' },
    mini: {
      title: 'Pokéball-Fangen',
      hint: 'Bewege dein Pokémon mit dem Finger und fange die Pokébälle.',
      collectible: 'ball',
      hazard: 'cloud',
      resultWord: 'Fänge'
    },
    training: {
      title: 'Krafttraining',
      hint: 'Tippe rhythmisch auf den Trainingssack.',
      target: 'bag'
    }
  }
};

export function themeForSpecies(species) {
  return WORLD_THEMES[species?.type] || WORLD_THEMES.default;
}

export function resolveWorldPhase(settings, date = new Date()) {
  const forced = settings?.worldTime;
  if (forced === 'day' || forced === 'night') return forced;
  const hour = date.getHours();
  return hour < 7 || hour >= 20 ? 'night' : 'day';
}
