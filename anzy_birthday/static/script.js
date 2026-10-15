/* A Little Universe for Anzy — intentionally dependency-free browser interactions */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const chapters = [
    'a tiny invitation', 'the happiness garden', 'catch a little happiness',
    'birthday wish time', 'a present for you', 'a letter for anzy', 'one last surprise'
  ];
  const catNames = ['cool', 'flower', 'splash', 'boba', 'hello', 'cozy', 'friends'];
  const catBase = 'static/cats/';
  const mascotLines = [
    'pssst, your birthday mission begins here! ✦',
    'flowers are blooming just for you! 🌷',
    'catch those sparkly little stars! ✦',
    'wish BIG! the universe can handle it. ✨',
    'a gift? for the birthday legend? obviously! 🎁',
    'a letter, plus a tiny comfort corner just in case. 📝',
    'surprise! you made it to the stars! ✦'
  ];
  const flowerNotes = [
    'You have a talent for making people laugh. Honestly, it should go on your résumé. 😆',
    'You’re generous with others, and that kindness never goes unnoticed.',
    'Your cheerful vibe makes even an ordinary day feel a bit more fun.',
    'Little thoughtful things can make a big difference. You’re really good at those.',
    'Your mission this year: collect good memories and remember to take care of yourself too. 🌷'
  ];
  const starNotes = [
    '✦ star one: unlimited good vibes unlocked!',
    '✦ star two: warning, your laughter may be contagious.',
    '✦ star three: officially certified good-vibes expert!',
    '✦ star four: may your snacks always be excellent.',
    '✦ star five: five stars for the birthday legend! ⭐⭐⭐⭐⭐'
  ];
  let currentStage = 0;
  let starCount = 0;
  let starsTimer = null;
  let giftTaps = 0;
  let candleState = 'unlit';
  let secretFound = new Set();
  let badgeShown = false;
  let toastTimer = null;
  let mascotTimer = null;
  let audioContext = null;
  let melodyTimer = null;
  let melodyIndex = 0;
  let musicOn = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Encouragement can be reopened whenever the birthday girl needs a little boost.
  const comfortMessages = [
    { cat: 'sleepy', alt: 'Sleepy cat tucked in bed', text: "You don't have to be cheerful every single day. It's okay to rest and take things at your own pace." },
    { cat: 'laptop', alt: 'Little cat with a laptop', text: "Even if today feels like a lot, you're doing better than you think. One small step is enough for now." },
    { cat: 'grr', alt: 'Frustrated doodle cat', text: "Some days are just unfairly difficult. Take a breath. A bad day isn't a bad life, and tomorrow can be different." },
    { cat: 'cozy', alt: 'Cozy blanket cat', text: "You give so much kindness to other people. Don't forget that you deserve some of that kindness too." },
    { cat: 'flower', alt: 'Cat carrying a little pink flower', text: "You don't need to have everything sorted out to deserve good things. You're allowed to grow at your own pace." },
    { cat: 'smile', alt: 'Happy little doodle cat', text: "It's okay if all you managed today was getting through it. Small victories still count, Anzy." }
  ];
  let comfortIndex = 0;
  let lastBoostFocus = null;
  function renderComfortMessage() {
    const item = comfortMessages[comfortIndex];
    $('#boostCat').src = `${catBase}${item.cat}.png`;
    $('#boostCat').alt = item.alt;
    $('#boostMessage').textContent = item.text;
  }
  function openBoost() {
    lastBoostFocus = document.activeElement;
    renderComfortMessage();
    $('#boostModal').classList.remove('hidden');
    $('#boostClose').focus();
  }
  function closeBoost() {
    $('#boostModal').classList.add('hidden');
    if (lastBoostFocus && typeof lastBoostFocus.focus === 'function') lastBoostFocus.focus();
  }
  $('#boostBtn').addEventListener('click', openBoost);
  $('#boostClose').addEventListener('click', closeBoost);
  $('#boostDone').addEventListener('click', closeBoost);
  $('#boostAnother').addEventListener('click', () => {
    comfortIndex = (comfortIndex + 1) % comfortMessages.length;
    renderComfortMessage();
  });
  $('#boostModal').addEventListener('click', (event) => {
    if (event.target === $('#boostModal')) closeBoost();
  });
  document.addEventListener('keydown', (event) => {
    if ($('#boostModal').classList.contains('hidden')) return;
    if (event.key === 'Escape') closeBoost();
    if (event.key === 'Tab') {
      const focusables = [$('#boostClose'), $('#boostAnother'), $('#boostDone')];
      const idx = focusables.indexOf(document.activeElement);
      if (event.shiftKey && idx === 0) { event.preventDefault(); focusables[focusables.length - 1].focus(); }
      if (!event.shiftKey && idx === focusables.length - 1) { event.preventDefault(); focusables[0].focus(); }
    }
  });

  // Floating ambient points of light. Fixed positions prevent jitter during interactions.
  let seed = 1493;
  function pseudoRandom() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  for (let i = 0; i < 42; i += 1) {
    const s = document.createElement('span');
    s.className = 'ambient-star';
    s.textContent = i % 4 === 0 ? '✧' : '·';
    s.style.left = `${pseudoRandom() * 98}%`;
    s.style.top = `${pseudoRandom() * 96}%`;
    s.style.setProperty('--size', `${7 + pseudoRandom() * 13}px`);
    s.style.setProperty('--duration', `${3 + pseudoRandom() * 6}s`);
    s.style.setProperty('--delay', `${-pseudoRandom() * 7}s`);
    $('#ambientStars').append(s);
  }

  // Lightweight celebration particles in a single canvas.
  const canvas = $('#fxCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animating = false;
  const colors = ['#ffc5dd', '#ffe4a1', '#dccbff', '#fff9ee', '#aee8d8', '#fb9eb4'];
  function resizeCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * scale);
    canvas.height = Math.round(window.innerHeight * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();
  function celebrate(x = innerWidth / 2, y = innerHeight / 2, amount = 70) {
    if (reducedMotion) return;
    for (let i = 0; i < amount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const power = 2 + Math.random() * 7;
      particles.push({ x, y, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power - 2,
        life: 65 + Math.random() * 50, angle: Math.random() * Math.PI, spin: (Math.random() - .5) * .18,
        color: colors[Math.floor(Math.random() * colors.length)], size: 2.5 + Math.random() * 5 });
    }
    if (!animating) { animating = true; requestAnimationFrame(drawParticles); }
  }
  function drawParticles() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter((p) => p.life > 0);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += .095; p.vx *= .991; p.angle += p.spin; p.life -= 1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.globalAlpha = Math.min(1, p.life / 24); ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.75);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (particles.length) requestAnimationFrame(drawParticles);
    else { animating = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function celebrateElement(el, amount = 55) {
    const b = el.getBoundingClientRect();
    celebrate(b.left + b.width / 2, b.top + b.height / 2, amount);
  }
  function fireworks() {
    celebrate(innerWidth * .3, innerHeight * .36, 110);
    setTimeout(() => celebrate(innerWidth * .74, innerHeight * .24, 120), 420);
    setTimeout(() => celebrate(innerWidth * .47, innerHeight * .55, 125), 840);
    setTimeout(() => celebrate(innerWidth * .63, innerHeight * .4, 85), 1700);
  }

  function toast(message, ms = 3400) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }
  function mascot(message) {
    $('#mascotText').textContent = message;
    $('#mascot').classList.add('visible');
    clearTimeout(mascotTimer);
    mascotTimer = setTimeout(() => $('#mascot').classList.remove('visible'), 4900);
  }
  function showStage(index) {
    if (index < 0 || index >= chapters.length) return;
    stopStarGame();
    currentStage = index;
    $$('.stage').forEach((stage) => {
      const active = Number(stage.dataset.stage) === index;
      stage.classList.toggle('active', active);
      stage.setAttribute('aria-hidden', String(!active));
    });
    $$('.chapter-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.classList.toggle('done', i < index);
    });
    $('#chapterName').textContent = chapters[index];
    $('#chapterNumber').textContent = String(index + 1).padStart(2, '0');
    document.body.dataset.scene = String(index);
    $('#mascotCat').src = `${catBase}${catNames[index]}.png`;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
    mascot(mascotLines[index]);
    if (index === 2 && starCount < 5) startStarGame();
  }
  function findSecret(id, message) {
    toast(message, 4200);
    if (secretFound.has(id)) return;
    secretFound.add(id);
    celebrate(innerWidth * .5, innerHeight * .35, 40);
    if (secretFound.size === 3 && !badgeShown) {
      badgeShown = true;
      const badge = $('#badgePop');
      badge.classList.add('show');
      mascot('you found all the secret surprises! ☀');
      setTimeout(() => badge.classList.remove('show'), 6600);
    }
  }

  $('#moonSecret').addEventListener('click', () => findSecret('moon', '🌙 Moon report: excellent birthday energy detected. More cake advised.'));
  $('#butterflySecret').addEventListener('click', () => findSecret('butterfly', '🦋 Secret butterfly message: the kindness you give always matters.'));
  $('#starSecret').addEventListener('click', () => findSecret('star', '✦ Your lucky star says: keep being your bright, wonderful self.'));

  // Tap any cat sticker or comfort note for a tiny extra birthday surprise.
  $$('.cat-pop, .comfort-chip').forEach((kitty) => {
    kitty.addEventListener('click', () => {
      const message = kitty.dataset.catMessage || 'Meeeow! Happy birthday, Anzy!';
      kitty.classList.remove('kitty-wiggle');
      void kitty.offsetWidth;
      kitty.classList.add('kitty-wiggle');
      toast(message, 4000);
      celebrateElement(kitty, kitty.classList.contains('comfort-chip') ? 18 : 20);
    });
    kitty.addEventListener('animationend', () => kitty.classList.remove('kitty-wiggle'));
  });

  // Invitation
  $('#envelopeButton').addEventListener('click', (event) => {
    if (event.currentTarget.classList.contains('opening')) return;
    event.currentTarget.classList.add('opening');
    $('#envelopeHint').textContent = 'surprise! birthday quest unlocked! ✦';
    celebrateElement(event.currentTarget, 100);
    setTimeout(() => showStage(1), reducedMotion ? 350 : 1450);
  });

  // Flowers
  const bloomed = new Set();
  $$('.flower').forEach((flower) => {
    flower.addEventListener('click', () => {
      const i = Number(flower.dataset.flower);
      if (bloomed.has(i)) { toast(flowerNotes[i]); return; }
      bloomed.add(i);
      flower.classList.add('bloomed');
      flower.setAttribute('aria-label', `Flower ${i + 1} bloomed. Read its message below`);
      $('#flowerMessageText').textContent = flowerNotes[i];
      $('#flowerCount').textContent = String(bloomed.size);
      celebrateElement(flower, 22);
      if (bloomed.size === 5) {
        $('#gardenNext').classList.remove('hidden');
        mascot('see? even the flowers are happier around you!');
        setTimeout(() => { $('#flowerMessageText').textContent = 'See? Even flowers are happier when you are around. 🌼'; celebrate(innerWidth * .5, innerHeight * .5, 110); }, 900);
      }
    });
  });
  $('#gardenNext').addEventListener('click', () => showStage(2));

  // Star catching minigame. Stars are true moving buttons, not static illustrations.
  function spawnStar() {
    if (currentStage !== 2 || starCount >= 5) return;
    const field = $('#starGame');
    if ($$('.falling-star').length >= 7) return;
    const star = document.createElement('button');
    star.className = 'falling-star';
    star.type = 'button';
    star.textContent = Math.random() > .4 ? '✦' : '✳';
    star.setAttribute('aria-label', 'Catch this falling star');
    star.style.setProperty('--x', `${8 + Math.random() * 78}%`);
    star.style.setProperty('--fall-time', `${5.5 + Math.random() * 2}s`);
    star.addEventListener('click', () => {
      if (star.classList.contains('caught') || starCount >= 5) return;
      star.classList.add('caught');
      starCount += 1;
      $('#starsCaught').textContent = String(starCount);
      $('#catchFeedback').textContent = starNotes[starCount - 1];
      celebrateElement(star, 27);
      setTimeout(() => star.remove(), 250);
      if (starCount === 5) {
        stopStarGame();
        $('#starsNext').classList.remove('hidden');
        $('#starInstruction').textContent = 'mission complete! you caught all five. ✦';
        mascot('5 out of 5! officially a star-catching legend!');
        setTimeout(() => celebrate(innerWidth * .5, innerHeight * .5, 110), 300);
      }
    });
    star.addEventListener('animationend', () => star.remove(), { once: true });
    field.appendChild(star);
  }
  function startStarGame() {
    if (starsTimer || starCount >= 5) return;
    spawnStar();
    starsTimer = setInterval(spawnStar, 850);
  }
  function stopStarGame() {
    if (starsTimer) { clearInterval(starsTimer); starsTimer = null; }
    $$('.falling-star').forEach((s) => s.remove());
  }
  $('#starsNext').addEventListener('click', () => showStage(3));

  // Birthday cake ritual
  $('#decorateCake').addEventListener('click', () => {
    $('#birthdayCake').classList.toggle('extra');
    $('#decorateCake').classList.add('completed');
    toast('✿ Extra sprinkles? Always a good idea.');
    celebrateElement($('#birthdayCake'), 40);
  });
  $('#lightCandles').addEventListener('click', () => {
    if (candleState === 'blown') { toast('One wish per cake! The birthday committee has spoken. 🎂'); return; }
    candleState = 'lit';
    $('#birthdayCake').classList.add('lit');
    $('#birthdayCake').classList.remove('blown');
    $('#lightCandles').classList.add('completed');
    $('#blowCandles').disabled = false;
    toast('✧ Candles are glowing! Make a wish...');
    celebrateElement($('#birthdayCake'), 55);
  });
  $('#blowCandles').addEventListener('click', () => {
    if (candleState !== 'lit') return;
    candleState = 'blown';
    $('#birthdayCake').classList.remove('lit');
    $('#birthdayCake').classList.add('blown');
    $('#blowCandles').classList.add('completed');
    $('#blowCandles').disabled = true;
    $('#lightCandles').disabled = true;
    $('#cakeNext').classList.remove('hidden');
    toast('🌙 Wish successfully sent to the universe. I hope it comes true!');
    fireworks();
    mascot('wish sent! no refunds from the universe, though. ✨');
  });
  function wishLantern() {
    const wish = $('#wishInput').value.trim();
    if (!wish) { toast('Type a birthday wish first, if you want to. ✨'); $('#wishInput').focus(); return; }
    const lantern = document.createElement('div');
    lantern.className = 'wish-lantern';
    lantern.style.setProperty('--lantern-x', `${25 + Math.random() * 50}%`);
    $('#lanternLayer').appendChild(lantern);
    setTimeout(() => lantern.remove(), 6200);
    $('#wishInput').value = '';
    toast('✨ Your secret wish is floating up to the stars. No one else can see it.');
  }
  $('#sendWish').addEventListener('click', wishLantern);
  $('#wishInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') wishLantern(); });
  $('#cakeNext').addEventListener('click', () => showStage(4));

  // The gift takes exactly three taps to unwrap.
  $('#giftButton').addEventListener('click', () => {
    if (giftTaps >= 3) return;
    giftTaps += 1;
    const gift = $('#giftButton');
    $$('.gift-taps span')[giftTaps - 1].classList.add('filled');
    gift.classList.remove('shaking');
    void gift.offsetWidth; // restart shake animation deliberately
    gift.classList.add('shaking');
    setTimeout(() => gift.classList.remove('shaking'), 360);
    if (giftTaps === 1) $('#giftHint').textContent = 'hehe, almost there! one more... or two?';
    if (giftTaps === 2) $('#giftHint').textContent = 'ONE MORE! i promise this time! 👀';
    if (giftTaps === 3) {
      $('#giftHint').textContent = 'SURPRISE!! you have officially unlocked your birthday note! 🎉';
      gift.classList.add('opened');
      gift.disabled = true;
      celebrateElement(gift, 150);
      setTimeout(() => $('#giftNext').classList.remove('hidden'), 650);
      mascot('ta-da! a very special delivery, just for you!');
    }
  });
  $('#giftNext').addEventListener('click', () => showStage(5));
  $('#letterNext').addEventListener('click', () => showStage(6));

  // The finale
  $('#finaleReveal').addEventListener('click', () => {
    $('#finalePrelude').classList.add('hidden');
    $('#finaleMessage').classList.remove('hidden');
    fireworks();
    mascot('happy birthday, anzy! the whole universe is cheering! 🎉');
  });
  function resetAdventure() {
    stopStarGame();
    $('#envelopeButton').classList.remove('opening');
    $('#envelopeHint').innerHTML = '<span class="tap-arrow">↗</span> tap the letter, birthday girl!';
    bloomed.clear();
    $$('.flower').forEach((f, i) => { f.classList.remove('bloomed'); f.setAttribute('aria-label', `Bloom flower ${i + 1}`); });
    $('#flowerCount').textContent = '0';
    $('#flowerMessageText').textContent = "Five flowers, five reasons you deserve a great birthday.";
    $('#gardenNext').classList.add('hidden');
    starCount = 0;
    $('#starsCaught').textContent = '0';
    $('#catchFeedback').textContent = 'some stars are worth making a wish on...';
    $('#starInstruction').textContent = 'psst, tap the moving stars before they disappear!';
    $('#starsNext').classList.add('hidden');
    candleState = 'unlit';
    $('#birthdayCake').classList.remove('lit', 'blown', 'extra');
    $$('#decorateCake, #lightCandles, #blowCandles').forEach((b) => b.classList.remove('completed'));
    $('#lightCandles').disabled = false;
    $('#blowCandles').disabled = true;
    $('#cakeNext').classList.add('hidden');
    $('#wishInput').value = '';
    giftTaps = 0;
    $('#giftButton').classList.remove('opened', 'shaking');
    $('#giftButton').disabled = false;
    $('#giftHint').textContent = 'Three taps to unlock it. Those are the rules. Hehe.';
    $$('.gift-taps span').forEach((tap) => tap.classList.remove('filled'));
    $('#giftNext').classList.add('hidden');
    $('#finalePrelude').classList.remove('hidden');
    $('#finaleMessage').classList.add('hidden');
    $('#toast').classList.remove('show');
    showStage(0);
  }
  $('#replayButton').addEventListener('click', resetAdventure);

  // Background music: play user-provided static/music.mp3 if available;
  // otherwise use a soft, original synthesized twinkle loop in Web Audio.
  const customTrack = $('#customMusic');
  const melody = [72, 76, 79, 83, 79, 76, 74, 79, 77, 81, 84, 81, 76, 74, 72, 79];
  function playNote(midi, length = .7, volume = .022) {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const hz = 440 * Math.pow(2, (midi - 69) / 12);
    oscillator.type = 'sine'; oscillator.frequency.value = hz;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .045);
    gain.gain.exponentialRampToValueAtTime(.0001, now + length);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(now); oscillator.stop(now + length + .05);
  }
  function startSynth() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) { toast('Music is not supported by this browser, but the magic still works!'); return false; }
    audioContext = new AudioCtx();
    melodyIndex = 0;
    function playStep() {
      if (!audioContext) return;
      playNote(melody[melodyIndex % melody.length]);
      if (melodyIndex % 4 === 0) playNote([48, 53, 57, 55][Math.floor(melodyIndex / 4) % 4], 1.8, .012);
      melodyIndex += 1;
    }
    playStep();
    melodyTimer = setInterval(playStep, 530);
    return true;
  }
  function stopSynth() {
    if (melodyTimer) clearInterval(melodyTimer);
    melodyTimer = null;
    const oldContext = audioContext;
    audioContext = null;
    if (oldContext && oldContext.state !== 'closed') oldContext.close().catch(() => {});
  }
  function updateMusicButton() {
    $('#musicLabel').textContent = musicOn ? 'sound on' : 'sound off';
    $('#musicIcon').textContent = musicOn ? '♫' : '♪';
    $('#musicBtn').setAttribute('aria-label', musicOn ? 'Turn off background music' : 'Turn on background music');
    $('#musicBtn').setAttribute('aria-pressed', String(musicOn));
  }
  $('#musicBtn').addEventListener('click', async () => {
    if (musicOn) {
      musicOn = false;
      if (customTrack) customTrack.pause();
      stopSynth(); updateMusicButton(); return;
    }
    if (customTrack) {
      try { await customTrack.play(); musicOn = true; }
      catch { musicOn = startSynth(); }
    } else musicOn = startSynth();
    updateMusicButton();
  });
  document.addEventListener('visibilitychange', () => {
    // Let the browser pause the synth while the tab is backgrounded.
    if (audioContext && document.hidden) audioContext.suspend().catch(() => {});
    else if (audioContext && !document.hidden && musicOn) audioContext.resume().catch(() => {});
  });

  // A friendly note appears briefly without obstructing the opening envelope.
  setTimeout(() => mascot(mascotLines[0]), 650);
})();
