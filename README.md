# TamaPoke Family Web v0.1

Erste spielbare Browser-Portierung des vom Nutzer bereitgestellten TamaPoke-Projekts für iPhone und iPad.

## Bereits enthalten

- echte TPK2-Animationen aus TamaPoke/PMD SpriteCollab
- alle 151 Pokémon-Datensätze und normale/Shiny-Spritepakete
- drei getrennte lokale Spielstände
- Starterwahl: Bisasam, Glumanda oder Schiggy
- Ei mit drei Berührungen und automatischem Schlüpfen
- Originalwerte: Sättigung, Freude, Energie, Hygiene, Gewicht und Verschmutzung
- Offline-Zeitfortschritt mit zweiwöchiger Obergrenze
- Originaltempo, Familientempo und Testtempo
- Lieblingsbeeren und Bonbons
- Schlafen, Waschen und Streicheln
- Minispiel „Fang den Stern“ für Initiative
- Krafttraining für Angriff
- Gene, Trainingswerte, Bindung, Pflegeserie und Medaillen
- Entwicklungslogik für alle 151 Pokémon einschließlich Evoli-Verzweigung
- Pokédex mit 151 Einträgen und animierter Detailansicht
- PWA-Installation und Laufzeit-Offline-Cache
- deutsche Pokémon-Namen und deutsche Benutzeroberfläche

## Noch nicht portiert

- vollständige originale Bildschirmführung des runden Geräts
- Abschieds- und Weglaufzeremonien
- originale Bade- und Trainingsszenen im Detail
- Original-Soundsequenzen aus `audio.cpp`
- Export/Import von Spielständen
- Synchronisierung zwischen mehreren Geräten

## GitHub Pages

1. Den Inhalt dieses Ordners in ein neues GitHub-Repository hochladen.
2. Unter **Settings → Pages** den Branch `main` und den Ordner `/root` auswählen.
3. Die veröffentlichte Adresse in Safari öffnen.
4. **Teilen → Zum Home-Bildschirm** auswählen.

## Wichtiger Hinweis

Die Sprite-Dateien umfassen ungefähr 41 MB. Beim ersten Anzeigen eines Pokémon wird nur dessen jeweilige Datei geladen und anschließend durch den Service Worker lokal zwischengespeichert.

## Credits und Lizenz

- TamaPoke-Quellcode: Quique Tortosa, MIT-Lizenz. Siehe `LICENSE-TAMAPOKE.txt`.
- Sprites: PMD SpriteCollab, CC BY-NC 4.0, nur nicht kommerziell. Siehe `CREDITS-TAMAPOKE.md`.
- Pokémon und zugehörige Namen/Figuren: © Nintendo / Game Freak / The Pokémon Company.
- Diese Web-Portierung ist ausschließlich als privates, nicht kommerzielles Fanprojekt vorgesehen.
