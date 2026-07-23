// --- GLOBAL STACKING VARIABLE ---
let highestZIndex = 10;

// --- 1. DYNAMIC SYSTEM CLOCK ---
function updateClock() {
  const clockEl = document.getElementById('system-clock');
  const now = new Date();
  if (clockEl) {
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
setInterval(updateClock, 1000);
updateClock();


// --- 2. DRAGGABLE WINDOW ENGINE ---
function makeDraggable(windowEl) {
  const header = windowEl.querySelector('.window-header');
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  windowEl.addEventListener('mousedown', () => {
    highestZIndex++;
    windowEl.style.zIndex = highestZIndex;
  });

  if (header) {
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - windowEl.offsetLeft;
      offsetY = e.clientY - windowEl.offsetTop;
    });
  }

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    windowEl.style.left = `${e.clientX - offsetX}px`;
    windowEl.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  const closeBtn = windowEl.querySelector('.win-btn.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      windowEl.style.display = 'none';
    });
  }
}

document.querySelectorAll('.window').forEach(makeDraggable);


// --- 3. TASKBAR APP LAUNCHERS ---
function setupLauncher(btnId, winId) {
  const btn = document.getElementById(btnId);
  const win = document.getElementById(winId);
  if (btn && win) {
    btn.addEventListener('click', () => {
      win.style.display = 'flex';
      highestZIndex++;
      win.style.zIndex = highestZIndex;
    });
  }
}

setupLauncher('launch-team', 'team-board-app');
setupLauncher('launch-devlog', 'devlog-app');
setupLauncher('launch-tea', 'tea-lounge');
setupLauncher('launch-pinboard', 'pinboard-app');
setupLauncher('launch-notepad', 'notepad-app');
setupLauncher('launch-ambient', 'ambient-app');


// --- 4. DIRECTOR PHOTO PERMANENT UPLOAD ENGINE ---
const directorUpload = document.getElementById('director-photo-upload');
const directorImg = document.getElementById('director-photo');

const savedDirectorPhoto = localStorage.getItem('stardance_director_photo');
if (savedDirectorPhoto && directorImg) {
  directorImg.src = savedDirectorPhoto;
}

if (directorUpload) {
  directorUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        directorImg.src = dataUrl;
        localStorage.setItem('stardance_director_photo', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  });
}


// --- 5. DEVLOG ENGINE WITH PARAGRAPH EDITOR ---
let defaultDevlogs = [
  {
    title: "CASE ENTRY #001: System Foundation",
    date: "Phase 1 - Baseline Setup",
    content: "Initiated Mentalist OS baseline project structure.\n\nConfigured HTML viewport, standard CSS variables for Manila paper themes, and wired up core JS dragging handlers."
  },
  {
    title: "CASE ENTRY #002: Window Stacking Engine",
    date: "Phase 2 - Core Functionality",
    content: "Implemented drag-and-drop window handling using mouse events.\n\nFixed z-index layering bug ensuring active windows jump to the front on click."
  },
  {
    title: "CASE ENTRY #003: CBI Customization",
    date: "Phase 3 - Detective UI Customization",
    content: "Customized theme based on The Mentalist detective desk aesthetic.\n\nBuilt Patrick's Tea Lounge, Evidence Pinboard, and Encrypted Field Notes."
  }
];

let savedUserDevlogs = JSON.parse(localStorage.getItem('stardance_user_devlogs') || '[]');
let activeDevlogs = [...defaultDevlogs, ...savedUserDevlogs];
let activeDevlogIndex = 0;

const devlogListEl = document.getElementById('devlog-list');
const devlogBodyEl = document.getElementById('devlog-body');

function renderDevlogList() {
  if (!devlogListEl) return;
  devlogListEl.innerHTML = '';
  activeDevlogs.forEach((log, index) => {
    const li = document.createElement('li');
    li.className = `log-item ${index === activeDevlogIndex ? 'active' : ''}`;
    li.dataset.index = index;
    li.textContent = `📁 ${log.title}`;
    li.addEventListener('click', () => {
      document.querySelectorAll('.log-item').forEach(i => i.classList.remove('active'));
      li.classList.add('active');
      activeDevlogIndex = index;
      renderDevlogContent(index);
    });
    devlogListEl.appendChild(li);
  });
}

