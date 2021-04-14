const { Kubik } = require('rubik-main');
const fetch = require('node-fetch');
const set = require('lodash/set');
const isObject = require('lodash/isObject');
const querystring = require('querystring');

const methods = require('./Odnoklassniki/methods');

const OdnoklassnikiError = require('../errors/OdnoklassnikiError');

const DEFAULT_HOST = 'https://api.ok.ru/';

/**
 * Кубик для запросов к API Odnoklassniki
 * @class
 * @prop {String} [token] токен для доступа к API
 * @prop {String} [host=DEFAULT_HOST] адрес API Odnoklassniki
 */
class Odnoklassniki extends Kubik {
  constructor(token, host, version) {
    super(...arguments);
    this.token = token || null;
    this.host = host || null;
    this.version = version || null;

    this.methods.forEach(this.generateMethod, this);
  }

  /**
   * Поднять кубик
   * @param  {Object} dependencies зависимости
   */
  up({ config }) {
    this.config = config;

    const options = this.config.get(this.name);

    this.token = this.token || options.token || null;
    this.host = this.host || options.host || DEFAULT_HOST;
  }

  getUrl({ path, params, token, host }) {
    if (!host) host = this.host;
    if (!token) token = this.token;

    if (!host) throw new TypeError('host is not defined');
    if (!token) throw new TypeError('token is not defined');

    if (!params) params = {};
    if (params.platformId) {
      path = path.replace('{{platformId}}', params.platformId);
      delete params.platformId
    }

    params.access_token = token;

    return `${host}graph/${path}?${querystring.stringify(params)}`;
  }

  /**
   * Сделать запрос к API Viber
   * @param  {String} name  имя метода
   * @param  {Object|String} body тело запроса
   * @param  {String} [token=this.token] токен для запроса
   * @param  {String} [host=this.host] хост API Viber
   * @return {Promise<Object>} ответ от Viber API
   */
  async request({ path, body, params, token, host }) {
    if (isObject(body)) {
      body = JSON.stringify(body);
    }

    const url = this.getUrl({ path, params, token, host });
    let method = 'GET';
    const headers = {};

    if (body) {
      method = 'POST';
      headers['Content-Length'] = Buffer.byteLength(body);
      headers['Content-Type'] = 'application/json'
    }

    const request = await fetch(url, { method, body, headers });
    const result = await request.json();

    if (result.error_msg) throw new OdnoklassnikiError(result.error_msg);
    return result;
  }

  /**
   * Сгенерировать метод API
   *
   * Создает функцию для запроса к API, привязывает ее к текущему контексту
   * и кладет в семантичное имя внутри this.
   * В итоге он разбирет путь на части, и раскладывает его по семантичным объектам:
   * one/two/three -> this.one.two.three(currency, body, id);
   * @param  {String}  path путь запроса, без ведущего /: one/two/three
   */
  generateMethod({ kubikName, apiName }) {
    const method = (options) => {
      if (!options) options = {};
      const { body, params, token, host } = options;
      return this.request({ path: apiName, body, params, token, host });
    };
    set(this, kubikName, method);
  }
}

// Чтобы не создавать при каждой инициализации класса,
// пишем значения имени и зависимостей в протип
Odnoklassniki.prototype.dependencies = Object.freeze(['config']);
Odnoklassniki.prototype.methods = Object.freeze(methods);
Odnoklassniki.prototype.name = 'odnoklassniki';

module.exports = Odnoklassniki;
