# Portierungsstatus v0.1

## Direkt aus TamaPoke übernommen oder eng übertragen

- TPK2-Parser und Aktions-IDs 0–11
- alle normalen und Shiny-Spritepakete
- Gen-1-Pokédexdaten, Entwicklungen, Typen, Grundwerte, Seltenheiten und Biome
- Pflegewerte und Minuten-Ticks
- sanfte Offline-Absenkung mit Untergrenzen
- Schlafregeln
- Gewicht, Bonbons und Training
- Lieblingsbeere nach `speciesId % 3`
- Gene 90–110 %, Training 0–100
- Bindung, Tagespflege-Serie und Medaillen
- manuell ausgelöste Entwicklung und zufällige Evoli-Verzweigung
- unvollständige Entwicklungsreihen werden bei neuen Eiern bevorzugt

## Web-spezifisch neu gebaut

- responsive iPhone-/iPad-Oberfläche
- Canvas-Renderer für TPK2
- drei Profile in `localStorage`
- PWA-Manifest und Service Worker
- Touch-Minispiele
- deutscher Namenssatz für Gen 1

## Bekannte Grenzen der ersten Version

- Spielstände sind aktuell an den jeweiligen Browser/das jeweilige Gerät gebunden.
- Safari kann Website-Daten entfernen, wenn Speicher manuell gelöscht wird.
- Der erste Aufruf eines neuen Pokémon-Sprites braucht eine Internetverbindung; danach wird er gecacht.
- SVG-App-Icons werden von modernen Safari-Versionen unterstützt. Für ältere Systeme können später PNG-Icons ergänzt werden.
