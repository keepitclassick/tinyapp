const bcrypt = require('bcryptjs');


const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.lighthouselabs.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = { 
  "BobtheBuilder": {
    id: "BobtheBuilder", 
    email: "bob@building.com", 
    password: bcrypt.hashSync("IcanFIXit", 10)
  },
 "ElBarto": {
    id: "ElBarto", 
    email: "lisasux@icloud.com", 
    password: bcrypt.hashSync("ayycarrumba", 10)
  }
}


const generateRandomString = function() {
  let result = '';
  let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charLength = alpha.length

  for(let i = 0; i < 6; i++) { 
    result += alpha.charAt(Math.floor(Math.random() * charLength)); 
  }
  return result;
};

const findUserByEmail = function(email, database) {
  for (let key in database) {
    if(database[key].email === email) {
      return database[key];
    }
  }
  return null;
};

const urlsForUser = function(id) {
  let userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  } 
  return userUrls;
};



module.exports = { generateRandomString, findUserByEmail, urlsForUser, users , urlDatabase };