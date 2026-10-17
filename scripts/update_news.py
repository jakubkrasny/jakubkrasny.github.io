import json,re,sys,urllib.request,html
from datetime import date
req=urllib.request.Request('https://everbot.ai/novinky',headers={'User-Agent':'Mozilla/5.0 (news-sync)'})
t=urllib.request.urlopen(req,timeout=30).read().decode('utf-8','replace')
items=[];seen=set()
for m in re.finditer(r'<a[^>]+href="(/novinky/[^"#?]+)"[^>]*>(.*?)</a>',t,re.S):
    href,inner=m.group(1),m.group(2)
    if href in seen:continue
    txt=html.unescape(re.sub(r'<[^>]+>','|',inner));parts=[p.strip() for p in txt.split('|') if p.strip()]
    d=next((p for p in parts if re.fullmatch(r'\d{2}\.\d{2}\.\d{4}',p)),None)
    title=next((p for p in parts if len(p)>20 and not re.fullmatch(r'\d{2}\.\d{2}\.\d{4}',p)),None)
    if not title:continue
    seen.add(href)
    if d:dd,mm,yy=d.split('.');d='%d. %d. %s'%(int(dd),int(mm),yy)
    items.append({'date':d or '','title':title,'url':'https://everbot.ai'+href})
    if len(items)>=6:break
if len(items)<3:
    print('Nepodařilo se načíst novinky, ponechávám stávající soubor');sys.exit(0)
json.dump({'updated':date.today().isoformat(),'items':items},open('news.json','w'),ensure_ascii=False,indent=1)
print('OK',len(items))
