/*
  WiFire - Painel Único (frontend)
*/

/* ============================
   CONFIG - ajusta aqui
   ============================
*/
const STORAGE_KEYS = { users:'wf_users_v1', convs:'wf_convs_v1', settings:'wf_settings_v1', loggedIn:'wf_logged_in_v1' };
let socket = null;
let SOCKET_ENDPOINT = 'https://feelings-studying-bm-michigan.trycloudflare.com';
/* ============================ */

/* ---------- seed local ---------- */
function seedData() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    const users = [
      {id:1, nome:'João Silva', numero:'87999990001', plano:'mensal', status:'active', created:Date.now()-86400000*5},
      {id:2, nome:'Maria Souza', numero:'87999990002', plano:'anual', status:'active', created:Date.now()-86400000*12},
      {id:3, nome:'Carlos Lima', numero:'87999990003', plano:'gratuito', status:'inactive', created:Date.now()-86400000*2}
    ];
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }
  if (!localStorage.getItem(STORAGE_KEYS.convs)) {
    const convs = [
      {id:101,userId:1, last:'Quero renovar plano', unread:1, messages:[
        {from:'user', text:'Olá, quero renovar meu plano', time:Date.now()-60000},
        {from:'admin', text:'Posso ajudar. Qual o plano?', time:Date.now()-30000}
      ]},
      {id:102,userId:2, last:'Pedido de suporte', unread:0, messages:[
        {from:'user', text:'Não consigo conectar', time:Date.now()-3600000}
      ]}
    ];
    localStorage.setItem(STORAGE_KEYS.convs, JSON.stringify(convs));
  }
  const settings = readSettings();
  if (!settings.adminPass) {
    settings.adminPass = 'wifire2025';
    saveSettings(settings);
  }
}
seedData();

/* ---------- helpers ---------- */
function readUsers(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'); }
function saveUsers(u){ localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(u)); }
function readConvs(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.convs) || '[]'); }
function saveConvs(c){ localStorage.setItem(STORAGE_KEYS.convs, JSON.stringify(c)); }
function readSettings(){
  const s = localStorage.getItem(STORAGE_KEYS.settings);
  if (s === 'undefined' || s === null || s === '') return {};
  try { return JSON.parse(s); }
  catch(e) { return {}; }
}
function saveSettings(s){
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));
    alert('Configurações salvas.');
    console.log('Configurações salvas no localStorage.');
  } catch(e) {
    console.error('Erro ao salvar no localStorage:', e);
    alert('Erro ao salvar as configurações. Verifique o console.');
  }
}

/* ---------- Auth & init ---------- */
let currentAdmin = null;
function checkLogin() {
  const isLoggedIn = localStorage.getItem(STORAGE_KEYS.loggedIn) === 'true';
  if (isLoggedIn) {
    document.getElementById('adminPanel').style.display = 'flex';
    document.getElementById('userLanding').style.display = 'none';
    const settings = readSettings();
    if(settings.socketEndpoint) { 
      SOCKET_ENDPOINT = settings.socketEndpoint; 
      connectSocket(SOCKET_ENDPOINT); 
    }
    initPanel();
  } else {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('userLanding').style.display = 'flex';
  }
}
function login(){
  const pw = document.getElementById('adminInput').value.trim();
  const settings = readSettings();
  if (pw === (settings.adminPass || 'wifire2025')) {
    currentAdmin = {name:'Administrador'};
    document.getElementById('adminLoginModal').style.display = 'none';
    localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
    checkLogin();
  } else {
    const el = document.getElementById('loginError');
    el.style.display = 'block';
    el.textContent = 'Senha incorreta.';
  }
}
function demoAccess(){ 
  document.getElementById('adminLoginModal').style.display='none'; 
  localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
  checkLogin(); 
}
function logout(){ 
  currentAdmin = null; 
  localStorage.removeItem(STORAGE_KEYS.loggedIn);
  checkLogin();
}
function userLogin() {
  const userName = document.getElementById('userName').value.trim();
  const userPhone = document.getElementById('userPhone').value.trim();
  if (!userName || !userPhone) {
    alert('Por favor, preencha seu nome e telefone.');
    return;
  }
  // Lógica para enviar dados do usuário para o bot
  alert('Conectado! Aguarde a página de destino do WiFire Marketing.');
}
function showAdminLogin(){
  document.getElementById('userLanding').style.display = 'none';
  document.getElementById('adminLoginModal').style.display = 'flex';
}
function hideAdminLogin(){
  document.getElementById('userLanding').style.display = 'flex';
  document.getElementById('adminLoginModal').style.display = 'none';
}

