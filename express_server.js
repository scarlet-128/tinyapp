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
const users = { 
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
}
app.get("/register", (req, res) => {
  res.render("register");
});

//register handler
app.post("/register",(req,res) =>{
  // console.log("req:",req.body);
  const email = req.body.email
  const password = req.body.password
  const id = generateRandomString();

  if(!email || !password) {
    return res.status(400).send("Please enter your email & password")
  }
  for (let user in users) {
    if (users[user].email === email ) {
      return res.status(400).json({
        msg: "Email already exists"
      })
    }
  }
  users[id] = {id,email,password}
  // console.log(req.cookies)
  res.cookie("email",email);
  res.redirect("/urls");
})



app.get("/login", (req, res) => {

  res.render("login");
});
app.post("/login",(req,res) => {
  console.log()
  const email = req.body.email
  res.cookie("email",email);
  const templateVars = {users: `Login as ${email}`}
  res.redirect("/urls",templateVars)

})

app.post("/urls", (req, res) => {
  // console.log(req.body);
  const longURL = req.body.longURL;
  

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  for (const key in urlDatabase) {
    if (urlDatabase[key] === longURL) {
      res.redirect(`/urls/${key}`);
    }
  }
  // console.log("urlDatabase: ", urlDatabase);
  res.redirect(`/urls/${ shortURL }`);

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
//get the urls page
app.get("/urls", (req, res) => {
  console.log(req.cookies)
   const templateVars = {
   urls: urlDatabase,
    user:  req.cookies.email
  };
  // console.log(res.cookies)
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  // console.log(req.params.shortURL)
   const longURL = urlDatabase[req.params.shorURL];
  res.redirect(longURL.includes("http") ? longURL : `http://${longURL}`);
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
app.post("/urls/:id", (req,res) => {
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id] = longURL;
  res.redirect("/urls/:shortURL")
})






app.post("/urls/:shortURL/delete",(req,res) => {
  const shortURL = req.params.shortURL
  console.log(urlDatabase);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})
app.post("/urls/:shortURL",(req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls")
})




app.post("/logout", (req, res) => {
  console.log(req.cookies)
  res.clearCookie('email',req.body.email);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});