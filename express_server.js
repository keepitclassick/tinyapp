const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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

const userUrlList = function(id) {
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
    password: "IcanFIXit"
  },
 "ElBarto": {
    id: "ElBarto", 
    email: "lisasux@icloud.com", 
    password: "ayycurramba"
  }
}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: userUrlList(req.cookies["user_id"]),
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

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you are trying to access does not exist.");
  }
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  if (!req.cookies["user_id"]) {
    res.status(403).send('You must log in to add a URL')
  } else {
    res.redirect(`/urls/${newShortURL}`);
  }
});

//deletes url
app.post("/urls/:shortURL/delete", (req, res) =>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

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
      password: req.body.password }
    res.cookie("user_id", newUserID);
    console.log(users);
    res.redirect("/urls");
    }
    return;
})

//edits specific url and redirects to main url page
app.post("/urls/:id", (req, res) => {
  shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.editURL;
  res.redirect("/urls/");
})


app.post("/login", (req, res) => {
const foundUser = findUserByEmail(req.body.email);
  if (foundUser) {
  res.cookie("user_id", foundUser.id);
  res.redirect("/urls/");
  } else if (foundUser && req.body.password !== foundUser.password) {
    res.status(403).send('Email and password do not match.')
  } else if (!foundUser) {
    res.status(403).send('Email does not exist.')
  }
  return;
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