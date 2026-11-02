(()=>{const root=document.querySelector('#game');const puppy=document.getElementById('dancer');const feedback=document.getElementById('feedback');if(!root||!puppy||!feedback)return;
const original=puppy.getAttribute('src');const map={PERFECT:'perfect',GOOD:'great',MISS:'miss',COMBO:'combo'};
let previous='';setInterval(()=>{if(!root.classList.contains('active'))return;const txt=feedback.textContent||'';if(txt===previous)return;previous=txt;let mood='ready';for(const k of Object.keys(map)){if(txt.toUpperCase().includes(k)){mood=map[k];break}}
puppy.src='assets/neon-original/puppy-'+mood+'.png';puppy.classList.add('neon-puppy');},140);
const result=document.querySelector('#results .puppy');if(result){result.src='assets/neon-original/puppy-win.png';result.classList.add('neon-puppy')}
const home=document.querySelector('#home .puppy');if(home){home.src='assets/neon-original/puppy-idle.png';home.classList.add('neon-puppy')}
})();