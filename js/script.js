const imageInput = document.getElementById("imageInput");
const fileNameSpan = document.getElementById("fileName");

imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    fileNameSpan.textContent = `✅ Selected: ${file.name}`;
  } else {
    fileNameSpan.textContent = "No image selected";
  }
});

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const input = document.getElementById("imageInput");
  const resultDiv = document.getElementById("result");
  const uploadBtn = document.getElementById("uploadBtn");

  if (!input.files || input.files.length === 0) {
    resultDiv.innerText = "Please select an image first.";
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Analyzing...`;

  const file = input.files[0];
  const originalName = file.name;
  resultDiv.innerText = "Uploading and analyzing image...";

  const uploadResponse = await fetch(
    "https://btgjcut471.execute-api.us-east-1.amazonaws.com/prod/upload",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageName: originalName }),
    }
  );

  if (!uploadResponse.ok) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Failed to get upload URL</p>`;
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = `<i class="fas fa-upload"></i> Upload & Analyze`;
    return;
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
    resultDiv.innerHTML = `<p style="color:red;">❌ Failed to upload to S3</p>`;
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = `<i class="fas fa-upload"></i> Upload & Analyze`;
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const apiUrl = `https://btgjcut471.execute-api.us-east-1.amazonaws.com/prod/image/${encodeURIComponent(
    fileKey
  )}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);

    const data = await response.json();
    const labels = data.labels;
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

    resultDiv.innerHTML = `
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
