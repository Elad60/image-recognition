document.getElementById("uploadBtn").addEventListener("click", async () => {
  const input = document.getElementById("imageInput");
  const resultDiv = document.getElementById("result");

  if (!input.files || input.files.length === 0) {
    resultDiv.innerText = "Please select an image first.";
    return;
  }

  const file = input.files[0];
  const originalName = file.name;

  resultDiv.innerText = "Uploading and analyzing image...";

  // שלב 1: בקשת כתובת חתומה
  const uploadResponse = await fetch(
    "https://zj2tr18y1i.execute-api.us-east-1.amazonaws.com/prod/upload",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageName: originalName }),
    }
  );

  if (!uploadResponse.ok) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Failed to get upload URL</p>`;
    return;
  }

  const uploadData = await uploadResponse.json();
  const uploadUrl = uploadData.uploadUrl;
  const fileKey = uploadData.fileKey; // 🔥 זה מה שנשמר ב־DynamoDB

  // שלב 2: העלאה ל-S3
  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/png",
    },
    body: file,
  });

  if (!putResponse.ok) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Failed to upload to S3</p>`;
    return;
  }

  // 🔁 הוספת השהייה כאן
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // ואז נמשיך לשלוח את ה־GET:
  const apiUrl = `https://zj2tr18y1i.execute-api.us-east-1.amazonaws.com/prod/image/${encodeURIComponent(
    fileKey
  )}`;
  

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    const labels = data.labels;

    if (!labels || labels.length === 0) {
      resultDiv.innerHTML = `<p>No labels found for this image.</p>`;
      return;
    }

    const html = labels
      .map(
        (label) =>
          `<div><strong>${label.Name}</strong>: ${parseFloat(
            label.Confidence
          ).toFixed(1)}%</div>`
      )
      .join("");

    resultDiv.innerHTML =
      `<h3>Labels for <em>${originalName}</em>:</h3>` + html;
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
  }
});
