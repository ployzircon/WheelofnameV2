/**
 * Classroom Wheel of Names (วงล้อสุ่มชื่อนักเรียน)
 * High-performance Canvas Wheel Engine, Web Audio API Synthesizer, & Classroom Manager
 */

(function () {
  'use strict';

  // --- Default Sample Student Names ---
  const DEFAULT_STUDENTS = [
    '1. ด.ช. กิตติศักดิ์ เจริญพร',
    '2. ด.ญ. กานดา รักษ์ดี',
    '3. ด.ช. ชนะชัย เก่งกล้า',
    '4. ด.ญ. ฐิติมา มีสุข',
    '5. ด.ช. ณัฐพล มุ่งมั่น',
    '6. ด.ญ. ปาริฉัตร ปัญญาดี',
    '7. ด.ช. ภานุวัฒน์ แสงทอง',
    '8. ด.ญ. วรรณภา สดใส',
    '9. ด.ช. อานนท์ สุขสำราญ',
    '10. ด.ญ. อัจฉรา เรียนเก่ง'
  ];

  // --- Color Palettes ---
  const PALETTES = {
    sky: [
      { bg: '#0284c7', text: '#ffffff' },
      { bg: '#38bdf8', text: '#0c4a6e' },
      { bg: '#0ea5e9', text: '#ffffff' },
      { bg: '#7dd3fc', text: '#075985' },
      { bg: '#0369a1', text: '#ffffff' },
      { bg: '#bae6fd', text: '#0369a1' }
    ],
    rainbow: [
      { bg: '#ef4444', text: '#ffffff' },
      { bg: '#f97316', text: '#ffffff' },
      { bg: '#f59e0b', text: '#ffffff' },
      { bg: '#10b981', text: '#ffffff' },
      { bg: '#06b6d4', text: '#ffffff' },
      { bg: '#3b82f6', text: '#ffffff' },
      { bg: '#8b5cf6', text: '#ffffff' },
      { bg: '#ec4899', text: '#ffffff' }
    ],
    pastel: [
      { bg: '#fbcfe8', text: '#831843' },
      { bg: '#fed7aa', text: '#7c2d12' },
      { bg: '#fef08a', text: '#713f12' },
      { bg: '#bbf7d0', text: '#14532d' },
      { bg: '#bfdbfe', text: '#1e3a8a' },
      { bg: '#ddd6fe', text: '#4c1d95' }
    ],
    candy: [
      { bg: '#f43f5e', text: '#ffffff' },
      { bg: '#a855f7', text: '#ffffff' },
      { bg: '#3b82f6', text: '#ffffff' },
      { bg: '#14b8a6', text: '#ffffff' },
      { bg: '#eab308', text: '#ffffff' }
    ],
    forest: [
      { bg: '#059669', text: '#ffffff' },
      { bg: '#10b981', text: '#ffffff' },
      { bg: '#34d399', text: '#064e3b' },
      { bg: '#0d9488', text: '#ffffff' },
      { bg: '#14b8a6', text: '#ffffff' }
    ],
    sunset: [
      { bg: '#ea580c', text: '#ffffff' },
      { bg: '#f97316', text: '#ffffff' },
      { bg: '#fb923c', text: '#431407' },
      { bg: '#facc15', text: '#713f12' },
      { bg: '#e11d48', text: '#ffffff' }
    ]
  };

  // --- App State ---
  const state = {
    names: [],
    history: [],
    classes: {},
    currentClassKey: 'default',
    settings: {
      duration: 7, // seconds
      palette: 'sky',
      soundEnabled: true,
      tickSound: true,
      winnerSound: true,
      autoRemove: false,
      celebrationText: '🎉 ยินดีด้วย! ผู้โชคดีคือ 🎉'
    },
    isSpinning: false,
    currentAngle: 0,
    lastTickIndex: -1,
    currentWinner: null
  };

  // --- DOM Elements ---
  const elements = {
    canvas: document.getElementById('wheelCanvas'),
    pointer: document.getElementById('wheelPointer'),
    centerSpinBtn: document.getElementById('centerSpinBtn'),
    spinLargeBtn: document.getElementById('spinLargeBtn'),
    shuffleWheelBtn: document.getElementById('shuffleWheelBtn'),
    namesInput: document.getElementById('namesInput'),
    activeCountBadge: document.getElementById('activeCountBadge'),
    tabCountBadge: document.getElementById('tabCountBadge'),
    historyCountBadge: document.getElementById('historyCountBadge'),
    sortAZBtn: document.getElementById('sortAZBtn'),
    clearAllNamesBtn: document.getElementById('clearAllNamesBtn'),
    saveAsClassBtn: document.getElementById('saveAsClassBtn'),
    importFileInput: document.getElementById('importFileInput'),
    exportFileBtn: document.getElementById('exportFileBtn'),
    quickClassSelect: document.getElementById('quickClassSelect'),
    addNewClassBtn: document.getElementById('addNewClassBtn'),
    classListContainer: document.getElementById('classListContainer'),
    historyList: document.getElementById('historyList'),
    historyEmptyState: document.getElementById('historyEmptyState'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    copyHistoryBtn: document.getElementById('copyHistoryBtn'),
    spinDurationRange: document.getElementById('spinDurationRange'),
    spinDurationValue: document.getElementById('spinDurationValue'),
    tickSoundCheckbox: document.getElementById('tickSoundCheckbox'),
    winnerSoundCheckbox: document.getElementById('winnerSoundCheckbox'),
    autoRemoveCheckbox: document.getElementById('autoRemoveCheckbox'),
    celebrationTextInput: document.getElementById('celebrationTextInput'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIconOn: document.getElementById('soundIconOn'),
    soundIconOff: document.getElementById('soundIconOff'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    enterFullscreenIcon: document.getElementById('enterFullscreenIcon'),
    exitFullscreenIcon: document.getElementById('exitFullscreenIcon'),
    winnerModal: document.getElementById('winnerModal'),
    winnerNameDisplay: document.getElementById('winnerNameDisplay'),
    winnerModalTitle: document.getElementById('winnerModalTitle'),
    modalRemoveBtn: document.getElementById('modalRemoveBtn'),
    modalKeepBtn: document.getElementById('modalKeepBtn'),
    modalSpinAgainBtn: document.getElementById('modalSpinAgainBtn'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    classModal: document.getElementById('classModal'),
    classNameInput: document.getElementById('classNameInput'),
    cancelClassModalBtn: document.getElementById('cancelClassModalBtn'),
    confirmClassModalBtn: document.getElementById('confirmClassModalBtn')
  };

  const ctx = elements.canvas.getContext('2d');

  // --- Web Audio API Sound Synthesizer ---
  class SoundEngine {
    constructor() {
      this.audioCtx = null;
    }

    init() {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    playTick(pitchModifier = 1) {
      if (!state.settings.soundEnabled || !state.settings.tickSound) return;
      this.init();
      if (!this.audioCtx) return;

      try {
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        const baseFreq = 480 * Math.min(Math.max(pitchModifier, 0.7), 1.8);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.04);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
      } catch (e) {
        // Audio error silent fallback
      }
    }

    playVictory() {
      if (!state.settings.soundEnabled || !state.settings.winnerSound) return;
      this.init();
      if (!this.audioCtx) return;

      try {
        const notes = [
          { f: 523.25, time: 0, dur: 0.12 },     // C5
          { f: 659.25, time: 0.12, dur: 0.12 },  // E5
          { f: 783.99, time: 0.24, dur: 0.14 },  // G5
          { f: 1046.50, time: 0.38, dur: 0.45 }  // C6 (Triumph finale)
        ];

        const now = this.audioCtx.currentTime;

        notes.forEach(note => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.f, now + note.time);

          gain.gain.setValueAtTime(0, now + note.time);
          gain.gain.linearRampToValueAtTime(0.4, now + note.time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + note.time);
          osc.stop(now + note.time + note.dur);
        });

        // Sparkle chimes
        setTimeout(() => {
          if (!this.audioCtx) return;
          const chimeNotes = [1318.5, 1567.98, 1760.0, 2093.0];
          chimeNotes.forEach((freq, idx) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const chimeTime = this.audioCtx.currentTime + (idx * 0.06);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, chimeTime);

            gain.gain.setValueAtTime(0.15, chimeTime);
            gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.2);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(chimeTime);
            osc.stop(chimeTime + 0.2);
          });
        }, 400);

      } catch (e) {
        // Audio error silent fallback
      }
    }
  }

  const soundEngine = new SoundEngine();

  // --- LocalStorage Management ---
  function loadFromStorage() {
    try {
      const savedClasses = localStorage.getItem('cw_classes');
      if (savedClasses) {
        state.classes = JSON.parse(savedClasses);
      } else {
        state.classes = {
          'default': { name: 'รายชื่อตัวอย่าง (ห้องเรียนทดลอง)', names: [...DEFAULT_STUDENTS] }
        };
      }

      const savedSettings = localStorage.getItem('cw_settings');
      if (savedSettings) {
        state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
      }

      const savedHistory = localStorage.getItem('cw_history');
      if (savedHistory) {
        state.history = JSON.parse(savedHistory);
      }

      const currentNames = state.classes[state.currentClassKey]?.names || [...DEFAULT_STUDENTS];
      setNames(currentNames, false);

      applySettingsToUI();
      renderClassList();
      renderHistoryList();
      populateClassSelectDropdown();
    } catch (e) {
      console.warn('LocalStorage load error:', e);
      setNames([...DEFAULT_STUDENTS], false);
    }
  }

  function saveClassesToStorage() {
    try {
      localStorage.setItem('cw_classes', JSON.stringify(state.classes));
      populateClassSelectDropdown();
      renderClassList();
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function saveSettingsToStorage() {
    try {
      localStorage.setItem('cw_settings', JSON.stringify(state.settings));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function saveHistoryToStorage() {
    try {
      localStorage.setItem('cw_history', JSON.stringify(state.history));
      renderHistoryList();
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // --- Wheel Physics & Drawing Engine ---
  function resizeCanvas() {
    const size = 800; // Native high-res canvas buffer
    elements.canvas.width = size;
    elements.canvas.height = size;
    drawWheel();
  }

  function drawWheel() {
    const width = elements.canvas.width;
    const height = elements.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    const namesCount = state.names.length;
    if (namesCount === 0) {
      // Empty wheel state
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = "bold 28px 'Prompt', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('กรุณาใส่รายชื่อนักเรียน', centerX, centerY);
      ctx.restore();
      return;
    }

    const arcSize = (2 * Math.PI) / namesCount;
    const palette = PALETTES[state.settings.palette] || PALETTES.sky;

    // Draw slices
    for (let i = 0; i < namesCount; i++) {
      const sliceStart = state.currentAngle + i * arcSize;
      const sliceEnd = sliceStart + arcSize;
      const colorScheme = palette[i % palette.length];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sliceStart, sliceEnd);
      ctx.closePath();

      // Gradient shading for subtle 3D depth
      const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius);
      grad.addColorStop(0, colorScheme.bg);
      grad.addColorStop(1, shadeColor(colorScheme.bg, -10));

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = namesCount > 40 ? 1 : 2.5;
      ctx.stroke();

      // Draw Slice Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(sliceStart + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colorScheme.text;

      // Smart Font Size calculation
      let fontSize = Math.floor(radius / 12);
      if (namesCount > 15) fontSize = Math.floor(radius / 16);
      if (namesCount > 30) fontSize = Math.floor(radius / 22);
      if (namesCount > 50) fontSize = Math.floor(radius / 28);
      fontSize = Math.max(fontSize, 11);

      ctx.font = `600 ${fontSize}px 'Prompt', sans-serif`;

      // Text truncation if too long
      let displayName = state.names[i];
      const maxTextWidth = radius - 80;
      if (ctx.measureText(displayName).width > maxTextWidth) {
        while (ctx.measureText(displayName + '…').width > maxTextWidth && displayName.length > 0) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '…';
      }

      // Text shadow for high contrast legibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(displayName, radius - 28, 0);
      ctx.restore();

      ctx.restore();
    }

    // Outer Rim Decoration & Pegs
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw Golden Pegs / Pins at slice borders
    for (let i = 0; i < namesCount; i++) {
      const pinAngle = state.currentAngle + i * arcSize;
      const pinX = centerX + (radius - 2) * Math.cos(pinAngle);
      const pinY = centerY + (radius - 2) * Math.sin(pinAngle);

      ctx.beginPath();
      ctx.arc(pinX, pinY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  function shadeColor(color, percent) {
    let num = parseInt(color.replace('#', ''), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // --- Winner Calculation ---
  function getWinnerIndex(angle) {
    const count = state.names.length;
    if (count === 0) return -1;
    const arcSize = (2 * Math.PI) / count;

    // Pointer is fixed at 0 radians (3 o'clock on the right)
    let normalized = (-angle) % (2 * Math.PI);
    if (normalized < 0) normalized += 2 * Math.PI;

    const index = Math.floor(normalized / arcSize) % count;
    return index;
  }

  // --- Spin Mechanics & Animation ---
  function spin() {
    if (state.isSpinning) return;
    if (state.names.length === 0) {
      alert('กรุณาใส่รายชื่อนักเรียนก่อนเริ่มหมุนวงล้อครับ');
      return;
    }

    soundEngine.init();

    state.isSpinning = true;
    elements.centerSpinBtn.disabled = true;
    elements.spinLargeBtn.disabled = true;

    // Random target rotations (between 5 and 10 full turns) + random stop slice
    const durationMs = state.settings.duration * 1000;
    const startAngle = state.currentAngle;
    const totalTurns = 6 + Math.floor(Math.random() * 5);
    const randomOffset = Math.random() * (2 * Math.PI);
    const targetDelta = totalTurns * (2 * Math.PI) + randomOffset;
    const startTime = performance.now();

    state.lastTickIndex = getWinnerIndex(startAngle);

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Smooth custom easing out (cubic bezier / quintic deceleration)
      const easeOut = 1 - Math.pow(1 - progress, 4);

      state.currentAngle = startAngle + targetDelta * easeOut;
      drawWheel();

      // Check peg crossing for ticking sound and pointer animation
      const currentWinnerIdx = getWinnerIndex(state.currentAngle);
      if (currentWinnerIdx !== state.lastTickIndex) {
        state.lastTickIndex = currentWinnerIdx;

        // Animate pointer deflection
        elements.pointer.classList.remove('ticking');
        void elements.pointer.offsetWidth; // trigger reflow
        elements.pointer.classList.add('ticking');

        // Play tick sound with pitch proportional to remaining speed
        const speedRatio = 1 - progress;
        soundEngine.playTick(speedRatio);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin finished!
        state.isSpinning = false;
        elements.centerSpinBtn.disabled = false;
        elements.spinLargeBtn.disabled = false;

        const winnerIndex = getWinnerIndex(state.currentAngle);
        const winnerName = state.names[winnerIndex];
        announceWinner(winnerName, winnerIndex);
      }
    }

    requestAnimationFrame(animate);
  }

  // --- Winner Announcement & Celebration ---
  function announceWinner(name, index) {
    state.currentWinner = { name, index };

    // Record to history
    const historyEntry = {
      name,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      id: Date.now()
    };
    state.history.unshift(historyEntry);
    saveHistoryToStorage();

    // Play Victory Fanfare Sound
    soundEngine.playVictory();

    // Trigger Multi-stage Confetti Cannon Explosion
    triggerConfetti();

    // Display Winner Modal
    elements.winnerModalTitle.textContent = state.settings.celebrationText || '🎉 ขอแสดงความยินดี! 🎉';
    elements.winnerNameDisplay.textContent = name;
    elements.winnerModal.classList.remove('hidden');

    // Auto-remove if setting is enabled
    if (state.settings.autoRemove) {
      setTimeout(() => {
        removeWinnerFromWheel();
      }, 500);
    }
  }

  function triggerConfetti() {
    if (typeof confetti !== 'function') return;

    // Confetti Burst 1: Center burst
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#38bdf8', '#f59e0b', '#10b981', '#ec4899', '#ffffff']
    });

    // Confetti Burst 2: Left and right cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 }
      });
    }, 250);
  }

  function removeWinnerFromWheel() {
    if (!state.currentWinner) return;
    const idx = state.names.indexOf(state.currentWinner.name);
    if (idx !== -1) {
      state.names.splice(idx, 1);
      setNames(state.names, true);
    }
  }

  // --- Names Management ---
  function setNames(namesList, syncTextarea = true) {
    state.names = namesList.filter(n => n.trim().length > 0);
    if (syncTextarea) {
      elements.namesInput.value = state.names.join('\n');
    }
    updateCounts();
    drawWheel();
  }

  function updateCounts() {
    const count = state.names.length;
    elements.activeCountBadge.textContent = count;
    elements.tabCountBadge.textContent = count;
  }

  function shuffleNames() {
    const arr = [...state.names];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setNames(arr, true);
  }

  function sortNamesAZ() {
    const sorted = [...state.names].sort((a, b) => a.localeCompare(b, 'th'));
    setNames(sorted, true);
  }

  // --- Classroom Preset Manager ---
  function populateClassSelectDropdown() {
    elements.quickClassSelect.innerHTML = '';
    const keys = Object.keys(state.classes);

    keys.forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = state.classes[key].name;
      if (key === state.currentClassKey) opt.selected = true;
      elements.quickClassSelect.appendChild(opt);
    });
  }

  function renderClassList() {
    elements.classListContainer.innerHTML = '';
    const keys = Object.keys(state.classes);

    if (keys.length === 0) {
      elements.classListContainer.innerHTML = `
        <div class="empty-state">
          <p>ยังไม่มีห้องเรียนที่บันทึกไว้</p>
        </div>`;
      return;
    }

    keys.forEach(key => {
      const classObj = state.classes[key];
      const isSelected = key === state.currentClassKey;

      const card = document.createElement('div');
      card.className = `class-item-card ${isSelected ? 'selected' : ''}`;

      card.innerHTML = `
        <div class="class-item-info">
          <span class="class-item-name">${escapeHtml(classObj.name)}</span>
          <span class="class-item-count">นักเรียน ${classObj.names.length} คน</span>
        </div>
        <div class="class-item-actions">
          <button class="btn-mini btn-load-class" data-key="${key}" title="โหลดห้องนี้">ใช้งาน</button>
          ${key !== 'default' ? `<button class="btn-mini text-danger btn-delete-class" data-key="${key}" title="ลบห้องนี้">ลบ</button>` : ''}
        </div>
      `;

      elements.classListContainer.appendChild(card);
    });

    // Attach button events
    elements.classListContainer.querySelectorAll('.btn-load-class').forEach(btn => {
      btn.addEventListener('click', () => {
        loadClass(btn.getAttribute('data-key'));
      });
    });

    elements.classListContainer.querySelectorAll('.btn-delete-class').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        if (confirm(`คุณต้องการลบห้อง "${state.classes[key].name}" ใช่หรือไม่?`)) {
          delete state.classes[key];
          if (state.currentClassKey === key) {
            state.currentClassKey = 'default';
            if (state.classes['default']) {
              setNames(state.classes['default'].names, true);
            }
          }
          saveClassesToStorage();
        }
      });
    });
  }

  function loadClass(key) {
    if (!state.classes[key]) return;
    state.currentClassKey = key;
    setNames([...state.classes[key].names], true);
    populateClassSelectDropdown();
    renderClassList();
  }

  function saveCurrentNamesAsNewClass(name) {
    if (!name || name.trim().length === 0) return;
    const key = 'class_' + Date.now();
    state.classes[key] = {
      name: name.trim(),
      names: [...state.names]
    };
    state.currentClassKey = key;
    saveClassesToStorage();
  }

  // --- History List Rendering ---
  function renderHistoryList() {
    elements.historyList.innerHTML = '';
    const count = state.history.length;
    elements.historyCountBadge.textContent = count;

    if (count === 0) {
      elements.historyEmptyState.classList.remove('hidden');
    } else {
      elements.historyEmptyState.classList.add('hidden');
      state.history.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
          <div class="history-item-left">
            <span class="history-rank">${count - index}</span>
            <span class="history-name">${escapeHtml(item.name)}</span>
          </div>
          <span class="history-time">${item.timestamp}</span>
        `;
        elements.historyList.appendChild(li);
      });
    }
  }

  // --- Settings UI Sync ---
  function applySettingsToUI() {
    elements.spinDurationRange.value = state.settings.duration;
    elements.spinDurationValue.textContent = `${state.settings.duration} วิ`;
    elements.tickSoundCheckbox.checked = state.settings.tickSound;
    elements.winnerSoundCheckbox.checked = state.settings.winnerSound;
    elements.autoRemoveCheckbox.checked = state.settings.autoRemove;
    elements.celebrationTextInput.value = state.settings.celebrationText;

    // Palette button active state
    document.querySelectorAll('.theme-btn').forEach(btn => {
      if (btn.getAttribute('data-palette') === state.settings.palette) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    updateSoundToggleUI();
  }

  function updateSoundToggleUI() {
    if (state.settings.soundEnabled) {
      elements.soundIconOn.classList.remove('hidden');
      elements.soundIconOff.classList.add('hidden');
    } else {
      elements.soundIconOn.classList.add('hidden');
      elements.soundIconOff.classList.remove('hidden');
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // --- File Import & Export ---
  function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) {
        setNames(lines, true);
        alert(`นำเข้ารายชื่อสำเร็จทั้งหมด ${lines.length} คน`);
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  }

  function exportNamesToFile() {
    if (state.names.length === 0) {
      alert('ไม่มีรายชื่อสำหรับส่งออก');
      return;
    }
    const content = state.names.join('\r\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-names-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Event Listeners Setup ---
  function initEvents() {
    // Spin trigger buttons
    elements.centerSpinBtn.addEventListener('click', spin);
    elements.spinLargeBtn.addEventListener('click', spin);
    elements.canvas.addEventListener('click', spin);

    // Shuffle & Sort
    elements.shuffleWheelBtn.addEventListener('click', () => {
      shuffleNames();
    });

    elements.sortAZBtn.addEventListener('click', () => {
      sortNamesAZ();
    });

    elements.clearAllNamesBtn.addEventListener('click', () => {
      if (confirm('คุณต้องการลบรายชื่อนักเรียนทั้งหมดในวงล้อใช่หรือไม่?')) {
        setNames([], true);
      }
    });

    // Textarea input sync
    elements.namesInput.addEventListener('input', (e) => {
      const lines = e.target.value.split('\n');
      state.names = lines.filter(l => l.trim().length > 0);
      updateCounts();
      drawWheel();

      // Auto update current class in memory
      if (state.classes[state.currentClassKey]) {
        state.classes[state.currentClassKey].names = [...state.names];
        saveClassesToStorage();
      }
    });

    // File I/O
    elements.importFileInput.addEventListener('change', handleFileImport);
    elements.exportFileBtn.addEventListener('click', exportNamesToFile);

    // Class selection dropdown
    elements.quickClassSelect.addEventListener('change', (e) => {
      loadClass(e.target.value);
    });

    // Save as class modal
    elements.saveAsClassBtn.addEventListener('click', () => {
      elements.classNameInput.value = '';
      elements.classModal.classList.remove('hidden');
      elements.classNameInput.focus();
    });

    elements.addNewClassBtn.addEventListener('click', () => {
      elements.classNameInput.value = '';
      elements.classModal.classList.remove('hidden');
      elements.classNameInput.focus();
    });

    elements.cancelClassModalBtn.addEventListener('click', () => {
      elements.classModal.classList.add('hidden');
    });

    elements.confirmClassModalBtn.addEventListener('click', () => {
      const name = elements.classNameInput.value;
      if (name.trim()) {
        saveCurrentNamesAsNewClass(name);
        elements.classModal.classList.add('hidden');
      }
    });

    // History buttons
    elements.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('คุณต้องการล้างประวัติการสุ่มทั้งหมดใช่หรือไม่?')) {
        state.history = [];
        saveHistoryToStorage();
      }
    });

    elements.copyHistoryBtn.addEventListener('click', () => {
      if (state.history.length === 0) {
        alert('ยังไม่มีประวัติการสุ่ม');
        return;
      }
      const text = state.history.map((h, i) => `${state.history.length - i}. ${h.name} (${h.timestamp})`).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        alert('คัดลอกรายชื่อผู้โชคดีทั้งหมดลงคลิปบอร์ดแล้ว!');
      });
    });

    // Settings tab listeners
    elements.spinDurationRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.settings.duration = val;
      elements.spinDurationValue.textContent = `${val} วิ`;
      saveSettingsToStorage();
    });

    elements.tickSoundCheckbox.addEventListener('change', (e) => {
      state.settings.tickSound = e.target.checked;
      saveSettingsToStorage();
    });

    elements.winnerSoundCheckbox.addEventListener('change', (e) => {
      state.settings.winnerSound = e.target.checked;
      saveSettingsToStorage();
    });

    elements.autoRemoveCheckbox.addEventListener('change', (e) => {
      state.settings.autoRemove = e.target.checked;
      saveSettingsToStorage();
    });

    elements.celebrationTextInput.addEventListener('input', (e) => {
      state.settings.celebrationText = e.target.value;
      saveSettingsToStorage();
    });

    // Palette switch
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.settings.palette = btn.getAttribute('data-palette');
        saveSettingsToStorage();
        drawWheel();
      });
    });

    // Sound toggle in header
    elements.soundToggleBtn.addEventListener('click', () => {
      state.settings.soundEnabled = !state.settings.soundEnabled;
      updateSoundToggleUI();
      saveSettingsToStorage();
      if (state.settings.soundEnabled) soundEngine.init();
    });

    // Fullscreen toggle
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Sidebar tab switching
    document.querySelectorAll('.sidebar-tabs .tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-tabs .tab-btn').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const targetId = tab.getAttribute('data-tab');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Winner Modal buttons
    elements.modalCloseBtn.addEventListener('click', () => {
      elements.winnerModal.classList.add('hidden');
    });

    elements.modalKeepBtn.addEventListener('click', () => {
      elements.winnerModal.classList.add('hidden');
    });

    elements.modalRemoveBtn.addEventListener('click', () => {
      removeWinnerFromWheel();
      elements.winnerModal.classList.add('hidden');
    });

    elements.modalSpinAgainBtn.addEventListener('click', () => {
      elements.winnerModal.classList.add('hidden');
      setTimeout(() => {
        spin();
      }, 300);
    });

    // Keyboard Shortcuts (Space to spin, Esc to close modals)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.activeElement !== elements.namesInput && document.activeElement !== elements.classNameInput && document.activeElement !== elements.celebrationTextInput) {
        e.preventDefault();
        if (!elements.winnerModal.classList.contains('hidden')) {
          elements.winnerModal.classList.add('hidden');
          setTimeout(() => spin(), 200);
        } else {
          spin();
        }
      } else if (e.code === 'Escape') {
        elements.winnerModal.classList.add('hidden');
        elements.classModal.classList.add('hidden');
      }
    });

    // Window Resize
    window.addEventListener('resize', () => {
      drawWheel();
    });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        document.body.classList.add('is-fullscreen');
        elements.enterFullscreenIcon.classList.add('hidden');
        elements.exitFullscreenIcon.classList.remove('hidden');
      }).catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        document.body.classList.remove('is-fullscreen');
        elements.enterFullscreenIcon.classList.remove('hidden');
        elements.exitFullscreenIcon.classList.add('hidden');
      });
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      document.body.classList.remove('is-fullscreen');
      elements.enterFullscreenIcon.classList.remove('hidden');
      elements.exitFullscreenIcon.classList.add('hidden');
    }
  });

  // --- Initializer ---
  function init() {
    resizeCanvas();
    loadFromStorage();
    initEvents();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
