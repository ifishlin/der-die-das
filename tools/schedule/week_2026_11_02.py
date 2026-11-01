# Week of 2 Nov 2026 (from the school's taskcards board). Simple German explanations are mine, not the teacher's words.
# Format: day(date, label, zh, items); item(color, title, zh, original, originalZh, originalGram, lines=[(de, zh, [gram])], words=[(de, zh, ipa-key or literal, note, composed)])
def item(color, title, zh, original, originalZh, originalGram, lines, words):
    return dict(color=color, title=title, zh=zh, original=original, originalZh=originalZh, originalGram=originalGram, lines=lines, words=words)
def day(date, label, zh, items): return dict(date=date, label=label, zh=zh, items=items)
W = lambda de, zh, ipa, note='', comp=False: (de, zh, ipa, note, comp)

def HA(colon=True):
    t = 'Hausaufgaben:' if colon else 'Hausaufgaben'
    return item('white', 'Hausaufgaben', '回家作業', t, '回家作業：（欄位目前是空的）',
        ['只有「Hausaufgaben」，是欄位標題：後面本來要填內容。', 'Hausaufgabe（單數）→ Hausaufgaben（複數，字尾加 -n）。'],
        [('Bei den Hausaufgaben steht noch nichts im Plan.', '行程表上回家作業那一欄還沒有寫。',
          ['Bei den Hausaufgaben：bei + 第3格；複數的冠詞 die 變成 den。意思是「關於回家作業」。', 'Bei … 放在句首，動詞排第二：steht。stehen 在這裡是「寫著」。', 'noch nichts = 還沒有任何東西。im = in dem（在…裡面）：im Plan = 在行程表上。']),
         ('Schau am Abend noch einmal nach.', '晚上再看一次。',
          ['命令句（對 du）：schauen → schau。nachschauen 是可分動詞：nach 移到句尾。', 'am Abend = an dem Abend（在晚上，說時間用 am）。', 'noch einmal = 再一次。'])],
        [W('die Hausaufgaben', '回家作業（複數）', 'ˈhaʊ̯sʔaʊ̯fˌɡaːbn̩'), W('der Plan', '計畫、行程表', 'plaːn')])

LW = lambda: item('red', 'Lernwerkstatt', '學習工坊（自己選作業的學習時間）', 'Lernwerkstatt', '學習工坊。',
    ['只有一個名詞，是課表上的時段名稱，沒有動詞。', 'Lernwerkstatt = Lern（學習）+ Werkstatt（工坊）。這個時段的做法請以老師說明為準，我猜是在不同的作業站自己選作業做。'],
    [('In der Lernwerkstatt arbeitest du an verschiedenen Aufgaben.', '在學習工坊，你做各種不同的作業。',
      ['in der Lernwerkstatt：in + 第3格表示地點（die → der）。', 'arbeiten an + 第3格 = 做、處理（某項工作）。arbeitest：du 的形態，字尾 -est。', 'verschiedenen Aufgaben：複數第3格，形容詞加 -en。']),
     ('Du suchst dir selbst aus, womit du anfängst.', '你自己挑要從哪一個開始。',
      ['aussuchen 是可分動詞：suchst … aus。dir = 給你自己（第3格），表示「自己選給自己」。', 'womit du anfängst：從句，動詞放最後（anfangen 在從句裡不分開）。womit = 用什麼、從什麼。', 'anfangen → du fängst an（a 變 ä）。'])],
    [W('die Lernwerkstatt', '學習工坊', 'ˈlɛʁnˌvɛʁkʃtat', 'Lern = 學習，Werkstatt = 工坊', True), W('die Aufgabe', '任務、作業', 'ˈaʊ̯fˌɡaːbə'), W('aussuchen', '挑選', 'ˈaʊ̯sˌzuːxn̩'), W('selbst', '自己', 'zɛlpst')])

KUNST = lambda: item('pink', 'Kunst', '美術課（Scheldt 老師）', 'Kunst mit Frau Scheldt.', '美術課，老師是 Scheldt 女士。',
    ['Kunst = 美術（科目名稱，不加冠詞）。', 'mit Frau Scheldt：mit + 第3格；名字前面的 Frau 不變。', '整句沒有動詞，是課表的簡短寫法。'],
    [('Wir haben Kunst.', '我們有美術課。', ['haben = wir 的現在式。科目名稱（Kunst）前面不加冠詞。']),
     ('Die Lehrerin heißt Frau Scheldt.', '老師叫做 Scheldt 女士。', ['die Lehrerin = 女老師（陰性）。', 'heißen = 叫做。Frau + 姓 = 某某女士。'])],
    [W('die Kunst', '美術、藝術', 'kʊnst'), W('die Lehrerin', '女老師', 'ˈleːʁəʁɪn')])

