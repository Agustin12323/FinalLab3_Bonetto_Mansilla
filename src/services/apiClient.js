import axios from 'axios';

const clienteAPI = axios.create({
  baseURL: " https://laboratorio-36cf.restdb.io/rest/",
  headers: { "x-apikey": "64a5ccf686d8c5d256ed8fce" },
  timeout: 20000,
});

clienteAPI.interceptors.request.use(
  (config) => {
    console.log("Solicitud enviada:", config.url, config.data, config.headers);
    return config;
  },
  (error) => {
    console.error("Error en la solicitud:", error.message, error.config);
    return Promise.reject(error);
  }
);

export default {
  obtenerTransaccion(user) {
    return clienteAPI.get(`/transactions?q={"user_id": "${user}"}`);
  },
  obtenerTransaccionId(id) {
    return clienteAPI.get(`/transactions/${id}`);
  },
  postTransaccion(user, accion, tipo, cantidad, precio, fecha, exchange, extra = {}) {
    return clienteAPI.post('/transactions', {
      "user_id": user,
      "action": accion,
      "crypto_code": tipo,
      "crypto_amount": cantidad,
      "money": precio,
      "datetime": fecha,
      "exchange": exchange,
      "originalAction": accion,
      "originalMoney": precio,
      "originalCryptoAmount": cantidad,
      "edited": false,
      "deleted": false,
      ...extra,
    });
  },
  insertarTransaccion(id, user, accion, tipo, cantidad, precio, fecha, exchange, extra = {}) {
    return clienteAPI.put(`/transactions/${id}`, {
      "user_id": user,
      "action": accion,
      "crypto_code": tipo,
      "crypto_amount": cantidad,
      "money": precio,
      "datetime": fecha,
      "exchange": exchange,
      ...extra,
    });
  },
  async deleteTransaccion(id) {
    try {
      
      const response = await clienteAPI.get(`/transactions/${id}`);
      const transaccion = response.data;

      return clienteAPI.put(`/transactions/${id}`, {
        "user_id": transaccion.user_id,
        "action": transaccion.action,
        "crypto_code": transaccion.crypto_code,
        "crypto_amount": transaccion.crypto_amount,
        "money": transaccion.money,
        "datetime": transaccion.datetime,
        "exchange": transaccion.exchange,
        "originalAction": transaccion.originalAction,
        "originalMoney": transaccion.originalMoney,
        "originalCryptoAmount": transaccion.originalCryptoAmount,
        "edited": transaccion.edited || false,
        "deleted": true, 
      });
    } catch (error) {
      throw new Error(`Error al obtener la transacción para eliminar: ${error.message}`);
    }
  },
};