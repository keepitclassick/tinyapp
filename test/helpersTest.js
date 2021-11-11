const { assert } = require('chai');
const { findUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  "26gdy5": {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "user2RandomID"
  },
  "bfjqot": {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "user1RandomID"
  },
  "htlams": {
    longUrl: "http://www.google.com",
    userID: "user1RandomID"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined for an email that does not exist', function() {
    const user = findUserByEmail("purple_monkey@dinosaur.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});

describe('generateRandomString', function() {

  it('should return a string with six characters', function() {
    const randomString = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomString, expectedOutput);
  });

  it('should not duplicate a string', function() {
    const firstRandomString = generateRandomString();
    const secondRandomString = generateRandomString();
    assert.notEqual(firstRandomString, secondRandomString);
  });
});

describe('urlsForUser', function() {
  it('should return an object of url information specific to the given user ID', function() {
    const specificUrls = urlsForUser("user1RandomID", testUrlDatabase);
    const expectedOutput = {
      "bfjqot": {
        longUrl: "http://www.lighthouselabs.ca",
        userID: "user1RandomID"
      },
      "htlams": {
        longUrl: "http://www.google.com",
        userID: "user1RandomID"
      }
    };
    assert.deepEqual(specificUrls, expectedOutput);
  });

  it('should return an empty object for an ID that does not exist', function() {
    const specificUrls = urlsForUser("user3RandomID", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(specificUrls, expectedOutput);
  });
});

