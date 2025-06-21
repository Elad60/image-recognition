// פונקציה שמביאה את נתוני המשתמשים עם מספר התמונות מכל Lambda API
$(document).ready(function() {
    renderUserUploads();
});

async function fetchUserUploads() {
    const apiURL = "https://btgjcut471.execute-api.us-east-1.amazonaws.com/prod/profiles";

    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json(); // קיבלנו אובייקט כמו { "user1": 3, "user2": 5 }
        return userData;
    } catch (error) {
        console.error("Failed to fetch user uploads:", error);
        return {};
    }
}

async function renderUserUploads() {
    const $container = $("#profiles-container");
    $container.empty();

    const uploads = await fetchUserUploads();

    $.each(uploads, function(userId, count) {
        const displayName = userId.split("_at_")[0];

        const card = `
        <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="team-item position-relative text-center rounded border border-primary p-4 overflow-hidden profile-card">
                <i class="fa fa-user fa-7x text-primary mb-3"></i>
                <h5 class="mb-0">${displayName}</h5>

                <div class="profile-overlay d-flex align-items-center justify-content-center">
                    <span class="text-white fs-5">Image Scans: ${count}</span>
                </div>
            </div>
        </div>
        `;

        $container.append(card);
    });
}