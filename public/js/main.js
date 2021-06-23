const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();
// Join chatroom
socket.emit("joinroom", { username, room });

// Get room and users info
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// message from server.js
socket.on("message", (message) => {
    // console.log(message);

    outputMessage(message);
});

// Message submit
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // getting msg text
    const msg = e.target.elements.msg.value;

    // emitting a msg to a server
    socket.emit("chatMessage", msg);

    // Scroll down to latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Clear inpur
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

// Output message to DOM
const outputMessage = (message) => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                        <p class="text">
                        ${message.text}
                        </p>`;
    document.querySelector(".chat-messages").appendChild(div);
};

//  Add room name to DOM
const outputRoomName = (room) => {
    roomName.innerText = room;
};

// Add active user list to dom

const outputUsers = (users) => {
    usersList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
};
