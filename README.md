# rubik-facebook
Odnoklassniki's Bot API kubik for the Rubik

## Install

### npm
```bash
npm i rubik-odnoklassniki
```

### yarn
```bash
yarn add rubik-odnoklassniki
```

## Use
```js
const { App, Kubiks } = require('rubik-main');
const Odnoklassniki = require('rubik-odnoklassniki');
const path = require('path');

// create rubik app
const app = new App();
// config need for most modules
const config = new Kubiks.Config(path.join(__dirname, './config/'));

const odnoklassniki = new Odnoklassniki();

app.add([ config, odnoklassniki ]);

app.up().
then(() => console.info('App started')).
catch(err => console.error(err));
```

## Config
`odnoklassniki.js` config in configs volume may contain the host and token.

If you do not specify a host, then `https://api.ok.ru/` will be used by default.

If you don't specify a token, you will need to pass it.
```js
...
const response = await app.get('odnoklassniki').debugToken();
...
```

```js
...
const response = await app.get('odnoklassniki').me.subscribedApps();
...
```

You may need the host option if for some reason Odnoklassniki host is not available from your server
and you want to configure a proxy server.


For example:
`config/odnoklassniki.js`
```js
module.exports = {
  host: 'https://my.odnoklassniki.proxy.example.com/'
};
```

## Extensions
Odnoklassniki kubik doesn't has any extension.
