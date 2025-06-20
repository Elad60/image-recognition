$(document).ready(async function () {
  const userInfo = getUserInfoFromToken();
  $("#profile-name").text(userInfo.username);
  $("#profile-email").text(userInfo.email);

  try {
    const token = localStorage.getItem("id_token");
    const response = await fetch(
      "https://btgjcut471.execute-api.us-east-1.amazonaws.com/prod/profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch scans");

    const data = await response.json();
    const scans = data.scans;
    const grid = $("#scansGrid");

    if (scans.length === 0) {
      grid.append('<div class="text-center">No scans found.</div>');
      return;
    }

    scans.forEach((scan) => {
      const imgUrl = `https://image-recognition-stack-myimageuploadbucket-v1uxcmt4htce.s3.us-east-1.amazonaws.com/${scan.ImageName}`;

      const labelHtml = scan.Labels.map(
        (label) =>
          `<span class="badge bg-${
            scan.IsDangerous ? "danger" : "success"
          } me-1 mb-1">${label.Name} (${label.Confidence}%)</span>`
      ).join(" ");

      const card = `
          <div class="col-md-6 col-lg-4">
            <div class="card shadow-sm h-100">
              <img src="${imgUrl}" class="card-img-top" alt="Scan Image">
              <div class="card-body">
                <h5 class="card-title">${
                  scan.IsDangerous ? "⚠️ Dangerous" : "✅ Safe"
                }</h5>
                <div>${labelHtml}</div>
              </div>
            </div>
          </div>
        `;

      grid.append(card);
    });
  } catch (error) {
    console.error("🔴 Failed to fetch scans:", error);
    $("#scansGrid").append(
      `<div class="text-center text-danger">Failed to load scans.</div>`
    );
  }
});
