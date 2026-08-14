/**
 * NBOS — app.js
 * Premium WebGL 3D Geodesic Matrix Sphere Engine + All Page Interactions
 */

'use strict';

/* ============================================================
   1. NAVBAR — scroll state
============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ============================================================
   2. MOBILE MENU
============================================================ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (isOpen) closeMenu(); else openMenu();
  });

  const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-cta');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
})();

/* ============================================================
   3. THREE.JS WEBGL — Cinematic Geodesic Matrix Sphere Engine
============================================================ */
(function initWebGL() {
  const canvas   = document.getElementById('webgl-canvas');
  const wrap     = document.getElementById('hero-canvas-wrap');
  const fallback = document.getElementById('webgl-fallback');

  function showFallback(reason) {
    console.warn('[NBOS WebGL Fallback]:', reason);
    if (canvas)   canvas.style.display = 'none';
    if (fallback) {
      fallback.classList.add('visible');
      fallback.removeAttribute('aria-hidden');
    }
  }

  if (!canvas || !wrap) {
    showFallback('Canvas or wrapper element missing');
    return;
  }

  let attempts = 0;
  function startWebGL() {
    if (typeof THREE === 'undefined') {
      attempts++;
      if (attempts < 50) {
        setTimeout(startWebGL, 100);
        return;
      }
      showFallback('Three.js library not loaded');
      return;
    }

    if (canvas) canvas.style.display = 'block';
    if (fallback) fallback.classList.remove('visible');

    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl') && !probe.getContext('experimental-webgl')) {
      showFallback('WebGL context not supported');
      return;
    }

    try {
      // 1. Renderer Setup
      const isMobile = window.innerWidth < 768;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      });

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
      renderer.setClearColor(0x09090b, 1);

      // 2. Scene & Camera Setup
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        48,
        wrap.clientWidth / wrap.clientHeight,
        0.1,
        50
      );
      camera.position.z = 2.95;

      // Helper: Generate soft glowing dot texture for node vertices
      function createDotTexture() {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0.0, 'rgba(0, 162, 255, 1.0)');
        grad.addColorStop(0.3, 'rgba(0, 82, 255, 0.85)');
        grad.addColorStop(0.6, 'rgba(0, 82, 255, 0.35)');
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      }

      const glowTexture = createDotTexture();

      // 3. Geodesic Matrix Geometries & Materials

      // A. Outer Geodesic Triangulated Matrix Grid
      const geoOuter = new THREE.IcosahedronGeometry(1.08, 2);
      const matOuter = new THREE.MeshBasicMaterial({
        color: 0x0052ff,
        wireframe: true,
        transparent: true,
        opacity: 0.38,
      });
      const meshOuter = new THREE.Mesh(geoOuter, matOuter);
      scene.add(meshOuter);

      // B. Inner Counter-Rotating Geodesic Core
      const geoInner = new THREE.IcosahedronGeometry(0.68, 1);
      const matInner = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const meshInner = new THREE.Mesh(geoInner, matInner);
      scene.add(meshInner);

      // C. Glowing Node Vertices at Grid Intersections
      const matNodes = new THREE.PointsMaterial({
        color: 0x66b2ff,
        size: 0.055,
        map: glowTexture,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const nodesMesh = new THREE.Points(geoOuter, matNodes);
      scene.add(nodesMesh);

      // D. Orbital Data Rings
      const ringGroup = new THREE.Group();

      const ringGeo1 = new THREE.TorusGeometry(1.32, 0.003, 16, 120);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: 0x0052ff,
        transparent: true,
        opacity: 0.55,
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI * 0.38;
      ring1.rotation.y = Math.PI * 0.15;
      ringGroup.add(ring1);

      const ringGeo2 = new THREE.TorusGeometry(1.42, 0.002, 16, 120);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.35,
      });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = -Math.PI * 0.28;
      ring2.rotation.y = Math.PI * 0.42;
      ringGroup.add(ring2);

      scene.add(ringGroup);

      // E. Outer Floating Ambient Data Particles
      const PARTICLE_COUNT = 110;
      const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = 1.15 + Math.random() * 0.45;
        particlePositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = r * Math.cos(phi);
      }
      const geoHalo = new THREE.BufferGeometry();
      geoHalo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const matHalo = new THREE.PointsMaterial({
        color: 0x3399ff,
        size: 0.035,
        map: glowTexture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const haloMesh = new THREE.Points(geoHalo, matHalo);
      scene.add(haloMesh);

      // 4. Pointer Mouse Interaction (Interpolated Parallax)
      let mouseX = 0, mouseY = 0;
      let targetX = 0, targetY = 0;

      function onPointerMove(e) {
        const rect = wrap.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5);
      }

      function onTouchMove(e) {
        if (e.touches.length < 1) return;
        const touch = e.touches[0];
        const rect = wrap.getBoundingClientRect();
        mouseX = (touch.clientX - rect.left) / rect.width - 0.5;
        mouseY = -((touch.clientY - rect.top) / rect.height - 0.5);
      }

      window.addEventListener('mousemove', onPointerMove, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });

      // 5. Smooth Continuous 60FPS Render Loop
      const clock = new THREE.Clock();
      let elapsed = 0;

      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        elapsed += delta;

        // Smooth Lerp toward mouse target
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        const autoY = elapsed * 0.16;
        const autoX = elapsed * 0.06;

        // Geodesic Outer Grid & Nodes Rotation
        meshOuter.rotation.y = autoY + targetX * 0.6;
        meshOuter.rotation.x = autoX + targetY * 0.45;

        nodesMesh.rotation.y = meshOuter.rotation.y;
        nodesMesh.rotation.x = meshOuter.rotation.x;

        // Inner Core Counter Rotation
        meshInner.rotation.y = -(elapsed * 0.24) - targetX * 0.4;
        meshInner.rotation.x = elapsed * 0.09 + targetY * 0.3;

        // Orbital Rings Rotation
        ringGroup.rotation.y = elapsed * 0.10 + targetX * 0.3;
        ringGroup.rotation.x = targetY * 0.2;

        // Floating Ambient Particles Motion
        haloMesh.rotation.y = elapsed * 0.05 + targetX * 0.15;
        haloMesh.rotation.x = elapsed * 0.02 + targetY * 0.1;

        // Subtle Breathing Opacity Pulse
        const pulse = 0.5 + 0.15 * Math.sin(elapsed * 2.0);
        matOuter.opacity = 0.32 + pulse * 0.12;
        matNodes.opacity = 0.80 + pulse * 0.15;

        renderer.render(scene, camera);
      });

      // 6. Responsive Resize Observer
      const resizeObserver = new ResizeObserver(() => {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        if (w <= 0 || h <= 0) return;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      });
      resizeObserver.observe(wrap);

      // 7. Reduced Motion Check
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        renderer.setAnimationLoop(null);
        renderer.render(scene, camera);
      }

      // 8. GPU & Memory Disposal on Page Unload
      window.addEventListener('pagehide', () => {
        renderer.setAnimationLoop(null);
        resizeObserver.disconnect();
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('touchmove', onTouchMove);

        geoOuter.dispose();
        geoInner.dispose();
        ringGeo1.dispose();
        ringGeo2.dispose();
        geoHalo.dispose();
        glowTexture.dispose();

        matOuter.dispose();
        matInner.dispose();
        matNodes.dispose();
        ringMat1.dispose();
        ringMat2.dispose();
        matHalo.dispose();

        renderer.dispose();
      }, { once: true });

    } catch (err) {
      showFallback('WebGL Exception: ' + (err.message || err));
    }
  }

  startWebGL();
})();

