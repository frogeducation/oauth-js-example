const express = require("express");
const session = require("express-session");
const OAuth1Client = require("oauth-1-client");

const config = require("./config.json");
const Oauth1Helper = require("./oauth1");
const axios = require("axios");

const app = express();
app.use(
  session({
    secret: "not a secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const oAuth1Client = new OAuth1Client({
  key: config.key,
  secret: config.secret,
  callbackURL: `http://localhost:${config.port}/callback`,
  requestUrl: `${config.base_url}/api/2/oauth1.php/request-token`,
  accessUrl: `${config.base_url}/api/2/oauth1.php/access-token`,
  apiHostName: config.base_url,
});

app.get("/", (req, res) => {
  res.send('<a href="/login">Login</a>');
});

app.get("/login", async (req, res) => {
  const requestTokenResponse = await oAuth1Client.requestToken();
  req.session.tokenSecret = requestTokenResponse.tokenSecret;
  res.redirect(`${config.base_url}/app/login?oauth_token=${requestTokenResponse.token}`);
});

app.get("/callback", async (req, res) => {
  const accessTokenResponse = await oAuth1Client.accessToken(
    req.query.oauth_token,
    req.session.tokenSecret,
    req.query.oauth_verifier
  );
  req.session.accessToken = accessTokenResponse.token;
  req.session.accessTokenSecret = accessTokenResponse.tokenSecret;

  res.redirect("/user");
});

app.get("/user", async (req, res) => {
  const api2Request = {
    url: `${config.base_url}/api/2/?method=auth.whoAmI`,
    method: "GET",
  };

  let authHeader = Oauth1Helper.getAuthHeaderForRequest(
    config.key,
    config.secret,
    req.session.accessToken,
    req.session.accessTokenSecret,
    api2Request
  );
  const api2 = await axios.get(api2Request.url, { headers: authHeader });

  const fdp1Request = {
    url: `${config.base_url}/api/fdp/1/auth/getauth`,
    method: "GET",
  };

  authHeader = Oauth1Helper.getAuthHeaderForRequest(
    config.key,
    config.secret,
    req.session.accessToken,
    req.session.accessTokenSecret,
    fdp1Request
  );
  authHeader["X-AuthType"] = "oauth_1_0_a";
  const fdp1 = await axios.get(fdp1Request.url, { headers: authHeader });

  res.send(`
<h1>Access Token & Secret</h1>
<pre>accessToken = ${req.session.accessToken}
accessTokenSecret = ${req.session.accessTokenSecret}</pre>

<h1>GET ${config.base_url}/api/2/?method=auth.whoAmI</h1>
<pre>${JSON.stringify(api2.data, null, 4)}</pre>

<h1>GET ${config.base_url}/api/fdp/1/auth/getauth</h1>
<pre>${JSON.stringify(fdp1.data, null, 4)}</pre>
`);
});

app.listen(config.port, () => {
  console.log(`Example app listening at http://localhost:${config.port}`);
});
