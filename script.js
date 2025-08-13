/*
  WiFire - Lógica do Frontend
*/

const STORAGE_KEYS = { users:'wf_users_v1', convs:'wf_convs_v1', settings:'wf_settings_v1', loggedIn:'wf_logged_in_v1' };
let socket = null;
let SOCKET_ENDPOINT = 'https://similar-webcams-ages-frame.trycloudflare.com';

/* ---------- Funções de Helper ---------- */
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
function initPanel(){
  // Funções de renderização do painel
}
function updateStats(){
  // Lógica para atualizar estatísticas
}
function renderUsersTable(){
  // Lógica para renderizar a tabela de usuários
}
function renderConversations(){
  // Lógica para renderizar conversas
}
function showView(name){
  // Lógica para mostrar as diferentes seções do painel
}

/* ---------- Lógica de Autenticação e Navegação ---------- */
function toggleSidebar(){
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('collapsed');
}
function showAdminLogin(){
  window.location.href = 'admin.html';
}
function login(){
  const pw = document.getElementById('adminInput').value.trim();
  const settings = readSettings();
  if (pw === (settings.adminPass || 'wifire2025')) {
    localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
    window.location.href = 'admin.html';
  } else {
    const el = document.getElementById('loginError');
    el.style.display = 'block';
    el.textContent = 'Senha incorreta.';
  }
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
    // Lógica para carregar o painel ou a página inicial
    const page = window.location.pathname.split('/').pop();
    if (page === 'admin.html') {
        if (localStorage.getItem(STORAGE_KEYS.loggedIn) === 'true') {
            document.getElementById('adminPanel').style.display = 'flex';
            const settings = readSettings();
            SOCKET_ENDPOINT = settings.socketEndpoint || SOCKET_ENDPOINT;
            connectSocket(SOCKET_ENDPOINT);
            initPanel();
        } else {
            document.getElementById('adminLoginModal').style.display = 'flex';
        }
    } else {
        // Lógica da landing page
        document.getElementById('landing-page').style.display = 'flex';
    }
});
