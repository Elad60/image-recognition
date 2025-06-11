// הגדרות AWS כל פעם בפתחית מעבדה צריך לשנות בהתאם את הנתונים

let isProfilePicUploaded = false;
let isGalleryUploaded = false;
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const bucketName = "chefs-images";
const idToken = localStorage.getItem('id_token');
const payload = JSON.parse(atob(idToken.split('.')[1]));
console.log('User Info:', payload);
const EmailUser = payload['email'];
console.log(EmailUser)
localStorage.setItem("selectedChef", EmailUser);

async function uploadProfilePic() {
    const fileInput = document.getElementById("chef-profile-pic");
    const file = fileInput.files[0];

    if (!file) {
        Swal.fire("Please choose a profile picture.!");
        return null;
    }

    const params = {
        Bucket: bucketName,
        Key: `img/${file.name}`,
        Body: file,
        ContentType: file.type,
    };

    try {
        const data = await s3.upload(params).promise();
        console.log("Profile picture uploaded:", data.Location);
        isProfilePicUploaded = true; // עדכון סטטוס העלאת תמונת הפרופיל
        document.getElementById("profile-pic-url").textContent = "Images uploaded successfully.";
        return data.Location; // URL של התמונה
    } catch (err) {
        console.error("Error uploading profile picture:", err);
        Swal.fire({
            title: "Error!",
            text: "Failed to upload profile picture.",
            icon: "error"
        });
        return null;
    }
}

async function uploadGalleryImages() {
    const fileInput = document.getElementById("chef-gallery");
    const files = fileInput.files;
    const urls = [];

    for (const file of files) {
        const params = {
            Bucket: bucketName,
            Key: `img/${file.name}`,
            Body: file,
            ContentType: file.type,
        };

        try {
            const data = await s3.upload(params).promise();
            console.log("Gallery image uploaded:", data.Location);
            urls.push(data.Location); // URL של התמונה
        } catch (err) {
            console.error("Error uploading gallery image:", err);
            Swal.fire({
                title: "Error!",
                text: "Failed to upload gallery image. ",
                icon: "error"
            });
        }
    }
    if (urls.length > 0) {
        isGalleryUploaded = true; // עדכון סטטוס העלאת תמונות הגלריה
        updateCreateButtonState(); // בדיקה אם הכפתור הסופי יכול לפעול
        document.getElementById("gallery-urls").textContent = "Images uploaded successfully.";

    }

    return urls;
}

async function createChefProfile() {
    const name = document.getElementById("chef-name").value;
    const price = document.getElementById("chef-price").value;
    const description = document.getElementById("chef-description").value;

    // משיכת קטגוריות שסומנו
    const categories = Array.from(
            document.querySelectorAll("input[type='checkbox']:checked")
        )
        .map((checkbox) => checkbox.value)
        .join(' '); // מחבר את הערכים למחרוזת עם רווחים


    // העלאת תמונות
    const profilePicUrl = await uploadProfilePic();
    const galleryUrls = await uploadGalleryImages();

    if (!profilePicUrl) {
        Swal.fire({
            title: "Error!",
            text: "Failed to upload profile image. ",
            icon: "error"
        });
        return;
    }

    // נתונים שיוכנסו לטבלה
    const item = {
        TableName: "ChefsTable",
        Item: {
            Email: EmailUser,
            Category: categories,
            Date: Date.now().toString(),
            Description: description,
            Gallery: galleryUrls,
            Name: name,
            Price: parseFloat(price),
            ProfilePic: profilePicUrl,
        },
    };
    console.log(item);
    try {
        await dynamoDB.put(item).promise();
        console.log("Chef profile added to DynamoDB:", item.Item);
        Swal.fire({
            title: "Work!",
            text: "Chef profile created successfully!",
            icon: "success"
        });
        window.location.href = "chefs.html";
    } catch (err) {
        console.error("Error adding chef profile to DynamoDB:", err);
        Swal.fire({
            title: "Error!",
            text: "Failed to create chef profile. ",
            icon: "error"
        });
    }
}
// עדכון מצב כפתור "Create Profile"
function updateCreateButtonState() {
    const createButton = document.getElementById("create-profile-btn");
    if (isProfilePicUploaded && isGalleryUploaded) {
        createButton.disabled = false; // פתיחת הכפתור
    } else {
        createButton.disabled = true; // השארת הכפתור מושבת
    }
}