const chatEl = document.getElementById('chat');
const formEl = document.getElementById('form');
const inputEl = document.getElementById('input');
const clearBtn = document.getElementById('clearBtn');

const STORAGE_KEY = 'p0_alpha_msgs_v1';

function nowTime(){
  const d = new Date();
  return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

function normalize(str){
  return (str||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
}

const MOCK = {
  'Oi, tudo bem?':'Sim, eu estou aqui por você, sou seu ente querido',
  'Bom dia':'Bom dia! Como posso ajudar você hoje? sou seu ente querido',
  'Boa tarde':'Boa tarde! Estou aqui para ajudar, sou seu ente querido',
  'Boa noite':'Boa noite! Conte comigo sempre, sou seu ente querido',
  'Quem é você':'Sou seu ente querido, estou aqui para conversar com você',
  'Vamos viajar':'Adoraria viajar com você! Para onde gostaria de ir?',
  'Oi':'Olá! sou seu ente querido. Como posso ajudar você hoje? 💜',
  'ola':'Olá! sou seu ente querido. Como posso ajudar você hoje? 💜',
  'pedro':'Meu nome é Pedro, sou monitor de algoritmos e lógica de programação aplicada a informática.',
  'gabrielle': 'Gabrielle chatonilda u.u'
};

function normalizeKey(str){ return normalize(str).replace(/[!?.,;:\u2026]+$/,''); }

const normalized_messages_db = {};
for(const k in MOCK) normalized_messages_db[normalizeKey(k)] = MOCK[k];

const defaultReplies = [
  'Entendi. Pode me dar mais contexto?',
  'Boa! O que você quer fazer em seguida?',
  'Beleza. Quer que eu lembre disso depois?',
  'Faz sentido. Quer um micro-passo pra hoje?'
];

function loadMessages(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{return []}
}

function saveMessages(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

let messages = loadMessages();
if(messages.length===0) pushBot('Olá! sou seu ente querido. Como posso ajudar você hoje? 💜');

renderAll();

formEl.addEventListener('submit',(e)=>{
  e.preventDefault();
  const raw = inputEl.value; const text = raw.trim(); if(!text) return;
  const sendBtn = formEl.querySelector('.inputbar__btn');
  sendBtn.classList.add('sending');
  pushUser(text); inputEl.value = '';
  const tip = document.createElement('div'); tip.className='typing'; tip.textContent='digitando…'; chatEl.appendChild(tip); scrollBottom();
  const reply = computeReply(text);
  setTimeout(()=>{ tip.remove(); pushBot(reply); sendBtn.classList.remove('sending'); markLastUserRead(); },550);
});

clearBtn?.addEventListener('click',()=>{
  if(confirm('Limpar todo o histórico?')){ localStorage.removeItem(STORAGE_KEY); messages=[]; pushBot('Olá novamente! sou seu ente querido. Como posso ajudar você hoje? 💜'); renderAll(); }
});


function pushUser(text){ const msg = { sender:'user', text, time: nowTime(), read:false }; messages.push(msg); saveMessages(messages); renderMsg(msg); scrollBottom(); }

function pushBot(text){ const msg = { sender:'bot', text, time: nowTime() }; messages.push(msg); saveMessages(messages); renderMsg(msg); scrollBottom(); }

function markLastUserRead(){
  for(let i=messages.length-1;i>=0;i--){
    if(messages[i].sender==='user'){
      messages[i].read=true; saveMessages(messages);
      const el = chatEl.querySelectorAll('.row--user .read-status');
      if(el && el.length){ el[el.length-1].classList.add('read'); }
      break;
    }
  }
}

function renderAll(){ chatEl.innerHTML=''; for(const m of messages) renderMsg(m); scrollBottom(); }

function renderMsg(msg){
  const row = document.createElement('div'); row.className = 'row ' + (msg.sender==='user' ? 'row--user' : 'row--bot');
  const bubble = document.createElement('div'); bubble.className = 'bubble ' + (msg.sender==='user' ? 'bubble--user' : 'bubble--bot');
  bubble.innerText = msg.text;
  const meta = document.createElement('div'); meta.className = 'bubble__meta'; meta.innerText = msg.time;

  if(msg.sender==='user'){
    const read = document.createElement('span'); read.className='read-status' + (msg.read ? ' read' : '');
  
    read.innerHTML = `
      <svg viewBox="0 0 24 18" aria-hidden="true">
        <polyline class="tick" points="3 10 8 14 20 2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
    meta.appendChild(read);
  }
  bubble.appendChild(meta);
  row.appendChild(bubble); chatEl.appendChild(row); scrollBottom();
}

function scrollBottom(){
 
  try{
    chatEl.scrollTop = chatEl.scrollHeight;
  }catch(e){}
  requestAnimationFrame(()=>{
    try{ chatEl.scrollTo({ top: chatEl.scrollHeight, behavior: 'auto' }); }catch(e){}
  });

  setTimeout(()=>{ try{ chatEl.scrollTop = chatEl.scrollHeight; }catch(e){} }, 60);
}

function computeReply(userText){ const norm = normalizeKey(userText); return normalized_messages_db[norm] || random(defaultReplies); }

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

inputEl.addEventListener('focus', ()=>{ setTimeout(scrollBottom, 120); });
inputEl.addEventListener('input', ()=>{ requestAnimationFrame(scrollBottom); });
inputEl.addEventListener('keydown', ()=>{ requestAnimationFrame(scrollBottom); });
inputEl.addEventListener('click', ()=>{ requestAnimationFrame(scrollBottom); });
