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
    keys: ["pepper", 33],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// Configuration
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// Databases
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

// GET
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id/show", (req, res) => {
  const TinyURL = urlDatabase.req.params;
  const longURL = urlDatabase[TinyURL].longURL;
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = {
    TinyURL,
    longURL,
    user,
  };
  console.log(templateVars);
  return res.render("urls_show", templateVars);
});

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

app.get("/register", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { user };

  return res.render("urls_register", templateVars);
});
// POST
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
  urlDatabase[id] = { longURL, userID: userId };

  const templateVars = { urls: urlDatabase };
  return res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const { newUrl } = req.body;
  const shortId = req.params.id;

  if (!urlDatabase[shortId]) {
    return res.send("URL does not exist. <a href='/urls'>View URLS.</a>");
  }

  urlDatabase[shortId].longURL = newUrl;

  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .send(
        "Something went wrong. <a href='/login'>Please try again.</a>"
      );
  }

  const foundUser = getUserByEmail(email, users);

  if (!foundUser) {
    return res
      .status(400)
      .send(
        "Something went wrong. <a href='/login'>Please try again</a>"
      );
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.send(
      "Something went wrong. <a href='/login'>Please try again</a>"
    );
  }

  req.session.userId = foundUser.id;

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // Clear cookies
  req.session.userId = undefined;
  return res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    return res
      .status(400)
      .send("No input detected. <a href='/register'>Please try again</a>");
  }

  const foundUser = getUserByEmail(email, urlDatabase);

  if (foundUser) {
    return res
      .status(400)
      .send("Something went wrong. <a href='/register'>Please try again</a>");
  }

  // Create new url edit
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
