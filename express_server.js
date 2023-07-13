const express = require("express");
const app = express();
const PORT = 8000;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

function generateRandomString() {
  const uniqueId = Math.random().toString(36).substring(2,8);
  return uniqueId;
}

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id/show", (req, res) => {
  const TinyURL = urlDatabase.req.params;
  const longURL = urlDatabase[TinyURL];
  const templateVars = 
  { TinyURL: TinyURL,
    longURL: longURL
  }
  console.log(templateVars);
  return res.render("urls_show", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
const shortId = req.params.id;
const longURL = urlDatabase[shortId]

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



app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const id = generateRandomString();
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
  const { newUrl } = req.body //fix this
  const shortId = req.params.id

  urlDatabase = { 
    shortId,
    newUrl
  }
  app.send(urlDatabase);
  
  return res.redirect("/urls");
});





