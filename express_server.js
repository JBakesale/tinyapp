const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3333;

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
const userUrls = (userId) => {
  const urls = {};
  const ids = Object.keys(urlDatabase);

  console.log("ids:", ids);

  for (const id of ids) {
    const url = urlDatabase[id];
    if (id === userId) {
      urls[id] = url;
    }
  }
  //almost works but doesn't display more than one url!!
  return urls;
};


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// Databases
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  def: "http://www.google.com",
  def: "http://www.netflix.com",
  def: "http://www.tsn.com",
};

const users = {
  abc: {
    id: "abc",
    email: "alice@a.com",
    password: "1234",
  },
  def: {
    id: "def",
    email: "bob@b.com",
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
    // email: req.cookies["email"],
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

  const urls = userUrls(userId);
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
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  const templateVars = {
    id: shortId,
    longURL,
    // email: req.cookies["email"],
  };

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
  const password = req.body.password;

  // test edge cases
  if (!email || !password) {
    return res
      .status(400)
      .send("Something went wrong. <a href='/login'>Please try again.</a>");
  }

  const foundUser = findUser(email);

  // keep status vague for security
  if (!foundUser) {
    return res
      .status(400)
      .send("Something went wrong. <a href='/login'>Please try again</a>");
  }

  if (foundUser.password !== password) {
    return res.send(
      "Something went wrong. <a href='/login'>Please try again</a>"
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
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .send("No input detected. <a href='/register'>Please try again</a>");
  }

  const foundUser = findUser(email);

  // keep response vague for security
  if (foundUser) {
    return res
      .status(400)
      .send("Something went wrong. <a href='/register'>Please try again</a>");
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
  res.cookie("userId", newUser.id);
  return res.redirect("/login");
});
