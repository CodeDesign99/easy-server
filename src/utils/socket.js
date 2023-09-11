const { createServer } = require("http");
const { Server } = require("socket.io");
const { PORT } = require("../services");
const { clients } = require("../../config/database");

const MessageEvent = {
  OFFER: "offer",
  ANSWER: "answer",
  GET_OFFER: "getOffer",
  ICE_CANDIDATE: "icecandidate",
}

function createSocket (app) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: true });
  
  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    initSocket(socket, clients);

    // 当客户端断开连接时，从客户端列表中删除
    socket.on('disconnect', () => {      
      delete clients[socket.id];
      console.log(`Client disconnected: ${socket.id}`, clients);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`);
  });
};

function initSocket (socket, clients) {
  const client = {
    id: socket.id,
    socket,
  }
  socket.on(MessageEvent.OFFER, (data) => {
    const { webrtcId, offer, merberId: socketId } = data
    const connectorSocket = clients[socketId];
    if (!connectorSocket) return
    connectorSocket.socket.emit(MessageEvent.OFFER, {
      connectorWebrtcId: webrtcId,
      offer,
      merberId: socket.id
    })
  })

  socket.on(MessageEvent.ANSWER, (data) => {
    const { connectorWebrtcId, webrtcId, answer, merberId: socketId } = data
    const connectorSocket = clients[socketId];
    if (!connectorSocket) return
    connectorSocket.socket.emit(MessageEvent.ANSWER, {
      connectorWebrtcId: webrtcId,
      webrtcId: connectorWebrtcId,
      answer,
      merberId: socket.id
    })
  })

  socket.on(MessageEvent.ICE_CANDIDATE, (data) => {
    const { connectorWebrtcId, merberId: socketId, candidate } = data
    const connectorSocket = clients[socketId];
    if (!connectorSocket) return
    connectorSocket.socket.emit(MessageEvent.ICE_CANDIDATE, {
      webrtcId: connectorWebrtcId,
      candidate
    })
  })

  Object.keys(clients).forEach(id => {
    const client = clients[id];
    client.socket.emit(MessageEvent.GET_OFFER, { id: socket.id });
  })

  clients[socket.id] = client
}

function log(desc, data) {
  console.log(desc, data);
}

module.exports = {
  createSocket
}