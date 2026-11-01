/* FITBEAT V4 — Sensor setup lives outside gameplay.
   Moves existing controls; does not replace MediaPipe or PeerJS logic. */
(()=>{
 const main=document.querySelector('main.shell');
 const controls=document.getElementById('sensor-controls');
 const dual=document.querySelector('.dual-panel');
 if(!main||!controls)return;
 const page=document.createElement('section');
 page.id='sensor-setup';page.className='screen';
 page.innerHTML=`<div class="sensor-setup-shell">
 <h2>📷 Camera & Phone Connection</h2>
 <p>ตั้งค่าเซนเซอร์ก่อนเล่นเกม · ตั้งค่าได้โดยไม่ต้องเริ่มด่าน</p>
 <div id="sensor-devices" class="sensor-devices"></div>
 <div class="sensor-preview-actions"><label><input type="checkbox" id="sensor-preview-toggle"> แสดงภาพกล้องตัวอย่างขณะตั้งค่า</label></div>
 <div class="sensor-setup-footer"><button type="button" id="sensor-setup-levels">🌸 เลือกระดับและเล่นเกม</button><button type="button" id="sensor-setup-home" class="secondary">← Home</button></div>
 <p class="sensor-note">ขณะเล่นเกม ระบบกล้องยังตรวจจับท่าอยู่ แต่จะซ่อนภาพวิดีโอเพื่อไม่ให้รบกวนโน้ต</p></div>`;
 main.append(page);
 const deviceArea=page.querySelector('#sensor-devices');
 deviceArea.append(controls);
 if(dual)deviceArea.append(dual);
 const video=document.getElementById('camera-video');
 const preview=document.createElement('div');preview.className='sensor-camera-preview';preview.id='sensor-camera-preview';
 controls.append(preview);
 if(video)preview.append(video);
 const toggle=document.getElementById('sensor-preview-toggle');
 function syncPreview(){if(originalScreens.some(el=>el!==page && el.classList.contains('active')))page.classList.remove('active');preview.classList.toggle('enabled',toggle.checked && page.classList.contains('active'))}
 toggle.addEventListener('change',syncPreview);
 const originalScreens=[...document.querySelectorAll('.screen')];
 function showSetup(){originalScreens.forEach(x=>x.classList.toggle('active',x===page));syncPreview();window.scrollTo?.(0,0)}
 document.querySelectorAll('[data-screen="sensor-setup"]').forEach(btn=>btn.addEventListener('click',showSetup));
 document.getElementById('open-sensor-setup')?.addEventListener('click',showSetup);
 // Existing game.js owns navigation; call the same screen buttons rather than duplicating its state.
 function navigate(id){const nav=document.querySelector('[data-screen="'+id+'"]');
  if(nav&&nav!==page){nav.click();return}
  const target=document.getElementById(id);if(target){originalScreens.forEach(x=>x.classList.toggle('active',x===target));syncPreview()}}
 document.getElementById('sensor-setup-levels').addEventListener('click',()=>navigate('levels'));
 document.getElementById('sensor-setup-home').addEventListener('click',()=>navigate('home'));
 // Observe game.js screen changes to always hide the preview outside setup.
 const observer=new MutationObserver(syncPreview);
 originalScreens.forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['class']}));
 syncPreview();
})();
