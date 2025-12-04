/* script.js
   - particles canvas
   - theme toggle (persist)
   - typewriter for name
   - scroll reveal
   - 3D tilt on cards (desktop + touch)
   - simple contact form feedback
*/

(() => {
  /* ---------- DOM helpers ---------- */
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- THEME HANDLING ---------- */
  const THEME_KEY = 'ak_theme_pref';
  const root = document.documentElement;

  function applyTheme(theme){
    if(theme === 'light') root.classList.add('light');
    else root.classList.remove('light');
    const btn = $('#theme-toggle');
    btn.textContent = theme === 'light' ? '🌞' : '🌗';
  }

  function initTheme(){
    const saved = localStorage.getItem(THEME_KEY);
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = saved || (prefersLight ? 'light' : 'dark');
    applyTheme(theme);
    $('#theme-toggle').addEventListener('click', () => {
      const current = root.classList.contains('light') ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  /* ---------- TYPEWRITER (Name) ---------- */
  function typewriter(targetId, text, speed=80){
    const el = document.getElementById(targetId);
    el.textContent = '';
    let i=0;
    const t = setInterval(()=> {
      el.textContent += text.charAt(i);
      i++;
      if(i >= text.length) clearInterval(t);
    }, speed);
  }

  /* ---------- PARTICLES CANVAS ---------- */
  function initParticles(){
    const canvas = $('#particle-canvas');
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;
    const particles = [];
    const count = Math.round((w*h)/70000); // scale with screen

    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.6 + 0.4,
        vx: (Math.random()-0.5)*0.2,
        vy: - (Math.random()*0.3 + 0.2),
        alpha: Math.random()*0.5 + 0.15
      });
    }

    function resize(){
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
    }
    window.addEventListener('resize', resize);

    function frame(){
      ctx.clearRect(0,0,w,h);
      particles.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        if(p.y < -10) { p.y = h + 10; p.x = Math.random()*w; }
        if(p.x < -10) p.x = w + 10;
        if(p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(230,250,255,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ---------- SCROLL REVEAL ---------- */
  function initReveal(){
    const els = $$('.reveal');
    function check(){
      const topOffset = window.innerHeight * 0.85;
      els.forEach(el=>{
        const r = el.getBoundingClientRect();
        if(r.top < topOffset) el.classList.add('active');
      });
    }
    window.addEventListener('scroll', check);
    check();
  }

  /* ---------- TILT EFFECT ON CARDS ---------- */
  function initTilt(){
    const cards = $$('[data-tilt]');
    const maxRotate = 12; // degrees
    const maxTranslate = 10; // px

    function handleMove(e, card){
      const rect = card.getBoundingClientRect();
      const x = (e.clientX ?? (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY ?? (e.touches && e.touches[0].clientY)) - rect.top;
      const px = (x / rect.width) - 0.5;
      const py = (y / rect.height) - 0.5;
      const rx = (-py) * maxRotate;
      const ry = (px) * maxRotate;
      const tz = Math.abs(px)*maxTranslate + Math.abs(py)*maxTranslate;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)`;
      card.style.boxShadow = `${-ry*1.6}px ${rx*1.6}px 30px rgba(10,20,30,0.25)`;
    }

    function reset(card){
      card.style.transform = '';
      card.style.boxShadow = '';
    }

    cards.forEach(card=>{
      card.addEventListener('pointermove', e => handleMove(e, card));
      card.addEventListener('pointerleave', () => reset(card));
      // touch support
      card.addEventListener('touchmove', e => handleMove(e, card), {passive:true});
      card.addEventListener('touchend', () => reset(card));
    });
  }

  /* ---------- NAV TOGGLE (mobile) ---------- */
  function initNavToggle(){
    const toggle = $('.nav-toggle');
    const links = $('.nav-links');
    toggle.addEventListener('click', ()=>{
      links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.right = '12px';
      links.style.top = '64px';
      links.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
      links.style.padding = '12px';
      links.style.borderRadius = '8px';
      links.style.backdropFilter = 'blur(8px)';
    });
    // close when link clicked
    $$('.nav-links a').forEach(a=> a.addEventListener('click', ()=> {
      if(window.innerWidth <= 900) links.style.display = 'none';
    }));
  }

  /* ---------- CONTACT FORM ---------- */
  function initForm(){
    const form = $('#contact-form');
    const feedback = $('#form-feedback');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      feedback.textContent = "Message sent (demo). I'll get back to you soon!";
      form.reset();
      setTimeout(()=> feedback.textContent = '', 5000);
    });
  }

  /* ---------- BOOTSTRAP EVERYTHING ---------- */
  function init(){
    initTheme();
    initParticles();
    initReveal();
    initTilt();
    initNavToggle();
    initForm();
    // typewriter for brand name (and hero typed fallback)
    typewriter('type-name', 'Ashutosh Kumar', 80);
    document.getElementById('year').textContent = new Date().getFullYear();
  }

  // Wait DOM content
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else init();

})();
