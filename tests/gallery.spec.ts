import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { BoxGeometry, BufferAttribute, Group, Mesh, MeshBasicMaterial, Points, Vector3 } from "three";
import { cameraTrack, sampleTrack } from "../src/lib/gallery/journey";
import { gpuParticleGeometry } from "../src/lib/gallery/gpu-hologram";
import { createParticleSport } from "../src/lib/gallery/particle-sports";

test.use({ launchOptions: { args: [] } });
async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/gallery-enhanced/, {
    timeout: 30000,
  });
  await expect(page.locator(".gallery-loader")).toBeHidden({ timeout: 8000 });
}
async function travel(page: Page, p: number) {
  await page.evaluate(
    (p) =>
      scrollTo({
        top: (document.documentElement.scrollHeight - innerHeight) * p,
        behavior: "instant",
      }),
    p,
  );
}

test("the authored camera is continuous and reversible through its complete depth", () => {
  for (const mobile of [false, true]) {
    const track = cameraTrack(mobile),
      position = new Vector3(),
      target = new Vector3(),
      previous = new Vector3();
    let longest = 0;
    for (let i = 0; i <= 2000; i++) {
      sampleTrack(i / 2000, track, position, target);
      expect(position.distanceTo(target)).toBeGreaterThan(2);
      if (i) longest = Math.max(longest, position.distanceTo(previous));
      previous.copy(position);
    }
    expect(longest).toBeLessThan(0.6);
    sampleTrack(1, track, position, target);
    expect(position.y).toBe(-45);
    expect(position.z).toBe(-156);
  }
});

test("the GPU formation has a wide graphics-card silhouette and front and back depth", () => {
  const geometry = gpuParticleGeometry(12000);
  geometry.computeBoundingBox();
  const size = geometry.boundingBox!.getSize(new Vector3());
  expect(size.z).toBeGreaterThan(2);
  expect(size.x).toBeGreaterThan(18);
  expect(size.x).toBeGreaterThan(size.y * 2);
  const points = geometry.getAttribute("position");
  let front = 0,
    back = 0;
  for (let i = 0; i < points.count; i++) {
    if (points.getZ(i) > 1) front++;
    if (points.getZ(i) < -.75) back++;
  }
  expect(front).toBeGreaterThan(500);
  expect(back).toBeGreaterThan(500);
  geometry.dispose();
});

test("compressed model coordinates retain their shape when sampled into particles", () => {
  const geometry = new BoxGeometry(1, 2, .5);
  const source = geometry.getAttribute("position");
  const encoded = new Int16Array(source.count * 3);
  for (let i = 0; i < source.count; i++) {
    encoded.set([source.getX(i), source.getY(i), source.getZ(i)].map(v => Math.round(v * 32767)), i * 3);
  }
  geometry.setAttribute("position", new BufferAttribute(encoded, 3, true));
  const mesh = new Mesh(geometry, new MeshBasicMaterial());
  mesh.scale.set(2, 1, 1);
  const art = new Group();
  art.add(mesh);
  const cloud = createParticleSport(art, 6, 3101);
  const points = cloud.group.children[0] as Points;
  points.geometry.computeBoundingBox();
  const extent = points.geometry.boundingBox!.getSize(new Vector3());
  expect(extent.x).toBeCloseTo(3.6, 1);
  expect(extent.y).toBeCloseTo(3.6, 1);
  expect(extent.z).toBeCloseTo(.9, 1);
  points.geometry.dispose();
  (points.material as MeshBasicMaterial).dispose();
});

