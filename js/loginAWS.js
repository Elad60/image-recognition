const cognitoConfig = {
    UserPoolId: "us-east-19jYmrBTIf",
    ClientId: "2dphdkq5242hoopevfgvjbgit7",
    Domain: "us-east-19jYmrBTIf",
    ClientSecret: "b1png91iphbnmbnerepr69oa5lf7ebh1i9na70mt5pu0bp47rof",
    Region: "us-east-1",
    redirectUri: "http://localhost:5500/index.html",
};

$(document).ready(function() {
    const idToken = localStorage.getItem("id_token");
    console.log("On Load: ID Token:", idToken);
    if (idToken) {
        displayUserInfo(idToken);
        const currentUrl = window.location.origin + window.location.pathname; // משאיר רק את ה-URL הבסיסי
        window.history.replaceState({}, document.title, currentUrl); // מחליף את ה-URL בלי לרענן את הדף
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        if (code) {
            exchangeCodeForTokens(code);
            const currentUrl = window.location.origin + window.location.pathname; // משאיר רק את ה-URL הבסיסי
            window.history.replaceState({}, document.title, currentUrl); // מחליף את ה-URL בלי לרענן את הדף
        } else {
            updateAuthUI(null);
        }
    }
});

function signIn() {
    const url = `https://${cognitoConfig.Domain}.auth.${
    cognitoConfig.Region
  }.amazoncognito.com/login?client_id=${
    cognitoConfig.ClientId
  }&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(
    cognitoConfig.redirectUri
  )}`;
    window.location.href = url;
}

function signOut() {
    const url = `https://${cognitoConfig.Domain}.auth.${
    cognitoConfig.Region
  }.amazoncognito.com/logout?client_id=${
    cognitoConfig.ClientId
  }&logout_uri=${encodeURIComponent(cognitoConfig.redirectUri)}`;
    localStorage.removeItem("id_token");
    window.location.href = url;
}

function getUserInfoFromToken() {
    const idToken = localStorage.getItem("id_token");
    if (!idToken) return null;

    try {
        const payload = JSON.parse(atob(idToken.split(".")[1]));
        return {
            username: payload["cognito:username"] || "User",
            email: payload["email"] || "No email",
            group: payload["cognito:groups"] ? payload["cognito:groups"][0] : null,
        };
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}

async function exchangeCodeForTokens(code) {
    const tokenEndpoint = `https://${cognitoConfig.Domain}.auth.${cognitoConfig.Region}.amazoncognito.com/oauth2/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", cognitoConfig.ClientId);
    params.append("client_secret", cognitoConfig.ClientSecret);
    params.append("code", code);
    params.append("redirect_uri", cognitoConfig.redirectUri);

    try {
        const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.id_token) {
            console.log("ID Token:", data.id_token);
            localStorage.setItem("id_token", data.id_token);
            displayUserInfo(data.id_token);
        } else {
            console.error("No ID token received");
        }
    } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        Swal.fire({
            title: "Error!",
            text: "Failed to sign in. Please try again.",
            icon: "error",
        });
    }
}

function getCurrentUserToken() {
    return localStorage.getItem("id_token");
}

function displayUserInfo(idToken) {
    try {
        const payload = JSON.parse(atob(idToken.split(".")[1]));
        console.log("User Info:", payload);
        const username = payload["cognito:username"] || "User";
        const userGroup = payload["cognito:groups"] ?
            payload["cognito:groups"][0] :
            null;
        updateAuthUI(username, userGroup);
    } catch (error) {
        return null;
    }
}

function updateAuthUI(username) {
    console.log("Updating Auth UI with username:", username);
    const userGreeting = document.getElementById("userGreeting");
    const authButton = document.getElementById("authButton");
    const profileLink = document.getElementById("Profilelink");
    const demoSection = document.getElementById("demo-section");
    const loginMessage = document.getElementById("login-message");
    if (username) {
        userGreeting.textContent = `Hello, ${username}`;
        userGreeting.classList.remove("d-none");
        authButton.textContent = "Sign Out";
        authButton.onclick = signOut;
        authButton.classList.remove("btn-primary");
        authButton.classList.add("btn-danger");
        profileLink.classList.remove("d-none"); // הסתרת קישור לפרופיל אם לא מחובר
        demoSection.classList.remove("d-none");
        loginMessage.classList.add("d-none");
    } else {
        userGreeting.textContent = "";
        userGreeting.classList.add("d-none");
        authButton.textContent = "Sign In";
        authButton.onclick = signIn;
        authButton.classList.remove("btn-danger");
        authButton.classList.add("btn-primary");
        profileLink.classList.add("d-none"); // הסתרת קישור לפרופיל אם לא מחובר
        demoSection.classList.add("d-none");
        loginMessage.classList.remove("d-none");
    }

    document.getElementById("authContainer").classList.remove("d-none");
}