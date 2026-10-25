import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({viewport:{width:1280,height:900}});
test.setTimeout(45000);
async function ready(page:Page){await expect(page.locator('.world-shell')).toHaveAttribute('data-scene','ready',{timeout:25000});}
async function destination(page:Page,id:string){await page.locator(`.world-navigation a[href='/#${id}']`).click();await expect(page.locator('#'+id)).toHaveAttribute('data-active','true');}
async function audit(page:Page){const result=await new AxeBuilder({page}).options({iframes:false}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([]);}

test('one persistent world connects every destination and contains no character/game controls',async({page})=>{
  test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
  await page.goto('/');await ready(page);await expect(page.getByRole('heading',{level:1})).toContainText('Pirapakaran');
  await page.locator('canvas').evaluate(c=>c.setAttribute('data-persistence-test','retained'));
  for(const [id,name]of [['projects','Things'],['experience','systems'],['about','deeper'],['skills','curiosity'],['contact','hello']]){
    await destination(page,id);await expect(page.locator('#'+id).getByRole('heading',{level:2}).first()).toContainText(name);
  }
  await expect.poll(async()=>Number(await page.locator('canvas').getAttribute('data-camera')),{timeout:12000}).toBeGreaterThan(4.8);
  await expect(page.locator('canvas')).toHaveAttribute('data-persistence-test','retained');
  await expect(page.locator('#contact a[href="mailto:babisanp@gmail.com"]')).toBeVisible();
  expect(requests.some(r=>/courier|character\.fbx|run\.fbx|resend/.test(r))).toBe(false);expect(errors).toEqual([]);
});

test('project selection opens complete records, traps focus and restores the initiating button',async({page})=>{
  await page.goto('/#projects');await ready(page);
  const switcher=page.getByRole('group',{name:'Select a project'});
  for(const name of ['Verilly','Behaviourly','Axiom']){
    await switcher.getByRole('button',{name:new RegExp(name)}).click();
    const trigger=page.getByRole('button',{name:'Inside '+name});await trigger.focus();await page.keyboard.press('Enter');
    const dialog=page.getByRole('dialog',{name:'Project dossier'});await expect(dialog).toBeVisible();await expect(dialog.getByRole('heading',{level:2})).toHaveText(name);
    await expect(dialog.getByText('Behind the build',{exact:true})).toBeVisible();
    await page.keyboard.press('Shift+Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog'))).toBe(true);
    await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
  }
});

test('the experience archive preserves complete, accurate technical history',async({page})=>{
  await page.goto('/#experience');await expect(page.locator('#experience')).toHaveAttribute('data-active','true');
  await page.getByRole('button',{name:'DevRoom',exact:true}).click();await expect(page.locator('.role-preview')).toContainText('20+ client deployments');
  await page.getByRole('button',{name:'Open the complete experience archive'}).click();const dialog=page.getByRole('dialog');
  for(const value of ['160 lifecycle policies','more than four hours to 15 minutes','50+ developers','40+ AWS','100+ engineers','more than ten','Sep 2024','May 2023','80%','550 users','Polaris Studios','Anti-cheat & exploit prevention','vector math','Grand River Analytics','CaseCommons','Coursework builds','Expected 2029'])await expect(dialog).toContainText(value);
  await expect(dialog).not.toContainText(/Minecraft|Volunteer|Network Owner/);await expect(dialog).toContainText('On an individual game server network');
});

test('toolkit interests support keyboard navigation and cloud planning preserves the same canvas',async({page})=>{
  await page.goto('/#skills');await ready(page);await page.locator('canvas').evaluate(c=>c.setAttribute('data-persistence-test','retained'));
  await page.getByRole('button',{name:'Exploration',exact:true}).click();await expect(page.locator('.domain-preview')).toContainText('learning interests');
  await page.locator('#skills').getByRole('button',{name:'Explore the toolkit',exact:true}).click();const dialog=page.getByRole('dialog');const tabs=dialog.getByRole('tablist',{name:'Engineering interests'});
  await tabs.getByRole('tab',{name:'Systems'}).focus();await page.keyboard.press('ArrowRight');await expect(tabs.getByRole('tab',{name:'GPUs'})).toBeFocused();await expect(dialog.getByRole('tabpanel')).toContainText('areas I’m exploring');
  await page.keyboard.press('End');await expect(tabs.getByRole('tab',{name:'Cloud'})).toHaveAttribute('aria-selected','true');await page.keyboard.press('Escape');
  await page.locator('#skills').getByRole('link',{name:'Cloud lab'}).click();await expect(page).toHaveURL('/infrastructure');await expect(page.locator('canvas')).toHaveAttribute('data-persistence-test','retained');
  await page.getByRole('button',{name:/02 \/ DELIVERY CloudFront/}).click();await expect(page.locator('.flow-description')).toContainText('deliver cached assets');
  await page.getByRole('button',{name:/03 \/ ORIGIN Private S3/}).click();await expect(page.locator('.flow-description')).toContainText('origin access control');await expect(page.getByText('This portfolio is a Next.js app hosted on Vercel.',{exact:false})).toBeVisible();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Experience',exact:true}).click();await expect(page).toHaveURL('/#experience');await expect(page.locator('#experience')).toHaveAttribute('data-active','true');await expect(page.locator('canvas')).toHaveAttribute('data-persistence-test','retained');
});

