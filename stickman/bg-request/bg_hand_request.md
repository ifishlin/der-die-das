# 背景描述 request（2026-11-13）

用途：把每格的背景描述交給 Claude（主對話開的幫手）逐格看地圖手寫，取代程式拼的背景（map_background.py，已停用）。
2026-11-13 第一次用：分 4 組平行寫第 1、3、5–12、15 幕（地圖沒改過的 11 幕，共 133 格）。四組的 request 只有【你負責的幕】和【這一幕要注意的】不同，其他完全一樣。

| 組 | 幕 | 地圖 | 這一幕要注意的 |
|---|---|---|---|
| 1 | 1、3、5、6、15 | dusk、campus_hut、（無）、arrive、（無） | 第 5、15 幕沒有地圖，照劇本 S03-1、S10-6 的畫面描述寫 |
| 2 | 7 | river | 舊 prompt 有 10 格把河寫成 "forest behind"，河的位置一定要照地圖和相機方向寫對 |
| 3 | 8、9、11 | path、riverbed、dusk | — |
| 4 | 10、12 | clearing、arrive_dusk | 跟入鏡角色同一個的物件不要寫（例如甲龍本身由 prompt 負責） |

---

你要幫一部 2D 火柴人動畫（Google Flow 生圖）逐格「手寫」背景描述。一律用繁體中文回報。不要用程式產生句子：每一格你都要自己看資料、自己寫。可以用工具讀檔、看圖。

## 你負責的幕
（每組不同，見上表）

## 資料
- 分鏡：`docs/requests/EP1-NN_v6_reply_claude.json`。看每格的 id、shot_size、azimuth、angle、camera（cell＝相機在地圖哪一格、look_at、height_m、distance_m）、subject、composition、action、cast、prompt；也看最上面的 blocking（每個角色在每個時間點 t 站哪一格、面朝哪裡）。
- 地圖：`episodes/001_trex_run/maps/<名字>.json`：grid（地形格子，欄 A、B、C…，列 1、2、3…，北在上），types（每種地形的中英文名稱），objects（cell 是左上角，w 寬、h 高；有 only_shots 的物件只在那些格出現），desc、setting、time、sun、labels。預覽圖 `maps/preview/<名字>.png`。
- 每格地圖小圖（黑框＝相機，黃色扇形＝鏡頭看出去的範圍，圓點＝角色位置）：`stickman/storyboard-v6/img/map_EP1-NN-MM.jpg`。扇形只是參考，你要自己判斷鏡頭看得到什麼。
- 範本（使用者認可的寫法）：`docs/requests/EP1-02_bg_hand.json` 的 EP1-02-01。

## 寫法（一定要遵守）
1. 像在描述一張照片，用直白的句子。先講鏡頭對著哪個方向、那邊是什麼，再講畫面裡有什麼；東西用彼此的關係和畫面左右定位。最後講光線從哪裡來、畫面裡看不到的重要地標（一句就好）。
2. 不寫東南西北（Flow 沒有地圖）。地圖方位要換算成畫面左／右／正前方／鏡頭後面。
3. 不寫幾公尺，用「很近」「遠處」「河對岸」這種說法。
4. 不用「前景／中景／背景」「畫面最後面」這種分層詞。
5. 特寫、局部鏡頭只寫鏡頭裡真的看得到的那一小塊。
6. 不要加地圖上沒有的東西，不要寫角色（角色由 prompt 負責）。地圖和 prompt 衝突時照地圖寫，並在 conflict 欄寫出來。
7. 光線照地圖 time、sun，換算成相對鏡頭的方向。
8. 英文版和中文同一個意思，以 "Background:" 開頭，給 Flow 用。

## 交件
每幕一個檔案 `docs/requests/EP1-NN_bg_hand.json`：
{"_doc": "第 N 幕每格背景描述，Claude 看地圖手寫，2026-11-13", "EP1-NN-MM": {"zh": "…", "en": "Background: …", "conflict": "沒有就填空字串"}, …}
每一格都要有（包括 W 結尾的加拍格）。寫完自己檢查：中英文都不能有 north/south/east/west/東/西/南/北、公尺數、foreground/background（開頭 "Background:" 除外）/前景/中景/背景。
最後回報每幕寫了幾格、有哪些 conflict。不要修改其他檔案。
