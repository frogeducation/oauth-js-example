# FrogOS oAuth 1.0a Client Example

First make sure that you have nodejs 14 | 16 installed. Then clone the repo and `npm install` the dependencies.

Edit [./config.json](config.json) and replace the values with your own.
To generate your own keys and secrets navigate to your Frog URL `/app/admin/oauth` 
e.g. [https://frogos-one.local.frogdev.asia/app/admin/oauth](https://frogos-one.local.frogdev.asia/app/admin/oauth)

You must be logged in as an admin to access this screen.

Finally, spin up a local server and navigate to http://localhost:3000.

```shell
git clone
cd oauth-js-example
npm install
node index.js
```
