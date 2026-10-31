# One folder per book under tools/books/<id>/ with meta.py + content.py; run `python3 tools/books/build.py <id>`.
META = dict(
    id='das-kleine-wir',
    title='Das kleine WIR',
    author='Daniela Kunkel',
    zh='小小的「我們」',
    blurb='一個叫 WIR（我們）的綠色小怪物，住在 Ben 和 Emma 的友誼裡。講吵架、想念和好。',
    # The photographed pages, named p01.jpg … in reading order; copied as-is into books/<id>/icons/.
    photos_dir='/Volumes/Fish/personal/Chris_learning/Wir',
)
