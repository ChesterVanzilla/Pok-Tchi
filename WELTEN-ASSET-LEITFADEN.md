# TamaPoke Family – World Engine v1

## Grundformat

- **18 Typordner**
- **2 Tageszeiten pro Typ**
- **4 PNG-Ebenen pro Tageszeit**
- insgesamt **144 austauschbare PNG-Dateien**
- einheitliche Größe: **1365 × 1152 px**
- Seitenverhältnis: **455:384**
- `midground.png`, `foreground.png` und `overlay.png` müssen einen transparenten Hintergrund besitzen.

## Ordner

```text
assets/worlds/
  normal/
  grass/
  fire/
  water/
  electric/
  ice/
  bug/
  poison/
  ground/
  rock/
  flying/
  psychic/
  ghost/
  dark/
  dragon/
  fairy/
  fighting/
  steel/
```

Jeder Typordner enthält:

```text
normal/
  world.json
  day/
    background.png
    midground.png
    foreground.png
    overlay.png
  night/
    background.png
    midground.png
    foreground.png
    overlay.png
  berries/
  effects/
  music/
  minigame/
```

## Bedeutung der Ebenen

1. **background.png** – Himmel, ferne Berge, entfernte Wälder, Sonne oder Mond. Darf vollständig deckend sein.
2. **midground.png** – Wege, mittlere Bäume, Häuser, Seen, Schilder und die eigentliche Standfläche. Transparent, wenn nur einzelne Elemente enthalten sind.
3. **foreground.png** – Blumen, Gras, Büsche, Äste oder Steine, die sichtbar **vor dem Pokémon** liegen sollen. Transparent.
4. **overlay.png** – Partikel und Effekte wie Blätter, Funken, Nebel, Schnee oder Glitzer. Transparent.

## Pokémon-Freifläche

In der unteren Mitte sollte möglichst wenig wichtiges Motiv liegen. Empfohlener freier Bereich:

- X: ungefähr **28–72 %** der Bildbreite
- Y: ungefähr **43–90 %** der Bildhöhe

Vordergrundelemente dürfen teilweise in diesen Bereich ragen, damit das Pokémon natürlicher in der Welt steht.

## Dateien austauschen

Du kannst jede PNG-Datei direkt gegen eine neue Datei mit **demselben Namen und derselben Größe** ersetzen. Änderungen am JavaScript sind nicht nötig. Die World Engine lädt Weltdateien netzwerkbevorzugt, sodass aktualisierte PNGs nach einem Neuladen übernommen werden.

Für eine zuverlässige Versionsänderung zusätzlich in `world.json` den Wert erhöhen:

```json
"version": "1.1.0"
```

## Zuordnung Deutsch → Ordner

| Typ | Ordner |
|---|---|
| Normal | `normal` |
| Pflanze | `grass` |
| Feuer | `fire` |
| Wasser | `water` |
| Elektro | `electric` |
| Eis | `ice` |
| Käfer | `bug` |
| Gift | `poison` |
| Boden | `ground` |
| Gestein | `rock` |
| Flug | `flying` |
| Psycho | `psychic` |
| Geist | `ghost` |
| Unlicht | `dark` |
| Drache | `dragon` |
| Fee | `fairy` |
| Kampf | `fighting` |
| Stahl | `steel` |

Der Ordner `_template` kann kopiert werden, wenn eine Welt vollständig neu aufgebaut wird.
