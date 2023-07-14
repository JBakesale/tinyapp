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

// functions
function generateRandomString(length) {
  const uniqueId = Math.random()
    .toString(36)
    .substring(2, length + 2);
  return uniqueId;
}
const findUser = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// Databases
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  abc: {
    id: "abc",
    email: "alice@a.com",
    password: "1234",
  },
  def: {
    id: "def",
    username: "bob@b.com",
    password: "5678",
  },
};

// GET
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id/show", (req, res) => {
  const TinyURL = urlDatabase.req.params;
  const longURL = urlDatabase[TinyURL];
  const templateVars = {
    TinyURL: TinyURL,
    longURL: longURL,
    username: req.cookies["username"],
  };
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

app.get("/login", (req, res) => {
  return res.render("urls_login");
});

//will be getting rid of this page
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

// POST
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
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // test edge cases
  if (!email || !password) {
    return res.status(400).send("Please enter a valid email or password");
  }

  const foundUser = findUser(email);

  // keep status vague for security
  if (!foundUser) {
    return res.status(400).send("Please enter a valid email or password");
  }

  if (foundUser.password !== password) {
    return res.send("Please enter a valid email or PASSWORD");
  }
  //happy path
  res.cookie("userId", foundUser.id);
  res.cookie("email", foundUser.email);

  //implement templateVars and redirect to /urls
  res.redirect("/protected");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  //this redirect is not working and page instead redirects to /protected
  return res.redirect("urls_login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please provide a valid email and password");
  }

  const foundUser = findUser(email);

  // keep response vague for security
  if (foundUser) {
    return res.status(400).send("Please enter a valid EMAIL and password");
  }

  //use this for the create new url edit
  const id = generateRandomString(3);
  const newUser = {
    id: id,
    email: email,
    password: password,
  };

  users[id] = newUser;
  // this is a test console log, remove later
  console.log(users);

  return res.redirect("/login");
});