/* ---------- Sidebar mobile toggle ---------- */
function toggleSidebar(){
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('open');
}

/* ---------- UI routing ---------- */
const menuBtns = document.querySelectorAll('#menuNav button');
menuBtns.forEach(btn=>btn.addEventListener('click', ()=> {
  menuBtns.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  showView(btn.dataset.view);
  // fechar sidebar no mobile ao navegar
  if(window.innerWidth <= 700) document.getElementById('sidebar').classList.remove('open');
}));
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.style.display='none');
  document.getElementById('view-'+name).style.display='block';
  if(name==='chat'){ renderConversations(); selectConversation(); }
}

/* ---------- Dashboard/chart ---------- */
let activityChart = null;
function initDashboard(){
  const labels = [], data=[];
  for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); labels.push(d.toLocaleDateString()); data.push(Math.floor(Math.random()*8)+readUsers().length); }
  const ctx = document.getElementById('chartActivity').getContext('2d');
  if(activityChart) activityChart.destroy();
  activityChart = new Chart(ctx, {
    type:'line',
    data:{labels, datasets:[{label:'Atividade diária', data, fill:true, tension:0.3, backgroundColor:'rgba(255,107,107,0.12)', borderColor:'#ff6b6b'}]},
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}
  });
  updateStats();
}
function updateStats(){
  const users = readUsers();
  const convs = readConvs();
  document.getElementById('statActive').textContent = users.filter(u=>u.status==='active').length;
  document.getElementById('statSubs').textContent = users.filter(u=>u.plano!=='gratuito' && u.status==='active').length;
  document.getElementById('statMsgs').textContent = convs.reduce((s,c)=>s+c.messages.filter(m=> (Date.now()-m.time) < 86400000).length,0);
  document.getElementById('statNew').textContent = users.filter(u=> (Date.now()-u.created) < 7*86400000).length;
  document.getElementById('totalUsers').textContent = users.length;
  const planSummary = users.reduce((acc,u)=>{ acc[u.plano]=(acc[u.plano]||0)+1; return acc; },{});
  document.getElementById('planSummary').textContent = Object.entries(planSummary).map(e=>e.join(':')).join(' • ');
}

