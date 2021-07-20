const crypto = require("crypto-js");
const oauth1a = require("oauth-1.0a");

class Oauth1Helper {
  static getAuthHeaderForRequest(consumer_key, consumer_secret, access_key, access_secret, request) {
    const oauth = oauth1a({
      consumer: { key: consumer_key, secret: consumer_secret },
      signature_method: "HMAC-SHA1",
      hash_function(base_string, key) {
        return crypto.algo.HMAC.create(crypto.algo.SHA1, key)
          .update(base_string)
          .finalize()
          .toString(crypto.enc.Base64);
      },
    });

    const authorization = oauth.authorize(request, {
      key: access_key,
      secret: access_secret,
    });

    return oauth.toHeader(authorization);
  }
}

module.exports = Oauth1Helper;
