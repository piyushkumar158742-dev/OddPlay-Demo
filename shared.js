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

  /* ============ Background music (persists across pages) ============ */
  var bgMusic = new Audio('Sunday_Morning_Level_Up.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  window.__arcadeSoundOn = function(){
    var v = localStorage.getItem('arcadeSoundOn');
    return v === null ? true : v === '1';
  };

  function applyMusicState(){
    if(window.__arcadeSoundOn()){
      var playPromise = bgMusic.play();
      if(playPromise && playPromise.catch){
        playPromise.catch(function(){
          function resumeOnGesture(){ bgMusic.play().catch(function(){}); }
          document.addEventListener('click', resumeOnGesture, {once:true});
          document.addEventListener('keydown', resumeOnGesture, {once:true});
          document.addEventListener('touchstart', resumeOnGesture, {once:true});
        });
      }
    } else {
      bgMusic.pause();
    }
  }

  var savedMusicTime = parseFloat(sessionStorage.getItem('arcadeMusicTime'));
  if(!isNaN(savedMusicTime)){
    bgMusic.addEventListener('loadedmetadata', function(){
      bgMusic.currentTime = savedMusicTime;
      applyMusicState();
    }, {once:true});
  } else {
    applyMusicState();
  }

  window.__arcadeSetSoundOn = function(on){
    localStorage.setItem('arcadeSoundOn', on ? '1' : '0');
    applyMusicState();
  };

  setInterval(function(){
    sessionStorage.setItem('arcadeMusicTime', bgMusic.currentTime);
  }, 1000);
  window.addEventListener('pagehide', function(){
    sessionStorage.setItem('arcadeMusicTime', bgMusic.currentTime);
  });

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
  var FALLBACK_GAMES = [
    { id:"cosmic-calendar", name:"Cosmic Calendar", url:"index.html" },
    { id:"block-market", name:"Block Market", url:"game2.html" },
    { id:"stop-at-5000", name:"Stop at 5.000", url:"game3.html" },
    { id:"a-is-z-typer", name:"A is Z Typer", url:"game4.html" },
    { id:"dvd-game", name:"DVD Game", url:"game5.html" }
  ];
  var GAMES = FALLBACK_GAMES.slice();
  var currentGameIndex = parseInt(document.body.getAttribute('data-game-index'), 10) || 0;

  /* ============ Random game entry ============ */
  /* GitHub Pages starts the project at the site root. Pick immediately from
     the local fallback registry so the entry decision never waits on a fetch. */
  var siteRootPath = new URL('.', window.location.href).pathname.replace(/\/+$/, '');
  var currentPath = window.location.pathname.replace(/\/+$/, '');
  var isSiteRoot = currentPath === siteRootPath && !window.location.search;
  if(isSiteRoot){
    var liveGames = FALLBACK_GAMES.slice();
    var selectedEntry = liveGames[Math.floor(Math.random() * liveGames.length)];
    if(selectedEntry && selectedEntry.url && selectedEntry.url !== 'index.html'){
      window.location.replace(selectedEntry.url);
      return;
    }
  }

  function isValidGameRegistry(games){
    return Array.isArray(games) && games.length > 0 && games.every(function(game){
      return game && typeof game.name === 'string' && game.name.trim() &&
             typeof game.url === 'string' && game.url.trim();
    });
  }

  var gamesReady = fetch('games.json', {cache:'no-store'})
    .then(function(response){
      if(!response.ok) throw new Error('games.json returned HTTP ' + response.status);
      return response.json();
    })
    .then(function(games){
      if(!isValidGameRegistry(games)) throw new Error('Invalid games.json registry');
      GAMES = games;
      return GAMES;
    })
    .catch(function(error){
      console.error('Kroma game registry failed to load:', error);
      GAMES = FALLBACK_GAMES.slice();
      return GAMES;
    });

  function loadGame(idx){
    gamesReady.then(function(){
      idx = ((idx % GAMES.length) + GAMES.length) % GAMES.length;
      if(idx === currentGameIndex) return;
      if(window.innerWidth < 992) { sessionStorage.setItem('navExpanded', '1'); }
      window.location.href = GAMES[idx].url;
    });
  }

  function wireNavButton(id, handler){
    var el = document.getElementById(id);
    if(el){ el.addEventListener('click', handler); }
  }
  wireNavButton('first-game-btn', function(){ loadGame(0); });
  wireNavButton('back-game-btn', function(){ loadGame(currentGameIndex-1); });
  wireNavButton('random-game-btn', function(){
    gamesReady.then(function(){
      var idx;
      do{ idx = Math.floor(Math.random()*GAMES.length); } while(idx===currentGameIndex && GAMES.length>1);
      loadGame(idx);
    });
  });
  wireNavButton('next-game-btn', function(){ loadGame(currentGameIndex+1); });
  wireNavButton('last-game-btn', function(){
    gamesReady.then(function(){ loadGame(GAMES.length-1); });
  });

  /* ============ Nav Bar Visibility & Expand Logic ============ */
  var navBar = document.querySelector('.game-nav');
  if (navBar) {
    document.addEventListener('mousemove', function(e) {
      if (window.innerWidth >= 992) {
        var revealZone = Math.max(140, window.innerHeight * 0.18);
        if (window.innerHeight - e.clientY < revealZone) {
          navBar.classList.add('desktop-visible');
        } else {
          navBar.classList.remove('desktop-visible');
        }
      }
    });

    var collapseTimeout;
    
    navBar.addEventListener('click', function(e) {
      if (window.innerWidth < 992) {
        if (!navBar.classList.contains('mobile-expanded')) {
          e.preventDefault();
          navBar.classList.add('mobile-expanded');
          resetCollapseTimeout();
        }
      }
    });

    document.addEventListener('click', function(e){
      if (window.innerWidth < 992 && navBar.classList.contains('mobile-expanded')) {
         if (!navBar.contains(e.target)) {
           navBar.classList.remove('mobile-expanded');
         }
      }
    });

    navBar.querySelectorAll('.game-nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
         if (window.innerWidth < 992) {
           resetCollapseTimeout();
           e.stopPropagation(); 
         }
      });
    });

    function resetCollapseTimeout() {
      clearTimeout(collapseTimeout);
      collapseTimeout = setTimeout(function() {
        navBar.classList.remove('mobile-expanded');
      }, 10000);
    }

    if (window.innerWidth < 992 && sessionStorage.getItem('navExpanded') === '1') {
      sessionStorage.removeItem('navExpanded');
      navBar.classList.add('mobile-expanded');
      resetCollapseTimeout();
    }
  }

})();
