const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8000;

// middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// configuration
app.set("view engine", "ejs");

function generateRandomString(length) {
  const uniqueId = Math.random()
    .toString(36)
    .substring(2, length + 2);
  return uniqueId;
}

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// Databases
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//GET
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id/show", (req, res) => {
  const TinyURL = urlDatabase.req.params;
  const longURL = urlDatabase[TinyURL];
  const templateVars = { TinyURL: TinyURL, longURL: longURL };
  console.log(templateVars);
  return res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  const templateVars = { id: shortId, longURL };
  res.render("urls_show", templateVars);
});

// app.get("/urls/:id", (req, res) => {
//   const { id } = req.params;
//   const longURL = urlDatabase[id];
//   const templateVars = { id, longURL };
//   if (!longURL) {
//     return res.status(404).send("URL not found");
//   }
//   return res.redirect(longURL); // this should be a render
// });

//POST
app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const id = generateRandomString(6);
  urlDatabase[id] = longURL;
  const templateVars = { urls: urlDatabase };
  return res.render("urls_index", templateVars); // this should be a redirect
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  
  const { newUrl } = req.body;
  const shortId = req.params.id;
  
  urlDatabase[shortId] = newUrl;
  console.log(urlDatabase);

  return res.redirect("/urls");


  // const id = generateRandomString(3);
  // const newUser = {
  //   id: id,
  //   username: username,
  //   password: password,
  // };

  // urlDatabase[shortId] = newUrl;
  // console.log(users);
});

// app.post("/urls/:id/new", (req, res) => {
//   const id = req.params.id;

//   return app.redirect("/ursl/show", templateVars);
// });

const users = {
  abc: {
    id: "abc",
    username: "alice",
    password: "1234",
  },
  def: {
    id: "def",
    username: "bob",
    password: "5678",
  },
};

//COOKIES         //(organize GETS && POSTS later)
//GET /login
app.get("/login", (req, res) => {
  return res.render("urls_login");
});

app.get("/protected", (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).send("You must be logged in to see this page");
  }

  const user = users[userId];
  const templateVars = {
    user,
  };

  return res.render("urls_protected", templateVars);
});

app.get("/register", (req, res) => {
  return res.render("urls_register");
});

//POST /login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // test edge cases
  if (!username || !password) {
    return res.status(400).send("Please enter a username and password");
  }

  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.username === username) {
      foundUser = user;
    }
  }

  if (!foundUser) {
    return res.status(400).send("No user with that username found");
  }

  if (foundUser.password !== password) {
    return res.send("Wrong Password!");
  }
  //happy path
  res.cookie("userId", foundUser.id);
  res.redirect("/protected");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
//this redirect is not working and page instead redirects to /protected
  return res.redirect("urls_login");
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).send("Please provide a username and password");
  }

  //turn this into a function above with functions
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.username === username) {
      foundUser = user;
    }
  }

  if (foundUser) {
    return res.status(400).send("A user with that username already exists");
  }

  //use this for the create new url edit
  const id = generateRandomString(3);
  const newUser = {
    id: id,
    username: username,
    password: password,
  };

  users[id] = newUser;
  console.log(users);

  // do we set the cookie?

  // redirect
  return res.redirect("/login");
});
