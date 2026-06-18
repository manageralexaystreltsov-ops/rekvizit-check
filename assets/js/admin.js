(function(){
'use strict';
const ADMIN_PASS='admin123';
const LS_KEY='cs_clients';
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
let clients=[];
let editingId=null;

function loadClients(){
  const raw=localStorage.getItem(LS_KEY);
  if(raw){clients=JSON.parse(raw);return}
  fetch('../data/clients.json').then(r=>r.json()).then(d=>{
    clients=d.clients||[];
    saveClients();
  });
}
function saveClients(){localStorage.setItem(LS_KEY,JSON.stringify(clients))}

function login(){
  const pass=$('#login-pass').value;
  if(pass===ADMIN_PASS){$('#login-screen').style.display='none';$('#admin-panel').style.display='block';renderTable()}
  else{alert('Неверный пароль')}
}

function renderTable(){
  const tbody=$('#clients-tbody');
  const search=($('#search-admin').value||'').toLowerCase();
  const filter=$('#filter-status').value;
  let list=clients.filter(c=>{
    if(filter&&c.status!==filter)return false;
    if(!search)return true;
    return(c.caseNumber||'').toLowerCase().includes(search)||(c.firstName||'').toLowerCase().includes(search)||(c.lastName||'').toLowerCase().includes(search)||(c.phone||'').includes(search);
  });
  $('#clients-count').textContent=list.length;
  tbody.innerHTML=list.slice(0,200).map(c=>`
    <tr>
      <td><strong>${c.caseNumber}</strong></td>
      <td>${c.firstName} ${c.lastName}</td>
      <td>${c.phone}</td>
      <td>${c.city}</td>
      <td>${c.platform}</td>
      <td>${c.amount?c.amount.toLocaleString('ru-RU')+' ₸':'—'}</td>
      <td><span class="badge badge-${c.status}">${c.statusName}</span></td>
      <td>${c.lastUpdate||'—'}</td>
      <td>
        <button class="btn-sm" onclick="editClient(${c.id})">✏️</button>
        <button class="btn-sm btn-danger" onclick="deleteClient(${c.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function showForm(client){
  editingId=client?client.id:null;
  $('#form-title').textContent=client?'Редактирование дела':'Новое дело';
  $('#f-caseNumber').value=client?client.caseNumber:genCaseNumber();
  $('#f-firstName').value=client?client.firstName:'';
  $('#f-lastName').value=client?client.lastName:'';
  $('#f-phone').value=client?client.phone:'';
  $('#f-email').value=client?client.email:'';
  $('#f-city').value=client?client.city:'Алматы';
  $('#f-platform').value=client?client.platform:'';
  $('#f-amount').value=client?client.amount:'';
  $('#f-status').value=client?client.status:'new';
  $('#f-priority').value=client?client.priority:'medium';
  $('#f-assignedTo').value=client?client.assignedTo:'Макаров С.';
  $('#f-notes').value=client?client.notes:'';
  $('#client-form-modal').style.display='flex';
}

function hideForm(){$('#client-form-modal').style.display='none';editingId=null}

function saveClient(e){
  e.preventDefault();
  const statusMap={
    new:['Новое обращение','Заявка принята. Ожидает первичного анализа.'],
    docs_collect:['Сбор документов','Идёт сбор и верификация документов клиента.'],
    docs_ready:['Документы готовы','Все документы собраны. Передача в юридический отдел.'],
    bank_check:['Проверка банка','Запрос отправлен в банк-эмитент. Ожидание ответа.'],
    bank_review:['Рассмотрение банком','Банк рассматривает оспаривание транзакции.'],
    regulator:['Обращение в регулятор','Дело передано в АРРФР / НБ РК для рассмотрения.'],
    regulator_review:['Рассмотрение регулятором','Регулятор проверяет законность операций.'],
    court_prep:['Подготовка иска','Составление искового заявления для суда.'],
    court:['В суде','Дело находится в судебном производстве.'],
    court_win:['Решение суда (выигрыш)','Суд вынес решение в пользу клиента.'],
    return_process:['Возврат средств','Процесс возврата средств на счёт клиента.'],
    return_done:['Средства возвращены','Деньги зачислены на счёт клиента. Дело закрыто.'],
    partial_return:['Частичный возврат','Часть средств возвращена. Работа продолжается.'],
    blocked:['Приостановлено','Дело приостановлено. Ожидание дополнительной информации.']
  };
  const st=$('#f-status').value;
  const info=statusMap[st]||['',''];
  const data={
    caseNumber:$('#f-caseNumber').value,
    firstName:$('#f-firstName').value,
    lastName:$('#f-lastName').value,
    phone:$('#f-phone').value,
    email:$('#f-email').value,
    city:$('#f-city').value,
    platform:$('#f-platform').value,
    amount:parseInt($('#f-amount').value)||0,
    status:st,
    statusName:info[0],
    statusDescription:info[1],
    priority:$('#f-priority').value,
    assignedTo:$('#f-assignedTo').value,
    notes:$('#f-notes').value,
    caseDate:new Date().toISOString().split('T')[0],
    lastUpdate:new Date().toISOString().split('T')[0],
    country:'Казахстан'
  };
  if(editingId){
    const idx=clients.findIndex(c=>c.id===editingId);
    if(idx>=0)clients[idx]={...clients[idx],...data};
  }else{
    data.id=clients.length?Math.max(...clients.map(c=>c.id))+1:1;
    clients.push(data);
  }
  saveClients();hideForm();renderTable();
}

function genCaseNumber(){
  const d=new Date();const m=String(d.getMonth()+1).padStart(2,'0');
  return`MK-${String(d.getFullYear()).slice(2)}${m}-${String(clients.length+1).padStart(5,'0')}`;
}

window.editClient=function(id){const c=clients.find(x=>x.id===id);if(c)showForm(c)};
window.deleteClient=function(id){if(!confirm('Удалить дело?'))return;clients=clients.filter(c=>c.id!==id);saveClients();renderTable()};

document.addEventListener('DOMContentLoaded',function(){
  loadClients();
  $('#login-btn').addEventListener('click',login);
  $('#login-pass').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
  $('#add-client-btn').addEventListener('click',()=>showForm(null));
  $('#client-form').addEventListener('submit',saveClient);
  $('#cancel-form').addEventListener('click',hideForm);
  $('#close-modal').addEventListener('click',hideForm);
  $('#search-admin').addEventListener('input',renderTable);
  $('#filter-status').addEventListener('change',renderTable);
  $('#export-btn').addEventListener('click',function(){
    const blob=new Blob([JSON.stringify({clients},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='clients-export.json';a.click();
  });
  // Seed from JSON if localStorage empty
  if(!localStorage.getItem(LS_KEY)){
    setTimeout(()=>{if(clients.length)renderTable()},1000);
  }
});
})();
