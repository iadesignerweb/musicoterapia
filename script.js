/*
  WiFire - Lógica do Frontend
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
  const isAdminPage = window.location.pathname.split('/').pop() === 'admin.html';

  if (isAdminPage) {
    if (isLoggedIn) {
      document.getElementById('adminPanel').style.display = 'flex';
      const settings = readSettings();
      if(settings.socketEndpoint) { 
        SOCKET_ENDPOINT = settings.socketEndpoint; 
        connectSocket(SOCKET_ENDPOINT); 
      }
      initPanel();
    } else {
      document.getElementById('adminLoginModal').style.display = 'flex';
    }
  }
}
function login(){
  const pw = document.getElementById('adminInput').value.trim();
  const settings = readSettings();
  if (pw === (settings.adminPass || 'wifire2025')) {
    currentAdmin = {name:'Administrador'};
    localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
    window.location.href = 'admin.html';
  } else {
    const el = document.getElementById('loginError');
    el.style.display = 'block';
    el.textContent = 'Senha incorreta.';
  }
}
function demoAccess(){ 
  localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
  window.location.href = 'admin.html'; 
}
function logout(){
  localStorage.removeItem(STORAGE_KEYS.loggedIn);
  window.location.href = 'index.html';
}
function requestUserAccess(){
  const name = document.getElementById('userName').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  if (!name || !phone) {
    document.getElementById('userMessage').textContent = 'Por favor, preencha seu nome e WhatsApp.';
    return;
  }
  // Lógica para enviar dados do usuário para o bot
  alert('Conectado! Aguarde a página de destino do WiFire Marketing.');
}

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
});
