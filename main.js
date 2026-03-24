/* ============================================================
   lanky medium /_ — PORTFOLIO
   main.js
   ============================================================ */

'use strict';

// ── Canvas Background: animated + signs ──────────────────────
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, mouse = { x: 0, y: 0 }, rafId;

  // Grid of + signs
  const SPACING  = 32;
  const SIZE     = 5;       // arm length of +
  const MAX_DIST = 260;     // mouse influence radius
  const BASE_ROT = 0;       // default angle (radians)
  const MAX_ROT  = Math.PI / 2; // max rotation from mouse

  let cols, rows, crosses = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGrid();
  }

  function buildGrid() {
    crosses = [];
    cols = Math.ceil(W / SPACING) + 2;
    rows = Math.ceil(H / SPACING) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        crosses.push({
          x: c * SPACING - (SPACING / 2),
          y: r * SPACING - (SPACING / 2),
        });
      }
    }
  }

  function drawCross(x, y, angle, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    // horizontal arm
    ctx.moveTo(-SIZE, 0);
    ctx.lineTo(SIZE, 0);
    // vertical arm
    ctx.moveTo(0, -SIZE);
    ctx.lineTo(0, SIZE);
    ctx.stroke();
    ctx.restore();
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth   = 0.8;

    for (const cross of crosses) {
      const dx   = cross.x - mouse.x;
      const dy   = cross.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // angle toward mouse when close
      let angle = BASE_ROT;
      let alpha = 0.18;

      if (dist < MAX_DIST) {
        const t    = 1 - dist / MAX_DIST;
        const towards = Math.atan2(dy, dx) + Math.PI / 4;
        angle = lerp(BASE_ROT, towards, t * 0.9);
        alpha = lerp(0.18, 0.55, t * t);
      }

      drawCross(cross.x, cross.y, angle, alpha);
    }

    rafId = requestAnimationFrame(render);
  }

  // Track mouse
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Touch support
  window.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    resize();
    render();
  });

  resize();
  render();
})();


// ── Scroll Reveal ─────────────────────────────────────────────
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => {
          el.classList.add('visible');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
})();


// ── Navbar scroll state ────────────────────────────────────────
(function initNav() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();


// ── Mobile Menu ────────────────────────────────────────────────
(function initMobile() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobile-menu');

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    // Animate burger lines
    const spans = burger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });
})();

function closeMobile() {
  const menu   = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger');
  menu.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  const spans = burger.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity   = '';
  spans[2].style.transform = '';
}


// ── Smooth active nav link highlight ──────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
})();


// ── Carousel dot interaction (placeholder behaviour) ──────────
(function initCarousels() {
  document.querySelectorAll('.carousel-placeholder').forEach(carousel => {
    const dots = carousel.querySelectorAll('.dot');
    const btns = carousel.querySelectorAll('.carousel-btn');
    let current = 0;

    function setActive(i) {
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      current = i;
    }

    btns[0] && btns[0].addEventListener('click', () => {
      setActive((current - 1 + dots.length) % dots.length);
    });

    btns[1] && btns[1].addEventListener('click', () => {
      setActive((current + 1) % dots.length);
    });
  });
})();


// ── Neon cursor glow trail ─────────────────────────────────────
(function initCursorTrail() {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const TRAIL_COUNT = 8;
  const trail = [];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      border-radius: 50%;
      mix-blend-mode: screen;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(el);
    trail.push({ el, x: 0, y: 0 });
  }

  let mx = 0, my = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animTrail() {
    let lx = mx, ly = my;
    trail.forEach((t, i) => {
      const ease = 0.3 - i * 0.02;
      t.x += (lx - t.x) * ease;
      t.y += (ly - t.y) * ease;
      lx = t.x;
      ly = t.y;

      const size  = Math.max(2, 10 - i * 1.1);
      const alpha = Math.max(0, 0.5 - i * 0.06);
      const hue   = i % 2 === 0 ? '0, 229, 255' : '0, 128, 255';
      t.el.style.cssText += `
        left: ${t.x - size / 2}px;
        top:  ${t.y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background: rgba(${hue}, ${alpha});
        box-shadow: 0 0 ${size * 2}px rgba(${hue}, ${alpha * 0.6});
      `;
    });
    requestAnimationFrame(animTrail);
  }

  animTrail();
})();
