// Module Imports:

const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 3333;

// Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuration
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// Databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
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
    password: '1234',
  },
};

// Function Imports:
const { generateRandomString } = require("./helpers");
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
const getUserByEmail = (email, database) => {
  for (const urlId in database) {
    const urlEntry = database[urlId];
    if (urlEntry.email === email) {
      return urlEntry.userID;
    }
  }

  return null;
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
    // will likely need to be updated post database update
  };
  console.log(templateVars);
  return res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];

  if (!user) {
    res.send(
      "You must be logged in to view this page. <a href='/login'>Login here.</a>"
    );
  }
  // console.log("userId", userId);
  // console.log("users[userId]", user);

  const urls = urlsForUser(userId);
  console.log("urls:", urls);

  // userUrls(userId);
  // console.log(userId);

  const templateVars = {
    urls,
    user,
    // email: req.cookies["email"],
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];
  if (!user) {
    res.send(
      "You must be logged in to view this page. <a href='/login'>Login here.</a>"
    );
  }
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  const templateVars = {
    id: shortId,
    longURL,
    // this will also likely need to be updated post urlDatabase update
  };

  // POST /urls/:id should return a relevant error message if id does not exist
  // POST /urls/:id should return a relevant error message if the user is not logged in
  // POST /urls/:id should return a relevant error message if the user does not own the URL
  // POST /urls/:id/delete should return a relevant error message if id does not exist
  // POST /urls/:id/delete should return a relevant error message if the user is not logged in
  // POST /urls/:id/delete should return a relevant error message if the user does not own the URL.

  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];

  if (user) {
    return res.redirect("/urls");
  }

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

app.post("/urls/:id/new", (req, res) => {
  const shortId = req.params.id;

  return app.redirect("/ursl/show", templateVars);
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
  console.log(email); //test
  const password = req.body.password;

  // test edge cases
  if (!email || !password) {
    return res
      .status(400)
      .send("Something went wrong (nothing entered). <a href='/login'>Please try again.</a>");
  }

  const foundUser = getUserByEmail(email, urlDatabase);
  console.log(foundUser); //test

  // keep status vague for security
  if (!foundUser) {
    return res
      .status(400)
      .send("Something went wrong (no user). <a href='/login'>Please try again</a>");
  }

  if (foundUser.password !== password) {
    return res.send(
      "Something went wrong (wrong password). <a href='/login'>Please try again</a>"
    );
  }

  res.cookie("userId", foundUser.id); // too many cookies!
  // res.cookie("email", foundUser.email);

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  // clear email cookie as well, or refactor to only 1 cookie

  return res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  // const password = req.body.password;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    return res
      .status(400)
      .send("No input detected. <a href='/register'>Please try again</a>");
  }

  const foundUser = getUserByEmail(email, urlDatabase);

  // keep response vague for security
  if (foundUser) {
    return res
      .status(400)
      .send("Something went wrong. <a href='/register'>Please try again</a>");
  }

  //use this for the create new url edit
  const id = generateRandomString(6);
  const newUser = {
    id: id,
    email: email,
    password: password,
  };

  users[id] = newUser;
  // this is a test console log, remove later
  console.log(users);
  res.cookie("userId", newUser.id);
  return res.redirect("/login");
});
