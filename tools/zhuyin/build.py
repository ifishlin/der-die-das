"""Generate audio/zy/<n>.mp3 for the zhuyin table. Run: PYTHONPATH=<edge-tts dir> python3 tools/zhuyin/build.py"""
import asyncio, os, shutil, sys
import edge_tts
sys.path.insert(0, os.path.dirname(__file__))
from data import ZY
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'audio', 'zy')
VOICE = 'zh-TW-HsiaoChenNeural'

async def one(i, text):
    dst = os.path.join(OUT, f'{i}.mp3')
    if os.path.exists(dst) and os.path.getsize(dst) > 1000: return
    for _ in range(4):
        tmp = dst + '.tmp'
        try:
            await asyncio.wait_for(edge_tts.Communicate(text, VOICE, rate='-15%').save(tmp), 25)
            if os.path.getsize(tmp) > 1000:
                shutil.move(tmp, dst); return
        except Exception as e:
            print('retry', i, e)
    print('FAILED', i)

async def main():
    for i, (sym, ch, py, grp) in enumerate(ZY):
        await one(i, ch)
asyncio.run(main())
