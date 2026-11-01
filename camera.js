const $=id=>document.getElementById(id),video=$('camera-video'),btn=$('camera-toggle'),status=$('camera-status');
let tracker=null,stream=null,running=false,lastVideo=-1,lastFrame=0;
const histories={left:[],right:[]},stables={left:{key:'none',n:0,lastHit:'none',lastAt:0},right:{key:'none',n:0,lastHit:'none',lastAt:0}};
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function angle(a,b,c){const ux=a.x-b.x,uy=a.y-b.y,vx=c.x-b.x,vy=c.y-b.y;return Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/(Math.hypot(ux,uy)*Math.hypot(vx,vy)+1e-9))))*180/Math.PI}
function detect(lm,side,now,world){
 const ids=side==='left'?[11,13,15,23]:[12,14,16,24];
 const [shoulder,elbow,wrist,hip]=ids.map(i=>lm[i]);
 const visibility=Math.min(shoulder.visibility??1,elbow.visibility??1,wrist.visibility??1);
 if(visibility<.35)return ['none',0];
 const torso=Math.max(.06,dist(shoulder,hip)),arm=dist(shoulder,wrist);
 const straight=angle(shoulder,elbow,wrist)>140;
 const dy=(wrist.y-shoulder.y)/torso,dx=Math.abs(wrist.x-shoulder.x)/torso;
 const h=histories[side];h.push({x:wrist.x,y:wrist.y,t:now});
 while(h.length&&(now-h[0].t>1500))h.shift();
 let turns=0;
 if(h.length>8){const cx=h.reduce((a,p)=>a+p.x,0)/h.length,cy=h.reduce((a,p)=>a+p.y,0)/h.length;
 let travel=0;for(let i=1;i<h.length;i++){const a=Math.atan2(h[i-1].y-cy,h[i-1].x-cx),b=Math.atan2(h[i].y-cy,h[i].x-cx);let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d< -Math.PI)d+=2*Math.PI;travel+=d}
 const radius=h.reduce((a,p)=>a+Math.hypot(p.x-cx,p.y-cy),0)/h.length;
 turns=(Math.abs(travel)>Math.PI*1.55&&radius>torso*.2&&radius<torso*1.8)?Math.abs(travel):0}
 if(turns)return ['circlemove',visibility];
 // Recognize relaxed arms-down first: wrists at or below the hip / well below shoulder.
 // A neutral, held-down arm should remain recognized without requiring movement.
 if(dy>.52 && wrist.y>=elbow.y-.06 && dx<.95)return ['down',visibility];
 // MediaPipe world coordinates provide relative depth in meters. The torso vector
 // establishes a body-local vertical, reducing sensitivity to camera tilt.
 if(world?.length>=25){
  const [S,E,W,H]=ids.map(i=>world[i]);
  const vec=(a,b)=>[b.x-a.x,b.y-a.y,b.z-a.z];
  const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
  const norm=a=>Math.hypot(...a);
  const unit=a=>a.map(x=>x/(norm(a)||1));
  const vertical=unit(vec(H,S)); // hip -> shoulder, body-up axis
  const arm3=vec(S,W),len=norm(arm3);
  const elevation=Math.asin(Math.max(-1,Math.min(1,dot(unit(arm3),vertical))))*180/Math.PI;
  const shoulderWidth=norm(vec(world[11],world[12]));
  const across=unit(vec(world[11],world[12]));
  const lateral=Math.abs(dot(unit(arm3),across));
  const depth=Math.abs(arm3[2])/(len||1);
  const elbow3=vec(S,E),forearm3=vec(E,W);
  const elbowStraight=dot(unit(elbow3),unit(forearm3))>.72;
  // A forward reach points away from the torso, approximately horizontal,
  // with depth dominance rather than the lateral direction of a side raise.
  if(elbowStraight&&len>Math.max(.12,shoulderWidth*.7)&&elevation>-28&&elevation<40&&depth>.48&&depth>lateral*.95)
    return ['forward',visibility*.9];
  if(elevation>40&&len>.18)return ['up',visibility];
  if(elbowStraight&&elevation>-30&&elevation<32&&lateral>.58&&lateral>depth*.9)return ['side',visibility];
  if(elevation< -25 || dy>.48)return ['down',visibility];
 }
 // 2D fallback for partial world tracking; deliberately conservative.
 if(dy<-.6&&arm>torso*.65)return ['up',visibility];
 if(straight&&dx>.65&&Math.abs(dy)<.5)return ['side',visibility];
 if(dy>.43&&dx<.95)return ['down',visibility];
 return ['none',visibility*.5]
}

async function frame(){if(!running)return;requestAnimationFrame(frame);if(!tracker||video.readyState<2||video.currentTime===lastVideo||performance.now()-lastFrame<33)return;
 lastVideo=video.currentTime;lastFrame=performance.now();try{
 const r=tracker.detectForVideo(video,lastFrame),lm=r.landmarks?.[0],world=r.worldLandmarks?.[0];if(!lm){status.textContent='ไม่พบผู้เล่น';return}
 const labels=[];for(const side of ['left','right']){const [key]=detect(lm,side,lastFrame,world),s=stables[side];if(s.key===key)s.n=Math.min(s.n+1,5);else{s.key=key;s.n=1}if(key==='none'){s.lastHit='none';labels.push(side[0].toUpperCase()+':—')}else if(s.n>=2){if(key!==s.lastHit||lastFrame-s.lastAt>480){window.fitbeatHit?.(side,key);s.lastHit=key;s.lastAt=lastFrame}labels.push(side[0].toUpperCase()+':'+key)}else labels.push(side[0].toUpperCase()+':—')}
 status.textContent='Tracking · '+labels.join(' ');
 }catch(e){status.textContent='Tracking: '+e.message}}
btn.addEventListener('click',async()=>{
 if(running){running=false;stream?.getTracks().forEach(t=>t.stop());tracker?.close();tracker=null;video.srcObject=null;video.hidden=true;btn.textContent='📷 เปิดกล้อง';status.textContent='Camera off';return}
 btn.disabled=true;status.textContent='กำลังโหลด MediaPipe…';try{
 const {FilesetResolver,PoseLandmarker}=await import('./vision_bundle.mjs');
 const vision=await FilesetResolver.forVisionTasks('https://nekokan0307-svg.github.io/damo002/wasm');
 const opts={baseOptions:{modelAssetPath:new URL('./pose_landmarker_lite.task',import.meta.url).href,delegate:'GPU'},runningMode:'VIDEO',numPoses:1};
 tracker=await PoseLandmarker.createFromOptions(vision,opts).catch(()=>PoseLandmarker.createFromOptions(vision,{...opts,baseOptions:{...opts.baseOptions,delegate:'CPU'}}));
 stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});video.srcObject=stream;await video.play();video.hidden=false;running=true;lastVideo=-1;btn.textContent='■ ปิดกล้อง';frame();
 }catch(e){status.textContent='Camera error: '+e.message;stream?.getTracks().forEach(t=>t.stop());tracker?.close();tracker=null}finally{btn.disabled=false}
});