REL = lambda: item('orange', 'Religion', '宗教課（Schneider 老師）', 'Religion mit Frau Schneider', '宗教課，老師是 Schneider 女士。',
    ['Religion = 宗教課（科目名稱，不加冠詞）。', 'mit Frau Schneider：mit + 第3格；名字前面的 Frau 不變。', '沒有動詞，是課表的簡短寫法。'],
    [('Wir haben Religion.', '我們有宗教課。', ['haben = wir 的現在式。科目名稱前面不加冠詞。']),
     ('Die Lehrerin heißt Frau Schneider.', '老師叫做 Schneider 女士。', ['die Lehrerin = 女老師。heißen = 叫做。'])],
    [W('die Religion', '宗教課', 'ʁeliˈɡi̯oːn'), W('die Lehrerin', '女老師', 'ˈleːʁəʁɪn')])

MO = day('2026-11-02', 'Montag, 2. November', '週一 11/02', [
  item('green', 'Infokiste (für die Eltern)', '資訊箱：給家長的通知', 'Ihre Kinder bekommen einen veränderten Stundenplan – die Schulzeiten ändern sich aber nicht.',
       '您的孩子會拿到一份有變動的課表——不過上下課的時間不變。',
       ['Ihre（大寫）= 您的，老師對家長用敬語。Ihre Kinder 是複數主詞，所以 bekommen。', 'einen veränderten Stundenplan：陽性第4格，ein → einen；veränderten 是「被改變的」，字尾 -en。', 'die Schulzeiten ändern sich nicht：sich ändern = 改變（反身動詞）；Schulzeiten 是複數。aber = 不過。'],
       [('In dieser Woche gibt es einen neuen Stundenplan.', '這個星期有一份新的課表。', ['in dieser Woche：in + 第3格（die Woche → dieser Woche）。', 'es gibt + 第4格 = 有…；einen neuen Stundenplan：陽性第4格。']),
        ('Aber die Schule beginnt und endet zur gleichen Zeit wie immer.', '但是學校還是跟平常一樣的時間上下課。', ['zur = zu der（zu + 第3格）。zur gleichen Zeit = 在同樣的時間。', 'wie immer = 像往常一樣。beginnt、endet：er/es 的形態（詞幹 d 結尾加 -et）。'])],
       [W('der Stundenplan', '課表', 'ˈʃtʊndn̩ˌplaːn', 'Stunde = 一堂課，Plan = 計畫', True), W('die Schulzeit', '上課時間', 'ˈʃuːlˌtsaɪ̯t', '', True), W('verändern', '改變', 'fɛɐ̯ˈʔɛndɐn'), W('die Infokiste', '資訊箱（放通知的地方）', 'ˈɪnfoˌkɪstə', 'Info = 資訊，Kiste = 箱子', True)]),
  LW(),
  item('blue', 'Herbstferien erzählen · Ziffern und Buchstaben', '聊秋假 · 複習數字和字母',
       'Wir erzählen uns von den Herbstferien und wiederholen die Ziffern und Buchstaben.', '我們互相講秋假的事，並且複習數字和字母。',
       ['wir erzählen uns：uns = 彼此，「互相講」。', 'von den Herbstferien：von + 第3格，複數的 die 變 den。Ferien 只有複數。', 'und wiederholen：und 後面的動詞前省略了 wir。die Ziffern und Buchstaben 是第4格複數。'],
       [('Zuerst erzählst du von den Herbstferien.', '先說說你的秋假。', ['Zuerst 放在句首，動詞排第二：erzählst du。', 'erzählen von + 第3格 = 講關於…；den Herbstferien：複數第3格。']),
        ('Danach wiederholen wir die Ziffern und die Buchstaben.', '然後我們複習數字和字母。', ['Danach 放在句首，動詞排第二：wiederholen wir。', 'die Ziffern、die Buchstaben：第4格複數（受詞）。']),
        ('Was hast du in den Ferien erlebt?', '你在假期裡經歷了什麼？', ['現在完成式：hast … erlebt（haben + 過去分詞），問已經發生的事。', 'was = 什麼。in den Ferien：in + 第3格複數。'])],
       [W('die Herbstferien', '秋假', 'ˈhɛʁpstˌfeːʁiən'), W('erzählen', '講述、說', 'ɛɐ̯ˈtsɛːlən'), W('wiederholen', '複習、重複', 'viːdɐˈhoːlən'), W('die Ziffer', '數字（0 到 9 的符號）', 'ˈtsɪfɐ'), W('der Buchstabe', '字母', 'ˈbuːxˌʃtaːbə')]),
  item('green', 'Tiere im Herbst und Winter', '秋天和冬天的動物', 'Tiere im Herbst und Winter.', '秋天和冬天的動物。',
       ['這是主題標題，沒有動詞。Tiere = 動物（das Tier 的複數，加 -e）。', 'im Herbst = in dem Herbst（在秋天）；im Winter 同理。季節用 im 說「在…季」。'],
       [('Heute sprechen wir über Tiere im Herbst und im Winter.', '今天我們談談秋天和冬天的動物。', ['Heute 放在句首，動詞排第二：sprechen wir。', 'sprechen über + 第4格 = 談論關於…。']),
        ('Zum Beispiel halten manche Tiere im Winter Winterschlaf.', '例如：有些動物在冬天會冬眠。', ['Zum Beispiel = 例如（zu dem Beispiel）。放句首，動詞排第二：halten manche Tiere。', 'Winterschlaf halten = 冬眠（固定說法）。manche Tiere = 有些動物。']),
        ('Andere Tiere sammeln Futter.', '另外有些動物會存食物。', ['andere Tiere：複數，「另外一些」。', 'Futter（動物的食物）不可數，不加冠詞。'])],
       [W('das Tier', '動物', 'tiːɐ̯', '複數 die Tiere'), W('der Herbst', '秋天', 'hɛʁpst'), W('der Winter', '冬天', 'ˈvɪntɐ'), W('der Winterschlaf', '冬眠', 'ˈvɪntɐˌʃlaːf', '', True), W('sammeln', '收集', 'ˈzamln̩'), W('das Futter', '飼料、動物的食物', 'ˈfʊtɐ')]),
  HA()])

