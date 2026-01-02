import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/initial-view.png', fullPage: true });
    console.log('📸 Screenshot saved: initial-view.png');

    // Check title centering
    const titleBox = await page.locator('h1').boundingBox();
    const headerBox = await page.locator('header').boundingBox();
    console.log('\n📏 Title positioning:');
    console.log(`   Header width: ${headerBox?.width}`);
    console.log(`   Title left position: ${titleBox?.x}`);
    console.log(`   Is title centered? ${titleBox ? 'Checking alignment...' : 'Not found'}`);

    // Check content centering
    const mainBox = await page.locator('main').boundingBox();
    const viewportWidth = page.viewportSize().width;
    console.log('\n📏 Content positioning:');
    console.log(`   Viewport width: ${viewportWidth}`);
    console.log(`   Main content width: ${mainBox?.width}`);
    console.log(`   Main left margin: ${mainBox?.x}`);

    // Test navigation
    console.log('\n🧪 Testing navigation...');

    // Get initial paragraph
    const initialText = await page.locator('main p').first().textContent();
    console.log(`   Initial section text starts with: "${initialText?.substring(0, 50)}..."`);

    // Click down button
    console.log('   Clicking down button...');
    await page.locator('button[aria-label="Next section"]').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/after-first-click.png', fullPage: true });

    const secondText = await page.locator('main p').nth(1).textContent();
    console.log(`   After click, second section: "${secondText?.substring(0, 50)}..."`);

    // Check current section indicator
    const currentSection = await page.locator('.scale-150').count();
    console.log(`   Current section indicators: ${currentSection}`);

    // Click down again
    console.log('   Clicking down button again...');
    await page.locator('button[aria-label="Next section"]').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/after-second-click.png', fullPage: true });

    const thirdText = await page.locator('main p').nth(2).textContent();
    console.log(`   After second click, third section: "${thirdText?.substring(0, 50)}..."`);

    // Test all paragraphs are visible
    const totalParagraphs = await page.locator('main p').count();
    console.log(`\n📊 Total paragraphs found: ${totalParagraphs}`);

    // Check opacity states
    const visibleSections = await page.locator('.opacity-100').count();
    const fadedSections = await page.locator('.opacity-40').count();
    console.log(`   Fully visible sections: ${visibleSections}`);
    console.log(`   Faded sections: ${fadedSections}`);

    // Check navigation buttons state
    const upButton = page.locator('button[aria-label="Previous section"]').first();
    const downButton = page.locator('button[aria-label="Next section"]').first();

    const upDisabled = await upButton.getAttribute('disabled');
    const downDisabled = await downButton.getAttribute('disabled');
    console.log(`\n🔘 Button states:`);
    console.log(`   Up button disabled: ${upDisabled !== null}`);
    console.log(`   Down button disabled: ${downDisabled !== null}`);

    // Test scrolling and intersection observer
    console.log('\n🔄 Testing scroll behavior...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);

    const firstParagraph = page.locator('main p').first();
    await firstParagraph.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    console.log('   Scrolled to first paragraph');

    console.log('\n✅ Test complete! Check screenshots folder for visual inspection.');
    console.log('\n⏸️  Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
})();
