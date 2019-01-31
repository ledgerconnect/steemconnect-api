module.exports = {
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 7,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "experimentalObjectRestSpread": true,
    },
  },
  "env": {
    "node": true,
    "browser": true,
  },
  "extends": "airbnb",
  "globals": {
    "document": true,
    "Headers": true,
    "localStorage": true,
    "window": true
  }
};