/* ---------- Users UI ---------- */
function renderUsersTable(){
  const tbody = document.querySelector('#usersTable tbody'); tbody.innerHTML='';
  const users = readUsers();
  users.forEach(u=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:#fff">${u.nome}</td>
      <td>${u.numero}</td>
      <td class="small">${u.plano}</td>
      <td>${u.status === 'active' ? '<span class="badge active">Ativo</span>' : '<span class="badge inactive">Inativo</span>'}</td>
      <td>
        <button class="action-btn" onclick="toggleStatus(${u.id})">${u.status==='active'?'Suspender':'Ativar'}</button>
        <button class="action-btn" onclick="openEditUser(${u.id})">Editar</button>
        <button class="action-btn" onclick="deleteUser(${u.id})">Remover</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* ---------- Subscriptions ---------- */
function renderSubscriptions(){
  const dest = document.getElementById('subsList'); dest.innerHTML='';
  const users = readUsers().filter(u=>u.plano!=='gratuito');
  if(!users.length){ dest.innerHTML='<div class="small">Nenhuma assinatura premium ativa.</div>'; return; }
  users.forEach(u=>{
    const el = document.createElement('div'); el.style.display='flex'; el.style.justifyContent='space-between'; el.style.alignItems='center'; el.style.padding='10px 0'; el.style.borderBottom='1px solid rgba(255,255,255,0.02)';
    el.innerHTML = `<div><strong>${u.nome}</strong><div class="small">${u.plano} • ${u.numero}</div></div>
      <div style="display:flex; gap:8px">
        <button class="action-btn" onclick="suspendPlan(${u.id})">Suspender</button>
        <button class="btn" onclick="renewPlan(${u.id})">Renovar</button>
      </div>`;
    dest.appendChild(el);
  });
}

/* ---------- User actions ---------- */
function toggleStatus(id){ const users=readUsers(), u=users.find(x=>x.id===id); if(!u) return; u.status = u.status==='active' ? 'inactive' : 'active'; saveUsers(users); renderUsersTable(); renderSubscriptions(); updateStats(); }
function deleteUser(id){ if(!confirm('Remover usuário?')) return; let users = readUsers(); users = users.filter(u=>u.id!==id); saveUsers(users); renderUsersTable(); renderSubscriptions(); updateStats(); }
function openEditUser(id){ const u = readUsers().find(x=>x.id===id); if(!u) return alert('Usuário não encontrado'); document.getElementById('nuName').value = u.nome; document.getElementById('nuNumber').value = u.numero; document.getElementById('nuPlan').value = u.plano; document.getElementById('nuStatus').value = u.status; document.getElementById('newUserModal').style.display='flex'; document.querySelector('#newUserModal .btn').onclick = function(){ saveEditUser(id) }; }
function saveEditUser(id){ const name=document.getElementById('nuName').value.trim(), number=document.getElementById('nuNumber').value.trim(), plan=document.getElementById('nuPlan').value, status=document.getElementById('nuStatus').value; if(!name||!number) return alert('Preencha nome e número'); const users=readUsers(); const idx=users.findIndex(x=>x.id===id); if(idx>=0){ users[idx].nome=name; users[idx].numero=number; users[idx].plano=plan; users[idx].status=status; saveUsers(users); } closeNewUser(); renderUsersTable(); renderSubscriptions(); updateStats(); }
function createUser(){ const name=document.getElementById('nuName').value.trim(), number=document.getElementById('nuNumber').value.trim(), plan=document.getElementById('nuPlan').value, status=document.getElementById('nuStatus').value; if(!name||!number) return alert('Preencha nome e número'); const users=readUsers(); const id=Date.now(); users.push({id, nome:name, numero:number, plano:plan, status:status, created:Date.now()}); saveUsers(users); closeNewUser(); renderUsersTable(); renderSubscriptions(); updateStats(); }
function openNewUser(){ document.getElementById('nuName').value=''; document.getElementById('nuNumber').value=''; document.getElementById('nuPlan').value='mensal'; document.getElementById('nuStatus').value='active'; document.getElementById('newUserModal').style.display='flex'; document.querySelector('#newUserModal .btn').onclick = createUser; }
function closeNewUser(){ document.getElementById('newUserModal').style.display='none'; }
function suspendPlan(id){ if(!confirm('Suspender assinatura desse usuário?')) return; const users=readUsers(), u=users.find(x=>x.id===id); if(!u) return; u.status='inactive'; saveUsers(users); renderUsersTable(); renderSubscriptions(); updateStats(); }
function renewPlan(id){ alert('Assinatura renovada (simulado).'); const users=readUsers(), u=users.find(x=>x.id===id); if(u){ u.created=Date.now(); saveUsers(users); updateStats(); } }

/* ---------- Chat (localStorage + Socket.IO) ---------- */
let selectedConv = null;
function renderConversations(){ const list=document.getElementById('conversationsList'); list.innerHTML=''; const convs=readConvs(); convs.forEach(c=>{ const user=readUsers().find(u=>u.id===c.userId) || {nome:'Desconhecido', numero:'---'}; const el=document.createElement('div'); el.className='conv-item'; el.innerHTML = `<div class="avatar">${(user.nome||'U').charAt(0)}</div><div class="conv-meta"><strong style="color:#fff">${user.nome}</strong><div class="small">${c.last}</div></div><div class="small">${c.unread>0?'<span style="background:#ff6b6b;padding:4px 6px;border-radius:6px;color:#fff">'+c.unread+'</span>':''}</div>`; el.onclick = ()=>selectConversation(c.id); list.appendChild(el); }); updateNotificationBadge(); }
function selectConversation(id){ const convs=readConvs(); const conv = id ? convs.find(c=>c.id===id) : convs[0]; selectedConv = conv || null; document.getElementById('messagesArea').innerHTML=''; if(!conv){ document.getElementById('chatTitle').textContent='Selecione uma conversa'; return; } const user=readUsers().find(u=>u.id===conv.userId) || {nome:'Desconhecido'}; document.getElementById('chatTitle').textContent=`${user.nome} • ${user.numero}`; conv.unread=0; saveConvs(convs); renderConversations(); conv.messages.forEach(m=>{ const el=document.createElement('div'); el.className='msg ' + (m.from==='admin' ? 'user' : 'other'); el.innerHTML = `<div>${m.text}</div><div class="small" style="opacity:0.6;margin-top:6px">${new Date(m.time).toLocaleString()}</div>`; document.getElementById('messagesArea').appendChild(el); }); setTimeout(()=>{ const ma=document.getElementById('messagesArea'); ma.scrollTop=ma.scrollHeight; },50); }
function sendMessage(){ const text=document.getElementById('chatInput').value.trim(); if(!text || !selectedConv) return; if(socket && socket.connected){ socket.emit('admin:message', { convId: selectedConv.id, text }); } else { const convs=readConvs(); const conv = convs.find(c=>c.id===selectedConv.id); conv.messages.push({from:'admin', text, time:Date.now()}); conv.last=text; saveConvs(convs); selectConversation(conv.id); setTimeout(()=>simulateUserReply(conv.userId,'Recebido pelo bot (demo).'),1000); } document.getElementById('chatInput').value=''; updateStats(); }
function simulateUserReply(userId, text){ const convs=readConvs(); const conv = convs.find(c=>c.userId===userId); if(!conv){ const newc = {id:Date.now(), userId, last:text, unread:1, messages:[{from:'user', text, time:Date.now()}]}; convs.unshift(newc); } else { conv.messages.push({from:'user', text, time:Date.now()}); conv.last=text; conv.unread = (conv.unread||0)+1; } saveConvs(convs); renderConversations(); notify('Nova mensagem', text); }

/* ---------- Notifications ---------- */
function updateNotificationBadge(){ const convs = readConvs(); const totalUnread = convs.reduce((s,c)=>s+(c.unread||0),0); const badge = document.getElementById('notiBadge'); if(totalUnread>0){ badge.style.display='inline-block'; badge.textContent=totalUnread; } else badge.style.display='none'; }
function notify(title, body){ if(!("Notification" in window)) return; if(Notification.permission === "granted"){ new Notification(title,{body}); } else if(Notification.permission !== "denied"){ Notification.requestPermission().then(p=>{ if(p==='granted') new Notification(title,{body}); }); } }

/* ---------- Socket.IO integration ---------- */
function saveSettings(){
  try {
    const s = readSettings();
    const newPass=document.getElementById('adminPasswordInput').value.trim();
    const socketUrl=document.getElementById('socketEndpoint').value.trim();
    if(newPass) s.adminPass=newPass;
    s.socketEndpoint=socketUrl;
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));
    alert('Configurações salvas.');
    console.log('Configurações salvas no localStorage.');
  } catch(e) {
    console.error('Erro ao salvar no localStorage:', e);
    alert('Erro ao salvar as configurações. Verifique o console.');
  }
  if(socketUrl) {
    SOCKET_ENDPOINT = socketUrl;
    tryConnectSocket();
  }
}
function tryConnectSocket(){ const s = readSettings(); const endpoint = document.getElementById('socketEndpoint').value.trim() || s.socketEndpoint || ''; if(!endpoint) return alert('Defina o endpoint do socket nas configurações.'); SOCKET_ENDPOINT = endpoint; connectSocket(SOCKET_ENDPOINT); }

