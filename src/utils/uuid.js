const uuid = require('uuid');

module.exports = {
  createUserId() {
    return uuid.v4();
  }
}