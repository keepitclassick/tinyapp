const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(cookieParser())

function generateRandomString() {
  let result = '';
  let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charLength = alpha.length

  for(let i = 0; i < 6; i++) { 
    result += alpha.charAt(Math.floor(Math.random() * charLength)); 
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}
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
  let userATM = users[req.cookies.user_id];
  let templateVars = { urls: urlDatabase,
    user: userATM};

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userATM = users[req.cookies["user_id"]];
  const templateVars =  { user: userATM };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userATM = users[req.cookies["user_id"]];
  const templateVars = { user: userATM, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = [req.body.longURL]
  res.redirect(`/urls/${newShortURL}`);
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
  newUserID = generateRandomString()
  users[newUserID] =  { id: newUserID, email: req.body.email, password: req.body.password }
  res.cookie("user_id", newUserID);
  console.log(users);
  res.redirect("/urls");
})
//edits specific url and redirects to main url page
app.post("/urls/:id", (req, res) => {
  shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.editURL;
  res.redirect("/urls/");
})

app.post("/login", (req, res) => {
res.cookie("user_id", req.cookies["user_id"]); //creates a cookie with the user id added to the form
res.redirect("/urls/");
})

app.post("/logout", (req, res) => {
res.clearCookie("user_id"); //deletes the cookie
res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});