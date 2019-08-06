const jwt = require('jsonwebtoken');
const {
  PublicKey,
  PrivateKey,
  cryptoUtils,
  Signature,
} = require('dsteem');
const client = require('./client');
const { b64uEnc } = require('./utils');

const issueAppToken = (proxy, user) => {
  const message = {
    signed_message: { type: 'posting', app: proxy },
    authors: [user],
    timestamp: parseInt(new Date().getTime() / 1000, 10),
  };
  const hash = cryptoUtils.sha256(JSON.stringify(message));
  const privateKey = PrivateKey.fromString(process.env.BROADCASTER_POSTING_WIF);
  const signature = privateKey.sign(hash).toString();
  message.signatures = [signature];
  return b64uEnc(JSON.stringify(message));
};

/**
 * Create a refresh token for application, it can be used to obtain a renewed
 * access token. Refresh tokens never expire
 */
const issueAppRefreshToken = (proxy, user, scope = []) => (
  jwt.sign(
    {
      role: 'refresh', proxy, user, scope,
    },
    process.env.JWT_SECRET,
  )
);

// eslint-disable-next-line consistent-return
const verifySignature = (message, username, signature, cb) => {
  const hash = cryptoUtils.sha256(message);

  const broadcasterPrivKey = PrivateKey.fromString(process.env.BROADCASTER_POSTING_WIF);
  const broadcasterPubKey = broadcasterPrivKey.createPublic();
  if (broadcasterPubKey.verify(hash, Signature.fromString(signature))) {
    return cb(null, true);
  }

  client.database.getAccounts([username]).then((accounts) => {
    let signatureIsValid = false;
    if (accounts[0] && accounts[0].name) {
      ['posting', 'active', 'owner'].forEach((type) => {
        accounts[0][type].key_auths.forEach((key) => {
          if (
            !signatureIsValid
            && PublicKey.fromString(key[0]).verify(hash, Signature.fromString(signature))
          ) {
            signatureIsValid = true;
          }
        });
      });
      cb(null, signatureIsValid);
    } else {
      cb('Request failed', null);
    }
  }).catch((e) => {
    console.log('Get accounts failed', e);
    cb(e, null);
  });
};

module.exports = {
  issueAppToken,
  issueAppRefreshToken,
  verifySignature,
};
