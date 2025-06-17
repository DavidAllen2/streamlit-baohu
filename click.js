const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
  const url = "https://xxxxxx.streamlit.app/";
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);

  let logMessage = `[${timestamp}] `;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    await page.waitForSelector("button, [role='button']", { timeout: 20000 });

    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button, [role='button']"));
      const target = buttons.find(btn => btn.innerText.includes("启动部署"));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });

    logMessage += clicked ? "✅ 成功点击部署按钮\n" : "⚠️ 没找到按钮\n";
    await browser.close();
  } catch (e) {
    logMessage += `❌ 点击失败：${e.message}\n`;
  }

  // 写入日志
  fs.appendFileSync("click_log.txt", logMessage, { encoding: "utf8" });
})();
