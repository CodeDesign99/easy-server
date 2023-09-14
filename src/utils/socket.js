const { createServer } = require("http");
const { Server } = require("socket.io");
const { PORT } = require("../services");
const { clients } = require("../../config/database");

const MessageEventName = {
  OFFER: "offer",
  ANSWER: "answer",
  GET_OFFER: "getOffer",
  ICE_CANDIDATE: "icecandidate",
  EXIT: "exit",
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
  // offer SDP 交换
  socket.on(MessageEventName.OFFER, (data) => {
    const { connectorId, offer, memberId: socketId, streaTtype } = data
    const connectorSocket = clients[socketId];
    if (!connectorSocket) return
    connectorSocket.socket.emit(MessageEventName.OFFER, {
      remoteConnectorId: connectorId,
      offer,
      memberId: socket.id,
      streaTtype
    })
  })
  // answer SDP 交换
  socket.on(MessageEventName.ANSWER, (data) => {
    const { remoteConnectorId, connectorId, answer, memberId: socketId } = data
    const connectorSocket = clients[socketId];
    if (!connectorSocket) return
    connectorSocket.socket.emit(MessageEventName.ANSWER, {
      remoteConnectorId: connectorId,
      connectorId: remoteConnectorId,
      answer,
      memberId: socket.id
    })
  })
  // icecandidate 交换
  socket.on(MessageEventName.ICE_CANDIDATE, (data) => {
    const { remoteConnectorId, memberId: socketId, candidate } = data
    const connectorSocket = clients[socketId];
    if (!connectorSocket) return
    connectorSocket.socket.emit(MessageEventName.ICE_CANDIDATE, {
      connectorId: remoteConnectorId,
      candidate
    })
  })

  // 使用RTCDataChannel实现数据通信，不再依赖服务器
  // socket.on(MessageEventName.EXIT, (dataList) => {
  //   dataList.forEach((data) => {
  //     const { remoteConnectorId: connectorId, memberId: socketId } = data
  //     const connectorSocket = clients[socketId];
  //     if (!connectorSocket) return
  //     connectorSocket.socket.emit(MessageEventName.EXIT, { connectorId, memberId: socket.id })
  //   })
  // })

  Object.keys(clients).forEach(id => {
    const client = clients[id];
    client.socket.emit(MessageEventName.GET_OFFER, { memberId: socket.id });
  })

  clients[socket.id] = client
}

function log(desc, data) {
  console.log(desc, data);
}

module.exports = {
  createSocket
}