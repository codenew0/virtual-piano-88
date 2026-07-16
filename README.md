# Virtual Piano 88

ブラウザで演奏できる、グランドピアノ固定・A0〜C8固定の88鍵ピアノです。
画面下端いっぱいに配置された鍵盤は画面幅に合わせて伸縮します。中央は上部が浅いシアン、下部が深い青になる水中表現で、速度や方向の異なる不規則な水流が重なります。鍵を離した瞬間に、押していた時間に応じた大きさの透明な音名入りバブルが発生します。バブルは一定速度で上昇しながら、毎回ランダムに決まる複数の通過点を通って左右へ揺れます。

## 起動

AudioWorkletを利用するため、`file://` ではなくローカルサーバーから開きます。

```powershell
cd virtual-piano-88
python -m http.server 8000
```

その後、`http://localhost:8000` をブラウザで開いてください。初回のみSoundFont音源を取得するためインターネット接続が必要です。

## 操作

- 中央音域: `1`〜`0`、`Q`〜`P`、`A`〜`M`、`,`
- 低音域: `F13`〜`F24`、NumPad
- 高音域: `Ctrl + F13`〜`F24`、`Ctrl + NumPad`
- マウス・タッチ: 画面の鍵盤を直接押す

ショートカット割り当ては既存の `piano` プロジェクトと同じです。

## 音源

既存 `piano` プロジェクトと同じ Signal Factory SoundFont と SpessaSynth 再生エンジンを使用しています。関連ライセンス表記は生成済みJavaScript内および `LICENSE` を参照してください。

## ビルドとデプロイ

```powershell
npm run check
npm run build
```

Cloudflare Pagesのプロジェクト名は `virtual-piano-88` です。公開ファイルは `dist/` に生成されます。