test("introduction, experience and projects lead to a complete resume with working links", async ({
  page,
}) => {
  const errors: string[] = [],
    oldAssets: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("request", (r) => {
    if (
      /\/(city|world|models\/courier)\/|baby-angel|nike.glb|fish.glb/.test(
        r.url(),
      )
    )
      oldAssets.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Babisan", exact: true }),
  ).toBeVisible();
  await travel(page, 0.25);
  await expect(
    page.getByRole("heading", { name: "Experience", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".depth-meter")).toHaveText("02 / 05 · Experience");
  await travel(page, 0.48);
  await expect(
    page.getByRole("heading", { name: "Projects", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore Verilly", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Verilly", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await travel(page, 0.74);
  await expect(
    page.getByRole("heading", { name: "Interests", exact: true }),
  ).toBeVisible();
  await travel(page, 1);
  const finale = page.locator(".gallery-finale");
  await expect(
    finale.getByRole("heading", { name: "My resume" }),
  ).toBeVisible();
  const image = finale.getByRole("img", {
    name: "Full-page preview of Babisan Pirapakaran’s resume",
  });
  await expect(image).toBeVisible();
  expect(
    await image.evaluate(
      (node: HTMLImageElement) => node.complete && node.naturalHeight === 1980,
    ),
  ).toBe(true);
  await expect(finale.locator("object,iframe")).toHaveCount(0);
  await expect(finale.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/NotTolerable",
  );
  await expect(
    finale.locator('a[href="mailto:babisanp@gmail.com"]'),
  ).toBeVisible();
  await expect(
    finale.getByRole("link", { name: "View resume PDF" }),
  ).toHaveAttribute("href", "/resume");
  await travel(page, 0);
  await expect(page.locator(".depth-meter")).toHaveText("01 / 05 · About");
  expect(errors).toEqual([]);
  expect(oldAssets).toEqual([]);
});

test("minimal panels preserve full experience and projects, scrolling and restored focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  const meet = page.getByRole("button", { name: "Meet Babisan", exact: true });
  await meet.click();
  const panel = page.getByRole("dialog");
  await expect(
    panel.getByRole("heading", { name: "Babisan Pirapakaran", exact: true }),
  ).toBeVisible();
  await expect(panel.locator(".full-record")).not.toHaveAttribute("open");
  await page.keyboard.press("Escape");
  await expect(meet).toBeFocused();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Experience", exact: true })
    .click();
  await panel.getByText("More details", { exact: false }).click();
  for (const name of [
    "407 ETR",
    "DevRoom",
    "Orbital Studios",
    "Polaris Studios",
    "Anti-cheat & exploit prevention",
    "200M+",
  ])
    await expect(panel).toContainText(name);
  const before = await page.evaluate(() => scrollY);
  await panel.hover();
  await page.mouse.wheel(0, 700);
  await expect
    .poll(() => panel.evaluate((e) => e.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await page.keyboard.press("Escape");
  await travel(page, 0.48);
  await page
    .getByRole("button", { name: "Explore projects", exact: true })
    .click();
  await expect(panel).toContainText("DPDK");
  await panel.getByRole("button", { name: "Behaviourly", exact: true }).click();
  await expect(panel).toContainText("Whisper");
});

test("multilingual greetings finish before the loading curtain opens into the live exhibit", async ({page}) => {
  await page.addInitScript(() => {
    const trace = { curtainEnd: 0, firstMaterial: 0, partialFrames: 0 };
    (window as unknown as { iceArrival: typeof trace }).iceArrival = trace;
    document.addEventListener("transitionend", (event) => {
      if (event.target instanceof HTMLElement && event.target.classList.contains("gallery-loader") && event.propertyName === "transform")
        trace.curtainEnd = performance.now();
    }, true);
    const locations = new WeakSet<WebGLUniformLocation>();
    const lookup = WebGL2RenderingContext.prototype.getUniformLocation;
    WebGL2RenderingContext.prototype.getUniformLocation = function(program, name) {
      const location = lookup.call(this, program, name);
      if (name === "iceReveal" && location) locations.add(location);
      return location;
    };
    const upload = WebGL2RenderingContext.prototype.uniform1f;
    WebGL2RenderingContext.prototype.uniform1f = function(location, value) {
      if (location && locations.has(location) && value > 0 && value < .999) {
        trace.firstMaterial ||= performance.now();
        trace.partialFrames++;
      }
      upload.call(this, location, value);
    };
  });
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.goto("/");
  const loader=page.getByRole("region",{name:"Loading interactive portfolio"});
  await expect(loader).toBeVisible();
  const words = page.locator(".loader-content");
  for (const [lang, text] of [["ta", "வணக்கம்"], ["zh-CN", "你好"], ["es", "Hola"], ["ar", "مرحبا"], ["hi", "नमस्ते"], ["fr", "Bonjour"]]) {
    await expect(words).toHaveAttribute("data-language", lang);
    await expect(words.locator(`[lang="${lang}"]`)).toHaveText(text);
    await expect(page.locator("html")).not.toHaveClass(/gallery-enhanced/);
  }
  await expect(words).toHaveAttribute("data-language", "en");
  await expect(page.locator(".loader-name")).toHaveCSS("opacity", "1");
  await expect(page.locator(".loader-name")).toHaveText("Babisan Pirapakaran");
  const name = (await page.locator(".loader-name").boundingBox())!;
  expect(Math.abs(name.y + name.height / 2 - page.viewportSize()!.height / 2)).toBeLessThan(2);
  await expect(page.locator(".loader-shutters")).toHaveCount(0);
  await expect(page.locator("html")).toHaveClass(/gallery-enhanced/, {timeout:30000});
  await expect(page.locator(".gallery-loader")).toBeHidden();
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as {iceArrival:{partialFrames:number}}).iceArrival.partialFrames)).toBeGreaterThan(5);
  const arrival = await page.evaluate(() => (window as unknown as {iceArrival:{curtainEnd:number;firstMaterial:number}}).iceArrival);
  expect(arrival.curtainEnd).toBeGreaterThan(0);
  expect(arrival.firstMaterial).toBeGreaterThanOrEqual(arrival.curtainEnd);
  expect(arrival.firstMaterial - arrival.curtainEnd).toBeLessThan(200);
  await page.getByRole("button",{name:"Meet Babisan",exact:true}).click();
  const typed=page.locator("dialog .typed-copy>span[aria-hidden=true]");
  await expect(typed).toHaveAttribute("data-typing","true");
  const early=(await typed.textContent())!.length;
  await expect(typed).toHaveAttribute("data-typing","false",{timeout:5000});
  expect((await typed.textContent())!.length).toBeGreaterThan(early+50);
});

test("reading and pause controls preserve all content and navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("button", { name: "Pause animation" }).click();
  await expect(
    page.getByRole("button", { name: "Resume animation" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Read portfolio without 3D" }).click();
  await expect(page.locator(".reading-portfolio")).toBeVisible();
  await expect(page.locator(".reading-portfolio")).toContainText(
    "Game server infrastructure & development",
  );
  await page.getByRole("button", { name: "Return to the gallery" }).click();
  await expect(page.locator(".reading-portfolio")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Babisan", exact: true }),
  ).toBeVisible();
});

test("mobile HUD and the complete resume fit within the viewport with accessible controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.getByRole("button", { name: "Meet Babisan", exact: true }).click();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.keyboard.press("Escape");
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
    { width: 1024, height: 600 },
    { width: 640, height: 360 },
    { width: 320, height: 500 },
  ]) {
    await page.setViewportSize(viewport);
    await travel(page, 1);
    const img = page.locator(".gallery-finale img");
    await expect(img).toBeVisible();
    const box = (await img.boundingBox())!;
    expect(box.y).toBeGreaterThan(60);
    expect(box.y + box.height).toBeLessThan(viewport.height - 45);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("no JavaScript and unavailable WebGL retain all public content and the resume preview", async ({
  browser,
}) => {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      viewport: { width: 320, height: 850 },
    });
    if (javaScriptEnabled)
      await context.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = (() =>
          null) as typeof HTMLCanvasElement.prototype.getContext;
      });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".reading-portfolio")).toBeVisible();
    await expect(page.locator(".reading-portfolio")).toContainText(
      "Orbital Studios",
    );
    await expect(page.locator(".reading-portfolio img")).toBeVisible();
    if (javaScriptEnabled)
      await expect(page.locator(".fallback-notice")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await context.close();
  }
});

