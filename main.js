const puppeteer = require("puppeteer");

async function downloadFromIgram(instagramUrl) {
  const browser = await puppeteer.launch({ headless: false }); // 실제 크롬 브라우저 실행
  const page = await browser.newPage();

  console.log("🔹 iGram 접속 중...");
  await page.goto("https://igram.io", { waitUntil: "networkidle2" });

  // 입력창에 URL 입력 후 엔터
  await page.type("input[name='url']", instagramUrl);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(5000); // 검색 결과 로딩 대기

  console.log("🔹 검색 완료, 다운로드 버튼 찾는 중...");

  let downloadCount = 0;
  while (true) {
    // 다운로드 버튼 찾기
    let buttons = await page.$$(".button_download");

    for (let button of buttons) {
      await button.click(); // 다운로드 버튼 클릭
      downloadCount++;
      console.log(`✅ ${downloadCount}장 다운로드 완료`);
      await page.waitForTimeout(3000); // 딜레이 추가
    }

    // 100장 다운로드 후 사용자 확인
    if (downloadCount >= 100) {
      let userChoice = await askUser();
      if (userChoice !== "y") {
        console.log("⛔ 다운로드 중지됨!");
        break;
      }
    }

    // 스크롤 더 내리기 (더 많은 게시물 로드)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000); // 스크롤 후 로딩 대기
  }

  console.log("✅ 모든 다운로드 완료!");
  await browser.close();
}

// 사용자 입력 받기 (100장마다 계속할지 확인)
function askUser() {
  return new Promise((resolve) => {
    process.stdout.write("🔹 계속 진행할까요? (y/n): ");
    process.stdin.once("data", (data) =>
      resolve(data.toString().trim().toLowerCase())
    );
  });
}

// 실행 예시 (인스타그램 게시물 URL을 입력해서 실행)
downloadFromIgram("https://www.instagram.com/p/example/");
