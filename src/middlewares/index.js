const bodyParser = require('body-parser'); // 导入 body-parser

function useMiddlewares(app) {
  // 使用 body-parser 中间件来解析 JSON 请求体
  app.use(bodyParser.json());
  // 添加CORS中间件，允许所有来源的请求
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

module.exports = {
  middlewares: [
    useMiddlewares
  ]
};