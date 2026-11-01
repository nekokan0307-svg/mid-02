(()=>{
const $=id=>document.getElementById(id);let peer=null,conn=null,enabled=false,base=0,filtered=0,lastPulse=0,seq=0,count=0,side='left',lastSend=0;
function status(s){$('status').textContent=s}
$('connect').onclick=()=>{
 const code=$('pair').value.trim();if(!/^fb-[a-z0-9]{6}-[a-z0-9]{3}$/.test(code)){status('กรอกรหัสจากหน้าจอเกม');return}
 if(typeof Peer==='undefined'){status('PeerJS load failed; check internet');return}
 if(peer)peer.destroy();peer=new Peer();status('Connecting…');peer.on('open',()=>{conn=peer.connect(code,{reliable:false});conn.on('open',()=>{status('✓ เชื่อมต่อแล้ว');$('net').textContent='Online'});conn.on('data',d=>{if(d?.type==='config'){side=d.side;$('side').textContent=side.toUpperCase()}});conn.on('close',()=>{status('Connection closed');$('net').textContent='Offline'});conn.on('error',()=>status('Connection error'))});peer.on('error',e=>status('Peer error: '+e.type));
};
function onMotion(e){const a=e.acceleration||e.accelerationIncludingGravity;if(!a)return;let energy=Math.hypot(a.x||0,a.y||0,a.z||0);
 // Use gravity-removed acceleration when available; high-pass filter otherwise.
 if(!e.acceleration){base=base*.94+energy*.06;energy=Math.abs(energy-base)}
 filtered=.38*filtered+.62*energy;const now=performance.now();const punch=filtered>1.9&&now-lastPulse>230;
 if(punch){lastPulse=now;count++;$('count').textContent=String(count)}
 $('motion').textContent=filtered.toFixed(1)+' m/s²';
 if(conn?.open&&(now-lastSend>45||punch)){lastSend=now;conn.send({type:'motion',seq:++seq,energy:filtered,punch,side})}
}
$('enable').onclick=async()=>{try{
 if(!window.isSecureContext)throw Error('ต้องเปิดผ่าน HTTPS หรือ localhost');
 if(typeof DeviceMotionEvent==='undefined')throw Error('โทรศัพท์นี้ไม่รองรับ Motion sensor');
 if(typeof DeviceMotionEvent.requestPermission==='function'){const r=await DeviceMotionEvent.requestPermission();if(r!=='granted')throw Error('Motion permission denied')}
 if(!enabled){window.addEventListener('devicemotion',onMotion);enabled=true}status('✓ Motion enabled; move phone to test');
 }catch(e){status('⚠ '+e.message)}};
$('calibrate').onclick=()=>{filtered=0;base=0;lastPulse=performance.now();status('Motion baseline reset')};
})();