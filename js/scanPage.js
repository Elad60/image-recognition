$(document).ready(function () {
  const userInfo = getUserInfoFromToken();
  const token = localStorage.getItem("id_token");

  const demoSection = $("#demo-section");
  const loginMessage = $("#login-message");
  const scanButton = $("#scanButton");
  const urlInput = $("#urlInput");
  const scanResults = $("#scanResults");

  // אם המשתמש לא מחובר – הסתר סריקה
  if (!userInfo || !token) {
    demoSection.addClass("d-none");
    loginMessage.removeClass("d-none");
    return;
  } else {
    demoSection.removeClass("d-none");
    loginMessage.addClass("d-none");
  }

  // לחיצה על כפתור הסריקה
  scanButton.on("click", async () => {
    const urlToScan = urlInput.val().trim();
    if (!urlToScan || !urlToScan.startsWith("http")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid URL",
        text: "Please enter a valid URL starting with http or https.",
      });
      return;
    }

    scanResults.html(`
        <div class="text-center scanning-msg my-4">
          <div class="fw-bold fs-4 text-primary mb-2">
            🔍 Scanning <span class="text-dark">${urlToScan}</span>
          </div>
          <div class="fs-5 text-secondary fst-italic">
            Please wait while we analyze the page...
          </div>
        </div>
      `);
    scanButton
      .prop("disabled", true)
      .html(`<i class="fas fa-spinner fa-spin"></i> Scanning...`);

    try {
      const apiUrl =
        "https://ymj65ginm4.execute-api.us-east-1.amazonaws.com/prod/scan-page";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: urlToScan }),
      });
      console.log("Payload:", JSON.stringify({ url: urlToScan }));


      if (!response.ok)
        throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      renderScanResults(data);
    } catch (err) {
      console.error("Scan failed:", err);
      scanResults.html(
        `<p class="text-danger">❌ Scan failed: ${err.message}</p>`
      );
    } finally {
      scanButton
        .prop("disabled", false)
        .html(`<i class="fas fa-search"></i> Scan This Page`);
    }
  });
});

function renderScanResults(data) {
  const scanResults = $("#scanResults");
  scanResults.empty();

  const { images, flaggedCount, totalImages, url } = data;

  // הודעה מסכמת
  const statusHtml =
    flaggedCount > 0
      ? `<div class="alert alert-danger text-center">
            ⚠️ This site contains <strong>${flaggedCount}</strong> potentially dangerous images out of <strong>${totalImages}</strong>.
          </div>
          <div class="text-center mb-4">
            <button id="showImagesBtn" class="custom-upload-btn">Show flagged & scanned images</button>
          </div>`
      : `<div class="alert alert-success text-center">
            ✅ This site is safe. No dangerous images found out of <strong>${totalImages}</strong>.
          </div>`;

  scanResults.append(statusHtml);

  if (!images || images.length === 0) {
    scanResults.append(`<p>No images found on this page.</p>`);
    return;
  }

  const grid = $('<div class="row g-4 d-none" id="imagesGrid"></div>');

  images.forEach((img) => {
    const isFlagged = img.isFlagged;
    const labels = img.labels?.join(", ") || "None";
    const borderClass = isFlagged ? "border-danger" : "border-success";
    const titleClass = isFlagged ? "text-danger" : "text-success";
    const title = isFlagged ? "⚠️ Flagged" : "✅ Safe";

    // רק אם התמונה flagged – מציגים את התוויות
    const labelHtml = isFlagged
      ? `<p class="card-text"><strong>Labels:</strong> ${labels}</p>`
      : "";

    const card = $(`
        <div class="col-md-4 col-sm-6">
          <div class="card ${borderClass} h-100 shadow">
            <img src="${img.image}" class="card-img-top" alt="Scanned image" onload="checkSize(this)">
            <div class="card-body d-flex flex-column justify-content-center text-center">
              <h5 class="card-title ${titleClass}">${title}</h5>
              ${labelHtml}
            </div>
          </div>
        </div>
      `);

    grid.append(card);
  });

  scanResults.append(grid);

  $("#showImagesBtn").on("click", () => {
    $("#imagesGrid").removeClass("d-none");
    $("#showImagesBtn").hide();
  });
}

// פונקציה שמסתירה תמונות קטנות מדי
function checkSize(img) {
  if (img.naturalWidth < 150 || img.naturalHeight < 150) {
    img.classList.add("too-small");
  }
}
