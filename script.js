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