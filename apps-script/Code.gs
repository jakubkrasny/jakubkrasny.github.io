/**
 * Rezervace konzultací z webu jakubkrasny.github.io
 * - GET  ?action=slots  -> volné termíny (jen skutečně volné 90min bloky z Google Kalendáře, omezený počet)
 * - POST (JSON, text/plain) -> rezervace: zápis do kalendáře + tabulky, e-mail klientovi, upozornění Jakubovi
 * Nastavení je v objektu CFG níže.
 */
var CFG = {
  SHEET_ID: '1N2PGI7DBm-CJrRW0JYa7HNV3-sX9Md0GLzi621QBfsk',
  SHEET_NAME: 'Žádosti',
  TZ: 'Europe/Prague',
  BLOCK_MIN: 90,          // kolik minut se skutečně blokuje v kalendáři (klientovi se píše cca 45)
  BUFFER_MIN: 15,         // rezerva před a po
  DAYS_AHEAD: 8,          // kolik pracovních dnů dopředu se nabízí
  START_H: 9, LAST_START_H: 16.5,   // první a poslední možný začátek (hodiny)
  STEP_MIN: 30,
  MAX_PER_DAY: 3,         // maximálně kolik termínů za den ukázat (méně = "vytížený")
  SPACING_MIN: 180,       // minimální rozestup nabízených začátků
  MIN_NOTICE_H: 20,       // nejdřív za kolik hodin od teď
  DAILY_CAP: 25,          // ochrana proti zneužití: max rezervací za den
  OWNER_NAME: 'Jakub Krásný',
  OWNER_PHONE: '+420 733 173 863',
  OWNER_MAIL: 'jakub.krasny@everbot.ai',
  SITE: 'https://jakubkrasny.github.io',
  REGISTER: 'https://app.everbot.ai/register'
};
var HOLIDAYS = ['2026-10-28','2026-11-17','2026-12-24','2026-12-25','2026-12-26','2027-01-01','2027-03-26','2027-03-29','2027-05-01','2027-05-08','2027-07-05','2027-07-06','2027-09-28','2027-10-28','2027-11-17'];
var DOW = ['neděle','pondělí','úterý','středa','čtvrtek','pátek','sobota'];
var MON = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];

function pad(n){ return (n<10?'0':'')+n; }
function ymd(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function hm(d){ return pad(d.getHours())+':'+pad(d.getMinutes()); }
function parseLocal(s){ // 'YYYY-MM-DD HH:mm'
  var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(s||''); if(!m) return null;
  return new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]);
}
function longDate(d){ return DOW[d.getDay()]+' '+d.getDate()+'. '+MON[d.getMonth()]+' '+d.getFullYear()+' v '+hm(d); }
function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function seed(str){ var h=7; for(var i=0;i<str.length;i++){ h=(h*31+str.charCodeAt(i))>>>0; } return h; }

/** Obsazené intervaly: krátké schůzky se počítají jako 90 min (i když jsou v kalendáři zapsané na 45). */
function busyIntervals(from, to){
  var out = [];
  CalendarApp.getDefaultCalendar().getEvents(from, to).forEach(function(ev){
    try {
      if (ev.getTransparency && ev.getTransparency() === CalendarApp.EventTransparency.TRANSPARENT) return; // "Volný" = ignoruj
      if (ev.getMyStatus && ev.getMyStatus() === CalendarApp.GuestStatus.NO) return;                         // odmítnuto
    } catch(e){}
    var s = ev.getStartTime(), e = ev.getEndTime();
    if (ev.isAllDayEvent()) { out.push([s.getTime(), e.getTime()]); return; }
    var dur = (e - s) / 60000;
    if (dur < CFG.BLOCK_MIN) e = new Date(s.getTime() + CFG.BLOCK_MIN*60000);
    out.push([s.getTime(), e.getTime()]);
  });
  return out;
}
function isFree(start, busy){
  var a = start.getTime() - CFG.BUFFER_MIN*60000, b = start.getTime() + (CFG.BLOCK_MIN+CFG.BUFFER_MIN)*60000;
  for (var i=0;i<busy.length;i++){ if (busy[i][0] < b && busy[i][1] > a) return false; }
  return true;
}

