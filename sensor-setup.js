/* FITBEAT V4.1 — stable setup navigation; no MutationObserver loop. */
(()=>{
 'use strict';
 const main=document.querySelector('main.shell');
 const controls=document.getElementById('sensor-controls');
 if(!main||!controls)return;
 const page=document.createElement('section');
 page.id='sensor-setup';
 page.className='screen';
 page.innerHTML=`<div class="sensor-setup-shell">
 <h2>📷 Camera & Phone Connection</h2>
 <p>ตั้งค่าเซนเซอร์ก่อนเริ่มเล่นเกม</p>
 <div id="sensor-devices" class="sensor-devices"></div>
 <div class="sensor-preview-actions"><label><input type="checkbox" id="sensor-preview-toggle"> แสดงภาพกล้องตัวอย่างขณะตั้งค่า</label></div>
 <div class="sensor-setup-footer"><button type="button" id="sensor-setup-levels">🌸 เลือกระดับและเล่นเกม</button><button type="button" id="sensor-setup-home" class="secondary">← Home</button></div>
 <p class="sensor-note">กล้องยังตรวจจับท่าระหว่างเล่น แต่ซ่อนภาพวิดีโอ</p></div>`;
 main.append(page);
 const devices=page.querySelector('#sensor-devices');
 devices.append(controls);
 const dual=document.querySelector('.dual-panel');
 if(dual)devices.append(dual);
 const video=document.getElementById('camera-video');
 const preview=document.createElement('div');
 preview.id='sensor-camera-preview';preview.className='sensor-camera-preview';
 controls.append(preview);
 if(video)preview.append(video);
 const checkbox=document.getElementById('sensor-preview-toggle');
 const updatePreview=()=>preview.classList.toggle('enabled',checkbox.checked&&page.classList.contains('active'));
 checkbox.addEventListener('change',updatePreview);
 function openSetup(){
   document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
   page.classList.add('active');updatePreview();
 }
 // game.js has already registered its menu handler; run after it to activate this late-added screen.
 document.querySelectorAll('[data-screen="sensor-setup"]').forEach(b=>b.addEventListener('click',openSetup));
 document.getElementById('open-sensor-setup')?.addEventListener('click',openSetup);
 function goTo(id){
   // Existing game.js navigation handles game lifecycle, music and animation.
   const b=[...document.querySelectorAll('[data-screen]')].find(el=>el.dataset.screen===id&&el.id!=='open-sensor-setup');
   if(b){b.click();page.classList.remove('active');updatePreview();return;}
   document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));updatePreview();
 }
 document.getElementById('sensor-setup-levels').addEventListener('click',()=>goTo('levels'));
 document.getElementById('sensor-setup-home').addEventListener('click',()=>goTo('home'));
})();