function connectSocket(url){
  if(socket && socket.connected) socket.disconnect();
  try {
    socket = io(url, { transports:['websocket'], reconnectionAttempts:5 });
    socket.on('connect', ()=>{ console.log('Socket conectado'); notify('Backend Conectado','Conexão ao WiFire-bot estabelecida.'); initAfterSocket(); });
    socket.on('disconnect', ()=>{ console.log('Socket desconectado'); notify('Backend','Conexão perdida.'); });
    socket.on('users:update', (users)=>{ saveUsers(users); renderUsersTable(); renderSubscriptions(); updateStats(); });
    socket.on('convs:update', (convs)=>{ saveConvs(convs); renderConversations(); updateStats(); });
    socket.on('message:new', (payload)=>{ // payload: { convId, from, text, time }
      const convs = readConvs(); const conv = convs.find(c=>c.id===payload.convId);
      if(conv){ conv.messages.push({ from: payload.from, text: payload.text, time: payload.time || Date.now() }); conv.last = payload.text; conv.unread = (conv.unread||0) + (payload.from === 'user' ? 1 : 0); saveConvs(convs); renderConversations(); if(selectedConv && selectedConv.id === conv.id) selectConversation(conv.id); notify('Nova Mensagem', payload.text); }
      else { socket.emit('convs:fetch'); }
    });
    socket.on('admin:message:ack', (ack)=>{ /* opcional */ });
  } catch(e){ console.error('Erro ao conectar Socket:', e); alert('Erro ao conectar ao socket. Verifique endpoint.'); }
}

