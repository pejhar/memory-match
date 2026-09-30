(() => {
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const F = n => String(n).split('').map(x => fa[x] ?? x).join('');
  const pad = n => String(n).padStart(2,'0');
  const timeText = s => `${F(pad(Math.floor(s/60)))}:${F(pad(s%60))}`;

  const categories = {
    flags:{title:'پرچم‌ها',icon:'🌍',path:'flags',items:['iran','japan','germany','france','italy','spain','uk','usa','canada','china','korea','brazil','argentina','turkey','india','australia','netherlands','portugal','sweden','norway','russia','mexico','egypt'],labels:{iran:'ایران',japan:'ژاپن',germany:'آلمان',france:'فرانسه',italy:'ایتالیا',spain:'اسپانیا',uk:'بریتانیا',usa:'آمریکا',canada:'کانادا',china:'چین',korea:'کره جنوبی',brazil:'برزیل',argentina:'آرژانتین',turkey:'ترکیه',india:'هند',australia:'استرالیا',netherlands:'هلند',portugal:'پرتغال',sweden:'سوئد',norway:'نروژ',russia:'روسیه',mexico:'مکزیک',egypt:'مصر'}},
    animals:{title:'حیوانات',icon:'🐾',path:'animals',items:['cat','dog','lion','elephant','panda','fox','rabbit','penguin','owl','frog','koala'],labels:{cat:'گربه',dog:'سگ',lion:'شیر',elephant:'فیل',panda:'پاندا',fox:'روباه',rabbit:'خرگوش',penguin:'پنگوئن',owl:'جغد',frog:'قورباغه',koala:'کوالا'}},
    shapes:{title:'اشکال',icon:'🔷',path:'shapes',items:['circle','square','triangle','star','diamond','hexagon','heart','oval'],labels:{circle:'دایره',square:'مربع',triangle:'مثلث',star:'ستاره',diamond:'لوزی',hexagon:'شش‌ضلعی',heart:'قلب',oval:'بیضی'}},
    colors:{title:'رنگ‌ها',icon:'🎨',path:'colors',items:['red','blue','green','yellow','purple','orange','pink','teal','navy','lime'],labels:{red:'قرمز',blue:'آبی',green:'سبز',yellow:'زرد',purple:'بنفش',orange:'نارنجی',pink:'صورتی',teal:'فیروزه‌ای',navy:'سرمه‌ای',lime:'لیمویی'}},
    fruits:{title:'میوه‌ها',icon:'🍎',path:'fruits',items:['apple','banana','orange','strawberry','watermelon','grape'],labels:{apple:'سیب',banana:'موز',orange:'پرتقال',strawberry:'توت‌فرنگی',watermelon:'هندوانه',grape:'انگور'}},
    vehicles:{title:'وسایل نقلیه',icon:'🚗',path:'vehicles',items:['car','bus','plane','rocket','boat','helicopter'],labels:{car:'ماشین',bus:'اتوبوس',plane:'هواپیما',rocket:'موشک',boat:'کشتی',helicopter:'هلیکوپتر'}}
  };
  const stages = [6,6,8,8,10,10,12,12,15,15,18,18,20,20,24,24,28,28,30,30];
  const state = {category:'animals',stage:0,deck:[],first:null,second:null,lock:false,moves:0,matched:0,seconds:0,timer:null,sound:JSON.parse(localStorage.getItem('mm_sound') ?? 'true'),vibrate:JSON.parse(localStorage.getItem('mm_vibrate') ?? 'true')};
  const $ = id => document.getElementById(id);
  const els = {home:$('home'),game:$('game'),board:$('board'),categories:$('categories'),stages:$('stages'),records:$('records'),result:$('result'),settings:$('settings'),timer:$('timer'),moves:$('moves'),pairs:$('pairs')};

  const audio = {};
  function loadAudio(){ ['click','win','start','background'].forEach(k => { audio[k]=new Audio(`assets/sounds/${k}.${k==='start'?'wav':'mp3'}`); audio[k].preload='auto'; if(k==='background'){audio[k].loop=true;audio[k].volume=.12}else audio[k].volume=.55; }); }
  function play(k){ if(!state.sound || !audio[k]) return; try{audio[k].currentTime=0; audio[k].play().catch(()=>{});}catch{} }
  function buzz(ms=30){if(state.vibrate && navigator.vibrate) navigator.vibrate(ms)}

  function renderCategories(){
    els.categories.innerHTML='';
    Object.entries(categories).forEach(([key,c])=>{const b=document.createElement('button');b.className='chip'+(key===state.category?' active':'');b.innerHTML=`<span class="ci">${c.icon}</span>${c.title}`;b.onclick=()=>{state.category=key;renderCategories();};els.categories.appendChild(b)});
  }
  function unlocked(){return Number(localStorage.getItem('mm_unlocked')||1)}
  function renderStages(){
    const max=unlocked(); els.stages.innerHTML='';
    stages.forEach((pairs,i)=>{const b=document.createElement('button');b.className='stage'+(i===state.stage?' active':'')+(i+1>max?' locked':'');b.textContent=F(i+1);b.title=`${pairs} جفت`;b.onclick=()=>{if(i+1<=max){state.stage=i;renderStages();}};els.stages.appendChild(b)});
  }
  function saveRecord(){
    const key=`${state.category}:${state.stage+1}`; const all=JSON.parse(localStorage.getItem('mm_records')||'{}'); const old=all[key]; if(!old || state.seconds<old.time || state.moves<old.moves){all[key]={time:state.seconds,moves:state.moves,date:new Date().toLocaleDateString('fa-IR')};localStorage.setItem('mm_records',JSON.stringify(all));}
  }
  function renderRecords(){
    const all=JSON.parse(localStorage.getItem('mm_records')||'{}'); const rows=Object.entries(all).sort((a,b)=>a[1].time-b[1].time).slice(0,12);
    els.records.innerHTML=rows.length?rows.map(([key,r],i)=>{const [cat,st]=key.split(':');return `<div class="record"><div class="rank">${['🥇','🥈','🥉'][i]||F(i+1)}</div><div><b>${categories[cat]?.title||cat} · مرحله ${F(st)}</b><small>${r.date||''}</small></div><strong>${timeText(r.time)}</strong></div>`}).join(''):'<div class="empty">هنوز رکوردی ثبت نشده است.<br>اولین رکورد را تو ثبت کن!</div>';
  }
  function showScreen(name){els.home.classList.toggle('hidden',name!=='home');els.game.classList.toggle('hidden',name!=='game');if(name==='home'){stopTimer();renderStages();renderRecords();}}
  function startGame(){
    const c=categories[state.category]; const pairs=stages[state.stage];
    if(pairs>c.items.length){ state.category='flags'; }
    const source=categories[state.category].items; const chosen=[...source].sort(()=>Math.random()-.5).slice(0,pairs);
    state.deck=[...chosen,...chosen].sort(()=>Math.random()-.5).map((id,index)=>({id,index,open:false,matched:false})); state.first=null;state.second=null;state.lock=false;state.moves=0;state.matched=0;state.seconds=0;
    $('category-title').textContent=categories[state.category].title; $('stage-title').textContent=`مرحله ${F(state.stage+1)} · ${F(pairs)} جفت`; els.pairs.textContent=`${F(0)}/${F(pairs)}`;els.moves.textContent=F(0);els.timer.textContent=timeText(0); renderBoard(); showScreen('game'); play('start'); startTimer();
  }
  function renderBoard(){
    els.board.innerHTML=''; const n=state.deck.length; els.board.style.gridTemplateColumns=n<=12?'repeat(4,1fr)':n<=20?'repeat(5,1fr)':'repeat(6,1fr)';
    state.deck.forEach((card,idx)=>{const b=document.createElement('button');b.className='card'+(card.open?' flipped':'')+(card.matched?' matched':'');b.dataset.index=idx;b.innerHTML=`<div class="card-inner"><div class="face back"></div><div class="face front"><img src="assets/${categories[state.category].path}/${card.id}.svg" alt=""></div></div>`;b.onclick=()=>choose(idx,b);els.board.appendChild(b)});
  }
  function choose(idx,el){
    if(state.lock) return; const card=state.deck[idx]; if(card.open||card.matched) return;
    card.open=true;el.classList.add('flipped');play('click');buzz(12);
    if(state.first===null){state.first=idx;return}
    state.second=idx;state.moves++;els.moves.textContent=F(state.moves);state.lock=true;
    const a=state.deck[state.first],b=state.deck[state.second];
    if(a.id===b.id){setTimeout(()=>{a.matched=b.matched=true;state.matched++;state.lock=false;els.pairs.textContent=`${F(state.matched)}/${F(stages[state.stage])}`;document.querySelectorAll('.card').forEach(x=>{if(+x.dataset.index===state.first||+x.dataset.index===state.second)x.classList.add('matched','pop')});buzz(55);state.first=state.second=null;if(state.matched===stages[state.stage])finish();},260)}
    else setTimeout(()=>{a.open=b.open=false;const cards=[...document.querySelectorAll('.card')];cards[state.first]?.classList.add('shake');cards[state.second]?.classList.add('shake');setTimeout(()=>{cards[state.first]?.classList.remove('flipped','shake');cards[state.second]?.classList.remove('flipped','shake');state.first=state.second=null;state.lock=false},230)},650);
  }
  function startTimer(){stopTimer();state.timer=setInterval(()=>{state.seconds++;els.timer.textContent=timeText(state.seconds)},1000)}
  function stopTimer(){if(state.timer){clearInterval(state.timer);state.timer=null}}
  function finish(){stopTimer();saveRecord();const max=unlocked();if(state.stage+1===max && max<stages.length)localStorage.setItem('mm_unlocked',String(max+1));$('final-time').textContent=timeText(state.seconds);$('final-moves').textContent=F(state.moves);$('result-text').textContent=`${categories[state.category].title} · مرحله ${F(state.stage+1)} را در ${timeText(state.seconds)} و ${F(state.moves)} حرکت کامل کردی.`;$('next').classList.toggle('hidden',state.stage+1>=stages.length);$('next').textContent=state.stage+1<stages.length?`مرحله ${F(state.stage+2)} 🚀`:'تمام مراحل';els.result.classList.remove('hidden');play('win');buzz([60,40,100]);}

  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');$('play-panel').classList.toggle('hidden',t.dataset.tab!=='play');$('records-panel').classList.toggle('hidden',t.dataset.tab!=='records');if(t.dataset.tab==='records')renderRecords()});
  $('start').onclick=startGame;$('restart').onclick=startGame;$('home-btn').onclick=()=>showScreen('home');$('result-home').onclick=()=>{$('result').classList.add('hidden');showScreen('home')};$('again').onclick=()=>{$('result').classList.add('hidden');startGame()};$('next').onclick=()=>{if(state.stage<stages.length-1)state.stage++;$('result').classList.add('hidden');renderStages();startGame()};
  $('settings-open').onclick=()=>els.settings.classList.remove('hidden');$('settings-close').onclick=()=>els.settings.classList.add('hidden');
  $('sound').checked=state.sound;$('vibrate').checked=state.vibrate;$('sound').onchange=e=>{state.sound=e.target.checked;localStorage.setItem('mm_sound',JSON.stringify(state.sound));if(state.sound)play('click')};$('vibrate').onchange=e=>{state.vibrate=e.target.checked;localStorage.setItem('mm_vibrate',JSON.stringify(state.vibrate));buzz(20)};
  $('clear-records').onclick=()=>{if(confirm('همه رکوردها پاک شوند؟')){localStorage.removeItem('mm_records');renderRecords()}};
  loadAudio();renderCategories();renderStages();renderRecords();showScreen('home');
})();