DI = day('2026-11-03', 'Dienstag, 3. November', '週二 11/03', [
  LW(),
  item('yellow', 'Yoga und Fangspiele', '瑜伽和追逐遊戲', 'Wir machen Yoga und Fangspiele', '我們做瑜伽和追逐遊戲。',
       ['machen = wir 的現在式。Yoga 不加冠詞（泛指活動）。', 'Fangspiele = Fang（抓）+ Spiele（遊戲，das Spiel 的複數）。'],
       [('Heute machen wir Sport: Yoga und Fangspiele.', '今天做運動：瑜伽和追逐遊戲。', ['Heute 放在句首，動詞排第二：machen wir。', '冒號後面列出內容。Yoga 不加冠詞；Fangspiele 是複數。']),
        ('Beim Fangspiel rennt ein Kind und fängt die anderen.', '玩追逐遊戲時，一個孩子跑著去抓其他人。', ['beim = bei dem：「在…的時候」。', 'fangen 是不規則：er fängt（a 變 ä）。rennt：er 的形態。', 'die anderen = 其他的人（第4格複數）。']),
        ('Beim Yoga bist du ganz ruhig.', '做瑜伽的時候你要很安靜。', ['bist = sein 的 du 形態。', 'ganz ruhig = 很安靜。'])],
       [W('das Yoga', '瑜伽', 'ˈjoːɡa'), W('das Fangspiel', '追逐遊戲', 'ˈfaŋˌʃpiːl', 'fangen = 抓，Spiel = 遊戲', True), W('fangen', '抓', 'ˈfaŋən', 'er fängt'), W('rennen', '跑', 'ˈʁɛnən'), W('ruhig', '安靜的', 'ˈʁuːɪç')]),
  item('blue', 'Ziffer 4 · Lerntheke', '認識數字 4 · 學習檯', 'Einführung der Ziffer 4 – Lerntheke', '介紹數字 4——學習檯。',
       ['Einführung = 介紹、引入。der Ziffer 4 是第2格（陰性）：「數字 4 的」。', '標題式寫法，沒有動詞。Lerntheke = 學習檯。'],
       [('Heute lernen wir eine neue Ziffer kennen: die Vier.', '今天認識一個新數字：4。', ['kennenlernen 是可分動詞：lernen … kennen。', 'eine neue Ziffer：陰性第4格。冒號後面是 die Vier（把數字當名詞用，大寫）。']),
        ('An der Lerntheke übst du die Vier.', '在學習檯練習 4。', ['an der Lerntheke：an + 第3格（die → der）。放句首，動詞排第二：übst du。', 'üben + 第4格。']),
        ('Du schreibst die Vier und zählst vier Dinge.', '你寫 4，也數出四個東西。', ['schreibst、zählst：du 的形態，字尾 -st。', 'das Ding → die Dinge（複數加 -e）。'])],
       [W('die Einführung', '介紹、引入', 'ˈaɪ̯nˌfyːʁʊŋ'), W('die Ziffer', '數字（0 到 9 的符號）', 'ˈtsɪfɐ'), W('die Lerntheke', '學習檯（桌上擺著作業，自己選著做）', 'ˈlɛʁnˌteːkə', 'Lern = 學習，Theke = 檯子', True), W('zählen', '數數', 'ˈtsɛːlən'), W('das Ding', '東西', 'dɪŋ', '複數 die Dinge')]),
  HA()])

