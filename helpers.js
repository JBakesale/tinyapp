const getUserByEmail = function (email, database) {
  for (const urlId in database) {
    const urlEntry = database[urlId];
    const userId = urlEntry.userID;
    const user = users[userId];

    if (user.email === email) {
      return user.id;
    }
    return null;
  }
};
function generateRandomString(length) {
  const uniqueId = Math.random()
    .toString(36)
    .substring(2, length + 2);
  return uniqueId;
}
const urlsForUser = (userId) => {
  const urls = {};
  for (const urlId in urlDatabase) {
    const urlEntry = urlDatabase[urlId];
    if (urlEntry.userID === userId) {
      urls[urlId] = urlEntry.longURL;
    }
  }
  return urls;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
};

// const {
//   getUserByEmail,
//   generateRandomString,
//   urlsForUser,
// } = require("./helpers");