test('ambient pause stops unchanged rendering while camera navigation still works',async({page})=>{
  await page.goto('/');await ready(page);await page.getByRole('button',{name:'Atmosphere'}).click();await page.getByRole('button',{name:'Pause atmosphere'}).click();await page.mouse.move(0,0);await page.waitForTimeout(2500);
  const before=Number(await page.locator('canvas').getAttribute('data-draws'));await page.waitForTimeout(600);const after=Number(await page.locator('canvas').getAttribute('data-draws'));expect(after-before).toBeLessThan(3);
  await destination(page,'projects');await expect.poll(async()=>Number(await page.locator('canvas').getAttribute('data-camera')),{timeout:10000}).toBeGreaterThan(.9);
  await page.getByRole('button',{name:'Rain on'}).click();await expect(page.getByRole('button',{name:'Rain off'})).toHaveAttribute('aria-pressed','false');
});

test('reduced motion defaults to complete reading mode and permits an explicit still world',async({page})=>{
  const requests:string[]=[];page.on('request',r=>requests.push(r.url()));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.world-shell')).toHaveAttribute('data-mode','reading');await expect(page.getByRole('heading',{name:'Anti-cheat & exploit prevention',exact:true})).toBeVisible();expect(requests.some(r=>r.endsWith('.glb'))).toBe(false);
  await audit(page);await page.getByRole('button',{name:'Explore in 3D'}).click();await ready(page);await destination(page,'projects');await expect.poll(async()=>Number(await page.locator('canvas').getAttribute('data-camera'))).toBe(1);
  await page.waitForTimeout(700);const draws=await page.locator('canvas').getAttribute('data-draws');await page.waitForTimeout(400);expect(await page.locator('canvas').getAttribute('data-draws')).toBe(draws);
});

test('reading view is reversible without losing content or the scene',async({page})=>{
  await page.goto('/');await ready(page);await page.getByRole('button',{name:'Read portfolio'}).click();await expect(page.locator('.world-shell')).toHaveAttribute('data-mode','reading');
  await expect(page.getByRole('heading',{name:'Verilly',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Anti-cheat & exploit prevention',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Explore in 3D'}).click();await expect(page.locator('.world-shell')).toHaveAttribute('data-mode','world');await expect(page.getByRole('heading',{level:1})).toBeVisible();
});

for(const failure of ['webgl','asset','context'])test(`${failure} failure leaves all content and resume links usable`,async({page})=>{
  if(failure==='webgl')await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type==='webgl'||type==='webgl2')return null;return Reflect.apply(original,this,[type,...args]);} as typeof original;});
  if(failure==='asset')await page.route('**/world/optics.glb',r=>r.abort());
  await page.goto('/');if(failure==='context'){await ready(page);await page.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));}
  await expect(page.locator('.world-shell')).toHaveAttribute('data-scene','unavailable',{timeout:25000});await expect(page.locator('.world-shell')).toHaveAttribute('data-mode','reading');
  await expect(page.getByRole('heading',{name:'Axiom',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Anti-cheat & exploit prevention',exact:true})).toBeVisible();await expect(page.locator('#contact a[href="mailto:babisanp@gmail.com"]')).toBeVisible();
  const pdf=await page.request.get('/documents/Babisan-Pirapakaran-Resume.pdf');expect(pdf.ok()).toBe(true);
});

test('mobile destinations, index, records and native touch scrolling remain usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await ready(page);await expect(page.getByRole('heading',{level:1})).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Experience',exact:true}).click();await expect(page.locator('#experience')).toHaveAttribute('data-active','true');
  await page.getByRole('button',{name:'Open the complete experience archive'}).click();await expect(page.getByRole('dialog')).toBeVisible();expect(await page.evaluate(()=>document.querySelector('dialog')!.getBoundingClientRect().right<=innerWidth)).toBe(true);await page.getByRole('button',{name:'Close record'}).click();
  await page.mouse.wheel(0,900);await expect(page.locator('#about')).toHaveAttribute('data-active','true');await audit(page);
});

for(const width of [320,1440])test(`reading and document UI pass accessibility and overflow checks at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await audit(page);
  await page.goto('/infrastructure');await audit(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('the full portfolio works without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:850}});try{const page=await context.newPage();await page.goto('http://127.0.0.1:3012/');await expect(page.getByRole('heading',{level:1})).toBeVisible();for(const name of ['Verilly','Behaviourly','Axiom','Anti-cheat & exploit prevention','University of Waterloo'])await expect(page.getByRole('heading',{name,exact:true}).first()).toBeVisible();await expect(page.locator('#contact a[href="mailto:babisanp@gmail.com"]')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#skills').getByRole('link',{name:'Cloud lab'}).click();await expect(page).toHaveURL(/\/infrastructure$/);}finally{await context.close();}
});

// The production custom domain uses Cloudflare email rewriting. This server-HTML
// contract prevents its pre-hydration transform while retaining a native mailto link.
test('the public contact link is protected from CDN HTML rewriting',async({request})=>{
  const response=await request.get('/');const html=await response.text();
  expect(html).toMatch(/<!--email_off--><a class="contact-email" href="mailto:babisanp@gmail\.com">[\s\S]*?<\/a><!--\/email_off-->/);
});