MI = day('2026-11-04', 'Mittwoch, 4. November', '週三 11/04', [
  LW(),
  item('red', 'Der nächste Buchstabe · Lerntheke', '認識下一個字母 · 學習檯', 'Einführung des nächsten Buchstaben – Lerntheke.', '介紹下一個字母——學習檯。',
       ['des nächsten Buchstaben：第2格（陽性）：「下一個字母的」。des、nächsten、Buchstaben 都有 -n / -s 的第2格字尾。', '標題式寫法，沒有動詞。'],
       [('Heute lernen wir einen neuen Buchstaben kennen.', '今天認識一個新字母。', ['kennenlernen 是可分動詞：lernen … kennen。', 'einen neuen Buchstaben：陽性第4格，ein → einen。']),
        ('Du hörst das Wort und suchst den ersten Laut.', '你聽這個字，找出第一個音。', ['hörst、suchst：du 的形態，字尾 -st。', 'den ersten Laut：陽性第4格；der erste Laut = 字首音（Anlaut）。']),
        ('An der Lerntheke übst du den Buchstaben.', '在學習檯練習這個字母。', ['an der Lerntheke：地點，第3格。', 'den Buchstaben：陽性第4格，Buchstabe 的字尾變成 -n。'])],
       [W('der Buchstabe', '字母', 'ˈbuːxˌʃtaːbə'), W('nächste', '下一個的', 'ˈnɛːçstə'), W('der Laut', '音', 'laʊ̯t'), W('hören', '聽', 'ˈhøːʁən')]),
  KUNST(),
  HA()])

DO = day('2026-11-05', 'Donnerstag, 5. November', '週四 11/05', [
  LW(),
  item('blue', 'Mathelerntheke', '數學學習檯', 'Weiterarbeit an der Mathelerntheke', '繼續做數學學習檯。',
       ['Weiterarbeit = 繼續做（名詞）。an der Mathelerntheke：an + 第3格（die → der）。', 'Mathe 是 Mathematik 的口語簡稱。標題式寫法，沒有動詞。'],
       [('Wir arbeiten an der Mathelerntheke weiter.', '我們繼續在數學學習檯做。', ['weiterarbeiten 是可分動詞：arbeiten … weiter。', 'an der Mathelerntheke：地點，第3格。']),
        ('Dort liegen Aufgaben mit Zahlen und Mengen.', '那裡有跟數字和數量有關的作業。', ['dort = 那裡。Aufgaben 是複數，所以用 liegen。', 'mit Zahlen und Mengen：mit + 第3格複數。']),
        ('Such dir eine Aufgabe aus und rechne.', '挑一個作業來算。', ['命令句（對 du）：aussuchen → such … aus。dir = 給你自己。', 'rechnen（計算）→ rechne。'])],
       [W('die Mathelerntheke', '數學學習檯', 'ˈmatəˈlɛʁnˌteːkə', 'Mathe = 數學，Lerntheke = 學習檯', True), W('die Mathe', '數學（口語）', 'ˈmatə'), W('die Menge', '一堆、數量', 'ˈmɛŋə'), W('rechnen', '計算', 'ˈʁɛçnən'), W('weiterarbeiten', '繼續做', 'ˈvaɪ̯tɐˌʔaʁbaɪ̯tn̩')]),
  item('green', 'Das Eichhörnchen', '松鼠', 'Das Eichhörnchen.', '松鼠。',
       ['Eichhörnchen 是中性名詞（das），主題標題，沒有動詞。', 'Eich- = 橡樹，-hörnchen = 小角；所以是「橡樹的小角」，就是松鼠。'],
       [('Heute geht es um das Eichhörnchen.', '今天的主題是松鼠。', ['es geht um + 第4格 = 主題是關於…。', 'Heute 放句首，動詞排第二：geht es。']),
        ('Das Eichhörnchen hat einen buschigen Schwanz.', '松鼠有一條蓬鬆的尾巴。', ['hat = haben 的 er/es 形態。', 'einen buschigen Schwanz：陽性第4格，ein → einen，形容詞加 -en。']),
        ('Im Herbst sammelt es Nüsse für den Winter.', '秋天它會收集堅果過冬。', ['im Herbst 在句首，動詞排第二：sammelt es。', 'die Nuss → die Nüsse（複數：u 變 ü，加 -e）。für den Winter：für + 第4格。'])],
       [W('das Eichhörnchen', '松鼠', 'ˈaɪ̯çˌhœʁnçən'), W('der Schwanz', '尾巴', 'ʃvants'), W('buschig', '蓬鬆的', 'ˈbʊʃɪç'), W('die Nuss', '堅果', 'nʊs', '複數 die Nüsse'), W('der Winter', '冬天', 'ˈvɪntɐ')]),
  HA()])

