const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helper');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['x', 'y']
}))

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}



const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
};

const urlsForUser = (userId) => {
  let urls = {};
  for (let x in urlDatabase) {
    if (urlDatabase[x].userID === userId) {
      urls[x] = urlDatabase[x];
    }
  };
  return urls;
};


app.get("/register", (req, res) => {
 const templateVars = {users : users,
  id : req.session["user_id"]}
  res.render("register",templateVars);
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
  bcrypt.genSalt(10).then((salt) => {
    return bcrypt.hash(password,salt);
  })
  .then((hash) => {
    users[id] = {id,email,password:hash}
    req.session.user_id = id
    res.redirect("/urls");
  });  
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login",(req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  let currentUser = users[getUserByEmail(email,users)]
  if (!currentUser) {
     return res.status(401).send("Wrong email address")  
  }
  bcrypt.compare(password,currentUser["password"]).then((result)=>{
        if (result){
          // res.cookie("user_id",users[user].id);
          req.session.user_id = currentUser.id
          res.redirect("/urls");
        } else {
          return res.status(401).send("Whooo password is wrong!")
        }
  })
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID: req.session.user_id };
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users : users,
    id : req.session.user_id
  };
    if (!templateVars["id"]) {
      res.redirect("/login")
    } else {
res.render("urls_new",templateVars);}
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//get the urls page
app.get("/urls", (req, res) => {  
  const userId =req.session.user_id
  if (!userId && userId!==null) {    
    res.redirect("/login");
  } else {
    const templateVars = {
      urls  : urlsForUser(userId),
      email :  req.session.email,
      users : users,
      id    : userId  
    };
  res.render("urls_index", templateVars);
  } 
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL :urlDatabase[req.params.shortURL].longURL, 
    users   : users,
    id      : req.session["user_id"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete",(req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})
app.post("/urls/:id", (req,res) => {
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls")
})

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    return res.status(400).send("URL doesn't exist");
  }
  res.redirect(longURL.includes("http") ? longURL : `http://${longURL}`);
  return;
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});