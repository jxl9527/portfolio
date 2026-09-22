(() => {
 const grid=document.querySelector('.works-grid'); if(!grid)return;
 const items=[...grid.querySelectorAll('.work-item')];
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  items.forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.category!==button.dataset.filter;});
  const visible=items.filter(item=>!item.hidden);
  document.querySelector('.index-status').textContent=`${String(visible.length).padStart(2,'0')} 个作品 / ${button.textContent}`;
 }));
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  grid.classList.toggle('list-view',button.dataset.view==='list');
 }));
})();
