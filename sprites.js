/* FITBEAT still-only mascot, v3 */
(()=>{
 const names=['idle','good','great','perfect','sad','miss','tired','encourage'];
 const imgs={};for(const n of names){const i=new Image();i.src='assets/reactions/'+n+'.png';imgs[n]=i.src}
 const dancer=document.getElementById('dancer');
 const all=[...document.querySelectorAll('img.puppy')];
 let current='idle',until=0;
 function set(el,n){if(!el)return;const url=imgs[n]||imgs.idle;if(el.getAttribute('src')!==url)el.src=url;el.dataset.reaction=n;}
 all.forEach(el=>set(el,el===dancer?'idle':'good'));
 function reaction(n){current=n;until=Date.now()+1150;set(dancer,n)}
 const fb=document.getElementById('feedback');
 if(fb)new MutationObserver(()=>{const s=fb.textContent.toLowerCase();if(s.includes('perfect'))reaction('perfect');else if(s.includes('good'))reaction('good');else if(s.includes('miss'))reaction('sad');else if(s.includes('early')||s.includes('keep'))reaction('encourage')}).observe(fb,{childList:true,subtree:true,characterData:true});
 // Game's animate() changes class names. Never animate the image; leave its src alone.
 if(dancer)new MutationObserver(()=>{if(dancer.className!=='puppy still-puppy')dancer.className='puppy still-puppy'}).observe(dancer,{attributes:true,attributeFilter:['class']});
 setInterval(()=>{if(dancer&&Date.now()>until&&current!=='idle'){current='idle';set(dancer,'idle')}},200);
 const result=document.querySelector('#results img.puppy');
 const results=document.getElementById('results');
 if(results&&result)new MutationObserver(()=>{if(!results.classList.contains('active'))return;const p=Number(document.getElementById('perfect')?.textContent||0),g=Number(document.getElementById('good')?.textContent||0),m=Number(document.getElementById('miss')?.textContent||0);set(result,p+g+m===0?'encourage':p>=m?'perfect':'sad')}).observe(results,{attributes:true,attributeFilter:['class']});
})();
