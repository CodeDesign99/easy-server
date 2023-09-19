const { userTable } = require('../../config/database');
const { createToken, refreshTokenFn } = require('../middlewares/auth');
const { createUserId } = require('../utils/uuid');
const { clients, rooms } = require('../../config/database');

// 使用路由
function useRouter(app) {
  // 设置登录路由接口
  app.post('/login', (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    let userInfo = userTable[username]
    if (!userInfo) {
      // 如果用户名不存在，则创建用户
      userTable[username] = userInfo = createUser({
        username,
        password
      })
    }
    const { username: name, password: pass } = userInfo

    // 创建token
    const token = createToken(userInfo)

    // 创建角色
    const roles = createRoles()

    // 如果用户名和密码正确，则返回token和用户信息
    if (username === name && password === pass) {
      const data = {
        ...token,
        id: userInfo.id,
        username,
        roles
      }
      res.json({ success: true, message: '登录成功', data });
      console.log('登录成功');
    } else {
      // 如果用户名和密码不正确，则返回401状态码和登录失败信息
      res.status(401).json({ success: false, message: '登录失败' });
      console.log('登录失败');
    }
  });

  // 使用刷新令牌获取新的访问令牌
  app.post('/refreshToken', (req, res) => {
    const { refreshToken } = req.body;
    refreshTokenFn(refreshToken).then((data) => {
      res.json({ success: true, data: {
        id: data.id,
        accessToken: data.newAccessToken,
        refreshToken: data.newRefreshToken,
        expires: data.expires
      } });
    }).catch(() => {
      res.sendStatus(401);
    })
  });

  app.get('/checkUsername', (req, res) => {
    const { username, roomname } = req.query;
    const room = rooms[roomname];
    if (!room) {
      res.status(200).json({ success: true, isRepeat: false });
      return
    }
    const isRepeat = Object.keys(room).some(id => {
      return room[id].username === username
    })
    res.status(200).json({ success: true, isRepeat });
  })
}

// 创建用户信息
function createUser(payload) {
  return {
    id: createUserId(),
    username: payload.username,
    password: payload.password
  }
}

// 创建角色
function createRoles() {
  const roles = ['admin']
  return roles
}

module.exports = {
  useRouter
};