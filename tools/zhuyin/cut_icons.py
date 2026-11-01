"""Cut the small pictures out of a photo of the ㄅㄆㄇ 注音符號表 poster (8 x 5 grid) into img/zy/<n>.jpg,
<n> = index in data.py's ZY (same numbering as audio/zy/). Grid positions are tuned for the 538x332 photo.
Run: python3 tools/zhuyin/cut_icons.py <photo>   (needs numpy, scipy, Pillow)"""
import os, sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from data import ZY
OUT = os.path.join(HERE, '..', '..', 'img', 'zy')
os.makedirs(OUT, exist_ok=True)
INDEX = {z[0]: i for i, z in enumerate(ZY)}

im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
XS = [3, 70, 137, 203, 270, 338, 404, 470, 536]
YS = [0, 67, 135, 201, 268, 332]
GRID = ['ㄅㄆㄇㄈㄉㄊㄋㄌ', 'ㄍㄎㄏㄐㄑㄒㄓㄔ', 'ㄕㄖㄗㄘㄙㄚㄛㄜ', 'ㄝㄞㄟㄠㄡㄢㄣㄤ', 'ㄥㄦㄧㄨㄩ']
for r, row in enumerate(GRID):
    for c, sym in enumerate(row):
        off = round(c * 1.8)  # the photo is slightly tilted: right-hand cells sit lower
        x0, x1 = max(XS[c] - 12, 0), XS[c + 1]
        y0, y1 = YS[r] + (off if r else 0), min(YS[r + 1] + off + 4, im.shape[0])
        cell = im[y0:y1, x0:x1]
        h = y1 - y0
        paper = np.median(cell.reshape(-1, 3), 0)
        mask = (np.abs(cell - paper).max(2) > 45) | (cell.max(2) - cell.min(2) > 40)
        mask[:, :4] = False; mask[:, -2:] = False
        lab, n = ndi.label(mask, structure=np.ones((3, 3)))
        # the picture is the biggest blob in the lower part of the cell (the word label is at the top)
        best, bs = None, 0
        for k in range(1, n + 1):
            ys, xs = np.nonzero(lab == k)
            if ys.max() < h * 0.55: continue
            score = (ys > h * 0.45).sum()
            if score > bs: best, bs = k, score
        ys, xs = np.nonzero(lab == best)
        t, b, L, R = ys.min(), ys.max(), xs.min(), xs.max()
        keep = lab == best
        for k in range(1, n + 1):  # small pieces inside the picture's box (eyes, dots)
            yy, xx = np.nonzero(lab == k)
            if k != best and yy.min() >= t - 2 and yy.max() <= b + 2 and xx.min() >= L - 2 and xx.max() <= R + 2:
                keep |= lab == k
        keep = ndi.binary_dilation(ndi.binary_fill_holes(keep), iterations=2)
        cell = np.where(keep[..., None], cell, paper)  # grid lines and specks -> paper
        pad = 3
        t, b, L, R = max(t - pad, 0), min(b + pad, h - 1), max(L - pad, 0), min(R + pad, x1 - x0 - 1)
        crop = np.clip(cell[t:b + 1, L:R + 1] / paper * 255, 0, 255).astype(np.uint8)  # paper -> white
        img = Image.fromarray(crop)
        s = 200 / max(img.size)
        img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
        canvas = Image.new('RGB', (220, 220), 'white')
        canvas.paste(img, ((220 - img.width) // 2, (220 - img.height) // 2))
        canvas.save(os.path.join(OUT, f'{INDEX[sym]}.jpg'), quality=88)
print('ok', sum(map(len, GRID)))
