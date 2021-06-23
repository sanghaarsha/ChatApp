const PORT = process.env.PORT || 3000;

// custom modules
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");

// core node modules
const path = require("path");
const http = require("http");

// added node modules
const express = require("express");
const app = express();
const socketio = require("socket.io");

// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

// passing express app to createServer method of http module
const server = http.createServer(app);

// Passing server to socket.io
const io = socketio(server);

const botName = "TalkPals Bot";

// run when client connects
io.on("connection", (socket) => {
    socket.on("joinroom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to TalkPals"));

        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has joined the chat`)
            );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    // Listen for chat message
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit(
            "message",
            formatMessage(`${user.username}`, msg)
        );
    });

    // Runs when client disconnect
    socket.on("disconnect", () => {
        // This too works:
        // const user = getCurrentUser(socket.id);

        // io.to(user.room).emit(
        //     "message",
        //     formatMessage(botName, `${user.username} has left the chat!`)
        // );

        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat!`)
            );

            // Send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
