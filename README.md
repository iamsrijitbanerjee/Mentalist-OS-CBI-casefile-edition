# 🕵️‍♂️ The Mentalist OS — CBI Casefile Edition

A browser-based Web OS inspired by *The Mentalist*. Built as my project submission for the **Stardance** mission. 

Instead of going with a standard modern dark-mode desktop, I built this with a warm, tactile manila-folder detective theme. It combines a custom window management engine with interactive tools from the show.

---

## ✨ Features

- **Draggable Window System:** Custom z-index stacking and drag mechanics for multiple case windows.
- **Patrick's Tea Lounge:** Built-in focus/pomodoro timer with tea presets and audio chime triggers.
- **CBI Team Roster:** MCU team profiles with permanent Director slot (Director Srijit Banerjee) and photo upload support.
- **Historical Database Search:** Instant search engine covering 50+ characters, suspects, victims, and agents from *The Mentalist*.
- **CBI Consultant ID Generator:** Customizable badge issuer with HTML5 Canvas export to download a personalized PNG ID.
- **Encrypted Field Notes:** Auto-saving notepad that syncs to `localStorage` with a timestamped archive system.
- **Evidence Pinboard:** Suspect board with polaroids and red string connection tags.
- **CBI Soundscape Generator:** Synthesized ambient office noise, rain, lo-fi vinyl, and teletype audio using Web Audio API.
- **Interactive Easter Eggs:**
  - *Patrick Jane Deduction Engine:* Real-time user observation ticker.
  - *Red John Mode:* A subtle blood mark that triggers screen flickering, falling blood drops, scary audio, and high-contrast dark mode.
- **Custom Context Menu:** Desk right-click menu tailored for detective actions.

---

## 🛠️ Tech Stack

- **HTML5 & CSS3** (Custom Manila paper aesthetic, Flexbox, CSS Grid)
- **Vanilla JavaScript** (Zero external heavy frameworks for maximum performance)
- **Web Audio API** (Procedurally generated sound effects and ambient noise)
- **HTML5 Canvas API** (Real-time badge generation and image export)