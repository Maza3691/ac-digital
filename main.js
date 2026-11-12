/* AC Digital: live Jersey clock, rotating hero word, Jersey footage, smooth scroll and scroll motion.
   The page is complete without this file; motion is skipped for visitors who prefer reduced motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- live clock: the time in Jersey ---------- */
  var clocks = document.querySelectorAll('.clock');
  function tick() {
    var t;
    try {
      t = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Europe/Jersey' })
        .format(new Date()).replace(' ', '').toLowerCase();
    } catch (e) { t = ''; }
    clocks.forEach(function (c) { c.textContent = t; });
  }
  tick(); setInterval(tick, 15000);

  /* ---------- contact form: sends without leaving the page ---------- */
  var form = document.querySelector('.cta__form');
  if (form && window.fetch && window.FormData) {
    var status = form.querySelector('.cta__form-status');
    var sendBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
      status.className = 'cta__form-status field--wide'; status.textContent = '';
      fetch(form.action, {
        method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
      }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok || String(res.d.success) !== 'true') throw new Error(res.d.message || 'Failed');
          form.reset();
          status.classList.add('is-ok');
          status.textContent = 'Thanks, your message has been sent. We’ll get back to you within one working day.';
          sendBtn.textContent = 'Sent';
        })
        .catch(function (err) {
          var v = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
          var body = 'Hi AC Digital,\n\n' + v('message') + '\n\nName: ' + v('name') + '\nBusiness: ' + v('business') + '\nEmail: ' + v('email') + '\nPhone: ' + v('phone');
          var mail = 'mailto:ac.digital03@gmail.com?subject=' + encodeURIComponent('Enquiry from the AC Digital website') + '&body=' + encodeURIComponent(body);
          status.classList.add('is-error');
          var why = err && err.message && err.message !== 'Failed' ? ' (' + String(err.message).replace(/[<>&"]/g, '') + ')' : '';
          status.innerHTML = 'Sorry, the form couldn’t send just now' + why + '. <a class="btn btn--navy" style="margin-top:12px" href="' + mail + '">Send by email instead</a><br>Or call <a href="tel:+447797759598">07797 759598</a>.';
          sendBtn.disabled = false; sendBtn.textContent = 'Send message';
        });
    });
  }

  /* ---------- top bar: solid on scroll, progress, where-you-are marker, services panel, phone menu ---------- */
  var navEl = document.getElementById('nav');
  var progress = navEl.querySelector('.nav__progress');
  function onBarScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    navEl.classList.toggle('is-solid', y > 40);
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
  }
  window.addEventListener('scroll', onBarScroll, { passive: true });
  onBarScroll();

  var ink = navEl.querySelector('.nav__ink');
  var links = navEl.querySelector('.nav__links');
  var spyMap = {};
  navEl.querySelectorAll('[data-spy]').forEach(function (a) { spyMap[a.getAttribute('data-spy')] = a; });
  function moveInk(el) {
    if (!el) { ink.classList.remove('is-on'); return; }
    var lr = links.getBoundingClientRect(), r = el.getBoundingClientRect();
    ink.style.width = (r.width - 28) + 'px';
    ink.style.transform = 'translateX(' + (r.left - lr.left + 14) + 'px)';
    ink.classList.add('is-on');
  }
  var spySections = ['services', 'how'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var spyCurrent = null, spyQueued = false;
  function spy() {
    spyQueued = false;
    var mid = window.innerHeight * 0.45, current = null;
    spySections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) current = s.id;
    });
    if (current !== spyCurrent) { spyCurrent = current; moveInk(current ? spyMap[current] : null); }
  }
  window.addEventListener('scroll', function () { if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); } }, { passive: true });
  window.addEventListener('resize', function () { spyCurrent = '__'; spy(); });
  spy();

  var burger = navEl.querySelector('.nav__burger');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('menu-open', open);
    navEl.classList.toggle('is-open', open);
    if (window.__lenis) { if (open) window.__lenis.stop(); else window.__lenis.start(); }
    if (open) { var first = menu.querySelector('a'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60); }
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });

  /* ---------- Jersey map: name the parish under the pointer ---------- */
  var mapCard = document.querySelector('.card--map');
  if (mapCard) {
    var tip = document.createElement('span');
    tip.className = 'jmap__tip';
    tip.setAttribute('aria-hidden', 'true');
    mapCard.appendChild(tip);
    var showTip = function (e) {
      var parish = e.target.closest('.parish');
      if (!parish) { tip.classList.remove('is-on'); return; }
      tip.textContent = parish.getAttribute('data-name').replace('Saint ', 'St ').replace('Brélade', 'Brelade');
      var box = mapCard.getBoundingClientRect();
      var x = Math.min(Math.max(e.clientX - box.left, tip.offsetWidth / 2 + 12), box.width - tip.offsetWidth / 2 - 12);
      var y = e.clientY - box.top;
      var below = y - tip.offsetHeight - 18 < 8;
      tip.style.transform = 'translate(' + x + 'px,' + (below ? y + 22 : y - 18) + 'px) translate(-50%, ' + (below ? '0' : '-100%') + ')';
      tip.classList.add('is-on');
    };
    var map0 = mapCard.querySelector('.jmap');
    map0.addEventListener('pointermove', showTip);
    map0.addEventListener('pointerdown', showTip);
    map0.addEventListener('pointerleave', function () { tip.classList.remove('is-on'); });
  }

  if (reduce || !window.gsap) return;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  if (ST) gsap.registerPlugin(ST);
  document.documentElement.classList.add('motion');

  /* ---------- smooth scroll: Lenis on GSAP's ticker ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    if (ST) lenis.on('scroll', ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    var navH = function () { return document.getElementById('nav').offsetHeight; };
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var target = id === '#top' ? 0 : document.querySelector(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === '#top' ? 0 : -navH() - 12, duration: 1.2 });
      });
    });
  }

  /* ---------- nav: out of the way while reading down, back when scrolling up ---------- */
  var nav = document.getElementById('nav');
  var last = 0;
  function onScroll(y) {
    if (y > window.innerHeight * 0.8 && y > last + 4) nav.classList.add('is-hidden');
    else if (y < last - 4 || y < 80) nav.classList.remove('is-hidden');
    last = y;
  }
  if (lenis) lenis.on('scroll', function (l) { onScroll(l.scroll); });
  else window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });

  /* ---------- hero entrance ---------- */
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro.from('.hero__title .serif, .rotor, .hero__lede, .hero__services, .hero__meta', { y: 40, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.1);

  /* ---------- service pills: each icon plays its little act once on arrival ---------- */
  gsap.utils.toArray('.svc').forEach(function (a, n) {
    gsap.delayedCall(1.4 + n * 0.18, function () {
      a.classList.add('play');
      gsap.delayedCall(1.3, function () { a.classList.remove('play'); });
    });
  });

  /* ---------- Jersey footage: plays muted behind the blur.
     If the video cannot play, the photo slideshow takes over. ---------- */
  var place = document.querySelector('.hero__place');
  var video = document.querySelector('.hero__video');
  function setPlace(name) {
    if (!place || place.textContent === name) return;
    gsap.to(place, { opacity: 0, duration: 0.25, onComplete: function () {
      place.textContent = name;
      gsap.to(place, { opacity: 1, duration: 0.4 });
    } });
  }
  function startSlideshow() {
    var photos = gsap.utils.toArray('.hero__photo');
    var p = 0;
    photos.forEach(function (ph) { ph.classList.remove('is-on'); });
    gsap.set(photos, { autoAlpha: 0 });
    gsap.set(photos[0], { autoAlpha: 1 });
    function drift(el) { gsap.fromTo(el, { scale: 1.02 }, { scale: 1.1, duration: 8, ease: 'none' }); }
    drift(photos[0]);
    setInterval(function () {
      if (document.hidden) return;
      var cur = photos[p], next = photos[(p + 1) % photos.length];
      gsap.to(cur, { autoAlpha: 0, duration: 1.6, ease: 'power1.inOut' });
      gsap.to(next, { autoAlpha: 1, duration: 1.6, ease: 'power1.inOut' });
      drift(next);
      if (place) {
        gsap.to(place, { opacity: 0, duration: 0.3, onComplete: function () {
          place.textContent = next.getAttribute('data-place');
          gsap.to(place, { opacity: 1, duration: 0.5 });
        } });
      }
      p = (p + 1) % photos.length;
    }, 6000);
  }
  if (video) {
    var failed = false;
    var fail = function () { if (failed) return; failed = true; video.classList.add('is-failed'); startSlideshow(); };
    video.addEventListener('error', fail, true);
    var p = video.play();
    if (p && p.catch) p.catch(fail);
  } else {
    startSlideshow();
  }

  /* ---------- rotating word ---------- */
  var words = gsap.utils.toArray('.rotor__word');
  var i = 0;
  words.forEach(function (w) { w.classList.remove('is-on'); });
  gsap.set(words, { yPercent: 105, autoAlpha: 0 }); gsap.set(words[0], { yPercent: 0, autoAlpha: 1 });
  setInterval(function () {
    if (document.hidden) return;
    var cur = words[i], next = words[(i + 1) % words.length];
    gsap.to(cur, { yPercent: -105, duration: 0.7, ease: 'power3.inOut', onComplete: function () { gsap.set(cur, { autoAlpha: 0 }); } });
    gsap.fromTo(next, { yPercent: 105, autoAlpha: 1 }, { yPercent: 0, duration: 0.7, ease: 'power3.inOut' });
    i = (i + 1) % words.length;
  }, 2200);

  if (!ST) return;

  /* ---------- entrances ---------- */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    if (el.closest('.bento')) return;
    var kids = el.children.length > 1 && !el.matches('li') ? el.children : [el];
    gsap.from(kids, { y: 28, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 96%', once: true } });
  });
  gsap.from('.bento .card', { y: 48, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: '.bento', start: 'top 94%', once: true } });

  /* ---------- intro types itself out when it comes into view: title first, then the description ---------- */
  var typed = gsap.utils.toArray('[data-type]');
  if (typed.length) {
    var chars = [];
    typed.forEach(function (el) {
      var text = el.textContent;
      el.setAttribute('aria-label', text);
      el.classList.add('typing');
      el.textContent = '';
      // split into words (so lines break normally), then letters
      text.split(/(\s+)/).forEach(function (part) {
        if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
        var word = document.createElement('span');
        word.setAttribute('aria-hidden', 'true');
        word.style.whiteSpace = 'nowrap';
        part.split('').forEach(function (ch) {
          var s = document.createElement('span');
          s.className = 'ch'; s.textContent = ch;
          word.appendChild(s); chars.push(s);
        });
        el.appendChild(word);
      });
    });
    var shown = -1;
    function typeTo(n) {
      n = Math.max(0, Math.min(chars.length, n));
      if (n === shown) return;
      for (var k = 0; k < chars.length; k++) {
        chars[k].classList.toggle('on', k < n);
        chars[k].classList.toggle('caret', k === n - 1 && n < chars.length + 1);
      }
      shown = n;
    }
    typeTo(0);
    // a real typewriter: same pace however fast you scroll. Title first, a breath, then the description.
    var titleCount = typed[0].querySelectorAll('.ch').length;
    var counter = { n: 0 };
    var typeTl = gsap.timeline({ paused: true })
      .to(counter, { n: titleCount, duration: titleCount * 0.06, ease: 'none', onUpdate: function () { typeTo(Math.round(counter.n)); } })
      .to(counter, { n: chars.length, duration: (chars.length - titleCount) * 0.03, ease: 'none', delay: 0.35,
                     onUpdate: function () { typeTo(Math.round(counter.n)); } });
    ST.create({ trigger: '.intro__text', start: 'top 75%', once: true, onEnter: function () { typeTl.play(); } });
  }

  /* ---------- service bands: each one settles back as the next slides over ---------- */
  var mmWide = gsap.matchMedia();
  mmWide.add('(min-width: 1081px)', function () {
    var bands = gsap.utils.toArray('.band');
    bands.forEach(function (band, n) {
      var nextBand = bands[n + 1];
      if (!nextBand) return;
      gsap.to(band, { scale: 0.94, ease: 'none',
        scrollTrigger: { trigger: nextBand, start: 'top bottom', end: 'top top+=120', scrub: true } });
    });
  });
  gsap.utils.toArray('.band').forEach(function (band) {
    gsap.from(band.querySelectorAll('.band__list li'), { x: -16, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.05,
      scrollTrigger: { trigger: band, start: 'top 85%', once: true } });
  });

  /* ---------- call to action: slides up, never hidden ---------- */
  gsap.from('.cta h2, .cta > p, .cta__actions, .cta__form', { y: 48, duration: 0.9, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: '.cta', start: 'top 90%', once: true } });

  /* ---------- industry pills: dropped onto the page, they settle with a bounce ---------- */
  gsap.from('.pills li', {
    y: -36, rotation: function () { return gsap.utils.random(-12, 12); }, opacity: 0,
    duration: 1.1, ease: 'bounce.out', stagger: { each: 0.05, from: 'random' },
    scrollTrigger: { trigger: '.pills', start: 'top 95%', once: true }
  });
  /* ...and lean gently towards the cursor (only where there is a real pointer) */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    gsap.utils.toArray('.pills li').forEach(function (li) {
      var xTo = gsap.quickTo(li, 'x', { duration: 0.4, ease: 'power3.out' });
      var yTo = gsap.quickTo(li, 'y', { duration: 0.4, ease: 'power3.out' });
      li.addEventListener('mousemove', function (e) {
        var r = li.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      li.addEventListener('mouseenter', function () { gsap.to(li, { scale: 1.06, rotation: gsap.utils.random(-4, 4), duration: 0.3, ease: 'power3.out' }); });
      li.addEventListener('mouseleave', function () {
        xTo(0); yTo(0);
        gsap.to(li, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
      });
    });
  }

  /* ---------- service drawings: each one starts doing its job when its band arrives ---------- */
  gsap.utils.toArray('.band').forEach(function (band) {
    ST.create({ trigger: band, start: 'top 75%', once: true, onEnter: function () { band.classList.add('is-live'); } });
  });

  /* ---------- Bouônjour card: a real little conversation ---------- */
  var hello = document.querySelector('.card--hello');
  if (hello) {
    var bIn = hello.querySelector('.chat__bubble--in');
    var bType = hello.querySelector('.chat__typing');
    var bOut = hello.querySelector('.chat__bubble--out');
    gsap.set([bIn, bOut], { autoAlpha: 0, y: 14 });
    gsap.set(bType, { autoAlpha: 0, scale: 0.8 });
    var talk = gsap.timeline({ paused: true })
      .to(bIn, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' })
      .to(bType, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out' }, '+=0.35')
      .to(bType, { autoAlpha: 0, scale: 0.8, duration: 0.2 }, '+=1.3')
      .set(bType, { display: 'none' })
      .to(bOut, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' });
    ST.create({ trigger: hello, start: 'top 80%', once: true, onEnter: function () { talk.play(); } });
    hello.addEventListener('mouseenter', function () {
      if (talk.isActive()) return;
      gsap.set(bType, { display: '' });
      talk.restart();
    });
  }

  /* ---------- Jersey map: the coast draws itself, the 12 parishes pop up, our pin pulses in St Helier ---------- */
  var map = document.querySelector('.jmap');
  if (map) {
    var group = map.querySelector('.jmap__parishes');
    var helier = map.querySelector('.parish[data-name="Saint Helier"]');
    var pin = map.querySelector('.jmap__pin');
    if (group && helier && pin) {
      var bb = helier.getBBox();
      var m = group.transform.baseVal.consolidate();
      var mx = m ? m.matrix : { a: 1, d: 1, e: 0, f: 0 };
      pin.setAttribute('transform', 'translate(' + (mx.a * (bb.x + bb.width / 2) + mx.e) + ' ' + (mx.d * (bb.y + bb.height * 0.62) + mx.f) + ')');
    }
    var coast = gsap.utils.toArray(map.querySelectorAll('.jmap__coast path'));
    coast.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    var parishes = gsap.utils.toArray(map.querySelectorAll('.parish'));
    gsap.set(parishes, { opacity: 0 });
    gsap.set(pin, { opacity: 0 });
    var mapTl = gsap.timeline({ paused: true })
      .to(coast, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .to(parishes, { opacity: 1, duration: 0.6, ease: 'power2.out', stagger: { each: 0.06, from: 'random' } }, 0.5)
      .to(pin, { opacity: 1, duration: 0.4 }, '-=0.2');
    ST.create({ trigger: map, start: 'top 80%', once: true, onEnter: function () { mapTl.play(); } });
    gsap.fromTo(map.querySelector('.jmap__ping'), { scale: 1, opacity: 0.6, svgOrigin: '0 0' },
      { scale: 2.4, opacity: 0, duration: 2.4, ease: 'power2.out', repeat: -1, svgOrigin: '0 0' });
  }

  /* ---------- the name rises into the footer ---------- */
  gsap.from('.footer__giant img', { yPercent: 60, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
})();
