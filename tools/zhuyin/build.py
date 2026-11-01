"""Download MOE (教育部國語辭典簡編本) recordings via moedict CDN, convert to audio/zy/<n>.mp3.
Run: python3 tools/zhuyin/build.py   (needs curl + ffmpeg)"""
import os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from data import ZY
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'audio', 'zy')
os.makedirs(OUT, exist_ok=True)
for i, z in enumerate(ZY):
    src = f'https://r2-assets.moedict.tw/audio/a/{z[4]}.ogg'
    tmp = os.path.join(OUT, f'{i}.ogg')
    subprocess.run(['curl', '-sfL', '-o', tmp, src], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-codec:a', 'libmp3lame', '-q:a', '4',
                    os.path.join(OUT, f'{i}.mp3')], check=True)
    os.remove(tmp)
print('ok', len(ZY))
