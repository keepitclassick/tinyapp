const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())

const generateRandomString = function() {
  let result = '';
  let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charLength = alpha.length

  for(let i = 0; i < 6; i++) { 
    result += alpha.charAt(Math.floor(Math.random() * charLength)); 
  }
  return result;
};

const findUserByEmail = function(email) {
  for (let key in users) {
    if(users[key].email === email) {
      return users[key];
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
//====================================//
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.cookies["user_id"]),
  user: users[req.cookies["user_id"]] }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userATM = users[req.cookies["user_id"]];
  const templateVars =  { user: userATM };
  if (req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
  res.redirect("/login")
  }
});

//SHOWS THE VALUES OF THE SHORT URL AND ALLOWS USER TO EDIT
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.cookies.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The short URL does not exist.");
  }
});
//ROUTES SHORT URL TO LONG URL IF IT EXISTS, IF NOT IT WILL RETURN AN ERROR MESSAGE
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL does not exist.");
  }
});

//ALLOWS USER TO ADD A URL
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  if (!req.cookies["user_id"]) {
    res.status(403).send("You must log in to add a URL")
  } else {
    res.redirect(`/urls/${newShortURL}`);
  }
});

//DELETES URL
app.post("/urls/:shortURL/delete", (req, res) =>{
  let userATM = users[req.cookies["user_id"]];
  // check if there is a current logged in user
  if (userATM) { 
    if (urlsForUser(userATM.id)[req.params.shortURL]) { //checking if url belongs to user 
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } 
  } else {
    res.status(403).send("Access Denied.");
  }
});

//ADD USER CREDENTIALS TO USER DATABASE
app.get("/register", (req, res) => {
  let userATM = users[req.cookies["user_id"]];
  const signupVars = { email: req.body.email, password: req.body.password, user: userATM}
  res.render("register_form", signupVars)
})
 

app.post("/register", (req, res) => { //gens new user ID and adds details to users object. Also creates a cookie for the user id.
  let newUserID = generateRandomString();
  const foundUser = findUserByEmail(req.body.email);
    if (req.body.email === '' || req.body.password === '') {
    res.sendStatus(400);
    } else if (foundUser) {
    res.sendStatus(400);
    } else {
    users[newUserID] =  { id: newUserID, 
      email: req.body.email, 
      password: bcrypt.hashSync(req.body.password, 10) }
    res.cookie("user_id", newUserID);
    console.log(users);
    res.redirect("/urls");
    }
    return;
})

//EDITS URL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  const userUrls = urlsForUser(userID);
  
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.editURL;
    res.redirect('/urls');
  } else {
    res.status(403).send("Access Denied.");
  }
})

app.post("/login", (req, res) => {
const foundUser = findUserByEmail(req.body.email);
const password = req.body.password
    if (foundUser && !bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send('Email and password do not match.')
  } else if (!foundUser) {
    return res.status(403).send('Email does not exist.')
  } else {
    res.cookie("user_id", foundUser.id);
    return res.redirect("/urls/");
  }
})

//LOGS IN & CREATES COOKIE
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
res.render("login_form", templateVars);
})

//LOGS OUT & DELETES COOKIE
app.post("/logout", (req, res) => {
res.clearCookie("user_id"); 
res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});