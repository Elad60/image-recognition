document.getElementById("uploadBtn").addEventListener("click", async () => {
  const input = document.getElementById("imageInput");
  const resultDiv = document.getElementById("result");

  if (!input.files || input.files.length === 0) {
    resultDiv.innerText = "Please select an image first.";
    return;
  }

  const file = input.files[0];
  resultDiv.innerText = "Uploading... (simulated)";

  // --- שלב אמיתי בהמשך: העלאה ל-S3 ---

  // המתנה קצרה ואז קריאה מדומה ל-API:
  setTimeout(() => {
    // כאן בהמשך תבצע fetch ל-API Gateway
    const fakeLabels = [
      { Name: "Person", Confidence: 98.5 },
      { Name: "Knife", Confidence: 89.2 },
      { Name: "Table", Confidence: 76.3 },
    ];

    const html = fakeLabels
      .map(
        (label) =>
          `<div><strong>${label.Name}</strong>: ${label.Confidence.toFixed(
            1
          )}%</div>`
      )
      .join("");

    resultDiv.innerHTML = "<h3>Labels:</h3>" + html;
  }, 1500);
});
