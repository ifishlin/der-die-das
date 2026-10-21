# Study notes for a picture book, in my own simple German (not the book's text). Each spread:
#   main = story line, side = small details in the pictures, words = (de, zh, ipa-key or literal, note)
# Names Ben (boy) / Emma (girl) are inferred from the pictures.
SPREADS = [
 dict(zh='小 WIR 登場', icon=8,
  main=[
   ('Hallo! Das ist ein kleines grünes Monster. Es heißt WIR.', '哈囉！這是一隻綠色的小怪物，它叫 WIR。', ['Das ist … = 這是…。ein kleines grünes Monster：中性第1格，形容詞加 -es。', 'heißen = 叫做：es heißt。']),
   ('Es ist klein, aber stark. Es ist etwas ganz Besonderes.', '它很小，但很強。它是很特別的存在。',
    ['aber = 但是。etwas Besonderes：「etwas + 形容詞」，形容詞要大寫，字尾 -es。', 'ganz = 非常、完全。'])],
  side=[
   ('Das WIR ist grün und hat viel Fell.', 'WIR 是綠色的，毛茸茸的。', ['hat = haben 的 er/es 形態。', 'viel Fell：不可數名詞，前面不加冠詞。']),
   ('Es winkt und sagt Hallo.', '它揮揮手，說哈囉。', ['winken → es winkt（動詞字尾 -t）。']),
   ('Neben dem WIR steht ein kleines Haus. Das Haus sieht aus wie ein Herz.', '旁邊有一間小房子，看起來像一顆心。',
    ['neben + 第3格（das WIR → dem WIR）表示「在旁邊」。', 'aussehen wie + 名詞 = 看起來像…。ein kleines Haus：中性第1格。'])],
  words=[('das Herz', '心', 'Herz', 'dem Herzen（第3格有特別字尾）'), ('stark', '強壯的', 'stark', ''), ('besonders', '特別的', 'besonders', ''), ('winken', '揮手', 'winken', '')]),

 dict(zh='什麼是 WIR？', icon=15,
  main=[
   ('Wo Menschen sich gern haben, entsteht ein WIR.', '有人互相喜歡的地方，就會出現一個「WIR」。',
    ['wo = 在…的地方，這是從句，動詞 haben 放最後（sich gern haben = 彼此喜歡）。', '從句放在前面時，後面主句的動詞要排第一：entsteht ein WIR。', 'entstehen（出現）的 er/es 形態是 entsteht。']),
   ('Auf der Welt gibt es sehr viele WIR. Alle sehen anders aus.', '世界上有非常多個 WIR，每一個都長得不一樣。',
    ['es gibt + 第4格 = 有…。auf der Welt = 在世界上。', 'alle = 全部（複數）。', 'aussehen 是可分動詞：sehen … aus。anders = 不一樣。']),
   ('Diese Geschichte erzählt vom WIR von Ben und Emma.', '這個故事講的是 Ben 和 Emma 的 WIR。',
    ['erzählen von + 第3格 = 講關於…。vom = von dem。', 'das WIR von Ben und Emma：「von + 人名」表示「某某的」。'])],
  side=[
   ('Ben und Emma klatschen sich ab.', 'Ben 和 Emma 擊掌。', ['abklatschen 是可分動詞：klatschen … ab。', 'sich = 彼此（互相）。']),
   ('Auf der Wiese spielen viele Kinder, Hunde und Katzen.', '草地上很多孩子、狗和貓在玩。', ['auf + 第3格表示地點（die Wiese → der Wiese）。', '地點放在句首，動詞排第二：spielen。']),
   ('Jedes WIR wirft einen großen Schatten.', '每個 WIR 都投下一個大影子。', ['werfen 是不規則動詞：es wirft（e 變 i）。', 'einen Schatten：陽性第4格，ein 變 einen。'])],
  words=[('das WIR', '「我們」（書裡把它當成一個小生物的名字）', 'viːɐ̯', ''), ('entstehen', '出現、形成', 'entstehen', ''), ('mögen', '喜歡', 'mögen', 'ich mag, er mag'),
         ('anders', '不一樣的', 'anders', ''), ('die Geschichte', '故事', 'Geschichte', ''), ('der Schatten', '影子', 'Schatten', ''), ('die Wiese', '草地', 'Wiese', '')]),

 dict(zh='WIR 把兩個人連在一起', icon=3,
  main=[
   ('Das WIR verbindet Ben und Emma.', 'WIR 把 Ben 和 Emma 連在一起。', ['verbinden → es verbindet（詞幹以 d 結尾，加 -et）。', 'Ben und Emma 是受詞（第4格）。']),
   ('Auch wenn sie weit weg sind, denken sie aneinander.', '就算離得很遠，他們也想著彼此。',
    ['auch wenn = 即使。這是從句，動詞 sind 放最後；從句在前面時，主句動詞排第一：denken sie。', 'weit weg = 很遠。aneinander = an + einander，「彼此」。']),
   ('Sie wissen auch ohne Worte, was der andere meint.', '不用說話，他們也知道對方的意思。', ['wissen 是不規則動詞：sie wissen。', 'ohne + 第4格；Worte（話語）是複數，這裡不加冠詞。', 'was der andere meint：從句，動詞 meint 放最後。'])],
  side=[
   ('Das WIR umarmt die beiden.', 'WIR 抱住他們兩個。', ['umarmen 是不可分動詞：umarmt。', 'die beiden = 那兩個人。']),
   ('Das WIR liebt Tee und Kuchen.', 'WIR 愛喝茶、吃蛋糕。', ['lieben → es liebt。', 'Tee、Kuchen 是泛指，不加冠詞。']),
   ('Es mag Blumen und hat Zauberkräfte.', '它喜歡花，還有魔法的力量。', ['mögen 是不規則：es mag。', 'Zauberkräfte = Zauber（魔法）+ Kraft（力量）的複數：a 變 ä，加 -e。']),
   ('Es wohnt in einem Haus im Herzen.', '它住在心裡的一間小屋。', ['wohnen in + 第3格。im = in dem。', 'das Herz → dem Herzen。']),
   ('Mit dem WIR ist alles nur halb so schlimm.', '有 WIR，什麼事都只有一半那麼糟。', ['mit + 第3格（dem WIR）。', 'halb so schlimm = 只有一半那麼糟。nur = 只有。'])],
  words=[('verbinden', '連接、結合', 'verbinden', ''), ('verstehen', '了解', 'verstehen', ''), ('das Wort', '詞、話', 'Wort', '複數 die Wörter＝單字；die Worte＝話語'),
         ('der Tee', '茶', 'Tee', ''), ('der Kuchen', '蛋糕', 'Kuchen', ''), ('die Zauberkraft', '魔法的力量', 'Zauberkraft', ''), ('schlimm', '糟糕的', 'schlimm', ''), ('halb', '一半的', 'halb', '')]),

 dict(zh='有 WIR 更勇敢', icon=13,
  main=[
   ('Mit dem WIR haben Ben und Emma keine Angst.', '有 WIR 在，Ben 和 Emma 就不害怕。', ['Angst haben = 害怕；否定用 keine（Angst 是陰性名詞，沒有冠詞時否定用 keine）。', 'mit + 第3格（dem WIR）。']),
   ('Zusammen können sie sogar ein Ungeheuer besiegen.', '一起，他們甚至能打敗一隻大怪獸。', ['können + 原形動詞：原形 besiegen 放句尾。', 'sogar = 甚至。Zusammen 在句首，所以 können sie。'])],
  side=[
   ('Das Ungeheuer ist groß und rot und hat spitze Zähne.', '怪獸又大又紅，有尖尖的牙齒。', ['der Zahn → die Zähne（複數：a 變 ä）。', 'spitze Zähne：複數，形容詞加 -e。']),
   ('Es schläft, und die beiden stehen vor ihm.', '它在睡覺，兩人站在它前面。', ['schlafen 是不規則：es schläft。', 'vor + 第3格；es 的第3格是 ihm。'])],
  words=[('die Angst', '害怕、恐懼', 'aŋst', ''), ('das Ungeheuer', '怪獸', 'Ungeheuer', ''), ('besiegen', '打敗', 'besiegen', ''), ('der Zahn', '牙齒', 'ˈtsaːn', '複數 die Zähne'),
         ('spitz', '尖的', 'ʃpɪts', ''), ('schlafen', '睡覺', 'ˈʃlaːfn̩', '')]),

 dict(zh='一起冒險', icon=9,
  main=[('Zusammen mit dem WIR erleben Ben und Emma tolle Abenteuer.', '和 WIR 在一起，Ben 和 Emma 經歷了很棒的冒險。',
         ['zusammen mit + 第3格（dem WIR）。', 'erleben 是不可分動詞（經歷）。', 'tolle Abenteuer：複數，沒有冠詞，形容詞加 -e。'])],
  side=[
   ('Sie fahren mit einem U-Boot unter Wasser.', '他們坐潛水艇在水下。', ['mit + 第3格：ein U-Boot → einem U-Boot。', 'unter Wasser = 在水底下。']),
   ('Ein großer Wal schwimmt neben ihnen.', '一隻大鯨魚在他們旁邊游。', ['neben + 第3格；sie（他們）的第3格是 ihnen。', 'ein großer Wal：陽性第1格，形容詞加 -er。']),
   ('Ein großer Fisch jagt viele kleine Fische.', '一條大魚追著很多小魚。', ['jagen → er jagt。', 'der Fisch → die Fische（複數加 -e）。'])],
  words=[('das Abenteuer', '冒險', 'Abenteuer', ''), ('toll', '很棒的', 'tɔl', ''), ('erleben', '經歷', 'erleben', ''), ('das U-Boot', '潛水艇', 'uːˈboːt', ''),
         ('der Wal', '鯨魚', 'Wal', ''), ('der Fisch', '魚', 'Fisch', ''), ('das Wasser', '水', 'ˈvasɐ', '')]),

 dict(zh='下雨天也開心', icon=10,
  main=[
   ('Es regnet, aber Ben und Emma lachen.', '在下雨，但 Ben 和 Emma 在笑。', ['es regnet：講天氣的 es，沒有真正的主詞。', 'aber 連接兩個句子，後面語序不變。']),
   ('Zusammen tanzen sie im Regen.', '他們一起在雨中跳舞。', ['Zusammen 放句首，動詞排第二：tanzen sie。', 'im = in dem。der Regen → dem Regen。'])],
  side=[
   ('Das WIR schützt die beiden wie ein Regenschirm.', 'WIR 像一把傘一樣保護他們。', ['schützen → es schützt。', 'wie = 像。ein Regenschirm 是陽性第1格。']),
   ('Die anderen Menschen sehen traurig und nass aus.', '其他人看起來又難過又濕。', ['die anderen Menschen：複數，定冠詞後形容詞加 -en。', 'aussehen：sehen … aus。']),
   ('Auf der Straße sind große Pfützen.', '街上有很大的水坑。', ['auf der Straße：地點，第3格。', 'große Pfützen 是複數主詞，所以用 sind。'])],
  words=[('der Regen', '雨', 'Regen', ''), ('lachen', '笑', 'lachen', ''), ('tanzen', '跳舞', 'tanzen', ''), ('der Regenschirm', '雨傘', 'Regenschirm', ''), ('die Pfütze', '水坑', 'Pfütze', ''), ('nass', '濕的', 'nass', ''), ('traurig', '難過的', 'traurig', '')]),

 dict(zh='困難變容易', icon=11,
  main=[
   ('Mit dem WIR sind schwere Aufgaben viel leichter.', '有 WIR，困難的事輕鬆多了。', ['leichter = leicht 的比較級（加 -er）。viel leichter = 容易得多。', 'schwere Aufgaben：複數，形容詞加 -e。']),
   ('Ben und Emma schieben zusammen einen schweren Schrank.', 'Ben 和 Emma 一起推一個很重的櫃子。', ['einen schweren Schrank：陽性第4格，ein → einen，形容詞加 -en。'])],
  side=[
   ('Der Schrank ist gelb und sehr schwer.', '櫃子是黃色的，很重。', ['sehr + 形容詞 = 很…。']),
   ('Zu zweit schmecken auch Kekse doppelt so gut.', '兩個人一起，連餅乾都好吃兩倍。', ['zu zweit = 兩個人一起。', 'schmecken 的主詞是 Kekse（複數），所以是 schmecken。', 'doppelt so gut = 好兩倍。'])],
  words=[('die Aufgabe', '任務、作業', 'Aufgabe', ''), ('schwer', '重的、困難的', 'ʃveːɐ̯', ''), ('leicht', '輕的、容易的', 'leicht', '比較級 leichter'), ('der Schrank', '櫃子', 'ʃʁaŋk', ''),
         ('schieben', '推', 'ˈʃiːbn̩', ''), ('der Keks', '餅乾', 'Keks', ''), ('schmecken', '嚐起來…', 'schmecken', '')]),

 dict(zh='吵架了', icon=12,
  main=[
   ('Manchmal ist es nicht leicht für das WIR.', '有時候，WIR 並不好過。', ['es ist nicht leicht für + 第4格 = 對…來說不容易。']),
   ('Ben und Emma streiten sich und rufen böse Wörter.', '兩個人吵架，大喊難聽的話。', ['sich streiten = 吵架（反身動詞）。', 'böse Wörter：複數，形容詞加 -e。Wörter = 單字，所以這裡指「一個一個的話」。']),
   ('Das WIR wird schwach und klein. Es bekommt Bauchschmerzen.', 'WIR 變得虛弱又小，還肚子痛。', ['werden + 形容詞 = 變得…。', 'bekommen = 得到、產生。Bauchschmerzen 只用複數。']),
   ('Am Ende ist das WIR ganz verschwunden.', '最後，WIR 完全消失了。', ['ist verschwunden：現在完成式（sein + 過去分詞），表示「已經不見了」。', 'am Ende = 最後。'])],
  side=[
   ('Ben und Emma sind wütend und rufen laut.', '兩人很生氣，大聲叫喊。', ['wütend = 生氣的。laut = 大聲。']),
   ('Das WIR steht in der Mitte und hört alles.', 'WIR 站在兩人中間，什麼都聽到了。', ['in der Mitte = 在中間（die Mitte 第3格）。']),
   ('Die Wörter sind wie schwarze Wolken.', '那些話像黑色的雲。', ['wie = 像。schwarze Wolken：複數，形容詞加 -e。'])],
  words=[('streiten', '吵架', 'streiten', ''), ('schwach', '虛弱的', 'schwach', ''), ('verschwinden', '消失', 'verschwinden', '過去分詞 verschwunden'), ('die Bauchschmerzen', '肚子痛（只有複數）', 'Bauchschmerzen', ''),
         ('wütend', '生氣的', 'ˈvyːtn̩t', ''), ('laut', '大聲的', 'laʊ̯t', '')]),

 dict(zh='沒有 WIR 的世界', icon=4,
  main=[
   ('Ohne das WIR sieht die Welt grau aus.', '沒有 WIR，世界看起來灰灰的。', ['ohne + 第4格。aussehen 是可分動詞：sieht … aus。', 'grau aussehen = 看起來灰灰的。']),
   ('Es regnet, der Wind ist kalt, und Ben und Emma sind allein.', '下雨、風很冷，Ben 和 Emma 都很孤單。', ['三個完整的句子用逗號和 und 連在一起。', 'allein = 一個人、孤單。']),
   ('Sie vermissen das WIR sehr.', '他們非常想念 WIR。', ['vermissen + 第4格 = 想念不在身邊的人。', 'sehr = 非常。'])],
  side=[
   ('Emma sitzt am Fenster und schaut hinaus.', 'Emma 坐在窗邊往外看。', ['am = an dem（在…旁邊）。', 'hinausschauen 是可分動詞：schaut … hinaus。']),
   ('Ben geht allein im Regen.', 'Ben 一個人走在雨中。', ['allein = 一個人。im Regen = 在雨裡。']),
   ('Am Zaun hängen Zettel: Das WIR ist vermisst.', '圍牆上貼著紙條：WIR 不見了。', ['am Zaun = an dem Zaun。hängen（掛著）用複數：Zettel 是複數。', 'vermisst = 失蹤的、找不到的。'])],
  words=[('grau', '灰色的', 'grau', ''), ('kalt', '冷的', 'kalt', ''), ('allein', '一個人', 'allein', ''), ('vermissen', '想念', 'fɛɐ̯ˈmɪsn̩', ''), ('der Zaun', '圍牆、籬笆', 'tsaʊ̯n', ''),
         ('der Zettel', '紙條', 'ˈtsɛtl̩', ''), ('das Fenster', '窗戶', 'Fenster', '')]),

 dict(zh='各找各的', icon=5,
  main=[
   ('Ben und Emma suchen das WIR, aber jeder sucht allein.', '兩人都在找 WIR，可是各找各的。', ['jeder = 每個人（這裡是「各自」）。', 'aber 連接兩個句子。']),
   ('Allein finden sie das WIR nicht.', '一個人是找不到 WIR 的。', ['Allein 放句首，動詞排第二：finden sie。', 'nicht 表示否定。'])],
  side=[
   ('Ben gräbt ein großes Loch im Sand.', 'Ben 在沙地裡挖一個大洞。', ['graben 是不規則：er gräbt（a 變 ä）。', 'im Sand = in dem Sand。']),
   ('Zwischen den beiden ist ein gelbes Band.', '兩人之間有一條黃色的帶子。', ['zwischen + 第3格（den beiden）= 在…之間。', 'ein gelbes Band：中性第1格，形容詞加 -es。']),
   ('Im Hintergrund sieht man eine Rutsche.', '後面可以看到一個溜滑梯。', ['man sieht = 一般來說看得到（man = 人們）。', 'im Hintergrund = 在背景。'])],
  words=[('suchen', '找', 'suchen', ''), ('allein', '一個人', 'allein', ''), ('graben', '挖', 'graben', 'er gräbt'), ('das Loch', '洞', 'Loch', ''), ('der Sand', '沙', 'zant', ''),
         ('die Rutsche', '溜滑梯', 'Rutsche', ''), ('zwischen', '在…之間', 'ˈtsvɪʃn̩', '')]),

 dict(zh='一起努力', icon=6,
  main=[
   ('Nur zusammen können sie das WIR wiederfinden.', '只有一起，才能把 WIR 找回來。', ['Nur zusammen 放在句首，所以動詞排第二：können sie。', 'können + 原形：wiederfinden 放句尾（wieder = 再，finden = 找到）。']),
   ('Sie malen Bilder und schreiben Zettel für das WIR.', '他們畫圖，寫紙條給 WIR。', ['für + 第4格。malen、schreiben 都是 sie（他們）的形態，字尾 -en。'])],
  side=[
   ('Auf den Zetteln steht: Du fehlst uns! Komm zurück! Es tut uns leid.', '紙條上寫著：我們想你！回來！對不起。',
    ['auf den Zetteln：複數第3格，名詞加 -n。', 'Du fehlst uns：fehlen + 第3格，「你不在，我們想你」。', 'Komm zurück：命令句，zurückkommen 是可分動詞。', 'Es tut uns leid = 我們很抱歉（leid tun + 第3格）。']),
   ('Auf den Zetteln sind Herzen, Wolken und Blumen.', '紙條上有愛心、雲朵和花。', ['sind + 複數主詞。das Herz → die Herzen。']),
   ('Das Wort Sorry steht auf vielen Zetteln.', '很多紙條上都寫著 Sorry。', ['auf vielen Zetteln：複數第3格。'])],
  words=[('wiederfinden', '再找到、找回', 'wiederfinden', ''), ('malen', '畫（上色）', 'malen', ''), ('der Zettel', '紙條', 'ˈtsɛtl̩', ''), ('fehlen', '缺少、想念', 'fehlen', 'Du fehlst mir = 我想你'),
         ('leidtun', '感到抱歉', 'leidtun', 'Es tut mir leid'), ('zurückkommen', '回來', 'zurückkommen', ''), ('die Entschuldigung', '道歉', 'Entschuldigung', '')]),

 dict(zh='WIR 回來了', icon=2,
  main=[
   ('Zusammen finden sie das WIR wieder.', '一起，他們把 WIR 找回來了。', ['wiederfinden 是可分動詞：finden … wieder。']),
   ('Es hat sich ganz klein in einer Ecke im Herzen versteckt.', '它把自己縮得小小的，躲在心裡的一個角落。', ['hat sich versteckt：現在完成式（haben + 過去分詞），sich = 自己。', 'in einer Ecke：in + 第3格（die Ecke → einer Ecke）。', 'ganz klein = 小小的。']),
   ('Ben und Emma bitten es: Bitte komm zurück!', 'Ben 和 Emma 請求它：請回來！', ['bitten + 第4格 = 請求。', 'Komm zurück：命令句；zurückkommen 可分。']),
   ('Endlich kommt das WIR aus seinem Versteck.', '終於，WIR 從藏身的地方出來了。', ['Endlich 放句首，動詞排第二：kommt。', 'aus + 第3格：das Versteck → seinem Versteck（seinem = 它的）。'])],
  side=[
   ('Ben und Emma klettern auf einer Leiter ins Herz.', 'Ben 和 Emma 爬梯子進到心裡。', ['auf einer Leiter：地點，第3格。', 'ins = in das，表示「進去」（方向用第4格）。']),
   ('Das WIR hält ein Schild mit einem Bild von Ben und Emma.', 'WIR 舉著一塊牌子，上面畫著 Ben 和 Emma。', ['halten 是不規則：es hält（a 變 ä）。', 'mit einem Bild：mit + 第3格。']),
   ('Im Haus im Herzen ist es gemütlich.', '心裡的小屋很舒服。', ['es ist gemütlich：es 是形式上的主詞，意思是「（這裡）很舒適」。'])],
  words=[('sich verstecken', '躲起來', 'fɛɐ̯ˈʃtɛkn̩', ''), ('die Ecke', '角落', 'Ecke', ''), ('bitten', '請求', 'ˈbɪtn̩', ''), ('endlich', '終於', 'ˈɛntlɪç', ''),
         ('das Versteck', '藏身處', 'fɛɐ̯ˈʃtɛk', ''), ('klettern', '爬', 'ˈklɛtɐn', ''), ('das Schild', '牌子', 'ʃɪlt', ''), ('gemütlich', '舒適的', 'gemütlich', '')]),

 dict(zh='照顧虛弱的 WIR', icon=1,
  main=[
   ('Das WIR ist noch schwach und zittert.', 'WIR 還很虛弱，在發抖。', ['noch = 還。zittern → es zittert。']),
   ('Ben und Emma pflegen es mit Tee und spannenden Geschichten.', '他們用茶和好聽的故事照顧它。', ['pflegen = 照顧。mit + 第3格。', 'spannenden Geschichten：複數第3格，形容詞加 -en。']),
   ('Bald ist das WIR wieder gesund.', '很快，WIR 又恢復健康了。', ['bald = 很快。wieder gesund = 又健康了。'])],
  side=[
   ('Das WIR liegt in einem Bett und hat eine Wärmflasche.', 'WIR 躺在床上，抱著一個熱水袋。', ['liegen in + 第3格（地點）。', 'eine Wärmflasche：陰性第4格。']),
   ('Ben liest ein Buch vor, und Emma ist als Pirat verkleidet.', 'Ben 念書給它聽，Emma 打扮成海盜。', ['lesen 是不規則：er liest；vorlesen 可分：liest … vor。', 'als Pirat verkleidet = 扮成海盜。']),
   ('Auf dem Boden liegen Spielzeug, Bücher und eine Teekanne.', '地上有玩具、書和一個茶壺。', ['auf dem Boden：地點，第3格。', 'das Buch → die Bücher（複數：u 變 ü，加 -er）。'])],
  words=[('zittern', '發抖', 'ˈtsɪtɐn', ''), ('pflegen', '照顧', 'ˈpfleːɡn̩', ''), ('gesund', '健康的', 'gesund', ''), ('die Wärmflasche', '熱水袋', 'ˈvɛʁmˌflaʃə', ''), ('das Bett', '床', 'bɛt', ''),
         ('vorlesen', '念給…聽', 'ˈfoːɐ̯ˌleːzn̩', ''), ('verkleiden', '裝扮', 'fɛɐ̯ˈklaɪ̯dn̩', ''), ('das Spielzeug', '玩具', 'ˈʃpiːlˌtsɔɪ̯k', ''), ('die Teekanne', '茶壺', 'ˈteːˌkanə', '')]),

 dict(zh='慢慢長大', icon=14,
  main=[
   ('Ben und Emma geben dem WIR Zeit und sagen nette Sachen.', 'Ben 和 Emma 給 WIR 時間，還說了好聽的話。', ['geben + 第3格（dem WIR）+ 第4格（Zeit）：給誰什麼。', 'nette Sachen：複數，形容詞加 -e。']),
   ('Jeden Tag wird das WIR ein Stück größer.', '每一天，WIR 都長大一點。', ['jeden Tag = 每天（時間用第4格）。', 'größer = groß 的比較級（加 -er，o 變 ö）；ein Stück = 一點點。'])],
  side=[
   ('Ben und Emma essen zusammen Kuchen.', 'Ben 和 Emma 一起吃蛋糕。', ['essen 是 sie（他們）的形態。Kuchen 泛指，不加冠詞。']),
   ('Sie teilen Erinnerungen, Träume und Humor.', '他們分享回憶、夢想和幽默。', ['der Traum → die Träume（複數：a 變 ä，加 -e）。', 'Humor 不可數，不加冠詞。']),
   ('Sie sagen: Es tut mir leid. Ich verzeihe dir.', '他們說：對不起。我原諒你。', ['leid tun + 第3格（mir）。', 'verzeihen + 第3格（dir = 給你）。'])],
  words=[('die Zeit', '時間', 'tsaɪ̯t', ''), ('größer', '更大', 'ˈɡʁøːsɐ', 'groß 的比較級'), ('die Erinnerung', '回憶', 'Erinnerung', ''), ('der Traum', '夢、夢想', 'tʁaʊ̯m', '複數 die Träume'),
         ('der Humor', '幽默', 'huˈmoːɐ̯', ''), ('verzeihen', '原諒', 'fɛɐ̯ˈtsaɪ̯ən', ''), ('teilen', '分享', 'ˈtaɪ̯lən', '')]),

 dict(zh='比以前更強', icon=0,
  main=[
   ('Jetzt ist das WIR stärker als je zuvor.', '現在，WIR 比以前任何時候都強。', ['stärker = stark 的比較級（a 變 ä，加 -er）。', 'als = 比。je zuvor = 以前任何時候。']),
   ('Ben und Emma sitzen auf der Hantel, und das WIR hebt sie hoch.', 'Ben 和 Emma 坐在啞鈴上，WIR 把他們舉起來。', ['auf der Hantel：地點，第3格。', 'hochheben 是可分動詞：hebt … hoch。sie = 他們（第4格）。'])],
  side=[
   ('Auf den Gewichten steht das Wort ICH.', '啞鈴片上寫著「ICH」（我）。', ['das Gewicht → die Gewichte；auf den Gewichten 是複數第3格，加 -n。']),
   ('Beide lachen und sind stolz.', '兩個人都在笑，覺得很驕傲。', ['beide = 兩個都。stolz = 驕傲的。']),
   ('Auf dem Kopf vom WIR wachsen kleine Blumen.', 'WIR 頭上長著小花。', ['vom = von dem。auf dem Kopf = 在頭上。wachsen 的主詞是複數 Blumen。'])],
  words=[('stärker', '更強', 'ˈʃtɛʁkɐ', 'stark 的比較級'), ('die Hantel', '啞鈴', 'Hantel', ''), ('das Gewicht', '重量、啞鈴片', 'ɡəˈvɪçt', ''), ('hochheben', '舉起', 'hochheben', ''), ('stolz', '驕傲的', 'ʃtɔlts', '')]),
]