function renderDevlogContent(index) {
  if (!devlogBodyEl || !activeDevlogs[index]) return;
  const log = activeDevlogs[index];
  const paragraphs = log.content.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');

  devlogBodyEl.innerHTML = `
    <h4>${log.title}</h4>
    <span class="log-date">📅 ${log.date}</span>
    ${paragraphs}
  `;
}

renderDevlogList();
renderDevlogContent(0);

document.getElementById('add-case-entry-btn').addEventListener('click', () => {
  const title = prompt("Enter Case Entry Title:", "CASE ENTRY #" + (activeDevlogs.length + 1));
  if (!title) return;
  const content = prompt("Enter Entry Notes (Separate paragraphs with a double linebreak):", "");
  if (!content) return;

  const newLog = {
    title: title,
    date: "Phase 4 - " + new Date().toLocaleDateString(),
    content: content
  };

  savedUserDevlogs.push(newLog);
  localStorage.setItem('stardance_user_devlogs', JSON.stringify(savedUserDevlogs));
  activeDevlogs.push(newLog);
  activeDevlogIndex = activeDevlogs.length - 1;
  
  renderDevlogList();
  renderDevlogContent(activeDevlogIndex);
});

document.getElementById('edit-case-entry-btn').addEventListener('click', () => {
  const currentLog = activeDevlogs[activeDevlogIndex];
  const newContent = prompt("Edit Paragraphs for '" + currentLog.title + "'\n(Use double linebreaks for new paragraphs):", currentLog.content);
  
  if (newContent !== null) {
    currentLog.content = newContent;
    localStorage.setItem('stardance_user_devlogs', JSON.stringify(activeDevlogs.slice(defaultDevlogs.length)));
    renderDevlogContent(activeDevlogIndex);
  }
});


// --- 6. TEA LOUNGE ENGINE ---
let teaInterval = null;
let totalSeconds = 180;
let remainingSeconds = 180;
let isRunning = false;

const timerDisplay = document.getElementById('tea-timer');
const startBtn = document.getElementById('tea-start-btn');
const resetBtn = document.getElementById('tea-reset-btn');
const presetChips = document.querySelectorAll('.tea-chip');

