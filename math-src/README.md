# 數學小練習（小一／小二）

給小一、小二的互動數學練習網站。每一道題，包括家長自訂或產生的新題，都會依算式即時畫出 SVG 圖解和逐步動畫。

- 網址：https://ifishlin.github.io/der-die-das/math/
- 原始碼：這個資料夾 `math-src/`
- 建置結果：`../math/`（GitHub Pages 直接提供這個資料夾）

不需要登入、沒有後端、不用任何付費 API。進度用 `localStorage` 存在同一台裝置上，小一、小二、小二乘法挑戰分開存。

## 功能

| | 小一 | 小二 |
|---|---|---|
| 內建題庫 | 20 題加減法（都在 20 以內） | 20 題加減法（100 以內）＋ 10 題乘法挑戰 |
| 圖解 | 20 以內：小圓點＋兩個十格框（湊十、跨十）；超過 20：十位積木 | 十位積木＋個位小方塊（進位、退位）；乘法用分組點陣 |
| 產生新題 | 加／減／加減混合，上限最多 100 | 加／減／加減混合／乘法／加減乘混合，加減上限最多 100，乘法因數最多 10 |
| 自訂一道題 | `+`、`−` | `+`、`−`、`×` |

作答：大字算式、數字鍵盤（也可以用鍵盤輸入，Enter 送出）、兩級提示、看解說、播放／暫停／上一步／下一步／重播、練習結束的統計和「只重練錯題」。

## 本機開發

需要 Node.js 18 以上（在 Node 20.12 上開發和測試）。

```bash
cd math-src
npm install
npm run dev      # 開發伺服器 http://localhost:5173/
npm run test     # Vitest 單元測試與互動測試
npm run build    # 型別檢查＋建置到 ../math/
```

## 部署

這個網站和 der-die-das 字卡網站放在同一個 repo，GitHub Pages 設定是 **Settings → Pages → Deploy from a branch → main / (root)**。

所以部署方式是：**在本機 `npm run build`，把 `../math/` 一起 commit 並 push 到 main。** 大約 1 分鐘後網站更新。

> 規格原本建議用 GitHub Actions 部署到 Pages。但 Pages 一個 repo 只能有一種來源，改成 Actions 會取代整個 der-die-das 網站，所以這裡改成提交建置結果。`.github/workflows/math-ci.yml` 仍會在 `math-src/` 有變動時自動跑測試和建置檢查（不部署）。

`vite.config.ts` 的 `base` 在建置時預設是 `'./'`（相對路徑），所以放在任何子路徑（`/der-die-das/math/`、`/<repo>/`、或 `<user>.github.io` 根目錄）都能正常載入。如果需要絕對路徑，可以設定 `VITE_BASE_PATH=/some/path/ npm run build`。輸出資料夾也可以用 `VITE_OUT_DIR` 改。

如果以後想獨立成自己的 repo 並用 GitHub Actions 部署：把 `math-src/` 內容搬到新 repo 根目錄，設定 `VITE_OUT_DIR=dist`，再加上官方的 `actions/upload-pages-artifact` 和 `actions/deploy-pages` 工作流程即可。

## 程式結構

```text
src/
  math/            純邏輯，不含畫面
    types.ts         題目型別、答案計算（答案一律程式算，不手寫）
    presets.ts       內建題庫（小一 20、小二 20、乘法 10）
    validation.ts    年級規則與自訂題驗證
    generator.ts     產生新題（不重複、平均分配運算、條件不足會明確回報）
    scene.ts         場景資料結構（有哪些點／積木、在哪、有沒有被拿走）
    explanations.ts  generateExplanation(question) → 逐步場景；getHints(question)
  visuals/         SVG 繪圖，只負責把場景畫出來
    DotsScene.tsx  TenFrame.tsx  BaseTenScene.tsx  MultiplicationScene.tsx
  hooks/useAnimationSteps.ts   播放／暫停／逐步控制；換題時取消舊的計時器
  components/      畫面元件（首頁、年級選單、作答卡、播放器、表單、結算）
  app/             App 外殼、樣式、localStorage 存取
  tests/           Vitest 測試
```

資料、運算邏輯、解說步驟和 SVG 繪圖是分開的：`explanations.ts` 只產生「場景狀態」，不含任何座標；`visuals/` 決定怎麼排版。每個點／積木有固定 id，換步驟時同一個 id 的物件會用 CSS transition 移動或淡出，所以看得出「哪幾個被移過去／被拿走」。

## 怎麼擴充

- **增加內建題目**：在 `src/math/presets.ts` 的表格加一列 `[左, '+', 右, '說明']`。測試會檢查題數（小一、小二各 20 題）和每題是否合法；改題數時也要改 `src/tests/presets.test.ts`。
- **改年級上限**：`src/math/validation.ts` 的 `LIMITS`。目前小一、小二加減法都是 100 以內（使用者要求把小一的 20 限制拿掉）。十格框只畫得下 20 個點，所以 `types.ts` 的 `usesTenFrames()` 決定：小一題目的數字和答案都在 20 以內才用十格框，否則改用十位積木。
- **增加新的動畫類型**（例如除法）：在 `scene.ts` 加一種 `SceneState`，在 `explanations.ts` 產生步驟，在 `visuals/` 加一個元件，並在 `AnimationPlayer.tsx` 的 `SceneView` 接上。
- 家長不用改程式碼，也能在網頁上「產生新題」或「自訂一道題」。

## 測試

`npm run test` 包含：

- 題庫題數、答案正確、範圍、小一沒有乘法、id 不重複
- 自訂題驗證（`8+5`、`15−8` 可；`19+8`、小一 `3×4`、`52−70` 不可）
- 產生器：各種設定都合法、不重複、難度條件確實成立、平均分配、題目不足和條件衝突會回報錯誤
- 動畫最後的圖：`8+5` → 13 個、`13−6` → 7 個（從原本 13 個拿走）、`37+16` → 5 條十位＋3 個個位、`52−27` → 2 條＋5 個、`100−58` → 9 條＋10 個再到 42、`3×4` → 3 組各 4 個
- 對兩個年級**所有合法題目**（超過一萬題）檢查：最後一步的圖形數量等於答案、中間步驟不會出現負數或超出格子
- 播放器：逐步、播放、暫停、重播；換題時不留下舊題的畫面或計時器
- localStorage：各年級分開存，清除一個年級不影響另一個
- 整體流程：首頁 → 小一作答 → 進度保留 → 小二自訂乘法；產生新題
