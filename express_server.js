const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
 return Math.random().toString(36).substring(2, 8);
}



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = { nameX : "password"}
  

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login",(req,res) => {
  const templateVars = {user,}
  const userName = req.body.username
  res.cookie("user",username);
  res.redirect("/login");å
})
app.post("/urls", (req, res) => {
  console.log(req.body);  
  res.send("Ok");         
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
res.render("urls_new");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];

  let currentUser = users[userId];
  if (!userId) currentUser = false;
  const templateVars = {
    email: currentUser["email"],
    userId: userId,
    urls: urlDatabase,
    user: currentUser
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase.shortURL;
  res.redirect(longURL);
});






app.post("/urls/:shortURL/delete",(req,res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})
app.post("/urls/:shortURL",(req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls")
})



app.post("/logout", (req, res) => {
  console.log(req.body);
  res.clearCookie('userId', req.body.userId);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});