function formatTime(sec) {
  const mins = Math.floor(sec / 60).toString().padStart(2, '0');
  const secs = (sec % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

presetChips.forEach(chip => {
  chip.addEventListener('click', () => {
    if (isRunning) clearInterval(teaInterval);
    isRunning = false;
    startBtn.textContent = 'Start Steeping';
    presetChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    totalSeconds = parseInt(chip.dataset.time, 10);
    remainingSeconds = totalSeconds;
    timerDisplay.textContent = formatTime(remainingSeconds);
  });
});

if (startBtn) {
  startBtn.addEventListener('click', () => {
    if (isRunning) {
      clearInterval(teaInterval);
      isRunning = false;
      startBtn.textContent = 'Resume Steeping';
    } else {
      isRunning = true;
      startBtn.textContent = 'Pause';
      teaInterval = setInterval(() => {
        remainingSeconds--;
        timerDisplay.textContent = formatTime(remainingSeconds);
        if (remainingSeconds <= 0) {
          clearInterval(teaInterval);
          isRunning = false;
          timerDisplay.textContent = '00:00';
          startBtn.textContent = 'Tea Ready!';
          alert('☕ Your tea has steeped to perfection!');
        }
      }, 1000);
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    clearInterval(teaInterval);
    isRunning = false;
    remainingSeconds = totalSeconds;
    timerDisplay.textContent = formatTime(remainingSeconds);
    startBtn.textContent = 'Start Steeping';
  });
}


// --- 7. ENCRYPTED NOTEPAD & ARCHIVE MANAGER ---
const notepadArea = document.getElementById('field-notes');
const saveStatus = document.getElementById('notepad-save-status');
const archiveSelect = document.getElementById('notes-archive-select');
const saveArchiveBtn = document.getElementById('save-note-archive-btn');

if (notepadArea) {
  const savedDraft = localStorage.getItem('stardance_cbi_draft');
  if (savedDraft) notepadArea.value = savedDraft;

  notepadArea.addEventListener('input', () => {
    localStorage.setItem('stardance_cbi_draft', notepadArea.value);
    saveStatus.textContent = 'Status: Draft Synced (' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ')';
  });
}

function loadArchiveDropdown() {
  if (!archiveSelect) return;
  const archives = JSON.parse(localStorage.getItem('stardance_notes_archive') || '[]');
  archiveSelect.innerHTML = '<option value="">📜 Load Saved Note...</option>';
  archives.forEach((item, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = `${item.title} (${item.timestamp})`;
    archiveSelect.appendChild(opt);
  });
}

if (saveArchiveBtn) {
  saveArchiveBtn.addEventListener('click', () => {
    const text = notepadArea.value.trim();
    if (!text) { alert("Cannot save an empty note!"); return; }
    const title = prompt("Enter Note Title:", "Field Note #" + (archiveSelect.options.length));
    if (!title) return;

    const archives = JSON.parse(localStorage.getItem('stardance_notes_archive') || '[]');
    archives.push({
      title: title,
      text: text,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });

    localStorage.setItem('stardance_notes_archive', JSON.stringify(archives));
    loadArchiveDropdown();
    alert("Note saved into CBI Archive!");
  });
}

if (archiveSelect) {
  archiveSelect.addEventListener('change', (e) => {
    const idx = e.target.value;
    if (idx === '') return;
    const archives = JSON.parse(localStorage.getItem('stardance_notes_archive') || '[]');
    if (archives[idx]) {
      notepadArea.value = archives[idx].text;
      localStorage.setItem('stardance_cbi_draft', notepadArea.value);
      saveStatus.textContent = 'Status: Loaded ' + archives[idx].title;
    }
  });
}

loadArchiveDropdown();


// --- 8. MULTI-OPTION SOUNDSCAPE ENGINE ---
let audioCtx = null;
let ambientSource = null;
let isAmbientPlaying = false;

const toggleAmbientBtn = document.getElementById('toggle-ambient-btn');

if (toggleAmbientBtn) {
  toggleAmbientBtn.addEventListener('click', () => {
    if (isAmbientPlaying) {
      if (ambientSource) ambientSource.stop();
      isAmbientPlaying = false;
      toggleAmbientBtn.textContent = 'Start Soundscape';
    } else {
      const mode = document.querySelector('input[name="soundscape"]:checked').value;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          if (mode === 'rain') {
            data[i] = (Math.random() * 2 - 1) * 0.1;
          } else if (mode === 'office') {
            data[i] = (Math.random() * 2 - 1) * 0.03;
          } else if (mode === 'vinyl') {
            data[i] = Math.random() > 0.98 ? (Math.random() * 2 - 1) * 0.3 : (Math.random() * 2 - 1) * 0.02;
          } else if (mode === 'typing') {
            data[i] = Math.random() > 0.95 ? (Math.random() * 2 - 1) * 0.25 : 0;
          }
        }

        ambientSource = audioCtx.createBufferSource();
        ambientSource.buffer = buffer;
        ambientSource.loop = true;

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);

        ambientSource.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        ambientSource.start();

        isAmbientPlaying = true;
        toggleAmbientBtn.textContent = 'Stop Soundscape';
      } catch (e) {
        console.log('Audio Context restricted');
      }
    }
  });
}


