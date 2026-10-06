(function(){
  function init(){
    var track=document.getElementById('amen-track'),dotsWrap=document.getElementById('amen-dots');
    if(!track||!dotsWrap||track.dataset.ready)return;
    track.dataset.ready='1';

    var originals=[].slice.call(track.children),n=originals.length;
    originals.forEach(function(c){var k=c.cloneNode(true);k.setAttribute('aria-hidden','true');track.appendChild(k);});
    originals.slice().reverse().forEach(function(c){var k=c.cloneNode(true);k.setAttribute('aria-hidden','true');track.insertBefore(k,track.firstChild);});

    var cards=[].slice.call(track.children),dots=[].slice.call(dotsWrap.children),jumping=false,ticking=false;

    function step(){return cards[0].offsetWidth+(parseFloat(getComputedStyle(track).columnGap)||16);}
    function centerOn(i){track.scrollLeft=cards[i].offsetLeft-(track.clientWidth-cards[i].offsetWidth)/2;}

    function update(){
      var r=track.getBoundingClientRect(),mid=r.left+r.width/2,best=0,min=Infinity;
      cards.forEach(function(c,i){var b=c.getBoundingClientRect(),d=Math.abs(b.left+b.width/2-mid);if(d<min){min=d;best=i;}});
      cards.forEach(function(c,i){c.classList.toggle('active',i===best);});
      dots.forEach(function(d,i){d.classList.toggle('active',i===best%n);});
      if(jumping)return;
      if(best<n){jumping=true;track.scrollLeft+=n*step();setTimeout(function(){jumping=false;},50);}
      else if(best>=n*2){jumping=true;track.scrollLeft-=n*step();setTimeout(function(){jumping=false;},50);}
    }

    track.addEventListener('scroll',function(){
      if(ticking||jumping)return;ticking=true;
      requestAnimationFrame(function(){update();ticking=false;});
    },{passive:true});
    window.addEventListener('resize',function(){centerOn(n);update();});

    centerOn(n);update();
  }
  if(document.readyState==='complete')init();else window.addEventListener('load',init);
})();

(function(){
  var root=document.getElementById('sh-life');
  if(!root)return;
  var track=root.querySelector('.lf-track'),dots=[].slice.call(root.querySelectorAll('.lf-dot')),n=dots.length;
  var smooth=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  function idx(){return Math.round(track.scrollLeft/track.clientWidth);}
  function go(i){track.scrollTo({left:((i%n)+n)%n*track.clientWidth,behavior:smooth});}
  function paint(){var i=idx();dots.forEach(function(d,k){d.classList.toggle('active',k===i);});}
  root.querySelector('.lf-prev').addEventListener('click',function(){go(idx()-1);});
  root.querySelector('.lf-next').addEventListener('click',function(){go(idx()+1);});
  dots.forEach(function(d,k){d.addEventListener('click',function(){go(k);});});
  track.addEventListener('scroll',function(){requestAnimationFrame(paint);},{passive:true});
  track.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){e.preventDefault();go(idx()+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();go(idx()-1);}
  });
})();


/* ===== LEAD FORM -> WEBHOOK -> THANK-YOU (Meta Lead fires there) ===== */
(function () {
  var form = document.getElementById('apply-form');
  if (!form) return;
  var C = window.SH_CONFIG || {};
  var status = form.querySelector('.ap-status');
  var btn = form.querySelector('button[type=submit]');
  var label = btn.querySelector('span');
  var labelText = label.textContent;

  function say(m) { status.textContent = m; }
  function cookie(n) { var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; }
  function busy(on) { btn.disabled = on; label.textContent = on ? 'Sending…' : labelText; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    say('');
    if (form.elements.company.value) return;                    // honeypot: bots only
    if (!C.WEBHOOK_URL) { say('Webhook URL is not set. Add it in config.js.'); return; }

    var q = new URLSearchParams(location.search);
    var data = new URLSearchParams(new FormData(form));
    data.delete('company');
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid'].forEach(function (k) { data.append(k, q.get(k) || ''); });
    var eid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2);
    data.append('event_id', eid);                               // same ID is used by the Meta Pixel (dedupe with server events)
    data.append('fbp', cookie('_fbp'));
    data.append('fbc', cookie('_fbc') || (q.get('fbclid') ? 'fb.1.' + Date.now() + '.' + q.get('fbclid') : ''));
    data.append('page_url', location.href);
    data.append('referrer', document.referrer);
    data.append('submitted_at', new Date().toISOString());

    busy(true);
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 10000);
    fetch(C.WEBHOOK_URL, { method: 'POST', body: data, mode: 'no-cors', signal: ctl.signal })
      .then(function () {
        clearTimeout(timer);
        try { sessionStorage.setItem('sh_lead', JSON.stringify({ event_id: eid, name: (form.elements.name.value || '').trim().split(' ')[0] })); } catch (err) {}
        location.href = C.THANK_YOU_URL || 'thank-you.html';
      })
      .catch(function () {
        clearTimeout(timer);
        busy(false);
        say('Could not send. Check your connection and try again.');
      });
  });
})();


/* ===== EVERY "APPLY" CTA -> FORM, + STICKY BAR ===== */
(function () {
  var form = document.getElementById('apply');
  if (!form) return;
  var bar = document.querySelector('.sh-bar');
  var heroCta = document.querySelector('.sh-hero .sh-cta');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  [].forEach.call(document.querySelectorAll('a[href="#apply"]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (window.matchMedia('(hover:hover)').matches) {      // desktop only: on phones the keyboard would cover the form
        setTimeout(function () {
          var f = form.querySelector('input[name=name]');
          if (f) f.focus({ preventScroll: true });
        }, reduce ? 0 : 600);
      }
      if (history.replaceState) history.replaceState(null, '', '#apply');
    });
  });

  /* bar shows once the hero button is off-screen, and hides while the form itself is on screen */
  if (!bar || !('IntersectionObserver' in window)) return;
  var seen = { hero: !!heroCta, form: false };
  function paint() { var on = !seen.hero && !seen.form; bar.classList.toggle('on', on); bar.inert = !on; }
  function watch(el, key) {
    if (!el) return;
    new IntersectionObserver(function (en) { seen[key] = en[0].isIntersecting; paint(); }).observe(el);
  }
  watch(heroCta, 'hero'); watch(form, 'form'); paint();
})();