/* ============================================================
   4. SCROLL REVEAL — Intersection Observer
============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px',
  });

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. INQUIRY FORM — Validation & Handling
============================================================ */
(function initForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  const fields = {
    ownerName:     document.getElementById('owner-name'),
    businessName:  document.getElementById('business-name'),
    callNum:       document.getElementById('call-number'),
    emailAddr:     document.getElementById('email-address'),
    whatsappNum:   document.getElementById('whatsapp-number'),
    packageSelect: document.getElementById('package-select'),
  };

  const errors = {
    ownerName:     document.getElementById('owner-name-error'),
    businessName:  document.getElementById('business-name-error'),
    callNum:       document.getElementById('call-number-error'),
    emailAddr:     document.getElementById('email-address-error'),
    whatsappNum:   document.getElementById('whatsapp-number-error'),
    packageSelect: document.getElementById('package-select-error'),
  };

  const successMsg   = document.getElementById('form-success');
  const errorMsg     = document.getElementById('form-error-state');
  const submitBtn    = document.getElementById('form-submit-btn');
  const btnLabel     = submitBtn ? submitBtn.querySelector('.btn-label') : null;

  const WHATSAPP_RE = /^[+]?[\d\s\-()]{7,15}$/;

  function setError(key, msg) {
    if (errors[key]) errors[key].textContent = msg;
    if (fields[key]) {
      fields[key].setAttribute('aria-invalid', 'true');
      fields[key].style.borderColor = '#ef4444';
    }
  }

  function clearError(key) {
    if (errors[key]) errors[key].textContent = '';
    if (fields[key]) {
      fields[key].removeAttribute('aria-invalid');
      fields[key].style.borderColor = '';
    }
  }

  function validate() {
    let valid = true;

    // Owner Name
    const owner = fields.ownerName?.value?.trim() || '';
    if (!owner) {
      setError('ownerName', 'Please enter owner / founder name.');
      valid = false;
    } else if (owner.length < 2) {
      setError('ownerName', 'Name must be at least 2 characters.');
      valid = false;
    } else {
      clearError('ownerName');
    }

    // Business Name
    const biz = fields.businessName?.value?.trim() || '';
    if (!biz) {
      setError('businessName', 'Please enter your business or brand name.');
      valid = false;
    } else {
      clearError('businessName');
    }

    // Call Number (Optional, but if provided, validate)
    const call = fields.callNum?.value?.trim() || '';
    if (call && !WHATSAPP_RE.test(call)) {
      setError('callNum', 'Please enter a valid phone number.');
      valid = false;
    } else {
      clearError('callNum');
    }

    // Email Address
    const email = fields.emailAddr?.value?.trim() || '';
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('emailAddr', 'Please enter your email address.');
      valid = false;
    } else if (!EMAIL_RE.test(email)) {
      setError('emailAddr', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError('emailAddr');
    }

    // WhatsApp Number
    const phone = fields.whatsappNum?.value?.trim() || '';
    if (!phone) {
      setError('whatsappNum', 'Please enter your WhatsApp number.');
      valid = false;
    } else if (!WHATSAPP_RE.test(phone)) {
      setError('whatsappNum', 'Please enter a valid phone number.');
      valid = false;
    } else {
      clearError('whatsappNum');
    }

    // Package Selection
    const pkg = fields.packageSelect?.value || '';
    if (!pkg) {
      setError('packageSelect', 'Please select a package.');
      valid = false;
    } else {
      clearError('packageSelect');
    }

    return valid;
  }

  Object.entries(fields).forEach(([key, field]) => {
    if (!field) return;
    field.addEventListener('input', () => clearError(key));
    field.addEventListener('change', () => clearError(key));
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (successMsg) successMsg.hidden = true;
    if (errorMsg) errorMsg.hidden = true;

    if (!validate()) {
      if (errorMsg) errorMsg.hidden = false;
      const firstError = Object.keys(fields).find(k => errors[k]?.textContent);
      if (firstError && fields[firstError]) fields[firstError].focus();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (btnLabel) btnLabel.textContent = 'Submitting…';

    const formData = {
      owner_name:          fields.ownerName?.value?.trim(),
      business_name:       fields.businessName?.value?.trim(),
      call_number:         fields.callNum?.value?.trim() || '',
      email_address:       fields.emailAddr?.value?.trim(),
      whatsapp_number:     fields.whatsappNum?.value?.trim(),
      package:             fields.packageSelect?.value,
      special_requirement: document.getElementById('special-requirement')?.value?.trim() || '',
      submitted_at:        new Date().toISOString()
    };

    console.log('[NBOS Inquiry] Form submission ready:', formData);

    // Save to Supabase Database
    if (window.nbosSupabase) {
      try {
        const { error } = await window.nbosSupabase
          .from('inquiries')
          .insert([formData]);
        
        if (error) {
          console.error('[NBOS] Database insert error:', error);
        } else {
          console.log('[NBOS] Form saved to Supabase successfully.');
        }
      } catch (err) {
        console.error('[NBOS] Database connection failed:', err);
      }
    }

    // Save lead in localStorage as backup
    try {
      const savedLeads = JSON.parse(localStorage.getItem('nbos_inquiries') || '[]');
      savedLeads.push(formData);
      localStorage.setItem('nbos_inquiries', JSON.stringify(savedLeads));
    } catch (e) {
      console.warn('[NBOS] Local storage save failed', e);
    }

    // Save to local NBOS folder via custom backend server
    try {
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      console.log('[NBOS] Form saved to local NBOS folder successfully.');
    } catch (err) {
      console.warn('[NBOS] Failed to save to local server (is server.js running?)', err);
    }

    setTimeout(() => {
      if (submitBtn) submitBtn.disabled = false;
      if (btnLabel) btnLabel.textContent = 'Submit Inquiry';

      if (successMsg) successMsg.hidden = false;
      form.reset();

      // Show Success Modal
      const successModal = document.getElementById('success-modal');
      if (successModal) {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Setup close button
        const closeBtn = document.getElementById('btn-close-success');
        if (closeBtn) {
          closeBtn.onclick = () => {
            successModal.classList.remove('active');
            document.body.style.overflow = '';
          };
        }
      } else {
        successMsg?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 700);
  });
})();

// Helper function to export all leads as CSV anytime
window.downloadNBOSLeads = function() {
  const leads = JSON.parse(localStorage.getItem('nbos_inquiries') || '[]');
  if (!leads.length) {
    alert('Abhi tak koi inquiry receive nahi hui hai.');
    return;
  }
  const headers = ['Submitted At', 'Owner Name', 'Business Name', 'Mobile Number', 'Email ID', 'WhatsApp Number', 'Package', 'Special Requirement'];
  const rows = leads.map(l => [
    `"${l.submitted_at || ''}"`,
    `"${l.owner_name || ''}"`,
    `"${l.business_name || ''}"`,
    `"${l.call_number || ''}"`,
    `"${l.email_address || ''}"`,
    `"${l.whatsapp_number || ''}"`,
    `"${l.package || ''}"`,
    `"${(l.special_requirement || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `NBOS_Inquiries_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/* ============================================================
   5.5. PRICING TABS — Segmented Tab Switcher
============================================================ */
(function initPricingTabs() {
  const tabs = document.querySelectorAll('.pricing-tab');
  const panels = document.querySelectorAll('.tab-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanelId = tab.getAttribute('aria-controls');

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      panels.forEach(p => {
        p.classList.remove('active');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
})();

/* ============================================================
   6. PRICING — PLAN DETAILS POPUP MODAL & INQUIRY SYNC
============================================================ */
(function initPricingModal() {
  const modal            = document.getElementById('plan-modal');
  const backdrop         = document.getElementById('modal-backdrop');
  const closeBtn         = document.getElementById('modal-close-btn');
  const cancelBtn        = document.getElementById('modal-cancel-btn');
  const proceedBtn       = document.getElementById('modal-proceed-btn');

  const modalBadge       = document.getElementById('modal-plan-badge');
  const modalTitle       = document.getElementById('modal-plan-title');
  const modalPrice       = document.getElementById('modal-plan-price');
  const modalCaption     = document.getElementById('modal-plan-caption');
  const modalFeatureList = document.getElementById('modal-feature-list');

  const packageSelect    = document.getElementById('package-select');

  let activePlanKey = '';

  const plansData = {
    standard: {
      badge: 'Standard Package',
      title: 'NBOS Standard',
      price: '₹24,999',
      caption: 'Essential online presence for small businesses & startups on a budget.',
      features: [
        { text: 'Basic Multi-Page / Landing Page Website', included: true },
        { text: 'No-Code / Template-Based Architecture', included: true },
        { text: 'Standard UI/UX Layout', included: true },
        { text: 'Mobile & Tablet Responsive Implementation', included: true },
        { text: 'Standard Deployment & Hosting Setup', included: true },
        { text: '7-Day Post-Launch Support', included: true },
        { text: 'Custom UI/UX Engineering', included: false },
        { text: 'Custom Web Application Dev', included: false },
        { text: '3D / WebGL Integration', included: false },
        { text: 'AI Chatbot & BI Dashboard', included: false }
      ]
    },
    growth: {
      badge: '🔥 MOST SELLING — Growth Package',
      title: 'NBOS Growth',
      price: '₹44,999',
      caption: 'Full-featured custom web applications for scaling companies.',
      features: [
        { text: 'Fully Detailed Custom Website & Web Application', included: true },
        { text: 'Custom UI/UX Engineering & High-End Prototyping', included: true },
        { text: '5 AI-Powered Marketing Posters', included: true },
        { text: 'Mobile & Tablet Responsive Implementation', included: true },
        { text: 'Secure Cloud Deployment & Hosting Setup', included: true },
        { text: '14-Day Post-Launch Support', included: true },
        { text: '3D / WebGL Integration', included: false },
        { text: 'AI Chatbot & BI Dashboard', included: false },
        { text: 'Google Ads & Meta Ads', included: false }
      ]
    },
    enterprise: {
      badge: 'Enterprise Ecosystem',
      title: 'NBOS Enterprise',
      price: '₹69,999',
      caption: 'Fully automated enterprise systems, 3D WebGL, AI Chatbot & BI Dashboards for industry leaders.',
      features: [
        { text: 'Everything in Standard & Growth', included: true },
        { text: 'Full E-Commerce & Online Store Engine', included: true },
        { text: '3D / WebGL Interactive Experience', included: true },
        { text: 'AI Chatbot Integration', included: true },
        { text: 'Detailed Business Intelligence (BI) Dashboard', included: true },
        { text: 'Google Ads Campaign Management', included: true },
        { text: 'Meta Ads Campaign Management', included: true },
        { text: 'Priority Deployment (72-Hour Delivery Target)', included: true },
        { text: '30-Day Post-Launch Support', included: true },
        { text: 'Dedicated Project Architect', included: true }
      ]
    },
    'web-custom': {
      badge: 'Custom Web Plan',
      title: 'NBOS Custom',
      price: 'Custom Pricing',
      caption: 'Tailored web solutions, specialized portals, and bespoke architectures.',
      features: [
        { text: 'Fully Bespoke UI/UX Design', included: true },
        { text: 'Complex Web Application Features', included: true },
        { text: 'Custom Integrations (API, ERP, CRM)', included: true },
        { text: 'Dedicated Project Manager & Dev Team', included: true }
      ]
    },
    'ai-starter': {
      badge: 'AI Starter Package',
      title: 'AI Starter',
      price: '₹14,999 / Mo',
      caption: 'Ideal for businesses initiating online marketing & automated responses.',
      features: [
        { text: 'Basic WhatsApp & Insta Automation (Welcome & FAQ Bot)', included: true },
        { text: '8 AI Social Media Posters / Month', included: true },
        { text: '2 AI UGC Videos (Reels & Shorts)', included: true },
        { text: '1 Basic Email Automation Sequence', included: true },
        { text: 'Standard Technical Support', included: true }
      ]
    },
    'ai-growth': {
      badge: '🔥 MOST POPULAR — AI Growth',
      title: 'AI Growth',
      price: '₹29,999 / Mo',
      caption: 'For growing businesses needing qualified leads, ad campaigns & sales.',
      features: [
        { text: 'Advanced WhatsApp & Insta Chatbot (Lead Gen)', included: true },
        { text: '1 Ad Campaign Setup & Management (FB/Insta)', included: true },
        { text: '15 Custom AI Posters / Month', included: true },
        { text: '4 High-Quality AI UGC Videos', included: true },
        { text: 'Advanced Email Marketing (Cart & Newsletter)', included: true },
        { text: 'Monthly Performance & ROI Report', included: true }
      ]
    },
    'ai-pro': {
      badge: 'AI Pro Package',
      title: 'AI Pro',
      price: '₹49,999 / Mo',
      caption: 'Full-scale multi-channel marketing & CRM integration for brands.',
      features: [
        { text: 'Multi-Channel Automation (WhatsApp + Insta + Email)', included: true },
        { text: '2-3 Paid Ad Campaigns (with A/B Testing)', included: true },
        { text: '30 AI Posters / Month (Daily Posting)', included: true },
        { text: '8 to 10 AI UGC Videos (Viral Hooks)', included: true },
        { text: 'Direct CRM Integration (Instant Lead Sync)', included: true }
      ]
    },
    'ai-custom': {
      badge: 'AI Enterprise & Custom',
      title: 'AI Custom',
      price: 'Custom Pricing',
      caption: 'Tailored AI models, dedicated workflows & enterprise scale.',
      features: [
        { text: 'Fully Customized AI & Automation Architecture', included: true },
        { text: 'Unlimited Graphic Designs & Video Production', included: true },
        { text: 'Dedicated AI Automation Specialist', included: true },
        { text: '24/7 SLA Priority Infrastructure', included: true }
      ]
    },
    'maint-basic': {
      badge: 'Website Care',
      title: 'Basic Care',
      price: '₹4,999 / Mo',
      caption: 'Website maintenance, hosting management & monthly backups.',
      features: [
        { text: 'Website Hosting & Domain Management', included: true },
        { text: 'Monthly Website & Database Backups', included: true },
        { text: 'Software & Core Plugin Updates', included: true },
        { text: 'Bug Fixing & Uptime Monitoring', included: true },
        { text: '1-2 Small Content/Image Edits / Month', included: true }
      ]
    },
    'maint-tech': {
      badge: '🔥 MOST SELLING — Tech & Bot Care',
      title: 'Tech & Bot Support',
      price: '₹9,999 / Mo',
      caption: 'Full website care + WhatsApp & Insta bot uptime monitoring.',
      features: [
        { text: 'All Basic Care Features Included', included: true },
        { text: 'WhatsApp & Insta Bot Active Uptime Monitoring', included: true },
        { text: '1-2 Monthly Automation Flow Updates (Reply Edits)', included: true },
        { text: 'Weekly Database Backups', included: true },
        { text: 'Priority Technical Support', included: true }
      ]
    },
    'maint-allinone': {
      badge: 'All-In-One Ecosystem',
      title: 'All-In-One Management',
      price: '₹19,999 / Mo',
      caption: '24/7 total system management, speed optimization & dedicated manager.',
      features: [
        { text: 'Daily Website Backup & Advanced Security', included: true },
        { text: 'Unlimited Small Automation & Campaign Updates', included: true },
        { text: 'Adding New Services / Products to Website', included: true },
        { text: 'Server Speed & Database Optimization', included: true },
        { text: '24/7 Instant Support & Dedicated Manager', included: true }
      ]
    }
  };

  function openModal(planKey) {
    const data = plansData[planKey];
    if (!data || !modal) return;

    activePlanKey = planKey;

    if (modalBadge) modalBadge.textContent = data.badge;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalPrice) modalPrice.textContent = data.price;
    if (modalCaption) modalCaption.textContent = data.caption;

    if (modalFeatureList) {
      modalFeatureList.innerHTML = data.features.map(f => `
        <li class="modal-feature-item ${f.included ? 'included' : 'excluded'}">
          <span class="${f.included ? 'modal-check' : 'modal-x'}">${f.included ? '✓' : '–'}</span>
          <span>${f.text}</span>
        </li>
      `).join('');
    }

    modal.classList.add('active');
    modal.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function proceedToInquiry() {
    closeModal();
    if (packageSelect && activePlanKey) {
      packageSelect.value = activePlanKey;
    }
    const form = document.getElementById('inquiry-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        document.getElementById('owner-name')?.focus();
      }, 600);
    }
  }

  document.querySelectorAll('.pricing-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.pricing-card');
      const planKey = card?.id?.replace('plan-', '') || '';

      if (planKey && plansData[planKey]) {
        openModal(planKey);
      } else {
        const label = btn.getAttribute('aria-label') || '';
        if (label.includes('Standard')) openModal('standard');
        else if (label.includes('Growth')) openModal('growth');
        else if (label.includes('Enterprise') || label.includes('Custom')) openModal('enterprise');
      }
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  proceedBtn?.addEventListener('click', proceedToInquiry);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });
})();

/* ============================================================
   7. SHOWCASE CARDS — subtle 3D tilt on desktop hover
============================================================ */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.showcase-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      const rotX = -dy * 4;
      const rotY = dx * 4;

      card.style.transform = `translateY(-4px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition = 'transform 0.08s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
})();

/* ============================================================
   8. SMOOTH ANCHOR NAVIGATION
============================================================ */
(function initSmoothNav() {
  const NAV_HEIGHT = 80;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   9. SUPABASE AUTHENTICATION
============================================================ */
(function initSupabaseAuth() {
  const SUPABASE_URL = 'https://lltblwkbixxpaoahbyli.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdGJsd2tiaXh4cGFvYWhieWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2Mjg2MzIsImV4cCI6MjEwMjIwNDYzMn0.6N7sTqyncPpS1aMjjnvbIM-pubsrIQ0Y16x6-OcGB84';

  if (!window.supabase) {
    console.warn('[NBOS Auth] Supabase SDK not found.');
    return;
  }

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.warn('[NBOS Auth] Supabase credentials missing. Auth flow disabled.');
    // Let users pass through for preview purposes if credentials are not set
    const appContent = document.getElementById('app-content');
    if (appContent) appContent.style.display = 'block';
    return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.nbosSupabase = supabase;

  const authModal = document.getElementById('auth-modal');
  const appContent = document.getElementById('app-content');
  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const groupAuthEmail = document.getElementById('group-auth-email');
  const groupAuthPassword = document.getElementById('group-auth-password');
  const labelAuthPassword = document.getElementById('label-auth-password');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const errorDiv = document.getElementById('auth-error');
  const successDiv = document.getElementById('auth-success');
  const forgotPasswordRow = document.getElementById('forgot-password-row');
  const linkForgotPassword = document.getElementById('link-forgot-password');
  const authBtnsDefault = document.getElementById('auth-btns-default');
  const authBtnsReset = document.getElementById('auth-btns-reset');
  const authBtnsUpdate = document.getElementById('auth-btns-update');
  const btnSignIn = document.getElementById('btn-signin');
  const btnSignUp = document.getElementById('btn-signup');
  const btnSendReset = document.getElementById('btn-send-reset');
  const btnBackSignin = document.getElementById('btn-back-signin');
  const btnUpdatePassword = document.getElementById('btn-update-password');
  const btnLogout = document.getElementById('nav-logout');
  const navCta = document.getElementById('nav-cta');

  let isSubmitting = false;
  let currentAuthMode = 'signin'; // 'signin' | 'forgot' | 'update_password'

  function showError(msg) {
    if (errorDiv) {
      errorDiv.textContent = msg;
      errorDiv.hidden = false;
    }
    if (successDiv) {
      successDiv.hidden = true;
    }
  }

  function showSuccess(msg) {
    if (successDiv) {
      successDiv.textContent = msg;
      successDiv.hidden = false;
    }
    if (errorDiv) {
      errorDiv.hidden = true;
    }
  }

  function clearMessages() {
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.hidden = true;
    }
    if (successDiv) {
      successDiv.textContent = '';
      successDiv.hidden = true;
    }
  }

  function setAuthMode(mode) {
    currentAuthMode = mode;
    clearMessages();

    if (mode === 'signin') {
      if (authTitle) authTitle.textContent = 'Welcome to NBOS';
      if (authSubtitle) authSubtitle.style.display = 'none';
      if (groupAuthEmail) groupAuthEmail.style.display = 'block';
      if (emailInput) emailInput.required = true;
      if (groupAuthPassword) groupAuthPassword.style.display = 'block';
      if (passwordInput) {
        passwordInput.required = true;
        passwordInput.placeholder = 'Enter your password';
      }
      if (labelAuthPassword) labelAuthPassword.textContent = 'Password';
      if (forgotPasswordRow) forgotPasswordRow.style.display = 'flex';
      if (authBtnsDefault) authBtnsDefault.style.display = 'flex';
      if (authBtnsReset) authBtnsReset.style.display = 'none';
      if (authBtnsUpdate) authBtnsUpdate.style.display = 'none';
    } else if (mode === 'forgot') {
      if (authTitle) authTitle.textContent = 'Reset Password';
      if (authSubtitle) {
        authSubtitle.textContent = 'Enter your email to receive a password reset link.';
        authSubtitle.style.display = 'block';
      }
      if (groupAuthEmail) groupAuthEmail.style.display = 'block';
      if (emailInput) emailInput.required = true;
      if (groupAuthPassword) groupAuthPassword.style.display = 'none';
      if (passwordInput) passwordInput.required = false;
      if (forgotPasswordRow) forgotPasswordRow.style.display = 'none';
      if (authBtnsDefault) authBtnsDefault.style.display = 'none';
      if (authBtnsReset) authBtnsReset.style.display = 'flex';
      if (authBtnsUpdate) authBtnsUpdate.style.display = 'none';
    } else if (mode === 'update_password') {
      if (authTitle) authTitle.textContent = 'Set New Password';
      if (authSubtitle) {
        authSubtitle.textContent = 'Enter your new password below to reset your account.';
        authSubtitle.style.display = 'block';
      }
      if (groupAuthEmail) groupAuthEmail.style.display = 'none';
      if (emailInput) emailInput.required = false;
      if (groupAuthPassword) groupAuthPassword.style.display = 'block';
      if (passwordInput) {
        passwordInput.required = true;
        passwordInput.value = '';
        passwordInput.placeholder = 'Enter new password (min 6 characters)';
      }
      if (labelAuthPassword) labelAuthPassword.textContent = 'New Password';
      if (forgotPasswordRow) forgotPasswordRow.style.display = 'none';
      if (authBtnsDefault) authBtnsDefault.style.display = 'none';
      if (authBtnsReset) authBtnsReset.style.display = 'none';
      if (authBtnsUpdate) authBtnsUpdate.style.display = 'flex';
    }
  }

  function toggleLoading(btn, loadingText) {
    if (!btn) return;
    if (isSubmitting) {
      btn.dataset.origText = btn.textContent;
      btn.textContent = loadingText;
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.origText || btn.textContent;
      btn.disabled = false;
    }
  }

  // Switch to Forgot Password mode
  linkForgotPassword?.addEventListener('click', (e) => {
    e.preventDefault();
    setAuthMode('forgot');
  });

  // Switch back to Sign In
  btnBackSignin?.addEventListener('click', (e) => {
    e.preventDefault();
    setAuthMode('signin');
  });

  // Monitor Auth State
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      if (authModal) authModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      setAuthMode('update_password');
      return;
    }

    if (session) {
      // If user is currently updating their password, keep the modal active until done
      if (currentAuthMode === 'update_password') {
        if (authModal) authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
      }

      // Logged in
      if (authModal) authModal.classList.remove('active');
      if (appContent) appContent.style.display = 'block';
      if (btnLogout) btnLogout.style.display = 'inline-block';
      if (navCta) navCta.style.display = 'none';
      if (authForm) authForm.reset();
      document.body.style.overflow = '';
    } else {
      // Not logged in
      if (authModal) authModal.classList.add('active');
      if (appContent) appContent.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'none';
      if (navCta) navCta.style.display = 'inline-block';
      document.body.style.overflow = 'hidden';
    }
  });

  // Check initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session && authModal) {
      authModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  // Handle Sign In
  authForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting || currentAuthMode !== 'signin') return;

    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();
    if (!email || !password) return;

    clearMessages();
    isSubmitting = true;
    toggleLoading(btnSignIn, 'Signing In...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      isSubmitting = false;
      toggleLoading(btnSignIn);

      if (error) {
        showError(error.message);
      }
    } catch (err) {
      isSubmitting = false;
      toggleLoading(btnSignIn);
      showError('Network error or invalid Supabase Key. Check console.');
      console.error(err);
    }
  });

  // Handle Sign Up
  btnSignUp?.addEventListener('click', async () => {
    if (isSubmitting || currentAuthMode !== 'signin') return;

    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();
    
    if (!email || !password) {
      showError('Please enter email and password to create an account.');
      return;
    }

    clearMessages();
    isSubmitting = true;
    toggleLoading(btnSignUp, 'Creating...');

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      isSubmitting = false;
      toggleLoading(btnSignUp);

      if (error) {
        showError(error.message);
      } else if (data?.user && data?.session === null) {
        showSuccess('Account created! Check your email for the confirmation link.');
      }
    } catch (err) {
      isSubmitting = false;
      toggleLoading(btnSignUp);
      showError('Network error or invalid Supabase Key. Check console.');
      console.error(err);
    }
  });

  // Handle Send Reset Password Link
  btnSendReset?.addEventListener('click', async () => {
    if (isSubmitting) return;

    const email = emailInput?.value.trim();
    if (!email) {
      showError('Please enter your email address.');
      return;
    }

    clearMessages();
    isSubmitting = true;
    toggleLoading(btnSendReset, 'Sending Link...');

    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      isSubmitting = false;
      toggleLoading(btnSendReset);

      if (error) {
        showError(error.message);
      } else {
        showSuccess('Password reset link sent! Please check your email inbox.');
      }
    } catch (err) {
      isSubmitting = false;
      toggleLoading(btnSendReset);
      showError('Failed to send reset link. Please try again.');
      console.error(err);
    }
  });

  // Handle Update Password
  btnUpdatePassword?.addEventListener('click', async () => {
    if (isSubmitting) return;

    const newPassword = passwordInput?.value.trim();
    if (!newPassword || newPassword.length < 6) {
      showError('New password must be at least 6 characters.');
      return;
    }

    clearMessages();
    isSubmitting = true;
    toggleLoading(btnUpdatePassword, 'Updating...');

    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });

      isSubmitting = false;
      toggleLoading(btnUpdatePassword);

      if (error) {
        showError(error.message);
      } else {
        showSuccess('Password updated successfully! Redirecting...');
        setTimeout(() => {
          setAuthMode('signin');
          if (authModal) authModal.classList.remove('active');
          if (appContent) appContent.style.display = 'block';
          if (btnLogout) btnLogout.style.display = 'inline-block';
          if (navCta) navCta.style.display = 'none';
          document.body.style.overflow = '';
        }, 1500);
      }
    } catch (err) {
      isSubmitting = false;
      toggleLoading(btnUpdatePassword);
      showError('Failed to update password. Please try again.');
      console.error(err);
    }
  });

  // Handle Log Out
  btnLogout?.addEventListener('click', async () => {
    await supabase.auth.signOut();
  });
})();

/* ============================================================
   10. SPLASH SCREEN CLEANUP
============================================================ */
(function initSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    // Remove from DOM after 1.8 seconds to ensure it doesn't block interactions
    setTimeout(() => {
      splash.remove();
    }, 1800);
  }
})();
