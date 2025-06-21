const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const url = "https://app-8w4wwungk5qvcotqhlsvgr.streamlit.app/";
  const maxWaitMs = 60 * 1000;    // 最长等待60秒
  const checkIntervalMs = 2000;   // 每2秒检查一次
  const maxTries = Math.floor(maxWaitMs / checkIntervalMs);

  let logMessage = `[${new Date().toISOString().replace("T", " ").substring(0, 19)}] `;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    let found = false;
    for (let i = 0; i < maxTries; i++) {
      console.log(`等待第 ${i + 1} 次检查按钮...`);
      found = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button, [role='button']"));
        const target = buttons.find(btn => btn.innerText.includes("启动部署"));
        if (target) {
          target.click();
          return true;
        }
        return false;
      });
      if (found) break;

      // 兼容旧版本puppeteer的等待方式
      await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }

    if (found) {
      logMessage += "✅ 成功点击部署按钮\n";
      console.log("✅ 成功点击部署按钮");
    } else {
      logMessage += "⚠️ 没找到部署按钮（超时）\n";
      console.log("⚠️ 没找到部署按钮（超时）");
    }
  } catch (e) {
    logMessage += `❌ 错误：${e.message}\n`;
    console.error("❌ 点击失败:", e.message);
  } finally {
    if (browser) await browser.close();

    try {
      fs.appendFileSync("click_log.txt", logMessage, { encoding: "utf8" });
    } catch (e) {
      console.error("❌ 写入日志失败:", e.message);
    }
  }
})();
