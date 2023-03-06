# Roadmap Highscores
## Grundlagen implementieren
Diese Grundlagen sind technisch nötig, es sind aber noch UI-Updates nötig, um sie sinnvoll ins Spiel integrieren zu können

- Code aufsplitten in Client/Rendering und Spiellogik
    - game.ts aufräumen: Game-Objekt überarbeiten
    - Key-Events außerhalb von Game-Objekt verarbeiten und stattdessen public methods aufrufen
    - Game-Klasse abstrakt machen, Steuerungs-API private setzen
        - einmal als "PlayerGame" erben und Steuerungs-API für Key-Events implementieren, außerdem Events aufzeichnen, 
        - einmal als "RecordedGame" erben und "virtuelle Inputs" anhand einer Aufnahme eines PlayerGames reproduzieren (aber ungenau, weil die dts nicht exakt stimmen)
        - einmal als "
    - Vielleicht kann ein Spiel am Client von Game erben? Alles style-/render-spezifische dann dort hinein
    - public objects für style/config doch durch Funktionen in Objekte durchreichen
    - Ein Game-Objekt für genau einen Zustand, bestehend aus:
        - Config
        - Seed
- Seed für Höhlen-Generator implementieren
- Spiellogik deterministisch machen und Events exportieren
    - timestamps notieren und mit den notierten `dt`s rechnen
    - dt notieren ist kürzer als ganzen Timestamp
    - Für Key-Events ist nur relevant, zwischen welchen Ticks sie auftreten
- Simulator schreiben, der ein Spiel nachrechnet
- API schreiben
    - Verwendet Simulator und antwortet, ob Highscore gültig ist
    - Speichert Highscore-Tabelle und liefert diese auf Anfrage aus
- Mit "Versions-ID" o.ä. sicherstellen, dass Client und Server dieselbe Version benutzen

## Client-UI-Updates
- Cave of the day-Knopf hinzufügen, der immer einen bestimmten Seed lädt
- Später/gleich diesen Seed über API vom Server beziehen
- Upload bei Gewinnen anbieten
- Highscore-Tabelle

## Simulation des Highscores im Client präsentieren
- Möglichkeit implementieren, einen Schatten anzuzeigen, der gegebene Event-Liste nachspielt
    - Soll die Timestamps der Event-Liste verwenden, obwohl er mit den nicht vorhersehbaren Ticks des Clients arbeitet

# API
## Anfrage: aufzunehmende/zu sendende Daten für ein Spiel
    {
        "version": "some_version_hash",
        "seed": 482983923489348,
        "difficulty": "hard"/"easy",
        "username": "cool_username_for_highscore",
        "events": ["Wu", 15.5, 16.1, 22.3, "Wd", 15.8, .....]
    }

### Aufbau der events-Liste
- Gültig sind die Typen `number` und `string`.
- Number repräsentiert ein `dt` in Millisekunden
- Strings entsprechen immer dem Regex `[AWD][ud]`, wobei das erste Zeichen die gedrückte Taste spezifiziert und das zweite, ob sie niedergedrückt (`d`) oder losgelassen (`u`) wurde.

### Antwort des Servers
    {
        "valid": true/false,
        "error_message": "",
        "rank": 2
    }

Gültig ist:
- wenn nicht in Wand geflogen -> am Ende angekommen
- wenn Seed und difficulty zur Cave of the day passen

Die aktualisierte Highscore-Liste kann dann mit dem dafür vorgesehenen Request erhalten werden. 

Rank wird übergeben, damit man in der Highscore-Liste hervorgehoben werden kann. (Der Server muss möglicherweise ja den Namen escapen und speichert deshalb ggf. einen anderen als angegeben.)

Fehlernachricht sollte eigentlich nie beim User ankommen.

## Anfrage: Get current data
Server antwortet mit dem aktuellen Status:
- Software-Versions-ID
- Cave of the day
    - Seed
    - Schwierigkeit/Config-ID/whatever
    - gültig bis?
- Aktuelle Highscores
- Event-Liste des ersten Platzes im Highscore