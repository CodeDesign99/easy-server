const express = require('express');

const PORT = 3000;
function createApp(middlewares) {
  const app = express();
  middlewares.forEach(use => {
    use(app)
  });
  // 启动服务器
  // app.listen(PORT, () => {
  //   console.log(`http://localhost:${PORT}/`);
  // });

  return app
}

module.exports = {
  createApp,
  PORT
};