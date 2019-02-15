const express = require('express');
const { authenticate } = require('../helpers/middleware');

const router = express.Router(); // eslint-disable-line new-cap

/** Get applications */
router.get('/', async (req, res) => {
  const apps = await req.db.apps.findAll({ where: { is_public: true }, attributes: { exclude: ['secret', 'allowed_ips'] } });
  res.json(apps);
});

/** Get my applications */
router.all('/me', authenticate('user'), async (req, res) => {
  const apps = await req.db.apps.findAll({ where: { owner: req.user } });
  res.json(apps);
});

/** Get application details */
router.get('/@:clientId', async (req, res, next) => {
  const { clientId } = req.params;
  const app = await req.db.apps.findOne({ where: { client_id: clientId }, attributes: { exclude: ['is_approved'] } });
  if (!app) {
    next();
  } else {
    if (!req.user || app.owner !== req.user) {
      app.secret = undefined;
      app.allowed_ips = undefined;
    }
    res.json(app);
  }
});

router.all('/authorized', authenticate('user'), async (req, res) => {
  const accounts = await req.steem.api.getAccountsAsync([req.user]);
  const postingAccountAuths = accounts[0].posting.account_auths;
  const apps = await req.db.apps.findAll({
    where: {
      client_id: postingAccountAuths.map(accountAuth => accountAuth[0]),
    },
    attributes: { exclude: ['secret'] },
  });

  res.json({ apps });
});

module.exports = router;
