/* ===== QUANTUM SYMBOL FIELD CANVAS ===== */
(function(){
  const c = document.getElementById('quantum-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  let W, H;

  function resize(){
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ===== QUANTUM SYMBOLS =====
  const symbols = [
    '⟨ψ|', '|ψ⟩', '⟨φ|', '|φ⟩',
    'Ĥ', 'ℏ', 'Ψ', 'Φ', 'ψ', 'φ',
    '∑', '∫', '∇²', '∂',
    'α', 'β', 'γ', 'δ',
    '⊗', '⊕', '∈', '∀',
    '†', '∗', '•', '∘',
    'ħ', '⟨x⟩', '⟨p⟩',
    '|0⟩', '|1⟩', '|+⟩', '|−⟩',
    'λ', 'ω', 'Ω', 'Σ',
  ];

  // ===== FLOATING ELEMENTS =====
  const elements = [];
  const COUNT = 30;

  function rand(min, max){ return Math.random() * (max-min) + min }

  for(let i=0; i<COUNT; i++){
    const isSymbol = i < 22; // more symbols than particles
    elements.push({
      type: isSymbol ? 'symbol' : 'dot',
      symbol: isSymbol ? symbols[Math.floor(Math.random()*symbols.length)] : null,
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-.12, .12),
      vy: rand(-.1, .08),
      size: isSymbol ? rand(13, 24) : rand(2, 3),
      alpha: rand(.04, .1),
      phase: rand(0, Math.PI*2),
      rotation: rand(-.015, .015),
      rot: rand(0, Math.PI*2),
      // gentle orbital drift center
      cx: rand(0, W),
      cy: rand(0, H),
      orbit: rand(.3, 1),
      orbitSpeed: rand(.0003, .0008),
      orbitAngle: rand(0, Math.PI*2),
    });
  }

  // ===== MOUSE INFLUENCE =====
  let mx = W/2, my = H/2;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    mx = t.clientX; my = t.clientY;
  }, { passive: true });

  // ===== DRAW =====
  function draw(t){
    ctx.clearRect(0, 0, W, H);

    // subtle radial gradient overlay for depth
    const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * .7);
    bgGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bgGrad.addColorStop(1, 'rgba(0,0,0,.02)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    for(const el of elements){
      // orbital drift
      el.orbitAngle += el.orbitSpeed;
      const driftX = Math.sin(el.orbitAngle) * el.orbit;
      const driftY = Math.cos(el.orbitAngle * .7) * el.orbit * .6;

      // mouse repulsion (very gentle)
      const dx = el.x - mx;
      const dy = el.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy) + .1;
      if(dist < 150){
        const force = .3 * (1 - dist/150);
        el.vx += (dx/dist) * force * .002;
        el.vy += (dy/dist) * force * .002;
      }

      // apply velocity + drift
      el.vx += driftX * .001;
      el.vy += driftY * .001;
      el.vx *= .995;
      el.vy *= .995;
      el.x += el.vx;
      el.y += el.vy;

      // rotation
      el.rot += el.rotation;
      el.alpha += (el.type === 'symbol' ? .06 : .04) * Math.sin(t * .0005 + el.phase) * .001;
      el.alpha = Math.max(.02, Math.min(.18, el.alpha));

      // wrap around edges
      if(el.x < -60) el.x = W + 50;
      if(el.x > W + 60) el.x = -50;
      if(el.y < -60) el.y = H + 50;
      if(el.y > H + 60) el.y = -50;

      // draw
      if(el.type === 'dot'){
        // simple dot
        ctx.fillStyle = `rgba(80, 60, 40, ${el.alpha})`;
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.size, 0, Math.PI*2);
        ctx.fill();
      } else {
        // quantum symbol
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rot);
        ctx.font = `${el.size}px 'Times New Roman', 'STIX Two Text', 'Georgia', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(60, 45, 30, ${el.alpha})`;
        ctx.fillText(el.symbol, 0, 0);
        ctx.restore();
      }
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ===== SIDEBAR & INTERACTIONS ===== */
(function(){
  // sidebar
  const sidebar=document.getElementById('sidebar');
  const hamburger=document.getElementById('hamburger');
  const overlay=document.getElementById('sidebar-overlay');
  const closeBtn=document.getElementById('sidebarClose');

  function openSidebar(){sidebar.classList.add('open');overlay.classList.add('open')}
  function closeSidebar(){sidebar.classList.remove('open');overlay.classList.remove('open')}
  if(hamburger) hamburger.addEventListener('click',openSidebar);
  if(closeBtn) closeBtn.addEventListener('click',closeSidebar);
  if(overlay) overlay.addEventListener('click',closeSidebar);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('open'))closeSidebar()});

  // nav items → scroll
  document.querySelectorAll('.nav-item').forEach(item=>{
    item.addEventListener('click',()=>{
      const id=item.dataset.target;
      if(id){const el=document.getElementById(id);if(el){const top=el.getBoundingClientRect().top+window.scrollY-90;window.scrollTo({top,behavior:'smooth'})}}
      if(window.innerWidth<=820)closeSidebar();
    });
  });

  // TOC clicks
  document.querySelectorAll('.toc-list li').forEach(li=>{
    li.addEventListener('click',()=>{
      const id=li.dataset.target;
      if(id){const el=document.getElementById(id);if(el){const top=el.getBoundingClientRect().top+window.scrollY-90;window.scrollTo({top,behavior:'smooth'})}}
    });
  });

  // active nav
  const sections=document.querySelectorAll('.section');
  const navItems=document.querySelectorAll('.nav-item');
  function updateActiveNav(){
    const sy=window.scrollY+160;let ci='intro';
    sections.forEach(s=>{if(s.offsetTop<=sy)ci=s.id});
    navItems.forEach(n=>n.classList.toggle('active',n.dataset.target===ci));
  }
  window.addEventListener('scroll',updateActiveNav);updateActiveNav();

  // reveal
  const secObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');secObs.unobserve(e.target)}})
  },{threshold:.08});
  sections.forEach(s=>secObs.observe(s));

  // progress
  const pb=document.getElementById('progressBar');
  if(pb) window.addEventListener('scroll',()=>{const st=window.scrollY,dh=document.documentElement.scrollHeight-window.innerHeight;pb.style.width=dh>0?`${(st/dh)*100}%`:'0%'});

  // back to top
  const bt=document.getElementById('backToTop');
  if(bt){
    window.addEventListener('scroll',()=>bt.classList.toggle('visible',window.scrollY>400));
    bt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }
})();
