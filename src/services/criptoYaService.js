import axios from "axios";

const criptoYaApi = axios.create({
  baseURL: "https://criptoya.com/api",
  timeout: 5000,
});

export const obtenerPrecio = async (exchange, cripto, moneda) => {
  try {
    const response = await criptoYaApi.get(`/${exchange}/${cripto}/${moneda}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    throw error;
  }
};