test("the hosting page explains the live setup and legacy prototypes redirect home", async ({
  page,
}) => {
  await page.goto("/infrastructure");
  await page.getByRole("button", { name: /Vercel CDN/ }).click();
  await expect(page.locator(".flow-description")).toContainText(
    "built ahead of time",
  );
  await expect(page.locator(".infra-notes")).toContainText(
    "Cloudflare handles the domain’s DNS",
  );
  for (const route of ["/camera-study", "/city-preview"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/$/);
  }
});

test("missing external artwork degrades gracefully and context loss releases the scene", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/gallery/*", (route) => route.abort());
  await ready(page);
  await page.getByRole("button", { name: "Meet Babisan", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Waterloo");
  await page.keyboard.press("Escape");
  await page.evaluate(() =>
    document
      .querySelector("canvas")!
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext(),
  );
  await expect(page.locator(".fallback-notice")).toBeVisible();
  await expect(page.locator(".gallery-interface")).toBeHidden();
  await expect(page.locator(".reading-portfolio")).toBeVisible();
});

test("skipping pending loading cannot enable the gallery after the assets arrive", async ({
  page,
}) => {
  await page.route("**/gallery/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Read portfolio instead" }).click();
  await expect(page.locator(".reading-portfolio")).toBeVisible();
  await page.waitForTimeout(4500);
  await expect(page.locator("html")).not.toHaveClass(/gallery-enhanced/);
  await expect(page.locator(".gallery-interface")).toBeHidden();
});

