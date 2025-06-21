const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const url = "https://app-8w4wwungk5qvcotqhlsvgr.streamlit.app/";
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  let logMessage = `[${timestamp}] `;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    let found = false;
    const maxTries = 30; // 最多等 30 次（60秒）
    for (let i = 0; i < maxTries; i++) {
      console.log(`等待第 ${i + 1} 次检查按钮...`);
      await page.waitForTimeout(2000);

      found = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button, [role='button']"));
        const target = buttons.find(btn => btn.innerText.includes("🚀 启动部署"));
        if (target) {
          target.click();
          return true;
        }
        return false;
      });

      if (found) break;
    }

    if (found) {
      logMessage += "✅ 成功点击部署按钮\n";
      console.log("✅ 成功点击部署按钮");
    } else {
      logMessage += "⚠️ 没找到部署按钮（超时）\n";
      console.log("⚠️ 没找到部署按钮（超时）");
    }

    await browser.close();
  } catch (e) {
    logMessage += `❌ 错误：${e.message}\n`;
    console.error("❌ 点击失败:", e.message);
  }

  // 写入日志
  try {
    fs.appendFileSync("click_log.txt", logMessage, { encoding: "utf8" });
  } catch (e) {
    console.error("❌ 写入日志失败:", e.message);
  }
})();