/** Spočítá nabízené termíny. */
function computeDays(){
  var now = new Date(), earliest = now.getTime() + CFG.MIN_NOTICE_H*3600000;
  var days = [], d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var list = [];
  while (list.length < CFG.DAYS_AHEAD) {
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1);
    var w = d.getDay();
    if (w===0 || w===6 || HOLIDAYS.indexOf(ymd(d))>=0) continue;
    list.push(new Date(d.getTime()));
    if (d.getTime() - now.getTime() > 40*86400000) break;
  }
  // dnes se nenabízí (min. odstup), ale pokud je příští pracovní den za víc než 20 h, projde to filtrem níže
  var busy = busyIntervals(new Date(now.getTime()-86400000), new Date(list[list.length-1].getTime()+2*86400000));
  list.forEach(function(day){
    var cands = [];
    for (var m = CFG.START_H*60; m <= CFG.LAST_START_H*60; m += CFG.STEP_MIN){
      var s = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(m/60), m%60);
      if (s.getTime() < earliest) continue;
      if (isFree(s, busy)) cands.push(s);
    }
    // stabilní "náhodné" pořadí podle data, pak vybrat rozestoupené termíny
    var sd = seed(ymd(day));
    cands.sort(function(a,b){ return (seed(hm(a))^sd) - (seed(hm(b))^sd); });
    var picked = [];
    cands.forEach(function(c){
      if (picked.length >= CFG.MAX_PER_DAY) return;
      var ok = picked.every(function(p){ return Math.abs(p.getTime()-c.getTime()) >= CFG.SPACING_MIN*60000; });
      if (ok) picked.push(c);
    });
    picked.sort(function(a,b){ return a-b; });
    days.push({ date: ymd(day), dow: DOW[day.getDay()], label: day.getDate()+'. '+(day.getMonth()+1)+'.', slots: picked.map(hm), full: picked.length===0 });
  });
  return days;
}

function doGet(e){
  var action = (e && e.parameter && e.parameter.action) || 'slots';
  if (action === 'ping') return json({ ok:true });
  try {
    var cache = CacheService.getScriptCache(), c = cache.get('slots');
    if (c) return ContentService.createTextOutput(c).setMimeType(ContentService.MimeType.JSON);
    var out = JSON.stringify({ ok:true, days: computeDays() });
    cache.put('slots', out, 45);
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  } catch(err){ return json({ ok:false, error:String(err) }); }
}