test("the breathing highlight follows scroll reading order, independent of block rotation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  const hotspots = page.locator(".gallery-hotspot"),
    glowing = page.locator(".gallery-hotspot.is-active");
  await expect(glowing).toHaveCount(1);
  await expect(hotspots.nth(0)).toHaveClass(/is-active/);
  for (const i of [1, 2])
    expect(
      await hotspots
        .nth(i)
        .locator("span")
        .evaluate((node) => getComputedStyle(node).boxShadow),
    ).toBe("none");
  await page.mouse.move(730, 450);
  await page.mouse.down();
  await page.mouse.move(790, 470, { steps: 12 });
  await page.mouse.up();
  await expect(hotspots.nth(0)).toHaveClass(/is-active/);
  await travel(page, 0.04);
  await expect(hotspots.nth(1)).toHaveClass(/is-active/);
  await expect(glowing).toHaveCount(1);
  await travel(page, 0.08);
  await expect(hotspots.nth(2)).toHaveClass(/is-active/);
  await expect(glowing).toHaveCount(1);
  await travel(page, 0.04);
  await expect(hotspots.nth(1)).toHaveClass(/is-active/);
  await hotspots.nth(1).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(glowing).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(glowing).toHaveCount(1);
  await travel(page, 0.74);
  await expect(glowing).toHaveCount(0);
  await travel(page, 0);
  await expect(hotspots.nth(0)).toHaveClass(/is-active/);
});

test("graphics selection reduces canvas resolution while HTML stays sharp and persists on reload", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  const canvas = page.locator("canvas"),
    control = page.getByLabel("Graphics quality");
  const fullWidth = await canvas.evaluate(
    (node: HTMLCanvasElement) => node.width,
  );
  const headingSize = await page
    .locator(".wordmark")
    .evaluate((node) => getComputedStyle(node).fontSize);
  await control.selectOption("performance");
  await expect(canvas).toHaveAttribute("data-graphics-tier", "2");
  expect(
    await canvas.evaluate((node: HTMLCanvasElement) => node.width),
  ).toBeLessThan(fullWidth * 0.8);
  expect(
    await page
      .locator(".wordmark")
      .evaluate((node) => getComputedStyle(node).fontSize),
  ).toBe(headingSize);
  await ready(page);
  await expect(control).toHaveValue("performance");
  await expect(canvas).toHaveAttribute("data-graphics-tier", "2");
  await control.selectOption("auto");
  await expect(control).toHaveValue("auto");
});

test("automatic quality responds to sustained slow browser frames", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const native = requestAnimationFrame;
    window.requestAnimationFrame = (callback) =>
      native(() => {
        window.setTimeout(() => callback(performance.now()), 30);
      });
  });
  await ready(page);
  await expect
    .poll(() => page.locator("canvas").getAttribute("data-graphics-tier"), {
      timeout: 16000,
    })
    .not.toBe("0");
  await expect(page.getByLabel("Graphics quality")).toHaveValue("auto");
});

