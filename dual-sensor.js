/* FITBEAT V3: Phone-assisted webcam detection, opt-in only. */
(()=>{
const bar=document.querySelector('#game .controls');if(!bar)return;
const panel=document.createElement('div');panel.className='dual-panel';panel.innerHTML=`<div><b>📱 Dual Sensor (ทดลอง)</b> <span id="ds-state">Phone not connected</span></div><div class="dual-actions"><button id="ds-start" type="button">สร้างรหัสเชื่อมต่อ</button><label>Phone on <select id="ds-side"><option value="left">LEFT ARM</option><option value="right">RIGHT ARM</option></select></label><label><input id="ds-use" type="checkbox" checked> ใช้แรงเหวี่ยงช่วยยืนยันหมัด</label></div><div id="ds-code" class="dual-code"></div><small>เปิด controller.html บนโทรศัพท์ผ่าน HTTPS แล้วใส่รหัสนี้ · กล้องยังเป็นตัวตรวจท่าหลัก · ใช้โทรศัพท์หนึ่งเครื่องช่วยแขนข้างที่เลือก</small>`;
bar.after(panel);
const $=id=>document.getElementById(id);let peer=null,connection=null,latestPulse=0,lastSeq=-1,lastHit=0;let cameraPose={left:null,right:null};
function setStatus(t){$('ds-state').textContent=t}
$('ds-start').onclick=()=>{
 if(typeof Peer==='undefined'){setStatus('ไม่สามารถโหลด PeerJS — ต้องมีอินเทอร์เน็ต');return}
 if(peer){peer.destroy();peer=null;connection=null}
 const code='fb-'+Math.random().toString(36).slice(2,8)+'-'+Math.random().toString(36).slice(2,5);
 peer=new Peer(code,{debug:0});setStatus('Connecting to signaling server…');
 peer.on('open',id=>{setStatus('รอโทรศัพท์');$('ds-code').textContent='PAIR CODE: '+id+' · Phone URL: '+new URL('controller.html',location.href).href});
 peer.on('connection',conn=>{if(connection?.open)connection.close();connection=conn;conn.on('open',()=>{setStatus('✓ Phone connected');conn.send({type:'config',side:$('ds-side').value})});conn.on('data',handle);conn.on('close',()=>setStatus('Phone disconnected'));conn.on('error',()=>setStatus('Phone connection error'))});
 peer.on('error',e=>setStatus('Connection error: '+e.type));
};
$('ds-side').onchange=()=>{if(connection?.open)connection.send({type:'config',side:$('ds-side').value});latestPulse=0};
function handle(data){if(!data||data.type!=='motion')return;const now=performance.now();if(data.seq===lastSeq)return;lastSeq=data.seq;
 if(data.punch===true){latestPulse=now;setStatus('✓ Phone connected · punch detected')}
 else if(now-latestPulse>800)setStatus('✓ Phone connected · motion '+(Number(data.energy)||0).toFixed(1));
}
const original=window.fitbeatHit;
window.fitbeatHit=(side,pose)=>{
 const now=performance.now();cameraPose[side]={pose,time:now};
 const assisted=$('ds-use').checked&&connection?.open&&$('ds-side').value===side;
 if(assisted){
  // Require a fresh inertial impulse AND a camera-confirmed pose. Prevent held-pose scoring.
  if(now-latestPulse>420||latestPulse<=lastHit)return;
  lastHit=latestPulse;
 }
 original?.(side,pose);
};
})();