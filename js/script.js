document.getElementById("uploadBtn").addEventListener("click", async () => {
  const input = document.getElementById("imageInput");
  const resultDiv = document.getElementById("result");

  if (!input.files || input.files.length === 0) {
    resultDiv.innerText = "Please select an image first.";
    return;
  }

  const file = input.files[0];
  const imageName = file.name;

  resultDiv.innerText = "Analyzing image...";

  const apiUrl = `https://zj2tr18y1i.execute-api.us-east-1.amazonaws.com/prod/image/${encodeURIComponent(
    imageName
  )}`;

  try {
    const response = await fetch(apiUrl); // 🔁 בלי Authorization Header

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

    resultDiv.innerHTML = `<h3>Labels for <em>${imageName}</em>:</h3>` + html;
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
  }
});
