import json, re, subprocess, time, urllib.parse, os
HERE = os.path.dirname(os.path.abspath(__file__))
def ipa(page):
    u = 'https://de.wiktionary.org/w/api.php?' + urllib.parse.urlencode({'action': 'parse', 'page': page, 'prop': 'wikitext', 'format': 'json'})
    for t in range(3):
        time.sleep(1.2)
        try:
            w = json.loads(subprocess.run(['curl', '-s', '-A', 'der-die-das/1.0 (ifishlin324@gmail.com)', u], capture_output=True).stdout)['parse']['wikitext']['*']
            m = re.search(r'\{\{Lautschrift\|([^}|]+)', w[w.index('{{Aussprache}}'):])
            if m: return m.group(1).replace('͡', '')
        except Exception: pass
    return ''
f = os.path.join(HERE, 'ipa_wir.json')
words = open(os.path.join(HERE, 'words.txt')).read().split()
out = json.load(open(f)) if os.path.exists(f) else {}
for w in words:
    if not out.get(w): out[w] = ipa(w)
    json.dump(out, open(f, 'w'), ensure_ascii=False, indent=1)
print('done', [k for k, v in out.items() if not v])