test("sound is opt-in and can be enabled and muted without external audio assets", async ({
  page,
}) => {
  const audioRequests: string[] = [],
    errors: string[] = [];
  page.on("request", (r) => {
    if (/\.(mp3|ogg|wav)(\?|$)/.test(r.url())) audioRequests.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(
    page.getByRole("button", { name: "Turn sound on" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Turn sound on" }).click();
  await expect(
    page.getByRole("button", { name: "Turn sound off" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Meet Babisan", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(
    page.getByRole("button", { name: "Turn sound on" }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(audioRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("sound enabled during loading continues into the gallery and preserves keyboard focus", async ({page}) => {
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.goto("/");
  const loader = page.getByRole("region", {name:"Loading interactive portfolio"});
  await loader.getByRole("button", {name:"Turn sound on", exact:true}).click();
  const enabled = loader.getByRole("button", {name:"Turn sound off", exact:true});
  await expect(enabled).toBeEnabled();
  await enabled.focus();
  await expect(loader).toBeHidden({timeout:10000});
  const control = page.getByRole("button", {name:"Turn sound off", exact:true});
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await expect(control).toBeFocused();
  await control.click();
  await expect(page.getByRole("button", {name:"Turn sound on", exact:true})).toHaveAttribute("aria-pressed", "false");
});


test("plain navigation exposes records directly and the labeled journey is reversible", async ({page}) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await ready(page);
  const nav = page.getByRole("navigation", {name:"Main navigation"});
  await nav.getByRole("button", {name:"Projects", exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("Axiom");
  await page.keyboard.press("Escape");
  await nav.getByRole("button", {name:"About", exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("Waterloo");
  await page.keyboard.press("Escape");
  const journey = page.getByRole("navigation", {name:"Explore portfolio sections"});
  for (const [label, step] of [["Projects","2"],["Experience","1"],["Resume","4"],["About","0"]]) {
    const destination=journey.getByRole("button", {name:label, exact:true});
    await destination.click();
    await expect(destination).toHaveAttribute("aria-current", "step");
    await expect(page.locator(".gallery-page")).toHaveAttribute("data-journey-step", step);
  }
  await expect(page.locator(".depth-meter")).toHaveText("01 / 05 · About");
});

test("contact shaders and the atmosphere journey render at every manual quality without errors", async ({page}) => {
  const errors:string[]=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",m=>{ if(m.type()==="error") errors.push(m.text()); });
  await ready(page);
  for(const mode of ["high","performance","balanced"]) {
    await page.getByLabel("Graphics quality").selectOption(mode);
    await page.mouse.move(680,300);
    await page.mouse.move(760,420,{steps:12});
    await page.mouse.move(810,490,{steps:8});
    await travel(page,.55);
    await travel(page,.73);
    await expect(page.getByRole("heading",{name:"Interests",exact:true})).toBeVisible();
    await travel(page,1);
    await expect(page.locator(".gallery-finale img")).toBeVisible();
    await travel(page,0);
    await expect(page.getByRole("button",{name:"Meet Babisan",exact:true})).toBeVisible();
  }
  expect(errors).toEqual([]);
});


test("the first touch can rotate an artifact without a prior pointer move", async ({browser}) => {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:"reduce"});
  const page=await context.newPage();
  try {
    await ready(page);
    const anchor=page.locator(".gallery-hotspot").first();
    const before=(await anchor.boundingBox())!;
    const input=await context.newCDPSession(page);
    await input.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:195,y:360,id:1}]});
    for(let x=205;x<=265;x+=10) await input.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:360,id:1}]});
    await input.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    await expect.poll(async()=>Math.abs((await anchor.boundingBox())!.x-before.x)).toBeGreaterThan(5);
    await expect(page.locator(".gallery-hotspot.is-active")).toHaveCount(1);
  } finally { await context.close(); }
});


test("opt-in atmospheric music continues under interface cues and mute silences the output", async ({page}) => {
  await page.addInitScript(() => {
    const original=AudioNode.prototype.connect;
    AudioNode.prototype.connect=function(this:AudioNode, destination:AudioNode|AudioParam, ...rest: number[]) {
      if(destination instanceof AudioDestinationNode && this.context instanceof AudioContext) {
        const meter=this.context.createAnalyser();meter.fftSize=1024;
        (window as unknown as {audioMeter:AnalyserNode}).audioMeter=meter;
        Reflect.apply(original,this,[meter]);
        return Reflect.apply(original,meter,[destination]);
      }
      return Reflect.apply(original,this,[destination,...rest]);
    } as typeof AudioNode.prototype.connect;
  });
  await page.emulateMedia({reducedMotion:"reduce"});
  await ready(page);
  const peak=()=>page.evaluate(async()=>{
    const meter=(window as unknown as {audioMeter:AnalyserNode}).audioMeter;
    const data=new Float32Array(meter.fftSize);let peak=0;
    for(let i=0;i<16;i++) {meter.getFloatTimeDomainData(data);for(const n of data)peak=Math.max(peak,Math.abs(n));await new Promise(r=>setTimeout(r,12));}
    return peak;
  });
  // No AudioContext exists before an explicit gesture.
  expect(await page.evaluate(() => "audioMeter" in window)).toBe(false);
  await page.getByRole("button",{name:"Turn sound on",exact:true}).click();
  await expect(page.getByRole("button",{name:"Turn sound off",exact:true})).toBeEnabled();
  await page.waitForTimeout(1600);
  expect(await peak()).toBeGreaterThan(.001);
  await page.getByRole("navigation",{name:"Main navigation"}).getByRole("button",{name:"Projects",exact:true}).hover();
  expect(await peak()).toBeGreaterThan(.002);
  await page.mouse.move(20,400);
  await page.waitForTimeout(200);
  await page.getByRole("button",{name:"About Babisan",exact:true}).hover();
  expect(await peak()).toBeGreaterThan(.002);
  await page.mouse.move(20,400);
  await page.waitForTimeout(300);
  expect(await peak()).toBeGreaterThan(.001);
  await travel(page,.25);
  await page.waitForTimeout(400);
  expect(await peak()).toBeGreaterThan(.001);
  await page.getByRole("button",{name:"Turn sound off",exact:true}).click();
  await page.waitForTimeout(500);
  expect(await peak()).toBeLessThan(.0001);
  expect(await page.evaluate(() => (window as unknown as {audioMeter:AnalyserNode}).audioMeter.context.state)).toBe("suspended");
});
