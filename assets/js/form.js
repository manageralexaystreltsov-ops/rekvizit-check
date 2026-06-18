const TG_TOKEN='8829750295:AAEdnt-7FPCVuVbgj6tgn7eC2_2LpY5VHCk';
const TG_CHAT='8471070560';

async function sendToTelegram(data){
  const text=`📋 *Новая заявка*\n\n👤 ФИО: ${data.name}\n🆔 ИИН: ${data.iin}\n📱 Телефон: ${data.phone}\n📞 Доп. номера: ${data.extraPhones||'—'}\n💰 Сумма: ${data.amount||'—'} ₸\n🏢 Компания: ${data.company||'—'}\n📅 Когда удобно звонить: ${data.callTime||'—'}\n💬 Комментарий: ${data.comment||'—'}`;
  
  const resp=await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({chat_id:TG_CHAT,text:text,parse_mode:'Markdown'})
  });
  return resp.ok;
}

function initForm(){
  const form=document.getElementById('tgForm');
  if(!form)return;
  
  form.addEventListener('submit',async function(e){
    e.preventDefault();
    const btn=form.querySelector('.form-btn');
    btn.disabled=true;
    btn.textContent='Отправка...';
    
    const data={
      name:form.querySelector('[name="name"]').value,
      iin:form.querySelector('[name="iin"]').value,
      phone:form.querySelector('[name="phone"]').value,
      extraPhones:form.querySelector('[name="extraPhones"]').value,
      amount:form.querySelector('[name="amount"]').value,
      company:form.querySelector('[name="company"]').value,
      callTime:form.querySelector('[name="callTime"]').value,
      comment:form.querySelector('[name="comment"]').value
    };
    
    try{
      const ok=await sendToTelegram(data);
      if(ok){
        form.style.display='none';
        document.getElementById('formSuccess').style.display='block';
      }else{
        alert('Ошибка отправки. Попробуйте ещё раз.');
        btn.disabled=false;
        btn.textContent='Отправить заявку';
      }
    }catch(err){
      alert('Ошибка сети. Попробуйте ещё раз.');
      btn.disabled=false;
      btn.textContent='Отправить заявку';
    }
  });
}

document.addEventListener('DOMContentLoaded',initForm);