FR = day('2026-11-06', 'Freitag, 6. November', '週五 11/06', [
  item('red', 'Buchstabenlerntheke', '字母學習檯', 'Weiterarbeit an der Buchstabenlerntheke.', '繼續做字母學習檯。',
       ['Weiterarbeit = 繼續做（名詞）。an der Buchstabenlerntheke：an + 第3格。', 'Buchstabenlerntheke = Buchstaben（字母）+ Lerntheke（學習檯）。標題式寫法。'],
       [('Wir arbeiten an der Buchstabenlerntheke weiter.', '我們繼續在字母學習檯做。', ['weiterarbeiten 是可分動詞：arbeiten … weiter。']),
        ('Dort übst du Buchstaben, Silben und Wörter.', '在那裡練習字母、音節和單字。', ['Dort 放在句首，動詞排第二：übst du。', 'Buchstaben、Silben、Wörter 都是複數（das Wort → die Wörter：o 變 ö，加 -er）。']),
        ('Wähle eine Aufgabe und mach sie in Ruhe.', '挑一個作業，慢慢做。', ['命令句（對 du）：wählen → wähle；machen → mach。', 'sie = 它（指 die Aufgabe，第4格）。in Ruhe = 不急、安靜地。'])],
       [W('die Buchstabenlerntheke', '字母學習檯', 'ˈbuːxˌʃtaːbn̩ˈlɛʁnˌteːkə', '', True), W('die Silbe', '音節', 'ˈzɪlbə'), W('wählen', '選擇', 'ˈvɛːlən'), W('die Ruhe', '安靜、不急', 'ˈʁuːə')]),
  item('lightblue', 'Martinslieder · Umzug', '練習聖馬丁節的歌 · 11/14 遊行', 'Wir üben die Martinslieder für den Umzug am 14.11.', '我們練習聖馬丁節的歌，為了 11 月 14 日的遊行。',
       ['die Martinslieder 是第4格複數（das Lied → die Lieder）。Martin 指聖馬丁節（St. Martin），德國孩子會提燈籠遊行唱歌。', 'für den Umzug：für + 第4格，der Umzug（陽性）→ den Umzug。', 'am 14.11. = am vierzehnten November（日期用 am + 序數）。'],
       [('Wir singen Martinslieder.', '我們唱聖馬丁節的歌。', ['singen = wir 的現在式。Martinslieder = Martin + Lieder，是複數。']),
        ('Am vierzehnten November gibt es den Umzug.', '11 月 14 日有遊行。', ['am vierzehnten November：日期用 am，序數字尾 -ten（14. = vierzehnten）。', 'Am … 放在句首，動詞排第二：gibt es。es gibt + 第4格（den Umzug）。']),
        ('Dafür üben wir die Lieder jetzt schon.', '所以我們現在就先練習這些歌。', ['Dafür 放在句首，動詞排第二：üben wir。dafür = 為了這個。', 'jetzt schon = 現在就。'])],
       [W('das Lied', '歌', 'liːt', '複數 die Lieder'), W('das Martinslied', '聖馬丁節的歌', 'ˈmaʁtiːnsˌliːt', '', True), W('der Umzug', '遊行', 'ˈʊmˌtsuːk', '也有「搬家」的意思'), W('singen', '唱歌', 'ˈzɪŋən'), W('der November', '十一月', 'noˈvɛmbɐ'), W('üben', '練習', 'ˈyːbn̩')]),
  REL(),
  HA(colon=False)])

DAYS_NEW = [MO, DI, MI, DO, FR]
