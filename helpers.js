

function generateRandomString(length) {
  const uniqueId = Math.random()
    .toString(36)
    .substring(2, length + 2);
  return uniqueId;
}

module.exports = {
  generateRandomString
};

// const {
//   getUserByEmail,
//   generateRandomString
// } = require("./helpers");