// --- 9. EXPANDED HISTORICAL MENTALIST DATABASE (50+ SHOW CHARACTERS) ---
const cbiDatabase = [
  // Core CBI MCU Team
  { name: "Srijit Banerjee", type: "CBI Director & Special Agent", action: () => document.getElementById('launch-team').click() },
  { name: "Patrick Jane", type: "CBI Consultant / Mentalist", action: () => document.getElementById('launch-team').click() },
  { name: "Teresa Lisbon", type: "Senior Special Agent / MCU Leader", action: () => document.getElementById('launch-team').click() },
  { name: "Kimball Cho", type: "Special Agent / Interrogator", action: () => document.getElementById('launch-team').click() },
  { name: "Wayne Rigsby", type: "Special Agent / Arson Specialist", action: () => document.getElementById('launch-team').click() },
  { name: "Grace Van Pelt", type: "Special Agent / Cyber Tech", action: () => document.getElementById('launch-team').click() },

  // CBI Directors & Leadership
  { name: "Madeleine Hightower", type: "CBI Special Agent in Charge", action: () => alert("Madeleine Hightower: Tough, pragmatic CBI Regional Director.") },
  { name: "Luther Wainwright", type: "Youngest CBI Special Agent in Charge", action: () => alert("Luther Wainwright: Earnest young SAC of the CBI MCU unit.") },
  { name: "Gale Bertram", type: "CBI Regional Director / Red John Suspect", action: () => alert("Gale Bertram: CBI Director linked to the Blake Association.") },
  { name: "Virgil Minelli", type: "Former CBI Director", action: () => alert("Virgil Minelli: Former Director who oversaw Jane's early days.") },

  // Seven Red John Suspects & Serial Killer Figures
  { name: "Thomas McAllister", type: "Napa Sheriff / Red John Leader", action: () => triggerRedJohnEffect() },
  { name: "Brett Partridge", type: "CBI Forensics Lead / Red John Suspect", action: () => alert("Brett Partridge: Creepy CBI forensics technician.") },
  { name: "Bret Stiles", type: "Visualize Cult Leader / Red John Suspect", action: () => alert("Bret Stiles: Head of the Visualize Self-Realization Center.") },
  { name: "Reede Smith", type: "FBI Special Agent / Blake Association", action: () => alert("Reede Smith: FBI Agent who confessed to Blake Association membership.") },
  { name: "Ray Haffner", type: "Former CBI Agent / Private Investigator", action: () => alert("Ray Haffner: Former CBI Agent turned Cult member & PI.") },
  { name: "Bob Kirkland", type: "Homeland Security Agent", action: () => alert("Bob Kirkland: DHS operative obsessively investigating Red John.") },
  { name: "Timothy Carter", type: "Red John Impostor (Mall Shooting)", action: () => alert("Timothy Carter: Man killed by Patrick Jane in the Season 3 finale.") },

  // Key Recurring Characters, FBI, & Associates
  { name: "Dennis Abbott", type: "FBI Supervisory Special Agent", action: () => alert("Dennis Abbott: Led the FBI shutdown of CBI, later hired Jane.") },
  { name: "Kim Fischer", type: "FBI Special Agent", action: () => alert("Kim Fischer: Agent who tracked Jane down in Austin, Texas.") },
  { name: "Jason Wylie", type: "FBI Tech Specialist", action: () => alert("Jason Wylie: Enthusiastic FBI cyber tech wizard.") },
  { name: "Michelle Vega", type: "Rookie FBI Special Agent", action: () => alert("Michelle Vega: Dedicated young FBI Agent trained by Cho.") },
  { name: "Marcus Pike", type: "FBI Art Crime Division Agent", action: () => alert("Marcus Pike: Agent who dated Lisbon before she chose Jane.") },
  { name: "J.J. LaRoche", type: "Internal Affairs Lead / CBI Interim SAC", action: () => alert("J.J. LaRoche: Brilliant IA officer with his mysterious Tupperware box.") },
  { name: "Lorelei Martins", type: "Red John Disciple / Waitress", action: () => alert("Lorelei Martins: Trusted associate who revealed Red John shook Jane's hand.") },
  { name: "Craig O'Laughlin", type: "FBI Agent / Van Pelt's Fiance / Red John Mole", action: () => alert("Craig O'Laughlin: FBI mole who shot Hightower.") },
  { name: "Walter Mashburn", type: "Playboy Billionaire / Friend of Jane", action: () => alert("Walter Mashburn: Wealthy thrill-seeker and romantic interest of Lisbon.") },
  { name: "Summer Edgecombe", type: "CBI Informant / Cho's Assistant", action: () => alert("Summer Edgecombe: Feisty street informant hired by Agent Cho.") },
  { name: "Erica Flynn", type: "Convicted Murderer / Matchmaker", action: () => alert("Erica Flynn: Charming, manipulative murderer who matched wits with Jane.") },
  { name: "Kristina Frye", type: "Psychic Medium", action: () => alert("Kristina Frye: Spiritualist who famously addressed Red John on live TV.") },
  { name: "Sam Bosco", type: "CBI Senior Agent (Former MCU)", action: () => alert("Sam Bosco: Dedicated Agent in charge of the original Red John file.") },
  { name: "Tommy Volker", type: "Corrupt Multi-Billionaire Industrialist", action: () => alert("Tommy Volker: Ruthless CEO prosecuted by Lisbon.") },
  { name: "Todd Johnson", type: "Cop Killer / Red John Operative", action: () => alert("Todd Johnson: Burned alive inside CBI holding cell.") },
  { name: "Osvaldo Ardiles", type: "District Attorney / Prosecutor", action: () => alert("Osvaldo Ardiles: Sacramento Assistant District Attorney.") },
  { name: "Sean Barlow", type: "Rival Psychic Specialist", action: () => alert("Sean Barlow: Counter-medium who claimed Jane was a fraud.") },
  { name: "Dean Harken", type: "CDC Epidemic Specialist", action: () => alert("Dean Harken: Health inspector during biological scare cases.") },
  { name: "Rosalind Harker", type: "Blind Pianist / Red John Ex-Girlfriend", action: () => alert("Rosalind Harker: Blind woman who lived with Red John under alias Roy.") },
  { name: "Richard Haibach", type: "Vengeful Suspect / Serial Kidnapper", action: () => alert("Richard Haibach: Suspect who targeted Lisbon and her team.") },
  { name: "Walter Pierce", type: "Tech CEO Suspect", action: () => alert("Walter Pierce: High-tech executive involved in homicide cases.") },
  { name: "Gabriel Hicks", type: "Serial Killer Suspect", action: () => alert("Gabriel Hicks: Target of FBI investigation in later seasons.") },
  { name: "Marcus LaSalle", type: "CBI Security Deputy", action: () => alert("Marcus LaSalle: Tactical response officer.") },
  { name: "Anthony Denison", type: "Visualize Executive", action: () => alert("Anthony Denison: Second-in-command at Visualize Center.") },
  { name: "Orville Coleman", type: "Sacramento Politician", action: () => alert("Orville Coleman: Local councilor involved in CBI corruption cases.") },
  { name: "Michael Ridley", type: "Human Trafficking Ring Leader", action: () => alert("Michael Ridley: Wealthy international smuggler.") },
  { name: "Royston Daniel", type: "Forensic Psychologist", action: () => alert("Royston Daniel: Evaluator of psychiatric cases.") },
  { name: "James Panzer", type: "Blog Reporter / San Joaquin Killer", action: () => alert("James Panzer: Serial killer called out on TV by Jane.") },
  { name: "Paul Delabaum", type: "Visualize Member", action: () => alert("Paul Delabaum: High-ranking member of Stiles' organization.") },
  { name: "Davenport", type: "Sacramento Judge", action: () => alert("Judge Davenport: Presiding judge on CBI warrant requests.") },
  { name: "Sarah Harrigan", type: "Public Defender / Rigsby's Ex", action: () => alert("Sarah Harrigan: Legal counsel who had a child with Rigsby.") },
  { name: "Ben Marx", type: "Car Salesman Suspect", action: () => alert("Ben Marx: Suspect interrogated by Jane using a fake bury-alive ploy.") }
];