function initAfterSocket(){
  // se quiser, pedir sync inicial
  if(socket && socket.connected) socket.emit('sync:request');
}

/* ---------- Sync / API helpers ---------- */
function syncWithBackend(){
  const s = readSettings();
  if(!s.socketEndpoint) return alert('Defina o endpoint do socket nas configurações (Settings).');
  if(socket && socket.connected){
    socket.emit('sync:request');
    alert('Solicitado sync via socket. Aguarde atualização.');
  } else {
    alert('Socket não conectado. Conecte e tente novamente.');
  }
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const isLoggedIn = localStorage.getItem(STORAGE_KEYS.loggedIn) === 'true';
  if (isLoggedIn) {
    document.getElementById('adminPanel').style.display = 'flex';
    document.getElementById('userLanding').style.display = 'none';
    const settings = readSettings();
    if(settings.socketEndpoint) { 
      SOCKET_ENDPOINT = settings.socketEndpoint; 
      connectSocket(SOCKET_ENDPOINT); 
    }
  } else {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('userLanding').style.display = 'flex';
  }
  
  initPanel();
  document.getElementById('searchInput').addEventListener('input', (e)=>filterUsers(e.target.value));
  const s = readSettings(); 
  if(s.socketEndpoint) document.getElementById('socketEndpoint').value = s.socketEndpoint; 
  if(s.adminPass) document.getElementById('adminPasswordInput').value = s.adminPass;
  if(s.socketEndpoint) { 
    SOCKET_ENDPOINT = s.socketEndpoint; 
    connectSocket(SOCKET_ENDPOINT); 
  }
});
function initPanel(){
  renderUsersTable(); renderSubscriptions(); renderConversations(); initDashboard();
}
function filterUsers(q){ q = q.trim().toLowerCase(); document.querySelectorAll('#usersTable tbody tr').forEach(r=>{ const txt = r.textContent.toLowerCase(); r.style.display = txt.includes(q) ? '' : 'none'; }); }

/* ---------- Utilities ---------- */
// document.addEventListener('DOMContentLoaded', ()=>{ /* nothing auto */ });

/* ---------- localStorage wrappers ---------- */
function readUsers(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'); }
function saveUsers(u){ localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(u)); }
function readConvs(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.convs) || '[]'); }
function saveConvs(c){ localStorage.setItem(STORAGE_KEYS.convs, JSON.stringify(c)); }
function readSettings(){
  const s = localStorage.getItem(STORAGE_KEYS.settings);
  if (s === 'undefined' || s === null || s === '') return {};
  try { return JSON.parse(s); }
  catch(e) { return {}; }
}
function saveSettings(s){ localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s)); }

/* END */
</script>
</body>
</html>
