const { assert } = require("chai");

// const { getUserByEmail } = require("../helpers.js");

const assertEqual = function (actual, expected) {
  //filter
  if (actual !== expected) {
    return console.log(`🛑🛑🛑 Assertion Failed: ${actual} !== ${expected}`);
  }
  //happy path
  console.log(`✅✅✅ Assertion Passed: ${actual} === ${expected}`);
};

const getUserByEmail = function (email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(
      user.id,
      expectedUserID,
      `Expected user ID: ${expectedUserID}, Actual user: ${JSON.stringify(
        user
      )}`
    );
  });

  it("should return undefined if email is non-existent", () => {
    const user = getUserByEmail("", testUsers);
    const expectedResult = undefined;
    assertEqual(user, expectedResult);
  });
});
