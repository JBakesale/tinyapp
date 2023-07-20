// Module Imports:
const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 3333;

// Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["pepper", "tofu"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// Configuration
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// Databases:
  //urlDatabase with prefilled test urls and Ids
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "abc",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
  //users database with prefilled test users
const users = {
  abc: {
    id: "abc",
    email: "alice@a.com",
    password: bcrypt.hashSync("lilbandit", 10),
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "bob@b.com",
    password: "1234",
  },
};

// Function Imports:
const { generateRandomString, getUserByEmail } = require("./helpers");

// Local Functions
const urlsForUser = (userId) => {
  const urls = {};
  for (const urlId in urlDatabase) {
    const urlEntry = urlDatabase[urlId];
    if (urlEntry.userID === userId) {
      urls[urlId] = urlEntry.longURL;
    }
  }
  return urls;
};

// Create New Url Page
app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const urls = urlDatabase;

  if (!user) {
    res.send(
      "You must be logged in to view this page. <a href='/login'>Login here.</a>"
    );
  }

  const templateVars = {
    urls,
    user,
  };

  res.render("urls_new", templateVars);
});

// URL Database for signed in User
app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  if (!user) {
    res.send(
      "You must be logged in to view this page. <a href='/login'>Login here.</a>"
    );
  }
  const urls = urlsForUser(userId);
  const templateVars = {
    urls,
    user,
  };

  res.render("urls_index", templateVars);
});

// URL Edit Page with signed in User check
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  if (!user) {
    res.send(
      "You must be logged in to view this page. <a href='/login'>Login here.</a>"
    );
  }

  const shortId = req.params.id;
  if (!urlDatabase[shortId]) {
    return res.send("Url does not exist. <a href='/urls'>View Urls.</a>");
  }

  const longURL = urlDatabase[shortId].longURL;
  const templateVars = {
    id: shortId,
    longURL,
    user,
  };

  res.render("urls_show", templateVars);
});

// Login Page
app.get("/login", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user,
  };

  return res.render("urls_login", templateVars);
});

// Registration Page
app.get("/register", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { user };

  return res.render("urls_register", templateVars);
});

// Login Redirect for root Url entry
app.get("/", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user,
  };

  return res.render("urls_login", templateVars);
});

// Redirect for New Url creation
app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const id = generateRandomString(6);
  const userId = req.session.userId;
  const user = users[userId];

  if (!user) {
    return res.send(
      "You must be logged in to view this page. <a href='/login'>Login here.</a>"
    );
  }
  // Add new Url to the secure database
  urlDatabase[id] = { longURL, userID: userId };

  return res.redirect("/urls");
});

// URL deleted from database with redirect to URL database page
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Edit URL by User => redirect to URL page with updated Database
app.post("/urls/:id", (req, res) => {
  const { newUrl } = req.body;
  const shortId = req.params.id;

  if (!urlDatabase[shortId]) {
    return res.send("URL does not exist. <a href='/urls'>View URLS.</a>");
  }

  urlDatabase[shortId].longURL = newUrl;

  return res.redirect("/urls");
});

// Login Validation
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .send("Something went wrong. <a href='/login'>Please try again.</a>");
  }

  const foundUser = getUserByEmail(email, users);

  if (!foundUser) {
    return res
      .status(400)
      .send("Something went wrong. <a href='/login'>Please try again</a>");
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.send(
      "Something went wrong. <a href='/login'>Please try again</a>"
    );
  }

  req.session.userId = foundUser.id;

  res.redirect("/urls");
});

// Logout and nullify session credentials 
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

// New Account Registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  console.log(email);
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    return res
      .status(400)
      .send("No input detected. <a href='/register'>Please try again</a>");
  }

  const foundUser = getUserByEmail(email, users);

  // If User already exists
  if (foundUser) {
    return res
      .status(400)
      .send("Something went wrong. <a href='/register'>Please try again</a>");
  }

  // Create new url id
  const id = generateRandomString(6);
  const newUser = {
    id: id,
    email: email,
    password: password,
  };

  users[id] = newUser;
  req.session.userId = newUser.id;
  return res.redirect("/login");
});