function clean(v, max){ return String(v==null?'':v).replace(/[\u0000-\u001f]/g,' ').trim().slice(0, max||300); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function doPost(e){
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var b = JSON.parse(e.postData.contents);
    if (b.web) return json({ ok:true });                         // pasti pro roboty
    var name = clean(b.name,80), email = clean(b.email,120).toLowerCase(), phone = clean(b.phone,30), company = clean(b.company,120);
    if (!name || !company) return json({ ok:false, error:'missing' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return json({ ok:false, error:'email' });
    if (phone.replace(/\D/g,'').length < 9) return json({ ok:false, error:'phone' });

    var props = PropertiesService.getScriptProperties(), today = ymd(new Date());
    var cnt = props.getProperty('cnt_'+today); cnt = cnt ? +cnt : 0;
    if (cnt >= CFG.DAILY_CAP) return json({ ok:false, error:'limit' });
    var lastKey = 'em_'+email; if (props.getProperty(lastKey) === today) return json({ ok:false, error:'dup' });

    var start = null;
    if (b.slot) {
      start = parseLocal(b.slot);
      var day = ymd(start || new Date(0)), t = start ? hm(start) : '';
      var found = computeDays().some(function(d){ return d.date===day && d.slots.indexOf(t)>=0; });
      if (!found) return json({ ok:false, error:'taken' });
    }
    var answers = {
      ico: clean(b.ico,20), about: clean(b.about,400), wants: clean(b.wants,300), size: clean(b.size,40), usesAi: clean(b.usesAi,40),
      note: clean(b.note,600), preferred: clean(b.preferred,200)
    };
    var termin = start ? longDate(start) : ('bez termínu – ' + (answers.preferred || 'domluvíme telefonicky'));

    if (start) {
      var end = new Date(start.getTime() + CFG.BLOCK_MIN*60000);
      var ev = CalendarApp.getDefaultCalendar().createEvent('⏳ Konzultace – ' + name + ' (' + company + ') – čeká na potvrzení', start, end, {
        description: 'Žádost z webu. Před schůzkou zavolat a potvrdit.\n\nTelefon: '+phone+'\nE-mail: '+email+'\nFirma: '+company+' (IČO '+answers.ico+')\nČím se zabývá: '+answers.about+'\nCo chce od AI: '+answers.wants+'\nVelikost: '+answers.size+'\nPoužívá AI: '+answers.usesAi+'\nPoznámka: '+answers.note
      });
      try { ev.setColor(CalendarApp.EventColor.YELLOW); ev.addPopupReminder(60); } catch(x){}
    }

    var sh = SpreadsheetApp.openById(CFG.SHEET_ID).getSheetByName(CFG.SHEET_NAME);
    sh.appendRow([ new Date(), start ? Utilities.formatDate(start, CFG.TZ, 'yyyy-MM-dd HH:mm') : termin, 'Nová', name, email, phone, company, answers.ico, answers.about, answers.wants, answers.size, answers.usesAi, (answers.note + (answers.preferred ? ' | Preferuje: '+answers.preferred : '')).trim(), 'Web' ]);

    props.setProperty('cnt_'+today, String(cnt+1)); props.setProperty(lastKey, today);
    CacheService.getScriptCache().remove('slots');

    sendClientMail(name, email, phone, start, termin);
    sendOwnerMail(name, email, phone, company, answers, termin);
    return json({ ok:true, when: termin });
  } catch(err){
    return json({ ok:false, error:String(err) });
  } finally { try { lock.releaseLock(); } catch(x){} }
}

function sendClientMail(name, email, phone, start, termin){
  var first = name.split(' ')[0];
  var when = start ? '<p style="margin:0 0 6px"><b>Termín:</b> '+esc(termin)+'</p>' : '<p style="margin:0 0 6px"><b>Termín:</b> domluvíme telefonicky</p>';
  var html =
  '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#10132a;line-height:1.55">'+
  '<div style="background:#0b0e1d;border-radius:16px;padding:22px 26px;margin-bottom:18px"><span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#2ef379;margin-right:8px"></span><b style="color:#fff;font-size:17px">Everbot · AI konzultace</b></div>'+
  '<p style="font-size:17px;margin:0 0 14px">Dobrý den, '+esc(first)+',</p>'+
  '<p style="margin:0 0 14px">děkuji, vaši žádost o bezplatnou konzultaci jsem v pořádku přijal. Těším se na ni.</p>'+
  '<div style="background:#f1fbf5;border:1px solid #c9efd8;border-radius:12px;padding:14px 18px;margin:0 0 16px">'+when+
  '<p style="margin:0">Před schůzkou vám <b>zavolám na '+esc(phone)+'</b>, abychom si termín potvrdili a doladili, co vás zajímá nejvíc.</p></div>'+
  '<p style="margin:0 0 6px"><b>Jak konzultace probíhá</b></p>'+
  '<ul style="margin:0 0 16px;padding-left:20px"><li>Je online a zdarma, bez závazků.</li><li>Počítejte zhruba s 45 minutami. Pokud vás to bude bavit, rád zůstanu déle.</li><li>Ukážu vám živě, jak vám AI ušetří čas, sníží náklady a zlepší výsledky, na příkladech z vaší firmy.</li></ul>'+
  '<p style="margin:0 0 6px"><b>Co můžete udělat předem (nepovinné)</b></p>'+
  '<p style="margin:0 0 16px">Vyzkoušejte si Everbot zdarma, ať jste už na schůzce o krok dál: <a href="'+CFG.REGISTER+'" style="color:#0a8f4a;font-weight:bold">registrace zdarma</a>. A vzpomeňte si na jeden úkol, který vám v práci zabírá nejvíc času. Právě na něm to ukážu.</p>'+
  '<p style="margin:0 0 16px">Pokud vám termín nevyhovuje, stačí odpovědět na tento e-mail nebo mi zavolat.</p>'+
  '<p style="margin:0">S pozdravem<br><b>'+CFG.OWNER_NAME+'</b><br>AI konzultant Everbotu<br>'+CFG.OWNER_PHONE+' · <a href="mailto:'+CFG.OWNER_MAIL+'" style="color:#0a8f4a">'+CFG.OWNER_MAIL+'</a><br><a href="'+CFG.SITE+'" style="color:#0a8f4a">'+CFG.SITE.replace('https://','')+'</a></p></div>';
  MailApp.sendEmail({ to: email, subject: 'Vaše konzultace s AI konzultantem Everbotu' + (start ? ' – ' + longDate(start) : ''), htmlBody: html, body: 'Dobrý den, děkuji za žádost o konzultaci. Termín: '+termin+'. Před schůzkou vám zavolám na '+phone+'. '+CFG.OWNER_NAME+', '+CFG.OWNER_PHONE, name: CFG.OWNER_NAME+' | Everbot', replyTo: CFG.OWNER_MAIL });
}

function sendOwnerMail(name, email, phone, company, a, termin){
  function row(k,v){ return '<tr><td style="padding:4px 14px 4px 0;color:#667"><b>'+k+'</b></td><td style="padding:4px 0">'+esc(v||'–')+'</td></tr>'; }
  var html = '<div style="font-family:Arial,sans-serif;color:#10132a"><h2 style="margin:0 0 10px">Nová žádost o konzultaci</h2><table>'+
    row('Termín',termin)+row('Jméno',name)+row('Telefon',phone)+row('E-mail',email)+row('Firma',company)+row('IČO',a.ico)+row('Čím se zabývá',a.about)+row('Co chce od AI',a.wants)+row('Velikost firmy',a.size)+row('Používá AI',a.usesAi)+row('Poznámka',a.note)+row('Preferuje',a.preferred)+
    '</table><p><a href="https://docs.google.com/spreadsheets/d/'+CFG.SHEET_ID+'">Otevřít tabulku</a> · <a href="https://calendar.google.com/calendar/r">Kalendář</a></p><p style="color:#667">Klientovi odešlo potvrzení. Zavolej mu a v tabulce změň Stav.</p></div>';
  MailApp.sendEmail({ to: CFG.OWNER_MAIL, subject: '[Rezervace z webu] ' + name + ' (' + company + ') – ' + termin, htmlBody: html, body: 'Nová žádost: '+name+', '+phone+', '+email+', '+company+', '+termin, name: 'Web – rezervace' });
}

/** Spusť jednou ručně pro udělení oprávnění (Spustit → testAuth). */
function testAuth(){
  CalendarApp.getDefaultCalendar().getName();
  SpreadsheetApp.openById(CFG.SHEET_ID).getName();
  MailApp.getRemainingDailyQuota();
  Logger.log(JSON.stringify(computeDays()));
}
