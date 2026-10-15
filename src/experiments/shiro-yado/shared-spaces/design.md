# 3階共用スペースと白の間：画像を中心にした紹介

- 対象：`/floor/3` と `/place/banquet`。白と淡い木の統一感を保ち、共用フロアの休憩・待ち合わせ、宴会場の食事・小さなお祝い・会合を紹介。
- 初期表示は新規の写真風画像。既存3Dは開閉式の任意表示へ移動し、開くまで描画しない。
- 生成画像は雰囲気のイメージであり、館内図の代わりにしない。各言語の説明から正確な配置は既存2D館内図へ案内する。
- 3階は浴場・宴会場・お手洗いの詳細と行き方、食事ページを見つけやすく配置。
- 保存先：`public/shiro-yado/shared-floor-3.webp`、`public/shiro-yado/banquet-white-hall.webp`。
- 組み込みImageGenで制作。1536×1024のまま配信用WebPへ変換。

## 最終生成プロンプト

### shared-floor-3

Use case: photorealistic-natural. Architectural editorial image for the fictional Japanese island inn Shiro no Yado. Consistent bright warm-white plaster, pale oak timber, soft natural linen, calm clean inviting boutique hospitality, photoreal materials. Landscape 3:2 1536x1024, straight verticals, eye-level 28mm, realistic small three-story inn not grand luxury palace. No people, no text or logos, no watermark, no signage that could be mistaken for a precise floor map. A third-floor shared foyer at a small Japanese inn, a useful welcoming place between a bathhouse and a dining/banquet room. Central recessed elevator doors at the back, passages on either side leading out of frame. By a generous sunlit side window a simple pale oak bench with ivory cushions, two comfortable seats and a small low table with two cups of tea; a restrained leafy plant. Bright unobstructed wide walkway and smooth light wood floor with no steps or obstacles. On one side a glimpse of soft fabric noren curtains indicating a bathhouse entrance, on the other open pale wood doors with a subtle glimpse of a dining hall. Atmosphere: pause after a warm bath, meet your family before dinner, practical and quietly enjoyable. Realistic intimate scale, no spa pool, no reception desk, no beds, no elaborate vending machines. Concept image only; not an overhead floor plan.

### banquet-white-hall

Use case: photorealistic-natural. Architectural editorial image for the fictional Japanese island inn Shiro no Yado. Consistent bright warm-white plaster, pale oak timber, soft natural linen, calm clean inviting boutique hospitality, photoreal materials. Landscape 3:2 1536x1024, straight verticals, eye-level 28mm, realistic small three-story inn not grand luxury palace. No people, no text or logos, no watermark, no signage that could be mistaken for a precise floor map. An 80-square-meter multipurpose dining and small banquet room named White Hall. Warm-white walls, pale oak floor and furniture, broad windows with translucent white curtains, gentle island-town greenery view, soft afternoon daylight. Several simple long rectangular dining tables arranged into small welcoming groups with comfortable ivory-upholstered oak chairs, clear generous circulation aisles. White ceramic place settings and tea cups for an intimate family or friends' gathering, discreet small vases with seasonal green branches. Suggest a room that can accommodate up to 40 people in different configurations without needing every seat visible. A neatly retracted presentation screen discreetly at the far end, no stage, no wedding decorations, no giant chandeliers. Room feels clean, flexible, cheerful and welcoming for breakfast, evening meals and little celebrations. Wide view from the entrance showing useful table arrangement and light-filled windows. No dramatic dark mood, no buffet trays, no alcohol focus.
