const generateRandomString = (length) => {
  const uniqueId = Math.random()
    .toString(36)
    .substring(2, length + 2);
    
  return uniqueId;
}

const getUserByEmail = (email, database) => {
  for (const id in database) {
    const entry = database[id];
    if (entry.email === email) {
      return entry;
    }
  }

  return null;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
};