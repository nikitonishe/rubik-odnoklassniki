/* global describe test expect */
const path = require('path');
const { Kubiks: { Config } } = require('rubik-main');

const { createApp, createKubik } = require('rubik-main/tests/helpers/creators');

const Odnoklassniki = require('../classes/Odnoklassniki.js');

const CONFIG_VOLUMES = [
  path.join(__dirname, '../default/'),
  path.join(__dirname, '../config/')
];

const get = () => {
  const app = createApp();
  app.add(new Config(CONFIG_VOLUMES));

  const kubik = createKubik(Odnoklassniki, app);

  return { app, kubik };
}

describe('Кубик для работы с Odnoklassniki', () => {
  test('Создается без проблем и добавляется в App', () => {
    const { app, kubik } = get();
    expect(app.odnoklassniki).toBe(kubik);
    expect(app.get('odnoklassniki')).toBe(kubik);
  });

  test('Делает тестовый запрос к odnoklassniki (не забудьте добавить токен в настройки)', async () => {
    const { app, kubik } = get();
    await app.up();
    const response = await kubik.me.subscriptions({ token: app.config.get('odnoklassniki').token });
    expect(response.subscriptions).toBeTruthy();
    await app.down();
  });

  test('Тестовый запрос к odnoklassniki с невалидным токеном завершается ошибкой', async () => {
    const { app, kubik } = get();
    await app.up();
    expect(kubik.me.subscriptions({ token: '12345' })).rejects.toThrow();
    await app.down();
  });
});
