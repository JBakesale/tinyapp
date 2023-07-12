const express = require("express");
const app = express();
const PORT = 8000;

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// app.get("/", (req, res) => {
//   res.send("Hello!");urls
// });

function generateRandomString() {
  let randomString = "";
  const stringLength = 6;
  const letters = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < stringLength; i++) {
    const ranChar = Math.random() * letters.length;
    randomString += letters.charAt(ranChar);
  }

  return randomString;
}

app.use(express.urlencoded({ extended: true }));

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  if (!longURL) {
    res.status(404).send("URL not found");
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  
  res.redirect("/urls_new");
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
