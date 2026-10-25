import {expect,test} from '@playwright/test';

test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2,launchOptions:{args:[]}});
test.setTimeout(70000);
test('native touch swipes advance the rendered city and touch links traverse to a connected district',async({page})=>{
 await page.goto('/city-preview');await expect(page.locator('.city-preview')).toHaveAttribute('data-renderer','ready',{timeout:45000});
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:650}]});
 for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:650-i*47}]});await page.waitForTimeout(20);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(async()=>Number(await page.locator('canvas').getAttribute('data-progress'))).toBeGreaterThan(.002);
 await page.getByRole('link',{name:'Backstreets',exact:true}).tap();
 await expect.poll(async()=>Number(await page.locator('canvas').getAttribute('data-progress')),{timeout:35000}).toBeCloseTo(.59,3);
 await expect(page.locator('canvas')).toHaveAttribute('data-district','c');expect(Number(await page.locator('canvas').getAttribute('data-dpr'))).toBeLessThanOrEqual(1.15);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
