// Add click event listener to the button
document
  .getElementById("requestChef")
  .addEventListener("click", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("id_token");

    if (!token) {
      Swal.fire({
        title: "Not Logged In",
        text: "Please log in to continue.",
        icon: "warning",
        confirmButtonText: "OK"
      });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userEmail = payload["email"];
      const userGroup = payload["cognito:groups"]
        ? payload["cognito:groups"][0]
        : null;

      if (userGroup && userGroup !== "SimpleUser") {
        Swal.fire("You are already a chef!");
        return;
      }

      const apiUrl = "https://gcyu5g0u93.execute-api.us-east-1.amazonaws.com/prod/check-request";
      const requestData = { email: userEmail };
      // Make the POST request to the server
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          // Check if the response is OK
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          return response.json(); // Parse response body as JSON
        })
        .then((data) => {
          console.log("Response from server:", data);

          // Assuming the server response has the relevant number in the `body`
          const statusCode = data.body;

          // Check the returned data and handle accordingly
          if (statusCode === "1") {

  Swal.fire({
    title: "Pending Approval",
    text: "Your request is pending approval.",
    icon: "info",
    confirmButtonText: "OK"
  });          } else if (statusCode === "2") {
    Swal.fire({
      title: "Request Rejected",
      text: "Your previous request was rejected.",
      icon: "error",
      confirmButtonText: "OK"
    });          } else {
            sendRequest(userEmail);
          }
        })
        .catch((error) => {
          // Handle errors
          console.error("Error:", error);

          if (error.message.includes("Failed to fetch")) {
            Swal.fire({
              title: "Connection Error",
              text: "Failed to connect to the server. Please check your internet connection or try again later.",
              icon: "warning",
              confirmButtonText: "OK"
            });
          } else if (error.message.includes("500")) {
            Swal.fire({
              title: "Server Error",
              text: "An internal server error occurred. Please try again later.",
              icon: "error",
              confirmButtonText: "OK"
            });          } else {
              Swal.fire({
                title: "Unexpected Error",
                text: "An unexpected error occurred. Please try again.",
                icon: "error",
                confirmButtonText: "OK"
              });          }
        });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Server Communication Failed",
        text: "Failed to communicate with the server. Please try again.",
        icon: "error",
        confirmButtonText: "OK"
      });    }
  });

function sendRequest(userEmail) {
  // API endpoint 
  const apiUrl ="https://gcyu5g0u93.execute-api.us-east-1.amazonaws.com/prod/chef-request";
  const requestData = {
    email: userEmail, 
    oldGroup: "SimpleUser",
    newGroup: "ChefUser",
  };

  // Make the POST request to the server
  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Handle the success response
      Swal.fire({
        title: "Success!",
        text: "Request sent successfully!",
        icon: "success",
        confirmButtonText: "OK"
      });      console.log(data);
    })
    .catch((error) => {
      // Handle errors
      console.error("Error:", error);
      Swal.fire({
        title: "Request Already Submitted",
        text: "You have already submitted a request.",
        icon: "warning",
        confirmButtonText: "OK"
      });    });
}
