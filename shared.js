(function(){

/* ============ Reduced motion (respects OS setting automatically) ============ */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion){ document.documentElement.classList.add('no-motion'); }

  /* ============ Orbit background rings ============ */
  var SVGNS = "http://www.w3.org/2000/svg";
  function buildOrbitSVG(){
    var svg = document.getElementById('orbit-svg');
    if(!svg) return;
    var cx=350, cy=350;
    [60,130,200,270,340].forEach(function(r){
      var c = document.createElementNS(SVGNS,'circle');
      c.setAttribute('class','orbit-ring');
      c.setAttribute('cx',cx); c.setAttribute('cy',cy); c.setAttribute('r',r);
      svg.appendChild(c);
    });
    for(var deg=0; deg<360; deg+=30){
      var rad = deg * Math.PI/180;
      var x1 = cx + 40*Math.sin(rad), y1 = cy - 40*Math.cos(rad);
      var x2 = cx + 340*Math.sin(rad), y2 = cy - 340*Math.cos(rad);
      var line = document.createElementNS(SVGNS,'line');
      line.setAttribute('class','orbit-spoke');
      line.setAttribute('x1',x1); line.setAttribute('y1',y1);
      line.setAttribute('x2',x2); line.setAttribute('y2',y2);
      svg.appendChild(line);
    }
    var sun = document.createElementNS(SVGNS,'circle');
    sun.setAttribute('class','orbit-sun');
    sun.setAttribute('cx',cx); sun.setAttribute('cy',cy); sun.setAttribute('r',6);
    svg.appendChild(sun);
  }
  buildOrbitSVG();

  /* ============ Starfield canvas ============ */
  var canvas = document.getElementById('starfield');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var stars = [];
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function sizeCanvas(){
    if(!canvas) return;
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    seedStars(w,h);
  }

  function seedStars(w,h){
    var count = Math.max(60, Math.min(220, Math.floor((w*h)/9000)));
    stars = [];
    for(var i=0;i<count;i++){
      var tint = Math.random();
      var color = '245,243,255';
      if(tint>0.88) color='240,194,110';
      else if(tint>0.76) color='124,108,240';
      stars.push({
        x:Math.random()*w, y:Math.random()*h,
        r:0.4 + Math.random()*1.4,
        base:0.25 + Math.random()*0.55,
        amp:0.15 + Math.random()*0.35,
        speed:0.4 + Math.random()*1.1,
        phase:Math.random()*Math.PI*2,
        color:color
      });
    }
  }

  function drawStarsStatic(){
    if(!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(function(s){
      ctx.beginPath();
      ctx.fillStyle = 'rgba('+s.color+','+s.base.toFixed(2)+')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });
  }

  var startTime = performance.now();
  function animateStars(now){
    if(!ctx) return;
    var t = (now - startTime)/1000;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(function(s){
      var alpha = s.base + s.amp*Math.sin(t*s.speed + s.phase);
      if(alpha<0) alpha=0; if(alpha>1) alpha=1;
      ctx.beginPath();
      ctx.fillStyle = 'rgba('+s.color+','+alpha.toFixed(2)+')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(animateStars);
  }

  sizeCanvas();
  if(reduceMotion){ drawStarsStatic(); } else { requestAnimationFrame(animateStars); }

  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      sizeCanvas();
      if(reduceMotion) drawStarsStatic();
    }, 200);
  });

  /* ============ Shared arcade controls ============ */
  function ensureSharedControls(){
    var body = document.body;
    if(!body) return;

    if(!document.getElementById('settings-btn')){
      var settingsBtn = document.createElement('button');
      settingsBtn.id = 'settings-btn';
      settingsBtn.className = 'settings-btn';
      settingsBtn.type = 'button';
      settingsBtn.setAttribute('aria-label','Settings');
      settingsBtn.setAttribute('aria-haspopup','true');
      settingsBtn.setAttribute('aria-expanded','false');
      settingsBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="1.6" fill="currentColor"></circle><circle cx="12" cy="12" r="1.6" fill="currentColor"></circle><circle cx="12" cy="19" r="1.6" fill="currentColor"></circle></svg>';
      body.appendChild(settingsBtn);
    }

    if(!document.getElementById('settings-panel')){
      var panel = document.createElement('div');
      panel.id = 'settings-panel';
      panel.className = 'settings-panel';
      panel.setAttribute('role','dialog');
      panel.setAttribute('aria-label','Settings');
      panel.innerHTML = '<h2>Settings</h2><div class="settings-row"><span>Sound</span><button class="settings-toggle" id="sound-toggle" role="switch" aria-checked="true" type="button" aria-label="Toggle sound"></button></div>';
      body.appendChild(panel);
    }

    if(!document.getElementById('game-nav')){
      var nav = document.createElement('nav');
      nav.id = 'game-nav';
      nav.className = 'game-nav';
      nav.setAttribute('aria-label','Game navigation');
      nav.innerHTML =
        '<a class="game-nav-btn" id="back-game-btn" href="game5.html" aria-label="Previous game">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 5 7.5 12l9 7Z"></path></svg>'+
        '</a>'+
        '<button class="game-nav-btn random-btn" id="random-game-btn" type="button" aria-label="Random game">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"></rect><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="8" cy="16" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"></circle></svg>'+
        '</button>'+
        '<a class="game-nav-btn" id="next-game-btn" href="game2.html" aria-label="Next game">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 5l9 7-9 7Z"></path></svg>'+
        '</a>';
      body.appendChild(nav);
    }

    var idx = parseInt(body.getAttribute('data-game-index'),10);
    if(!isFinite(idx)) idx=0;
    var previous = ['game5.html','game1.html','game2.html','game3.html','game4.html'][idx] || 'game5.html';
    var next = ['game2.html','game3.html','game4.html','game5.html','game1.html'][idx] || 'game1.html';
    var back = document.getElementById('back-game-btn');
    var nextBtn = document.getElementById('next-game-btn');
    if(back) back.href=previous;
    if(nextBtn) nextBtn.href=next;
  }

  ensureSharedControls();

  /* ============ Background music (persists across pages) ============ */
  var bgMusic = new Audio('./Sunday_Morning_Level_Up.mp3?v=3');
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
  bgMusic.preload = 'auto';
  bgMusic.setAttribute('playsinline', '');

  var savedMusicTime = parseFloat(sessionStorage.getItem('arcadeMusicTime'));
  var musicPositionRestored = isNaN(savedMusicTime);

  window.__arcadeSoundOn = function(){
    var v = localStorage.getItem('arcadeSoundOn');
    return v === null ? true : v === '1';
  };

  function restoreMusicPosition(){
    if(musicPositionRestored || isNaN(savedMusicTime)) return;
    var duration = bgMusic.duration;
    if(!isFinite(duration) || duration <= 0) return;
    bgMusic.currentTime = Math.min(Math.max(savedMusicTime, 0), Math.max(duration - 0.05, 0));
    musicPositionRestored = true;
  }

  function tryPlayMusic(){
    if(!window.__arcadeSoundOn()) return;
    restoreMusicPosition();
    var playPromise = bgMusic.play();
    if(playPromise && playPromise.catch) playPromise.catch(function(){});
  }

  function applyMusicState(){
    if(window.__arcadeSoundOn()){
      restoreMusicPosition();
      tryPlayMusic();
    } else {
      bgMusic.pause();
    }
  }

  bgMusic.addEventListener('loadedmetadata', function(){
    restoreMusicPosition();
    if(window.__arcadeSoundOn()) tryPlayMusic();
  });

  bgMusic.addEventListener('canplay', function(){
    restoreMusicPosition();
  });

  /* Browsers may block autoplay. Once the player interacts, resume the
     soundtrack from the exact position reached on the previous game. */
  ['pointerdown','touchstart','click','keydown'].forEach(function(eventName){
    document.addEventListener(eventName, function(){ tryPlayMusic(); }, {passive:true});
  });

  function saveMusicPosition(){
    if(isFinite(bgMusic.currentTime) && bgMusic.currentTime >= 0){
      sessionStorage.setItem('arcadeMusicTime', bgMusic.currentTime.toString());
    }
  }

  var musicSaveTimer = setInterval(saveMusicPosition, 500);
  window.addEventListener('pagehide', function(){
    clearInterval(musicSaveTimer);
    saveMusicPosition();
  });
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden') saveMusicPosition();
  });

  applyMusicState();

  /* ============ Settings panel ============ */
  var settingsBtn = document.getElementById('settings-btn');
  var settingsPanel = document.getElementById('settings-panel');
  var soundToggle = document.getElementById('sound-toggle');
  var soundOn = window.__arcadeSoundOn();

  function setToggleState(btn, on){
    if(!btn) return;
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
  }
  setToggleState(soundToggle, soundOn);

  if(settingsBtn && settingsPanel){
    settingsBtn.addEventListener('click', function(){
      var open = settingsPanel.classList.toggle('open');
      settingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function(e){
      if(settingsPanel.classList.contains('open') &&
         !settingsPanel.contains(e.target) &&
         !settingsBtn.contains(e.target)){
        settingsPanel.classList.remove('open');
        settingsBtn.setAttribute('aria-expanded','false');
      }
    });
  }
  
  if(soundToggle){
    soundToggle.addEventListener('click', function(){
      soundOn = !soundOn;
      setToggleState(soundToggle, soundOn);
      window.__arcadeSetSoundOn(soundOn);
    });
  }

  /* ============ Game ecosystem registry ============ */
  /* Navigation is intentionally local and synchronous. The five-game fallback
     is the canonical runtime list, so a network request can never block play. */
  var GAMES = [
    { id:"cosmic-calendar", name:"Cosmic Calendar", url:"game1.html" },
    { id:"block-market", name:"Block Market", url:"game2.html" },
    { id:"stop-at-5000", name:"Stop at 5.000", url:"game3.html" },
    { id:"a-is-z-typer", name:"A is Z Typer", url:"game4.html" },
    { id:"dvd-game", name:"DVD Game", url:"game5.html" }
  ];
  var currentGameIndex = parseInt(document.body.getAttribute('data-game-index'), 10);
  if(!isFinite(currentGameIndex)) currentGameIndex = 0;

  function loadGame(idx){
    idx = ((idx % GAMES.length) + GAMES.length) % GAMES.length;
    if(idx === currentGameIndex) return;
    window.location.assign(GAMES[idx].url);
  }

  function wireNavButton(id, handler){
    var el = document.getElementById(id);
    if(el){ el.addEventListener('click', handler); }
  }

  wireNavButton('back-game-btn', function(){ loadGame(currentGameIndex-1); });
  wireNavButton('random-game-btn', function(e){
    if(e) e.preventDefault();
    var idx;
    do{ idx = Math.floor(Math.random()*GAMES.length); } while(idx===currentGameIndex && GAMES.length>1);
    loadGame(idx);
  });
  wireNavButton('next-game-btn', function(){ loadGame(currentGameIndex+1); });
  wireNavButton('first-game-btn', function(){ loadGame(0); });
  wireNavButton('last-game-btn', function(){ loadGame(GAMES.length-1); });

  /* ============ Nav Bar Visibility ============ */
  var navBar = document.querySelector('.game-nav');
  if(navBar){
    document.addEventListener('mousemove', function(e){
      if(window.innerWidth >= 992){
        var revealZone = Math.max(140, window.innerHeight * 0.18);
        navBar.classList.toggle('desktop-visible', window.innerHeight - e.clientY < revealZone);
      }
    });
  }

})();