const searchInput = document.getElementById('cbi-search-input');
const searchDropdown = document.getElementById('search-results-dropdown');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { searchDropdown.classList.add('hidden'); return; }

    const matches = cbiDatabase.filter(item => item.name.toLowerCase().includes(query) || item.type.toLowerCase().includes(query));

    searchDropdown.innerHTML = '';
    if (matches.length === 0) {
      searchDropdown.innerHTML = '<div class="search-result-item">No CBI historical records match query.</div>';
    } else {
      matches.forEach(match => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `
          <div class="search-result-title">${match.name}</div>
          <div class="search-result-type">${match.type}</div>
        `;
        div.addEventListener('click', () => {
          match.action();
          searchDropdown.classList.add('hidden');
          searchInput.value = '';
        });
        searchDropdown.appendChild(div);
      });
    }
    searchDropdown.classList.remove('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.add('hidden');
    }
  });
}


// --- 10. DEDUCTION ENGINE OBSERVATIONS (15+ ITEMS) ---
const observations = [
  "Noticing a subtle hesitation in your mouse movements...",
  "Browsing evidence logs... searching for a specific pattern?",
  "Fidgeting with open windows... classic sign of intense focus.",
  "You haven't touched the tea timer in a while. Caffeine low?",
  "A quiet detective is either thorough or plotting something clever.",
  "Your cursor trajectory suggests you're scanning for hidden secrets.",
  "Observing... every click tells a psychological story.",
  "Director Srijit Banerjee is monitoring the investigation room.",
  "Checking the team roster? Ensuring everyone is accounted for.",
  "Eyes darting across the desktop grid. deliberating next move?",
  "A relaxed pulse rate... or calculated composure?",
  "Comparing field notes against suspect profiles... methodical.",
  "There are no coincidences in crime, only unobserved details.",
  "Patrick Jane observes: You double-click when contemplating decisions.",
  "System telemetry active: CBI Sacramento network operational."
];

