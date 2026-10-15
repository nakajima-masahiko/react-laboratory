# 白の宿のお食事：制作記録

ユキノ先生の献立案、テアの利用案内案、Webデザインレビューをもとに、朝夕2つの食事を同一ページへまとめました。白い器・淡い木の食卓を共通とし、朝は窓からの光と湯気、夜は温かい光で時間帯を描き分けます。

- 保存先：`public/shiro-yado/dining-breakfast.webp`、`public/shiro-yado/dining-dinner.webp`
- 組み込みImageGenで新規制作し、1536×1024のままWebPへ配信用に変換。
- 入口：トップ、宴会場詳細、コンシェルジュ。食事ページから既存の白の間への案内へ接続。
- 料理・時間・料金は架空の設定。客室予約に含まず、食事の申込や決済、個別相談は行わないと明記。
- 朝夕へはボタンで見出しに移動・フォーカス。HashRouterでURLを壊す単独アンカーは使わない。
- 子どもの食事は構想として紹介。食物アレルギーは使用想定例と保証・相談受付の範囲を説明。

## 最終生成プロンプト

### breakfast

Use case: photorealistic-natural. Editorial food photograph for the fictional Japanese island boutique inn 'Shiro no Yado'. Warm white ceramics, pale oak tabletop, clean quiet refined Japanese hospitality, natural texture, immaculate appetizing food, realistic modest portion sizes. Landscape 3:2 1536x1024. One complete meal for ONE person, thoughtful coherent table setting, no people, no text, no logos, no watermark. Real food photography, not illustration, crisp but soft natural light, food clearly visible. Japanese breakfast, morning window light in a peaceful white dining hall with pale oak furniture softly out of focus. A rectangular light oak serving tray with small white rice bowl of freshly cooked rice, dark lacquer bowl of miso soup with tofu and green vegetables and very subtle rising steam, grilled small salmon fillet with crisp skin and lemon, three neatly sliced tamagoyaki omelet pieces, a little seasonal greens side dish, tiny Japanese pickles dish. A small ceramic tea cup and chopsticks on a simple rest beside tray. Shot from a graceful 45 degree elevated angle, three-quarter overhead, all dishes readable, generous airy margins. Fresh, nourishing, unpretentious, the kind of breakfast one looks forward to after a good night's sleep. No raw fish on breakfast tray.

### dinner

Use case: photorealistic-natural. Editorial food photograph for the fictional Japanese island boutique inn 'Shiro no Yado'. Warm white ceramics, pale oak tabletop, clean quiet refined Japanese hospitality, natural texture, immaculate appetizing food, realistic modest portion sizes. Landscape 3:2 1536x1024. One complete meal for ONE person, thoughtful coherent table setting, no people, no text, no logos, no watermark. Real food photography, not illustration, crisp but soft natural light, food clearly visible. Japanese seasonal dinner set for one guest in a peaceful white dining hall, subtle warm evening light, elegant yet intimate and attainable. A small plate of fresh white fish sashimi with shiso and a small soy sauce dish, a separate beautifully browned miso-marinated grilled fish portion, a shallow white bowl of simmered autumn vegetables with pumpkin and mushrooms, a small chawanmushi steamed egg custard cup with lid set aside, small white rice bowl, small dark lacquer clear soup bowl, tiny dessert plate with a bite-size chestnut sweet. Restrained garnishes and realistic portions, fine white and ivory ceramic plates on pale oak table, chopsticks on a rest and a warm tea cup, a few distant dining chairs blurred. Graceful 45 degree elevated camera angle, every dish distinct and visible in a coherent single-person setting. Gentle warmth and a delicious shared-evening feeling, no banquet buffet, no alcohol focus.
