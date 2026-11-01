"""Symbol sounds only: extract audio/zy/<n>_s.mp3 from the MOE 國語注音符號手冊 open materials (CC BY 4.0)
and write the ZY array into zhuyin.html. Example words are display-only.
Run: python3 tools/zhuyin/build.py   (needs curl + ffmpeg)"""
import glob, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from data import ZY
ROOT = os.path.join(HERE, '..', '..')
OUT = os.path.join(ROOT, 'audio', 'zy')
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(OUT, '*')): os.remove(f)

# 符號本身的讀音：教育部《國語注音符號手冊》開放部件（CC BY 4.0），F1..F37 依手冊順序
ORDER = 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ'
import tempfile, zipfile
zpath = os.path.join(tempfile.mkdtemp(), 'bopomofo.zip')
subprocess.run(['curl', '-sfL', '-o', zpath, 'https://language.moe.gov.tw/001/Upload/files/site_content/M0001/juyin/bopomofo_materials_20170213.zip'], check=True)
zf = zipfile.ZipFile(zpath)

def symbol_part(sym, name):
    wav = os.path.join(OUT, name + '.wav'); mp3 = os.path.join(OUT, name + '.mp3')
    open(wav, 'wb').write(zf.read(f'audio/F{ORDER.index(sym) + 1}.WAV'))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '4', mp3], check=True)
    os.remove(wav)
    return [name, 0, 1.0]  # 整檔約 0.8 秒，不剪

rows = []
for i, z in enumerate(ZY):
    rows.append(list(z[:4]) + [[symbol_part(z[0], f'{i}_s')]])
print('ok', len(rows))
p = os.path.join(ROOT, 'zhuyin.html')
t = open(p, encoding='utf-8').read()
t = re.sub(r'const ZY=.*?;\n', lambda m: 'const ZY=' + json.dumps(rows, ensure_ascii=False) + ';\n', t, count=1, flags=re.S)
open(p, 'w', encoding='utf-8').write(t)
