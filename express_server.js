const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, findUserByEmail, urlsForUser, users, urlDatabase } = require("./helpers");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//If A USER IS LOGGED IN, REDIRECTS TO URLS. IF NO USER, REDIRECTS TO LOG IN
app.get("/", (req, res) => {
  const userATM = users[req.session.user_id];
  if (userATM) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

//SHOWS USER A LIST OF THEIR URLS IF LOGGED IN, IF NOT IT WILL BE EMPTY AND PROMPT THEM TO LOG IN/ SIGN UP
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  return res.render("urls_index", templateVars);
});

//ALLOWS ONLY REGISTERED USERS TO ADD NEW URL
app.get("/urls/new", (req, res) => {
  const userATM = users[req.session.user_id];
  const templateVars =  { user: userATM };

  if (req.session.user_id) {
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
  }
});

//SHOWS THE VALUES OF THE SHORT URL AND ALLOWS USER TO EDIT
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] ) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id],
    };
    return res.render("urls_show", templateVars);
  } else {
    return res.status(404).send("The short URL does not exist.");
  }
});

//ROUTES SHORT URL TO LONG URL IF IT EXISTS, IF NOT IT WILL RETURN AN ERROR MESSAGE
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      return res.redirect(longURL);
    }
  } else {
    return res.status(404).send("The short URL does not exist.");
  }
});

//ALLOWS USER TO ADD A URL IF THEY ARE LOGGED IN, IF NOT THERE WILL BE AN ERROR MESSAGE
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  if (!req.session.user_id) {
    return res.status(403).send("You must log in to add a URL");
  } else {
    return res.redirect(`/urls/${newShortURL}`);
  }
});

//DELETES URL IF THE URL BELONGS TO THE USER LOGGED IN
app.post("/urls/:shortURL/delete", (req, res) =>{
  let userATM = users[req.session.user_id];

  if (userATM) {
    if (urlsForUser(userATM.id, urlDatabase)[req.params.shortURL]) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect("/urls");
    }
  } else {
    return res.status(403).send("Access Denied.");
  }
});

//ADD USER CREDENTIALS TO USER DATABASE
app.get("/register", (req, res) => {
  let userATM = users[req.session.user_id];
  if (!userATM) {
    const signupVars = { email: req.body.email, password: req.body.password, user: userATM};
    return res.render("register_form", signupVars);
  } else {
    return res.redirect("/urls");
  }
});
 

app.post("/register", (req, res) => { //gens new user ID and adds details to users object. Also creates a cookie for the user id.
  let newUserID = generateRandomString();
  const foundUser = findUserByEmail(req.body.email, users);
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Please enter an email and password.");
  } else if (foundUser) {
    return res.status(400).send("This email already exists.");
  } else {
    users[newUserID] =  {
      id: newUserID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
  return;
});

//EDITS URL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.editURL;
    return res.redirect("/urls");
  } else {
    return res.status(403).send("Access Denied.");
  }
});

app.post("/login", (req, res) => {
  const foundUser = findUserByEmail(req.body.email, users);
  const password = req.body.password;

  if (foundUser && !bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("Email and password do not match.");
  } else if (!foundUser) {
    return res.status(403).send("Email does not exist.");
  } else {
    req.session.user_id = foundUser.id;
    return res.redirect("/urls");
  }
});

//ALLOWS USER TO LOG IN & CREATES COOKIE IF SUCCESSFULL
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  return res.render("login_form", templateVars);
});

//LOGS OUT & DELETES COOKIE
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});