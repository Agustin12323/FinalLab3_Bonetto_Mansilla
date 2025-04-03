<template>
  <div class="Historial">
    <div v-if="precios.length" class="BasePrecio">
      <div v-for="cripto in precios" :key="cripto.nombre" class="precio">
        <img :src="getCryptoLogo(cripto.nombre)" :alt="`${cripto.nombre} logo`" class="crypto-logo" />
        <h2>{{ cripto.nombre }}</h2>
        <p class="precio-valor">Precio en {{ cripto.moneda }}: <span class="precio-valor">${{ cripto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span></p>
      </div>
    </div>
    <div v-else class="mensaje">
      <p>Cargando...</p>
    </div>

    <div v-if="presupuestoARS !== null" class="mensaje">
      <p>Presupuesto disponible (ARS): ${{ presupuestoARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
    </div>

    <div class="ColumnaFiltro">
      <div class="FilaFiltro">
        <div class="Filtro">
          <label for="accion">Selecciona una acción:</label>
          <select v-model="accion" id="accion" required>
            <option value="purchase">Compra</option>
            <option value="sale">Venta</option>
          </select>
        </div>
        <div class="Filtro">
          <label for="moneda">Selecciona una moneda:</label>
          <select v-model="monedaSeleccionada" id="moneda" required>
            <option v-for="cripto in precios" :key="cripto.nombre" :value="cripto.nombre">
              {{ cripto.nombre }}
            </option>
          </select>
        </div>
      </div>
      <div class="FilaFiltro">
        <div class="Filtro">
          <label for="exchange">Exchange:</label>
          <select v-model="exchange" id="exchange" @change="obtenerPrecios" required>
            <option disabled value="">Seleccione una opción</option>
            <option value="satoshitango">SatoshiTango</option>
            <option value="buenbit">BuenBit</option>
            <option value="criptofacil">CriptoFacil</option>
            <option value="letsbit">Let'sBit</option>
          </select>
        </div>
        <div class="Filtro">
          <label for="cantidad">Cantidad:</label>
          <input type="number" step="any" name="cantidad" id="cantidad" v-model.number="cantidad" required />
        </div>
      </div>
      <div class="filter-button">
        <button @click="precioFinal">
          {{ accion === "purchase" ? "Comprar" : "Vender" }}
        </button>
      </div>
    </div>

    <div v-if="precioEstimado" class="mensaje">
      <p>Precio estimado: ${{ precioEstimado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
    </div>

    <div v-if="messajeOk" class="mensaje">
      <p>{{ messajeOk }}</p>
    </div>
  </div>
</template>

<script>
import { obtenerPrecio } from '@/services/criptoYaService';
import apiClient from '@/services/apiClient';

export default {
  name: "CriptoPreciosView",
  data() {
    return {
      precios: [],
      cantidad: 0,
      monedaSeleccionada: "",
      exchange: "satoshitango",
      accion: "",
      totalPrecio: 0,
      messajeOk: "",
      presupuestoARS: null,
    };
  },
  async created() {
    try {
      await this.obtenerPrecios();
      await this.cargarPresupuesto();
    } catch (error) {
      alert("Error al cargar precios iniciales o presupuesto: " + (error.message || "Error de Red"));
      console.error("Error en created:", error);
    }
  },
  computed: {
    precioEstimado() {
      const criptoSeleccionado = this.precios.find(
        (cripto) => cripto.nombre === this.monedaSeleccionada
      );
      return criptoSeleccionado ? criptoSeleccionado.precio * this.cantidad : 0;
    },
  },
  methods: {
    getCryptoLogo(nombre) {
      const logos = {
        Bitcoin: '/images/bitcoin-logo.png',
        Ethereum: '/images/ethereum-logo.png',
        Dogecoin: '/images/dogecoin-logo.png',
      };
      return logos[nombre] || '/public/images/default-crypto-logo.png';
    },
    async precioFinal() {
      if (!this.accion) {
        alert("Selecciona una acción");
        return;
      }
      if (!this.monedaSeleccionada) {
        alert("Selecciona una moneda");
        return;
      }
      if (!this.exchange) {
        alert("Selecciona un exchange");
        return;
      }
      if (this.cantidad <= 0) {
        alert("La cantidad debe ser mayor a 0");
        return;
      }

      const criptoSeleccionado = this.precios.find(
        (cripto) => cripto.nombre === this.monedaSeleccionada
      );
      if (!criptoSeleccionado) return;

      
      this.totalPrecio = Number(criptoSeleccionado.precio) * Number(this.cantidad);
      console.log("Precio unitario:", criptoSeleccionado.precio, "Cantidad:", this.cantidad, "Total calculado:", this.totalPrecio);

      if (isNaN(this.totalPrecio) || this.totalPrecio <= 0) {
        alert("Error al calcular el precio total.");
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("No hay un usuario activo. Inicia sesión.");
        return;
      }

      const ahora = new Date();
      const fechaFormateada = ahora.toISOString();

      const cryptoCode = this.monedaSeleccionada.toLowerCase();

      try {
        const cajaAhorro = await this.obtenerCajaAhorro(userId);
        console.log("Caja de ahorro actual:", cajaAhorro);

        if (this.accion === "purchase") {
          if (cajaAhorro.ARS < this.totalPrecio) {
            alert("No tienes fondos suficientes en pesos para realizar esta compra.");
            return;
          }
          console.log(`Intentando comprar ${this.cantidad} ${cryptoCode} por $${this.totalPrecio}. Saldo ARS: $${cajaAhorro.ARS}`);
          cajaAhorro.ARS -= this.totalPrecio;
          cajaAhorro[cryptoCode.charAt(0).toUpperCase() + cryptoCode.slice(1)] += this.cantidad;
        } else if (this.accion === "sale") {
          if (cajaAhorro[cryptoCode.charAt(0).toUpperCase() + cryptoCode.slice(1)] < this.cantidad) {
            alert(`No tienes suficientes ${cryptoCode} para realizar esta venta.`);
            return;
          }
          cajaAhorro.ARS += this.totalPrecio;
          cajaAhorro[cryptoCode.charAt(0).toUpperCase() + cryptoCode.slice(1)] -= this.cantidad;
        }

        try {
          const transaccionData = {
            user_id: userId,
            action: this.accion,
            crypto_code: cryptoCode,
            crypto_amount: this.cantidad,
            money: this.totalPrecio,
            datetime: fechaFormateada,
            exchange: this.exchange,
          };
          console.log(transaccionData);

          const response = await apiClient.postTransaccion(
            userId,
            this.accion,
            cryptoCode,
            this.cantidad,
            this.totalPrecio,
            fechaFormateada,
            this.exchange
          );

          console.log(response.data);
        } catch (apiError) {
          if (apiError.message.includes("Error de Red")) {
            alert("No se pudo conectar con la API. Verifica tu conexión a internet o la disponibilidad del servidor.");
            console.error("Detalles del error de red:", apiError);
            return;
          } else if (apiError.response && apiError.response.status === 400) {
            console.error("Detalles del error 400:", apiError.response.data);
            alert("Error al registrar la transacción en la API: " + apiError.message);
            return;
          }
          throw apiError;
        }

        const montoFormateado = this.totalPrecio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.messajeOk = `${this.accion === "purchase" ? "Compra realizada con éxito" : "Venta realizada con éxito"} por $${montoFormateado}`;
        this.resetForm();
        await this.cargarPresupuesto();
        window.dispatchEvent(new Event("actualizarCaja"));
      } catch (error) {
        alert("Error al realizar la operación: " + (error.message || "Error de Red"));
        console.error("Detalles del error:", error);
      }
    },
    async obtenerPrecios() {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          alert("No hay un usuario activo. Inicia sesión.");
          return;
        }

        if (!this.exchange) {
          this.precios = [];
          return;
        }

        const [btcData, ethData, dogeData] = await Promise.all([
          obtenerPrecio(this.exchange, "btc", "ars"),
          obtenerPrecio(this.exchange, "eth", "ars"),
          obtenerPrecio(this.exchange, "doge", "ars"),
        ]);

        this.precios = [
          { nombre: "Bitcoin", moneda: "ARS", precio: Number(btcData.ask) },
          { nombre: "Ethereum", moneda: "ARS", precio: Number(ethData.ask) },
          { nombre: "Dogecoin", moneda: "ARS", precio: Number(dogeData.ask) },
        ];
        console.log("Precios obtenidos:", this.precios);
      } catch (error) {
        alert("Error al obtener precios: " + (error.message || "Network Error"));
        console.error("Error al obtener precios:", error);
        this.precios = [];
      }
    },
    async obtenerCajaAhorro(userId) {
      try {
        const response = await apiClient.obtenerTransaccion(userId);
        const transacciones = response.data;
        const caja = {
          ARS: 0,
          Bitcoin: 0,
          Ethereum: 0,
          Dogecoin: 0,
        };

        transacciones.forEach((transaccion) => {
          const money = Number(transaccion.originalMoney) || Number(transaccion.money) || 0;
          const cryptoAmount = Number(transaccion.originalCryptoAmount) || Number(transaccion.crypto_amount) || 0;
          const action = transaccion.originalAction || transaccion.action;

          if (action === "purchase" && transaccion.crypto_code !== "ARS") {
            caja.ARS -= money;
            caja[transaccion.crypto_code.charAt(0).toUpperCase() + transaccion.crypto_code.slice(1)] += cryptoAmount;
          } else if (action === "sale") {
            caja.ARS += money;
            caja[transaccion.crypto_code.charAt(0).toUpperCase() + transaccion.crypto_code.slice(1)] -= cryptoAmount;
          } else if (action === "purchase" && transaccion.crypto_code === "ARS") {
            caja.ARS += money;
          }
        });
        return caja;
      } catch (error) {
        throw new Error("Error al obtener la caja de ahorro: " + error.message);
      }
    },
    async cargarPresupuesto() {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        this.presupuestoARS = null;
        return;
      }
      try {
        const caja = await this.obtenerCajaAhorro(userId);
        this.presupuestoARS = caja.ARS;
      } catch (error) {
        console.error("Error al cargar el presupuesto:", error);
        this.presupuestoARS = null;
        alert("Error al cargar el presupuesto: " + (error.message || "Error de Red"));
      }
    },
    resetForm() {
      this.cantidad = 0;
      this.monedaSeleccionada = "";
      this.accion = "";
      this.totalPrecio = 0;
    },
  },
  mounted() {
    window.addEventListener("actualizarCaja", this.cargarPresupuesto);
  },
  beforeUnmount() {
    window.removeEventListener("actualizarCaja", this.cargarPresupuesto);
  },
};
</script>

<style scoped>
.Historial {
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

.BasePrecio {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.precio {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  margin: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 250px;
  text-align: center;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.precio:hover {
  transform: scale(1.05);
}

.crypto-logo {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: #2c3e50;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
}

p {
  font-size: 1.3rem;
  margin-bottom: 0;
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
}

.precio-valor {
  font-weight: 700;
  color: #2980b9;
}

.mensaje {
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px 30px;
  border-radius: 10px;
  display: inline-block;
  margin: 20px auto;
}

.ColumnaFiltro {
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 10px;
  display: inline-block;
  margin: 20px auto;
  color: #ffffff;
}

.FilaFiltro {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.Filtro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
}

select,
input {
  padding: 5px;
  width: 150px;
  border-radius: 5px;
  border: none;
  background-color: #ffffff;
  color: #333;
  font-family: 'Roboto', sans-serif;
}

.filter-button {
  display: flex;
  justify-content: center;
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
</style>