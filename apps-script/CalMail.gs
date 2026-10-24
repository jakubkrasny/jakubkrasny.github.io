/**
 * Cal.com -> tabulka + uvítací e-mail.
 * Běží časovačem (každých 5 min) pod pracovním účtem, žádný veřejný web app není potřeba.
 * Zpracuje e-maily "Awaiting approval: …" od hello@cal.com a označí je štítkem "web-zpracovano".
 */
var CAL = { LABEL: 'web-zpracovano', QUERY: 'from:hello@cal.com subject:"Awaiting approval" -label:web-zpracovano newer_than:3d' };

function processCalMails(){
  var label = GmailApp.getUserLabelByName(CAL.LABEL) || GmailApp.createLabel(CAL.LABEL);
  var threads = GmailApp.search(CAL.QUERY, 0, 20);
  var sh = SpreadsheetApp.openById(CFG.SHEET_ID).getSheetByName(CFG.SHEET_NAME);
  threads.forEach(function(t){
    var m = t.getMessages()[0];
    try {
      var d = parseCal_(m.getPlainBody(), m.getBody());
      if (!d.email) throw new Error('bez e-mailu klienta');
      var termin = d.start ? longDate(d.start) : 'domluvíme telefonicky';
      sh.appendRow([ new Date(), d.start ? Utilities.formatDate(d.start, CFG.TZ, 'yyyy-MM-dd HH:mm') : '', 'Nová', d.name, d.email, d.phone, d.company, d.ico, d.about, '', '', '', '', 'Web (Cal.com)' ]);
      sendClientMail(d.name || 'dobrý den', d.email, d.phone || CFG.OWNER_PHONE, d.start, termin);
      t.addLabel(label);
    } catch (err) {
      Logger.log('Chyba ' + err);
      t.addLabel(label); // ať se nezacyklí; chybu uvidíš v protokolu
      MailApp.sendEmail(CFG.OWNER_MAIL, '[Rezervace z webu] Nepodařilo se zpracovat žádost', String(err) + '\n' + m.getSubject());
    }
  });
}

function parseCal_(plain, html){
  function field(label){
    var re = new RegExp('(?:^|\\n)' + label + ':\\s*\\n([^\\n]*)', 'i');
    var r = plain.match(re); return r ? r[1].trim() : '';
  }
  var out = { name:'', email:'', phone: field('Phone number') || field('Telefonní číslo'), company: field('Název firmy'), ico: field('IČO'), about: field('Čím se vaše firma zabývá\\?') };
  // Kdo: dvojice "Jméno - Organizer" / řádek s e-mailem / jméno / e-mail
  var who = (plain.split(/\nWho:\s*\n/i)[1] || '').split(/\n\n/)[0].split('\n');
  var people = [];
  for (var i = 0; i + 1 < who.length; i++) {
    if (/@/.test(who[i+1]) && !/@/.test(who[i])) { people.push({ name: who[i].replace(/\s+-\s+(Organizer|Organizátor)\s*$/i,'').trim(), email: who[i+1].trim(), org: /Organizer|Organizátor/i.test(who[i]) }); i++; }
  }
  var guest = people.filter(function(p){ return !p.org && p.email.toLowerCase() !== CFG.OWNER_MAIL.toLowerCase(); })[0] || people.filter(function(p){ return !p.org; })[0];
  if (guest) { out.name = guest.name; out.email = guest.email; }
  // Kdy z HTML (data-testid="when")
  var w = html.match(/data-testid="when"[\s\S]*?<p[^>]*>([^<]+)<\/p>[\s\S]*?<p[^>]*>(?:<span[^>]*>[^<]*<\/span>)?([^<]+)<\/p>/);
  if (w) {
    var date = w[1].replace(/^[A-Za-zěščřžýáíéúůďťňÁÉÍÓÚŽŠČŘ]+,\s*/, '').trim();       // October 26, 2026
    var tm = (w[2].match(/(\d{1,2}:\d{2}\s*[ap]m)/i) || [])[1];                           // 3:00pm
    if (tm) { try { out.start = Utilities.parseDate(date + ' ' + tm.toUpperCase().replace(/\s+/g,''), CFG.TZ, 'MMMM d, yyyy h:mma'); } catch (e) { Logger.log('datum: ' + e); } }
  }
  return out;
}

/** Spusť jednou ručně: vytvoří časovač každých 5 minut. */
function installTrigger(){
  ScriptApp.getProjectTriggers().forEach(function(t){ if (t.getHandlerFunction()==='processCalMails') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('processCalMails').timeBased().everyMinutes(5).create();
}
