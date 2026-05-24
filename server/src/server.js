import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import http from "http";
// import mongoose from "mongoose";
import SocketEvents from "./config/socket-events.js";
import jwt from "jsonwebtoken";
import app from "./app.js";
import documentService from "./service/document-service.js";

const PORT = process.env.PORT || 8000;
// const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL,
    methods: "*",
  },
});

server.listen(PORT, () => {
  console.log(`Server is Live at Port: ${PORT}`);
});

io.on("connection", (socket) => {
  // console.log(socket);
  console.log("connected to frontend");
  const accessToken = socket.handshake.query.accessToken;
  const documentId = socket.handshake.query.documentId;
  // console.log(accessToken, 'accsToken')
  if (!accessToken || !documentId) return socket.disconnect();
  else {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      console.log(decoded);
      const { id, email } = decoded.user;

      socket.username = email;

      documentService
        .findDocumentById(parseInt(documentId), parseInt(id))
        .then((document) => {
          if (!document) return socket.disconnect();
          // ROOM CREATE
          socket.join(documentId);
          io.in(documentId)
            .fetchSockets()
            .then((clients) => {
              io.sockets.in(documentId).emit(
                SocketEvents.CURRENT_USERS_UPDATE,
                clients.map((client) => client.username)
              );
            });
          // broadcast change in editorState to room members;
          socket.on(SocketEvents.SEND_CHANGES, (rawEditorStateContent) => {
            socket.broadcast
              .to(documentId)
              .emit(SocketEvents.RECEIVE_CHANGES, rawEditorStateContent);
          });
          //Disconnect Socket
          socket.on("disconnect", () => {
            socket.leave(documentId);
            io.in(documentId)
              .fetchSockets()
              .then((clients) => {
                io.sockets.in(documentId).emit(
                  SocketEvents.CURRENT_USERS_UPDATE,
                  clients.map((client) => client.username)
                );
              });
            socket.disconnect();
          });
        })
        .catch((error) => {
          console.log(error);
          return socket.disconnect();
        });
    });
  }
});

// mongoose.connection.once("open", () => {
//     console.log("mongoose is connected");
// });
// mongoose.connection.on("error", (err) => {
//     console.log(err);
// });

// async function startServer() {
// await mongoose.connect(MONGO_URL);
// }

// startServer();
