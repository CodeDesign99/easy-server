const { createServer } = require("http");
const { Server } = require("socket.io");
const { PORT } = require("../services");
const { clients, userInfoMap, rooms } = require("../../config/database");

const MessageEventName = {
  OFFER: "offer",
  ANSWER: "answer",
  GET_OFFER: "getOffer",
  ICE_CANDIDATE: "icecandidate",
  LEAVE: "leave",
  JOIN: "join",
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
    const { connectorId, offer, memberId: socketId, streamType } = data
    const connectorSocket = clients[socketId];
    if (!connectorSocket) return
    connectorSocket.socket.emit(MessageEventName.OFFER, {
      remoteConnectorId: connectorId,
      offer,
      memberId: socket.id,
      streamType
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

  // 加入房间
  socket.on(MessageEventName.JOIN, (data) => {
    const { id, username, roomname } = data
    client.userId = id
    if (userInfoMap[id]) {
      userInfoMap[id].socketId = socket.id
      return
    }
    const userInfo = {
      id,
      username,
      roomname,
      socketId: socket.id
    }
    userInfoMap[id] = userInfo

    const room = rooms[roomname] ? rooms[roomname] : (rooms[roomname] = {})
    Object.keys(room).forEach(id => {
      const socketId = room[id]
      const connectorSocket = clients[socketId];
      if (!connectorSocket) return
      connectorSocket.socket.emit(MessageEventName.GET_OFFER, { memberId: socket.id });
    })
    room[id] = userInfo
  })

  // 退出房间
  socket.on(MessageEventName.LEAVE, (dataList) => {
    const userId = client.userId
    const roomname = userInfoMap[userId].roomname
    const room = rooms[roomname]
    delete room[userId]
    delete userInfoMap[userId]
    dataList.forEach((data) => {
      const { remoteConnectorId: connectorId, memberId: socketId } = data
      const connectorSocket = clients[socketId];
      if (!connectorSocket) return
      connectorSocket.socket.emit(MessageEventName.LEAVE, { connectorId, memberId: socket.id })
    })
  })

  clients[socket.id] = client
}

function log(desc, data) {
  console.log(desc, data);
}

module.exports = {
  createSocket
}