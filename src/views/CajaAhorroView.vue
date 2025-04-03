<template>
  <div class="CajaAhorro">
    <div class="Titulo">
      <h2>Caja de Ahorro</h2>
    </div>

    <div class="TablaCaja">
      <table>
        <thead>
          <tr>
            <th>Moneda</th>
            <th>Cantidad</th>
            <th>Valor en ARS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ARS</td>
            <td>{{ cajaAhorro.ARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            <td>-</td>
          </tr>
          <tr>
            <td>Bitcoin</td>
            <td>{{ cajaAhorro.Bitcoin }}</td>
            <td>{{ valorEnARS.Bitcoin.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
          </tr>
          <tr>
            <td>Ethereum</td>
            <td>{{ cajaAhorro.Ethereum }}</td>
            <td>{{ valorEnARS.Ethereum.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
          </tr>
          <tr>
            <td>Dogecoin</td>
            <td>{{ cajaAhorro.Dogecoin }}</td>
            <td>{{ valorEnARS.Dogecoin.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="IngresarPesos">
      <div class="SaldoPesos">
        <label for="pesosDisponibles">Ingresar Pesos (ARS):</label>
        <input type="number" id="pesosDisponibles" v-model.number="pesosDisponibles" step="any" min="0" placeholder="Cantidad en ARS"/>
        <button @click="cargarDinero">Ingresar</button>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient';
import { obtenerPrecio } from '@/services/criptoYaService';

export default {
  data() {
    return {
      cajaAhorro: {
        ARS: 0,
        Bitcoin: 0,
        Ethereum: 0,
        Dogecoin: 0,
      },
      valorEnARS: {
        Bitcoin: 0,
        Ethereum: 0,
        Dogecoin: 0,
      },
      pesosDisponibles: 0,
    };
  },
  methods: {
    async cargarCajaAPI() {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("No hay un usuario activo. Inicia sesión.");
        return;
      }

      try {
        const response = await apiClient.obtenerTransaccion(userId);
        const transacciones = response.data;

        console.log("Transacciones recibidas:", transacciones);

        this.cajaAhorro = {
          ARS: 0,
          Bitcoin: 0,
          Ethereum: 0,
          Dogecoin: 0,
        };

        transacciones.forEach((transaccion) => {
          const money = Number(transaccion.originalMoney) || Number(transaccion.money) || 0;
          const cryptoAmount = Number(transaccion.originalCryptoAmount) || Number(transaccion.crypto_amount) || 0;
          const action = transaccion.originalAction || transaccion.action;

          if (action === "purchase" && transaccion.crypto_code === "ARS") {
            this.cajaAhorro.ARS += money;
          } else if (action === "purchase" && transaccion.crypto_code !== "ARS") {
            this.cajaAhorro.ARS -= money;
            const cryptoKey = transaccion.crypto_code.charAt(0).toUpperCase() + transaccion.crypto_code.slice(1);
            if (this.cajaAhorro[cryptoKey] !== undefined) {
              this.cajaAhorro[cryptoKey] += cryptoAmount;
            }
          } else if (action === "sale") {
            this.cajaAhorro.ARS += money;
            const cryptoKey = transaccion.crypto_code.charAt(0).toUpperCase() + transaccion.crypto_code.slice(1);
            if (this.cajaAhorro[cryptoKey] !== undefined) {
              this.cajaAhorro[cryptoKey] -= cryptoAmount;
            }
          }
        });

        console.log("Caja de Ahorro:", this.cajaAhorro);
        await this.calcularEnPesos(); 
      } catch (error) {
        if (error.message.includes("Network Error")) {
          alert("No se pudo conectar con la API. Verifica tu conexión a internet o la disponibilidad del servidor.");
        } else {
          alert("Error al cargar la caja de ahorro: " + error.message);
        }
        console.error("Error al cargar caja de ahorro:", error);
        throw error;
      }
    },
    async calcularEnPesos() {
      try {
        const [btcData, ethData, dogeData] = await Promise.all([
          obtenerPrecio("satoshitango", "btc", "ars"),
          obtenerPrecio("satoshitango", "eth", "ars"),
          obtenerPrecio("satoshitango", "doge", "ars"),
        ]);

        this.valorEnARS = {
          Bitcoin: this.cajaAhorro.Bitcoin * btcData.ask,
          Ethereum: this.cajaAhorro.Ethereum * ethData.ask,
          Dogecoin: this.cajaAhorro.Dogecoin * dogeData.ask,
        };

        console.log("Valores en pesos calculados:", this.valorEnARS);
      } catch (error) {
        console.error("Error al calcular valores en pesos:", error);
        alert("Error al obtener los precios de las criptomonedas: " + error.message);
        this.valorEnARS = {
          Bitcoin: 0,
          Ethereum: 0,
          Dogecoin: 0,
        };
      }
    },
    async cargarDinero() {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("No hay un usuario activo. Inicia sesión.");
        return;
      }

      if (this.pesosDisponibles <= 0 || isNaN(this.pesosDisponibles)) {
        alert("Por favor, ingresa una cantidad válida mayor a 0.");
        return;
      }

      try {
        const response = await apiClient.postTransaccion(
          userId,
          "purchase",
          "ARS",
          0,
          this.pesosDisponibles,
          new Date().toISOString(),
          "manual"
        );

        console.log("Respuesta de postTransaccion:", response.data);

        this.pesosDisponibles = 0;
        await this.cargarCajaAPI();
        window.dispatchEvent(new Event("actualizarCaja"));
      } catch (error) {
        if (error.message.includes("Network Error")) {
          alert("No se pudo conectar con la API. Verifica tu conexión a internet o la disponibilidad del servidor.");
        } else {
          alert("Error al ingresar dinero: " + error.message);
        }
        console.error("Detalles del error:", error);
      }
    },
  },
  created() {
    this.cargarCajaAPI();
  },
  mounted() {
    window.addEventListener("actualizarCaja", this.cargarCajaAPI);
  },
  beforeUnmount() {
    window.removeEventListener("actualizarCaja", this.cargarCajaAPI);
  },
};
</script>

<style scoped>
.CajaAhorro {
  text-align: center;
  min-height: 100vh;
  background-image: url('/public/images/crypto2.png'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
}

.Titulo {
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px 30px;
  border-radius: 10px;
  display: inline-block;
  margin: 20px auto;
}

.TablaCaja {
  position: relative;
  z-index: 2;
  margin: 20px auto;
  max-width: 600px; 
}

table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
}

th,
td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #3498db;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

td {
  font-size: 1rem;
  color: #2c3e50;
}

.IngresarPesos {
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 10px;
  display: inline-block;
  margin: 20px auto;
}

.SaldoPesos {
  display: flex;
  align-items: center;
  gap: 15px;
}

label {
  font-weight: 500;
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
}

input[type="number"] {
  padding: 8px;
  width: 160px;
  border-radius: 5px;
  border: none;
  background-color: #ffffff;
  color: #333;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
}

button {
  padding: 10px 20px;
  border: none;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}

h2 {
  font-size: 2rem;
  padding: 10px;
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
}
</style>