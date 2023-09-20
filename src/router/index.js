const fs = require('fs');
const path = require('path');

const moduleDir = path.join(__dirname, '.');
const excludeFileName = 'index.js';

function creatRouter(app) {
  // useHomeRouter(app)
  // 遍历并导入所有模块
  fs.readdirSync(moduleDir).forEach(file => {
    if (file !== excludeFileName){
      const modulePath = path.join(moduleDir, file);
      const { useRouter } = require(modulePath);
      // 处理导入的模块
      useRouter(app)
    }
  });
}

function useHomeRouter(app) {
  app.get('/', (req, res) => {
    res.redirect(301, 'http://localhost:5173/');
  });
}

module.exports = {
  creatRouter
};