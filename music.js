/* Safiyyah Belajar - lagu latar yang perlahan (dijana sendiri dengan Web Audio, tiada fail muzik). */
(function(){
  var KEY='safiyyahMusic.v1', on=true, ctx=null, master=null, timer=null, nextBar=0, bar=0;
  try{ on = localStorage.getItem(KEY)!=='off'; }catch(e){}
  var BPM=66, BEAT=60/BPM, BARLEN=BEAT*4;
  // C major, gentle progression: C - Am - F - G
  var CHORDS=[[48,52,55],[45,48,52],[41,45,48],[43,47,50]];
  // pentatonic melody, two phrases (null = rest)
  var MEL=[[72,null,76,74],[72,69,null,67],[69,72,74,null],[74,72,null,null],
           [76,null,79,76],[74,72,null,69],[72,74,null,69],[67,null,null,null]];
  function hz(m){return 440*Math.pow(2,(m-69)/12);}
  function note(m,t,dur,type,vol,attack){
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type; o.frequency.value=hz(m);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vol,t+attack);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+0.05);
  }
  function scheduleBar(t,i){
    var ch=CHORDS[i%4];
    ch.forEach(function(m){ note(m,t,BARLEN*1.05,'sine',0.05,0.6); });           // soft pad
    for(var k=0;k<4;k++){ note(ch[k%3]+12,t+k*BEAT,BEAT*1.6,'triangle',0.035,0.02); } // slow arpeggio
    var mel=MEL[i%MEL.length];
    mel.forEach(function(m,k){ if(m) note(m,t+k*BEAT,BEAT*1.8,'sine',0.06,0.03); });  // melody
    note(ch[0]-12,t,BARLEN,'sine',0.06,0.05);                                         // bass
  }
  function tick(){
    while(nextBar < ctx.currentTime + 1.5){ scheduleBar(nextBar, bar++); nextBar += BARLEN; }
  }
  function start(){
    if(!on) return;
    try{
      if(navigator.audioSession) navigator.audioSession.type='playback'; // iPad: main walaupun mod senyap
      if(!ctx){
        var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
        ctx=new AC(); master=ctx.createGain(); master.gain.value=0.5; master.connect(ctx.destination);
      }
      if(ctx.state==='suspended') ctx.resume();
      if(!timer){ nextBar=ctx.currentTime+0.1; timer=setInterval(tick,400); tick(); }
    }catch(e){}
  }
  function stop(){
    if(timer){ clearInterval(timer); timer=null; }
    if(ctx){ try{ ctx.suspend(); }catch(e){} }
  }
  // toggle button
  var css=document.createElement('style');
  css.textContent='.music-btn{position:fixed;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:50;border:2px solid var(--line,#D5E4DF);background:var(--surface,#fff);color:var(--ink,#1D2A31);border-radius:999px;padding:8px 14px;font:800 15px/1 "Nunito",system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer}.music-btn[aria-pressed="false"]{opacity:.7}.music-btn:focus-visible{outline:3px solid #F2B33D;outline-offset:2px}';
  document.head.appendChild(css);
  var btn=document.createElement('button');
  btn.className='music-btn'; btn.type='button';
  function label(){ btn.setAttribute('aria-pressed',on?'true':'false'); btn.textContent=on?'♫ Muzik: Hidup':'♫ Muzik: Mati'; }
  label();
  btn.addEventListener('click',function(e){
    e.stopPropagation(); on=!on; label();
    try{ localStorage.setItem(KEY,on?'on':'off'); }catch(err){}
    if(on) start(); else stop();
  });
  function add(){ document.body.appendChild(btn); }
  if(document.body) add(); else document.addEventListener('DOMContentLoaded',add);
  // browsers only allow sound after the first tap
  ['pointerdown','keydown','touchstart'].forEach(function(ev){ document.addEventListener(ev,function(){ if(on && !timer) start(); },{passive:true}); });
  document.addEventListener('visibilitychange',function(){ if(document.hidden) stop(); else if(on && ctx) start(); });
})();
