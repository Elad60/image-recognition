// ✅ הנחנו שה־userInfo כבר קיים מהתחברות קודמת
$(document).ready(function () {
  const userInfo = getUserInfoFromToken(); // אתה כנראה מגדיר את זה בדף login
  console.log("📧 Logged in user:", userInfo?.email || "Unknown");

  const imageInput = document.getElementById("imageInput");
  const fileNameSpan = document.getElementById("fileName");
  const uploadBtn = document.getElementById("uploadBtn");
  const resultDiv = document.getElementById("result");

  if (!imageInput || !uploadBtn || !fileNameSpan || !resultDiv) {
    console.error("❌ One or more elements not found in DOM.");
    return;
  }

  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      fileNameSpan.textContent = `✅ Selected: ${file.name}`;
    } else {
      fileNameSpan.textContent = "No image selected";
    }
  });

  uploadBtn.addEventListener("click", async () => {
    if (!imageInput.files || imageInput.files.length === 0) {
      resultDiv.innerText = "Please select an image first.";
      return;
    }

    // ✅ ודא ש־userInfo קיים
    if (!userInfo || !userInfo.email) {
      resultDiv.innerHTML = `<p style="color:red;">❌ User info not available</p>`;
      return;
    }

    const userEmail = userInfo.email;
    console.log("📧 Using email:", userEmail);

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Analyzing...`;

    const file = imageInput.files[0];
    const originalName = file.name;
    resultDiv.innerText = "Uploading and analyzing image...";

    try {
      const uploadResponse = await fetch(
        "https://btgjcut471.execute-api.us-east-1.amazonaws.com/prod/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageName: originalName,
            userEmail: userEmail,
          }),
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const uploadData = await uploadResponse.json();
      const uploadUrl = uploadData.uploadUrl;
      const fileKey = uploadData.fileKey;

      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/png" },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error("Failed to upload to S3");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const apiUrl = `https://btgjcut471.execute-api.us-east-1.amazonaws.com/prod/image/${encodeURIComponent(
        fileKey
      )}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const labels = data.labels;
      const isDangerous = data.isDangerous;
      const imageUrl = `https://image-recognition-stack-myimageuploadbucket-v1uxcmt4htce.s3.us-east-1.amazonaws.com/${fileKey}`;

      if (!labels || labels.length === 0) {
        resultDiv.innerHTML = `<p>No labels found for this image.</p>`;
        return;
      }

      const labelTags = labels
        .map(
          (label) =>
            `<div class="label-tag">${label.Name} (${parseFloat(
              label.Confidence
            ).toFixed(1)}%)</div>`
        )
        .join("");

      let warningHtml = "";
      if (isDangerous) {
        warningHtml = `
          <div class="danger-alert">
            ⚠️ Dangerous object detected in this image!
          </div>
        `;
      }

      resultDiv.innerHTML = `
        ${warningHtml}
        <img src="${imageUrl}" alt="Uploaded Image" />
        <div class="labels-container">
          <h3>Detected Labels</h3>
          <div class="labels">${labelTags}</div>
        </div>
      `;
    } catch (err) {
      resultDiv.innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = `<i class="fas fa-upload"></i> Upload & Analyze`;
    }
  });
});
