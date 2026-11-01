/* FITBEAT unified update: original art retained, five workout intensities,
   separate exercise phases, original beat soundtrack, elevated hit zone. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const screens=[...document.querySelectorAll('.screen')];
const intensity=[
 {id:'light',name:'Light · เบา',bpm:80,duration:60,scene:0},
 {id:'moderate',name:'Moderate · ปานกลาง',bpm:110,duration:90,scene:1},
 {id:'vigorous',name:'Vigorous · หนัก',bpm:130,duration:120,scene:2},
 {id:'maximum',name:'Maximum · หนักมาก',bpm:150,duration:120,scene:3},
 {id:'interval',name:'Interval · หนักสลับเบา',bpm:150,duration:120,scene:4}
];
let phase='workout',mode=intensity[0],score=0,combo=0,maxCombo=0,perfect=0,good=0,miss=0;
let notes=[],elapsed=0,last=0,spawnAt=0,playing=false,paused=false,raf=0;
let ctx=null,master=null,musicTimer=null,nextBeat=0,step=0;
const TRAVEL=3.3,HIT=0.67;
const gestures=["up","side","forward","down"];let gestureStep=0;
const beatDuration=()=>60/currentBpm();
function currentBpm(){
 if(phase==='warmup')return Math.round(72+Math.min(1,elapsed/60)*18);
 if(phase==='cooldown')return Math.round(90-Math.min(1,elapsed/60)*18);
 if(mode.id==='interval')return Math.floor(elapsed/15)%2===0?150:80;
 return mode.bpm;
}
function audioReady(){
 try{
  if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();master=ctx.createGain();master.gain.value=Number($('music-volume')?.value||75)/100*.48;master.connect(ctx.destination)}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  return true;
 }catch(e){return false}
}
function synth(f,t,d=.1,v=.07,type='sine',end=0){
 if(!ctx)return;
 const o=ctx.createOscillator(),g=ctx.createGain();
 o.type=type;o.frequency.setValueAtTime(f,t);
 if(end)o.frequency.exponentialRampToValueAtTime(end,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);
}
const chords=[[261.63,329.63,392],[293.66,349.23,440],[329.63,392,493.88],[261.63,349.23,440]];
const melodies=[
 [523.25,659.25,783.99,659.25,587.33,523.25,440,493.88],
 [659.25,783.99,880,783.99,698.46,659.25,587.33,659.25],
 [783.99,987.77,1046.5,987.77,880,783.99,659.25,698.46],
 [698.46,880,987.77,880,783.99,698.46,587.33,659.25]
];
function playBeat(t,n){
 const s=n%8,bar=Math.floor(n/8),ch=chords[Math.floor(bar/2)%4];
 if(s===0||s===4)synth(130,t,.16,.32,'sine',48);
 if(s===2||s===6){synth(200,t,.07,.14,'triangle',110);synth(1200,t,.045,.025,'sawtooth',500)}
 synth(3200,t,.03,.028,'triangle',1900);
 if(s===0||s===4)synth(ch[0]/2,t,.22,.10,'triangle');
 if(s===0)ch.forEach((f,j)=>synth(f,t+j*.01,.27,.027));
 if(s===3||s===7)synth(ch[(bar+s)%3]*2,t,.12,.045);
 // Original melodic phrases: varied by harmony, with occasional rests.
 const phrase=melodies[Math.floor(bar/2)%4];
 if(s%2===0 || (bar%4===3 && s===7)){
   const note=phrase[(s+Math.floor(bar/2))%8];
   synth(note,t,.19,.080,'triangle');
   synth(note/2,t,.25,.023,'sine');
 }
 if(s===0 && bar%4===0)synth(1046.5,t,.38,.038,'sine');
}
function musicTick(){
 if(!playing||paused||!ctx||!$('sound')?.checked)return;
 if(nextBeat<ctx.currentTime-.2)nextBeat=ctx.currentTime+.04;
 while(nextBeat<ctx.currentTime+.12){
  playBeat(nextBeat,step++);
  nextBeat+=beatDuration()/2;
 }
}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}
function startMusic(){
 stopMusic();
 if(!audioReady())return;
 step=0;nextBeat=ctx.currentTime+.08;
 musicTimer=setInterval(musicTick,25);
}
function ping(f){if(!ctx||!$('sound')?.checked)return;synth(f,ctx.currentTime,.10,.045)}
function show(id){
 screens.forEach(s=>s.classList.toggle('active',s.id===id));
 if(id!=='game'){playing=false;cancelAnimationFrame(raf);stopMusic()}
}
document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.screen)));
const homeLevelButton=[...document.querySelectorAll('#home .menu button')].find(b=>b.textContent.includes('Level Select'));
if(homeLevelButton){
 homeLevelButton.dataset.screen='intensity-guide';
 homeLevelButton.textContent='📖 Intensity Guide';
 homeLevelButton.addEventListener('click',()=>show('intensity-guide'));
}
const guide=document.createElement('section');
guide.id='intensity-guide';guide.className='screen';
guide.innerHTML=`<h2>🌸 Exercise Intensity Guide</h2>
<p class="fb-guide-intro">Understand exercise intensity, energy systems and heart-rate monitoring before choosing your workout.</p>
<div class="fb-guide-grid">
<article><h3>🌿 Light · เบา</h3><p>Easy breathing, comfortable conversation. RPE 9–11/20. Approx. 50–63% HRmax.</p><p><b>Energy:</b> Predominantly aerobic/oxidative pathways.</p></article>
<article><h3>🌼 Moderate · ปานกลาง</h3><p>Breathing faster, but still able to talk. RPE 12–13/20. Approx. 64–76% HRmax.</p><p><b>Energy:</b> Mostly aerobic, with increased carbohydrate use.</p></article>
<article><h3>🔥 Vigorous · หนัก</h3><p>Breathing hard; only short phrases. RPE 14–16/20. Approx. 77–95% HRmax.</p><p><b>Energy:</b> Aerobic and anaerobic glycolysis both contribute.</p></article>
<article><h3>⚡ Maximum · หนักมาก</h3><p>Near-maximal effort, difficult to sustain. RPE 17–20/20. HR alone responds too slowly for short maximal bursts.</p><p><b>Energy:</b> ATP-PCr and fast glycolysis contribute strongly; aerobic energy also contributes.</p></article>
<article><h3>💜 Interval · หนักสลับเบา</h3><p>Alternate hard effort and easy recovery. Monitor HR trends and recovery, but also use the talk test and perceived effort.</p><p><b>Energy:</b> Mix of ATP-PCr, glycolytic and oxidative pathways, depending on work/rest duration.</p></article>
</div>
<div class="fb-guide-note"><b>Heart-rate guidance:</b> An approximate HRmax formula is 220 − age, but individual values vary. These zones are rough educational examples, not personalized exercise prescriptions. Medications, fitness and health conditions can affect HR response. <b>Music BPM is not exercise intensity or heart rate.</b> Energy systems always overlap; calories cannot be estimated reliably without personal and activity data.</div>
<button data-screen="levels" class="fb-guide-start">🌸 Choose Workout</button>
<button data-screen="home" class="secondary fb-guide-home">← Home</button>`;
document.querySelector('.shell')?.append(guide);
screens.push(guide);
guide.querySelector('.fb-guide-start').addEventListener('click',()=>show('levels'));
guide.querySelector('.fb-guide-home').addEventListener('click',()=>show('home'));
const levelGrid=document.querySelector('#levels .level-grid');
const section=document.getElementById('levels');
const heading=section?.querySelector('h2');
if(heading)heading.textContent='🌸 Choose Your Exercise 🌸';
if(levelGrid){
 const phaseBar=document.createElement('div');
 phaseBar.className='fb-phase-tabs';
 phaseBar.innerHTML='<button type="button" data-phase="warmup">🌤 Warm-up</button><button type="button" data-phase="workout">💪 Workout</button><button type="button" data-phase="cooldown">🌙 Cool-down</button>';
 levelGrid.before(phaseBar);
 const detail=document.createElement('p');detail.className='fb-phase-help';phaseBar.after(detail);
 function render(){
  phaseBar.querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.dataset.phase===phase);b.setAttribute('aria-pressed',String(b.dataset.phase===phase))});
  if(phase==='workout'){
   detail.textContent='Choose workout intensity. BPM is music tempo, not a clinical intensity measure.';
   levelGrid.innerHTML=intensity.map((m,i)=>'<button class="level" type="button" data-mode="'+m.id+'"><img src="assets/'+['level1-spring.webp','level2-bakery.webp','level3-night.webp','level4-amusement.webp','level5-lakeside.webp'][m.scene]+'" alt=""><b>'+m.name+'</b><span>'+(m.id==='interval'?'80 ↔ 150':m.bpm)+' BPM · '+m.duration+' sec</span></button>').join('');
  }else{
   const warm=phase==='warmup';
   detail.textContent=warm?'A gentle warm-up with gradually increasing tempo.':'A gentle cool-down with gradually decreasing tempo.';
   levelGrid.innerHTML='<button class="level fb-single" type="button" data-mode="phase"><img src="assets/'+(warm?'level1-spring.webp':'level2-bakery.webp')+'" alt=""><b>'+(warm?'🌤 Start Warm-up':'🌙 Start Cool-down')+'</b><span>'+(warm?'72 → 90':'90 → 72')+' BPM · 60 sec</span></button>';
  }
 }
 phaseBar.addEventListener('click',e=>{const b=e.target.closest('[data-phase]');if(!b)return;phase=b.dataset.phase;render()});
 levelGrid.addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;mode=intensity.find(m=>m.id===b.dataset.mode)||intensity[0];start()});
 render();
}
function reset(){
 score=combo=maxCombo=perfect=good=miss=0;notes=[];elapsed=0;spawnAt=.4;last=0;paused=false;gestureStep=0;
 $('target-lanes').querySelectorAll('.note').forEach(n=>n.remove());
 $('feedback').textContent='Ready? ♪';$('pause').textContent='Ⅱ';update();
}
function start(){
 reset();
 const scene=phase==='warmup'?0:phase==='cooldown'?1:mode.scene;
 $('game').dataset.level=String(scene);
 $('game').dataset.phase=phase;
 playing=true;show('game');playing=true;
 startMusic();
 raf=requestAnimationFrame(tick);
}
function duration(){return phase==='workout'?mode.duration:60}
function update(){
 $('score').textContent=score.toLocaleString();$('combo').textContent=combo;
 const remaining=Math.max(0,duration()-elapsed);
 $('timer').textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(Math.floor(remaining%60)).padStart(2,'0');
 $('progress').style.width=Math.min(100,elapsed/duration()*100)+'%';
}
function spawn(){
 // Choreographed blocks: a full arm phrase before switching sides.
 const side=Math.floor(gestureStep/4)%2,pose=gestureStep%4;gestureStep++;
 const el=document.createElement('div');el.className='note arm-note';
 el.innerHTML='<span>'+['↑',side===0?'←':'→','✋','↓'][pose]+'</span><small>'+gestures[pose].toUpperCase()+'</small>';
 document.querySelectorAll('#target-lanes .lane')[side].append(el);
 notes.push({lane:side,pose,el,born:elapsed,hit:false});
}
function fail(n){
 if(n.hit)return;n.hit=true;n.el.remove();combo=0;miss++;$('feedback').textContent='MISS';update();
}
function tick(time){
 if(!playing)return;
 if(!last)last=time;
 const dt=Math.min(.05,(time-last)/1000);last=time;
 if(!paused){
  elapsed+=dt;
  while(elapsed>=spawnAt&&spawnAt<duration()-TRAVEL){
   spawn();
   spawnAt+=phase==='workout'?(mode.id==='light'?3.8:mode.id==='moderate'?3.1:mode.id==='vigorous'?2.6:2.3):4;
  }
  for(const n of notes){
   if(n.hit)continue;
   const p=(elapsed-n.born)/TRAVEL;
   // 67% of the lane is the physical hit zone; the scoring time is p=1.
   n.el.style.top='calc('+Math.max(0,Math.min(1.15,p))*HIT*100+'% - 17px)';
   if(p>1.22)fail(n);
  }
  notes=notes.filter(n=>!n.hit);
  update();
  if(elapsed>=duration()){finish();return}
 }
 raf=requestAnimationFrame(tick);
}
function move(lane,pose){
 if(!playing||paused)return;
 const candidates=notes.filter(n=>!n.hit&&n.lane===lane&&(pose===undefined||n.pose===pose)).sort((a,b)=>Math.abs(elapsed-a.born-TRAVEL)-Math.abs(elapsed-b.born-TRAVEL));
 const n=candidates[0];
 if(!n){$('feedback').textContent='Keep moving!';return}
 const delta=Math.abs(elapsed-n.born-TRAVEL);
 if(delta>.40){$('feedback').textContent=elapsed-n.born<TRAVEL?'Too early!':'Too late!';return}
 n.hit=true;n.el.remove();combo++;maxCombo=Math.max(maxCombo,combo);
 if(delta<.16){perfect++;score+=100+Math.min(combo,20)*5;$('feedback').textContent='PERFECT! ✨';ping(750)}
 else{good++;score+=50+Math.min(combo,20)*2;$('feedback').textContent='GOOD! 🌸';ping(560)}
 update();
}
function finish(){
 playing=false;cancelAnimationFrame(raf);stopMusic();
 $('final-score').textContent=score.toLocaleString();$('perfect').textContent=perfect;
 $('good').textContent=good;$('miss').textContent=miss;$('max-combo').textContent=maxCombo;
 show('results');
}
window.fitbeatHit=(side,pose)=>move(side==='left'?0:1,gestures.indexOf(pose));
document.addEventListener('keydown',e=>{
 const map={Digit1:[0,0],Digit2:[0,1],Digit3:[0,2],Digit4:[0,3],KeyQ:[1,0],KeyW:[1,1],KeyE:[1,2],KeyR:[1,3]};
 if(map[e.code]){e.preventDefault();move(...map[e.code])}
});
$('pause').addEventListener('click',()=>{
 paused=!paused;$('pause').textContent=paused?'▶':'Ⅱ';last=0;
 if(ctx)nextBeat=ctx.currentTime+.07;
});
$('sound')?.addEventListener('change',()=>{if(ctx)nextBeat=ctx.currentTime+.07});
const soundSetting=$('sound');
if(soundSetting){
 const vol=document.createElement('label');
 vol.className='fb-volume-control';
 vol.innerHTML='<span>🎵 Music volume <strong id="music-volume-label">75%</strong></span><input id="music-volume" type="range" min="0" max="100" value="75" step="1" aria-label="Music volume">';
 soundSetting.closest('.setting')?.after(vol);
 $('music-volume').addEventListener('input',e=>{
  const v=Number(e.target.value);
  $('music-volume-label').textContent=v+'%';
  if(master&&ctx)master.gain.setTargetAtTime(v/100*.48,ctx.currentTime,.02);
 });
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused){paused=true;$('pause').textContent='▶';last=0}});
})();
