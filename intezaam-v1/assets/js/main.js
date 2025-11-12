
// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if(el){ el.scrollIntoView({behavior:'smooth'}); }
  });
});

// Countdown
const targetDate = new Date('2025-12-25T20:00:00'); 
const dDOM = document.querySelector('[data-cd-days]');
const hDOM = document.querySelector('[data-cd-hours]');
const mDOM = document.querySelector('[data-cd-mins]');
const sDOM = document.querySelector('[data-cd-secs]');
function tick(){
  const now = new Date();
  const diff = Math.max(0, targetDate - now);
  const s = Math.floor(diff/1000)%60;
  const m = Math.floor(diff/1000/60)%60;
  const h = Math.floor(diff/1000/60/60)%24;
  const d = Math.floor(diff/1000/60/60/24);
  dDOM && (dDOM.textContent = d);
  hDOM && (hDOM.textContent = h);
  mDOM && (mDOM.textContent = m);
  sDOM && (sDOM.textContent = s);
  requestAnimationFrame(()=>setTimeout(tick, 500));
}
tick();

// Gallery Lightbox
const dlg = document.getElementById('lightbox');
const dlgImg = document.getElementById('lightbox-img');
document.querySelectorAll('.gallery img').forEach(img=>{
  img.addEventListener('click',()=>{
    dlgImg.src = img.src;
    if(typeof dlg.showModal === 'function'){ dlg.showModal(); }
    else { dlg.setAttribute('open',''); }
  });
});
document.getElementById('lightbox-close').addEventListener('click',()=>{
  if(typeof dlg.close === 'function'){ dlg.close(); }
  else { dlg.removeAttribute('open'); }
});
