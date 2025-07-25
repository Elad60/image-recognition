$(document).ready(function () {
  const userInfo = getUserInfoFromToken();
  const token = localStorage.getItem("id_token");

  const demoSection = $("#demo-section");
  const scanButton = $("#scanButton");
  const urlInput = $("#urlInput");
  const scanResults = $("#scanResults");

  // Always show the scan section to all users
  demoSection.removeClass("d-none");

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

      // Only add Authorization header if token exists
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
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

  // Always show a summary message
  const statusHtml =
    flaggedCount > 0
      ? `<div class="alert alert-danger text-center">
            \u26a0\ufe0f This site contains <strong>${flaggedCount}</strong> potentially dangerous images out of <strong>${totalImages}</strong>.
          </div>`
      : `<div class="alert alert-success text-center">
            \u2705 This site is safe. No dangerous images found out of <strong>${totalImages}</strong>.
          </div>`;

  // Add AWS anti-bot info message
  const infoHtml = `<div class="alert alert-info text-center" style="margin-top: 10px;">
    Please note: For AWS anti-bot protection, a maximum of 10 images can be scanned per website. As a result, not all images on the page may be analyzed.
  </div>`;

  scanResults.append(statusHtml);
  scanResults.append(infoHtml);

  if (!images || images.length === 0) {
    scanResults.append(`<p>No images found on this page.</p>`);
    return;
  }

  // Decide if grid should be hidden by default
  const gridClass = flaggedCount > 0 ? "row g-4 d-none" : "row g-4";
  const grid = $(`<div class="${gridClass}" id="imagesGrid"></div>`);

  images.forEach((img) => {
    const isFlagged = img.isFlagged;
    const labels = img.labels?.join(", ") || "None";
    const borderClass = isFlagged ? "border-danger" : "border-success";
    const titleClass = isFlagged ? "text-danger" : "text-success";
    const title = isFlagged ? "\u26a0\ufe0f Flagged" : "\u2705 Safe";

    // Always show labels
    const labelHtml = `<p class="card-text"><strong>Labels:</strong> ${labels}</p>`;

    const card = $(`
        <div class="col-md-4 col-sm-6">
          <div class="card ${borderClass} h-100 shadow">
            <div class="card-img-area">
              <img src="${img.image}" class="card-img-top" alt="Scanned image" onload="checkSize(this)">
            </div>
            <div class="card-body d-flex flex-column justify-content-end text-center">
              <div class="card-status">
                <h5 class="card-title ${titleClass}">${title}</h5>
                ${labelHtml}
              </div>
            </div>
          </div>
        </div>
      `);

    grid.append(card);
  });

  scanResults.append(grid);

  // Only show the button if there are flagged images
  if (flaggedCount > 0) {
    scanResults.append(`
      <div class="text-center mb-4">
        <button id="showImagesBtn" class="custom-upload-btn">Show flagged & scanned images</button>
      </div>
    `);

    $("#showImagesBtn").on("click", () => {
      $("#imagesGrid").removeClass("d-none");
      $("#showImagesBtn").hide();
    });
  }
}

// פונקציה שמסתירה תמונות קטנות מדי
function checkSize(img) {}
