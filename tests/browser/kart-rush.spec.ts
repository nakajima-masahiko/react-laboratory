import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`abyss race ${viewport.width}x${viewport.height} / ${colorScheme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ colorScheme });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("#/experiments/kart-rush");
      const game = page.getByTestId("abyss-rush");
      await expect(game.locator("canvas")).toBeVisible();
      await page.getByRole("button", { name: "軽量", exact: true }).click();
      await page.getByLabel("難易度").selectOption("easy");
      await page.getByRole("button", { name: "レースをはじめる" }).click();
      await expect(game).toHaveAttribute("data-phase", "racing");
      await expect
        .poll(async () => Number(await page.getByTestId("speed").textContent()))
        .toBeGreaterThan(20);
      await page.getByRole("button", { name: "一時停止", exact: true }).click();
      await expect(
        page.getByRole("dialog", { name: "一時停止", exact: true }),
      ).toBeVisible();
      await expect(game).toHaveAttribute("data-phase", "paused");
      await page
        .getByRole("button", { name: "レースに戻る", exact: true })
        .click();
      await expect(game).toHaveAttribute("data-phase", "racing");
      await page.getByRole("button", { name: "操作方法", exact: true }).click();
      await expect(
        page.getByRole("dialog", { name: "操作ガイド" }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "スタート画面へ", exact: true })
        .click();
      await expect(game).toHaveAttribute("data-phase", "ready");
      if (viewport.width <= 900) {
        await page.getByRole("button", { name: "レースをはじめる" }).click();
        await expect(
          page.getByRole("button", { name: "左へハンドル", exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "ドリフト", exact: true }),
        ).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("tablet can steer and drift with two fingers, then release into boost", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
    baseURL: test.info().project.use.baseURL,
  });
  const page = await context.newPage();
  try {
    await page.goto("#/experiments/kart-rush");
    await page.getByRole("button", { name: "軽量", exact: true }).click();
    await page.getByRole("button", { name: "レースをはじめる" }).click();
    await expect
      .poll(async () => Number(await page.getByTestId("speed").textContent()))
      .toBeGreaterThan(60);
    const left = await page
      .getByRole("button", { name: "左へハンドル", exact: true })
      .boundingBox();
    const drift = await page
      .getByRole("button", { name: "ドリフト", exact: true })
      .boundingBox();
    expect(left).not.toBeNull();
    expect(drift).not.toBeNull();
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { id: 1, x: left!.x + left!.width / 2, y: left!.y + left!.height / 2 },
        {
          id: 2,
          x: drift!.x + drift!.width / 2,
          y: drift!.y + drift!.height / 2,
        },
      ],
    });
    await expect(
      page.getByText("RELEASE TO BOOST", { exact: true }),
    ).toBeVisible();
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(page.getByText("BOOST ACTIVE", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "操作方法", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "操作ガイド" }),
    ).not.toBeVisible();
    await expect(page.getByTestId("abyss-rush")).toHaveAttribute(
      "data-phase",
      "racing",
    );
  } finally {
    await context.close();
  }
});
