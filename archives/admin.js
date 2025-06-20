$(document).ready(function() {
  (async function() {
    const requests = await fetchRequests();
    renderRequests(requests);
  })();
});
// Function to fetch requests from the API
async function fetchRequests() {
  const apiUrl = "https://gcyu5g0u93.execute-api.us-east-1.amazonaws.com/prod/list-requests";
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    // Use `body` directly if it's already an object, otherwise parse it
    const requests = Array.isArray(responseData.body) ? responseData.body : JSON.parse(responseData.body);

    return requests;
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    return []; // Return an empty array to prevent breaking the rendering
  }
}

// Function to render requests in the table
function renderRequests(requests) {
  console.log("Requests:", requests);

  // Get the table body element
  const tableBody = document
    .getElementById("requests-table")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // Clear previous rows

  // Loop through the requests and populate the table
  requests.forEach((request) => {
    const row = document.createElement("tr");

    // Create cells for each column
    const timestampCell = document.createElement("td");
    const statusCell = document.createElement("td");
    const newGroupCell = document.createElement("td");
    const oldGroupCell = document.createElement("td");
    const emailCell = document.createElement("td");
    const actionCell = document.createElement("td"); // New cell for actions

    // Populate cells with data
    timestampCell.textContent = new Date(request.Timestamp * 1000).toLocaleString(); // Convert timestamp to readable date
    statusCell.textContent = request.Status;
    newGroupCell.textContent = request.NewGroup;
    oldGroupCell.textContent = request.OldGroup;
    emailCell.textContent = request.Email;
    if(request.Status=="Pending"){
    // Create Approve and Deny buttons
    const approveButton = document.createElement("button");
    approveButton.textContent = "Approve";
    approveButton.className = "btn btn-success btn-sm me-2"; // Add Bootstrap classes for styling
    approveButton.onclick = () => handleAction(request.Email,"Approved"); // Attach event handler

    const denyButton = document.createElement("button");
    denyButton.textContent = "Reject";
    denyButton.className = "btn btn-danger btn-sm"; // Add Bootstrap classes for styling
    denyButton.onclick = () => handleAction(request.Email,"Rejected"); // Attach event handler

    // Append buttons to the action cell
    actionCell.appendChild(approveButton);
    actionCell.appendChild(denyButton);
  }
    // Append cells to the row
    row.appendChild(timestampCell);
    row.appendChild(statusCell);
    row.appendChild(newGroupCell);
    row.appendChild(oldGroupCell);
    row.appendChild(emailCell);
    row.appendChild(actionCell); 

    // Append the row to the table body
    tableBody.appendChild(row);
  });
}

// Function to handle the approve action
function handleAction(email,status1) {
  console.log(`Action: ${status1}, Email: ${email}`);
  const apiUrl = "https://gcyu5g0u93.execute-api.us-east-1.amazonaws.com/prod/update-request";
  const requestData = {
    email: email, // Replace with the logged-in user's email
    status: status1
};

// Make the POST request to the server
fetch(apiUrl, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(requestData)
})
.then(response => {
    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    // Handle the success response
    Swal.fire({
      title: "Work!",
      text: "Request processed successfully!",
      icon: "success"
    });
    console.log(data);
    window.location.reload();
})
.catch(error => {
    // Handle errors
    console.error("Error:", error);
    Swal.fire({
      title: "Error!",
      text: "Failed to process the request. ",
      icon: "error"
    });
});   
}
