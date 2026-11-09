
const API_URL =  "/api/admin";

let adminToken = "";

const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");
const messagesDiv = document.getElementById("messages");
const loginMessage = document.getElementById("loginMessage");

// ========== ADMIN LOGIN ==========

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Logging in...";

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            loginMessage.textContent = result.message || "Login failed";
            return;
        }

        adminToken = result.token;
        loginMessage.textContent = "";

        loginSection.style.display = "none";
        dashboard.style.display = "block";

        loginForm.reset();
        loadMessages();

        document.getElementById("adminSection").style.display = "block";

    } catch (error) {
        console.error(error);
        loginMessage.textContent = "Backend connection failed!";
    }
});

// ========== LOAD MESSAGES ==========

async function loadMessages() {
    messagesDiv.textContent = "Loading messages...";

    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        });

        const result = await response.json();

        if (response.status === 401) {
            logout();
            alert("Session expired. Please login again.");
            return;
        }

        if (!response.ok || !result.success) {
            messagesDiv.textContent = "Unable to load messages.";
            return;
        }

        messagesDiv.replaceChildren();

        if (result.messages.length === 0) {
            messagesDiv.textContent = "No messages found.";
            return;
        }

        result.messages.forEach(function (msg) {
            const card = document.createElement("div");
            card.className = "message-card";

            const heading = document.createElement("h4");
            heading.textContent = `Message #${msg.id}`;

            const name = document.createElement("p");
            name.textContent = `Name: ${msg.name}`;

            const email = document.createElement("p");
            email.textContent = `Email: ${msg.email}`;

            const subject = document.createElement("p");
            subject.textContent = `Subject: ${msg.subject}`;

            const message = document.createElement("p");
            message.textContent = `Message: ${msg.message}`;

            const date = document.createElement("p");
            date.textContent = `Date: ${msg.created_at || "Not available"}`;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete Message";

            deleteButton.addEventListener("click", function () {
                deleteMessage(msg.id);
            });

            card.append(
                heading, name, email, subject,
                message, date, deleteButton
            );

            messagesDiv.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        messagesDiv.textContent = "Backend connection failed!";
    }
}

// ========== DELETE MESSAGE ==========

async function deleteMessage(id) {
    if (!confirm("Are you sure you want to delete this message?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        });

        const result = await response.json();

        if (response.status === 401) {
            logout();
            alert("Session expired. Please login again.");
            return;
        }

        alert(result.message);

        if (result.success) {
            loadMessages();
        }

    } catch (error) {
        console.error(error);
        alert("Unable to delete message.");
    }
}

// ========== REFRESH ==========

document.getElementById("refreshBtn").addEventListener("click", loadMessages);

// ========== LOGOUT ==========

function logout() {
    adminToken = "";

    dashboard.style.display = "none";
    loginSection.style.display = "block";

    document.getElementById("adminSection").style.display = "block";

    messagesDiv.replaceChildren();
    loginForm.reset();
}


document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("adminSection").style.display = "none";