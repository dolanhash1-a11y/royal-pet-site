(()=>{
function clean(){document.querySelectorAll('#view-appointments .m-appt-card').forEach(card=>{card.querySelectorAll('.m-appt-grid > div').forEach(cell=>{const label=cell.querySelector('small')?.textContent?.trim();if(label==='Розмір'||label==='Стан шерсті')cell.remove()});card.dataset.search=card.dataset.search.replace(/\s*(undefined)?/g,' ').trim()})}
function init(){const root=document.getElementById('view-appointments');if(!root)return;clean();new MutationObserver(clean).observe(root,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