const tickerEl = document.getElementById('deduction-ticker');
function updateObservation(text) {
  if (tickerEl) tickerEl.textContent = `Observation: ${text}`;
}

setInterval(() => {
  const randomIndex = Math.floor(Math.random() * observations.length);
  updateObservation(observations[randomIndex]);
}, 18000);


// --- 11. CBI BADGE ISSUANCE & CANVAS DOWNLOAD ---
const badgeModal = document.getElementById('cbi-credential-modal');
const cbiBadgeEgg = document.getElementById('cbi-badge-egg');
const closeBadgeBtn = document.getElementById('close-badge-modal');
const generateBadgeBtn = document.getElementById('generate-badge-btn');
const downloadBadgeBtn = document.getElementById('download-badge-btn');
const badgeFormPane = document.getElementById('badge-form-pane');
const badgeCardResult = document.getElementById('badge-card-result');

if (cbiBadgeEgg) {
  cbiBadgeEgg.addEventListener('click', () => {
    badgeModal.classList.remove('hidden');
  });
}

if (closeBadgeBtn) {
  closeBadgeBtn.addEventListener('click', () => {
    badgeModal.classList.add('hidden');
  });
}

if (generateBadgeBtn) {
  generateBadgeBtn.addEventListener('click', () => {
    const name = document.getElementById('consultant-name').value.trim() || "Special Investigator";
    const dept = document.getElementById('consultant-dept').value;

    document.getElementById('issued-name').textContent = name;
    document.getElementById('issued-spec').textContent = "Field: " + dept;
    document.getElementById('issued-serial').textContent = "ID: CBI-" + Math.floor(10000 + Math.random() * 90000) + "-CA";

    badgeFormPane.classList.add('hidden');
    badgeCardResult.classList.remove('hidden');
  });
}

