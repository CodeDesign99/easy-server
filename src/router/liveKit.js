const { AccessToken } =  require('livekit-server-sdk')
const { verifyToken } = require('../middlewares/auth');
const { liveKitConfig } = require('../../config/database')

const apiKey = liveKitConfig.LIVEKIT_API_KEY;
const apiSecret = liveKitConfig.LIVEKIT_API_SECRET;
const livekitUrl = liveKitConfig.LIVEKIT_URL

const createToken = (userInfo, grant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.ttl = '5m';
  at.addGrant(grant);
  return at.toJwt();
};

const roomPattern = /\w{4}\-\w{4}/;

function useRouter(app) {
  app.get('/token', (req, res) => {
    verifyToken(req)
      .then(() => {
        try {
          const { roomName, identity, name, metadata } = req.query;
      
          if (typeof identity !== 'string' || typeof roomName !== 'string') {
            res.status(403).end();
            return;
          }
      
          if (Array.isArray(name)) {
            throw Error('provide max one name');
          }
          if (Array.isArray(metadata)) {
            throw Error('provide max one metadata string');
          }
          console.log(roomName);
          if (!roomName.match(roomPattern)) {
            res.status(400).end();
            return;
          }
      
          const grant = {
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canPublishData: true,
            canSubscribe: true,
          };
      
          const token = createToken({ identity, name, metadata }, grant);
          const result = {
            identity,
            accessToken: token,
          };
      
          res.status(200).json(result);
        } catch (e) {
          res.statusMessage = e.message;
          res.status(500).end();
        }
      })
      .catch((error) => {
        res.status(500).end(error);
      })
  })

  app.get('/getLiveKitUrl', (req, res) => {
    verifyToken(req)
      .then(() => {
        const result = {
          livekitUrl
        }
        res.status(200).json(result)
      })
      .catch((error) => {
        res.status(500).end(error);
      })
  })
}

module.exports = {
  useRouter
};