// Canvas-based Badge Download Generator
if (downloadBadgeBtn) {
  downloadBadgeBtn.addEventListener('click', () => {
    const name = document.getElementById('issued-name').textContent;
    const spec = document.getElementById('issued-spec').textContent;
    const serial = document.getElementById('issued-serial').textContent;

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 500, 280);
    grad.addColorStop(0, '#2b1c11');
    grad.addColorStop(1, '#120b07');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 280);

    // Border
    ctx.strokeStyle = '#c29b38';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 480, 260);

    // Header Bar
    ctx.fillStyle = '#c29b38';
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('CALIFORNIA BUREAU OF INVESTIGATION', 250, 40);

    // Divider
    ctx.beginPath();
    ctx.moveTo(30, 50);
    ctx.lineTo(470, 50);
    ctx.strokeStyle = '#c29b38';
    ctx.stroke();

    // Badge Star Symbol
    ctx.font = '60px serif';
    ctx.fillText('⭐', 80, 150);

    // Badge Text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Courier New';
    ctx.fillText(name, 150, 110);

    ctx.fillStyle = '#d2c3a5';
    ctx.font = '14px Courier New';
    ctx.fillText('Special Consultant', 150, 135);
    ctx.fillText(spec, 150, 160);

    ctx.fillStyle = '#c29b38';
    ctx.font = 'bold 13px Courier New';
    ctx.fillText(serial, 150, 190);

    // Footer Signature
    ctx.textAlign = 'right';
    ctx.fillStyle = '#aaaaaa';
    ctx.font = 'italic 12px Courier New';
    ctx.fillText('Authorized by: Director Srijit Banerjee', 460, 245);

    // Download PNG
    const link = document.createElement('a');
    link.download = `CBI_Badge_${name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}


// --- 12. CUSTOM CONTEXT MENU ---
const contextMenu = document.getElementById('context-menu');

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (contextMenu) {
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.classList.remove('hidden');
  }
});

document.addEventListener('click', (e) => {
  if (contextMenu && !contextMenu.contains(e.target)) {
    contextMenu.classList.add('hidden');
  }
});

document.getElementById('cm-inspect').addEventListener('click', () => {
  updateObservation("Patrick Jane is inspecting the desk surface for fingerprints...");
  contextMenu.classList.add('hidden');
});

document.getElementById('cm-team').addEventListener('click', () => { document.getElementById('launch-team').click(); contextMenu.classList.add('hidden'); });
document.getElementById('cm-badge').addEventListener('click', () => { badgeModal.classList.remove('hidden'); contextMenu.classList.add('hidden'); });
document.getElementById('cm-tea').addEventListener('click', () => { document.getElementById('launch-tea').click(); contextMenu.classList.add('hidden'); });
document.getElementById('cm-devlogs').addEventListener('click', () => { document.getElementById('launch-devlog').click(); contextMenu.classList.add('hidden'); });
document.getElementById('cm-pinboard').addEventListener('click', () => { document.getElementById('launch-pinboard').click(); contextMenu.classList.add('hidden'); });
document.getElementById('cm-notepad').addEventListener('click', () => { document.getElementById('launch-notepad').click(); contextMenu.classList.add('hidden'); });
document.getElementById('cm-darkmode').addEventListener('click', () => { triggerRedJohnEffect(); contextMenu.classList.add('hidden'); });


// --- 13. RED JOHN HORROR EASTER EGG (RIGHT EASTER EGG) ---
function triggerRedJohnEffect() {
  const overlay = document.getElementById('rj-overlay');
  const dripsContainer = document.getElementById('blood-drips-container');
  dripsContainer.innerHTML = '';

  for (let i = 0; i < 25; i++) {
    const drop = document.createElement('div');
    drop.className = 'blood-drop';
    drop.style.left = `${Math.random() * 100}vw`;
    drop.style.animationDuration = `${1 + Math.random() * 2}s`;
    drop.style.animationDelay = `${Math.random() * 0.5}s`;
    dripsContainer.appendChild(drop);
  }

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.8);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.8);
  } catch (e) {}

  overlay.classList.remove('hidden');
  document.body.classList.toggle('dark-mode');

  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 2200);
}

document.getElementById('red-john-egg').addEventListener('click', triggerRedJohnEffect);