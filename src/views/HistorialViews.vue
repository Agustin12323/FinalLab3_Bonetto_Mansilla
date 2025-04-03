<template>
  <div class="Historial">
    <div class="Título">
      <h2>Historial de Operaciones</h2>
    </div>

    <div class="FiltroFondo">
      <div class="FilaFiltro">
        <div class="Filtro">
          <label for="filtrarAccion">Acción realizada:</label>
          <select id="filtrarAccion" v-model="filtrarAccion">
            <option value="">Todas</option>
            <option value="purchase">Compra</option>
            <option value="sale">Venta</option>
          </select>
        </div>
        <div class="Filtro">
          <label for="filtrarMoneda">Filtrar por Moneda:</label>
          <select id="filtrarMoneda" v-model="filtrarMoneda">
            <option value="">Todas</option>
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="dogecoin">Dogecoin</option>
          </select>
        </div>
        <div class="Filtro">
          <label for="filtrarExchange">Seleccione un Exchange:</label>
          <select id="filtrarExchange" v-model="filtrarExchange">
            <option value="">Todos</option>
            <option value="satoshitango">SatoshiTango</option>
            <option value="buenbit">BuenBit</option>
            <option value="criptofacil">CriptoFacil</option>
            <option value="letsbit">Let'sBit</option>
          </select>
        </div>
      </div>
      <div class="FilaFiltro">
        <div class="Filtro">
          <label for="filtrarCantidad">Cantidad:</label>
          <input type="number" id="filtrarCantidad" v-model.number="filtrarCantidad" min="0" placeholder="Cantidad" />
        </div>
        <div class="Filtro">
          <label for="filtrarMinimo">Mínimo Total (ARS):</label>
          <input type="number" id="filtrarMinimo" v-model.number="filtrarMinimo" min="0" placeholder="Monto" />
        </div>
        <div class="Filtro">
          <label for="filtrarFecha">Fecha:</label>
          <input type="date" id="filtrarFecha" v-model="filtrarFecha" />
        </div>
      </div>
      <div class="BotonFiltro">
        <button @click="aplicarFiltros">Filtrar</button>
      </div>
    </div>

    <div class="TablaFiltro" v-if="filtro.length">
      <table>
        <thead>
          <tr>
            <th>Usuario ID</th>
            <th>Acción</th>
            <th>Moneda</th>
            <th>Exchange</th>
            <th>Cantidad</th>
            <th>Total (ARS)</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="operacion in filtro" :key="operacion._id">
            <td>{{ userId }}</td>
            <td>{{ operacion.action === 'purchase' ? 'Compra' : 'Venta' }}</td>
            <td>{{ operacion.crypto_code }}</td>
            <td>{{ operacion.exchange || 'N/A' }}</td>
            <td>{{ operacion.crypto_amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            <td>{{ operacion.money.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            <td>{{ formatoFecha(operacion.datetime) }}</td>
            <td>
              <button @click="detallesOperacion(operacion._id)">Detalles</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="Título">
      <p>No hay operaciones que coincidan con el filtro.</p>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient';

export default {
  data() {
    return {
      historial: [],
      userId: localStorage.getItem("userId") || '',
      filtrarAccion: '',
      filtrarMoneda: '',
      filtrarExchange: '',
      filtrarCantidad: null,
      filtrarMinimo: null,
      filtrarFecha: null,
      filtro: [],
    };
  },
  async created() {
    try {
      await this.cargarHistorial();
    } catch (error) {
      alert("Error al cargar el historial: " + (error.message || "Error de Red"));
      console.error("Error en created:", error);
    }
  },
  methods: {
    async cargarHistorial() {
      if (!this.userId) {
        alert("No hay usuario activo. Inicia sesión.");
        this.$router.push("/login");
        return;
      }
      try {
        const response = await apiClient.obtenerTransaccion(this.userId);
        this.historial = response.data
          .filter(
            (transaccion) => !(transaccion.action === "purchase" && transaccion.crypto_code === "ARS") && transaccion.deleted !== true
          )
          .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)); 
        this.filtro = [...this.historial];
      } catch (error) {
        if (error.message.includes("Network Error")) {
          alert("No se pudo conectar con la API. Verifica tu conexión a internet o la disponibilidad del servidor.");
        } else {
          alert("Error al cargar el historial: " + error.message);
        }
        console.error("Error al cargar historial:", error);
        throw error;
      }
    },
    aplicarFiltros() {
      this.filtro = [...this.historial];

      if (this.filtrarAccion) {
        this.filtro = this.filtro.filter((op) => op.action === this.filtrarAccion);
      }
      if (this.filtrarMoneda) {
        this.filtro = this.filtro.filter((op) =>
          op.crypto_code.toLowerCase().includes(this.filtrarMoneda.toLowerCase())
        );
      }
      if (this.filtrarExchange) {
        this.filtro = this.filtro.filter((op) =>
          op.exchange && op.exchange.toLowerCase().includes(this.filtrarExchange.toLowerCase())
        );
      }
      if (this.filtrarCantidad !== null && !isNaN(this.filtrarCantidad)) {
        this.filtro = this.filtro.filter((op) => op.crypto_amount == this.filtrarCantidad);
      }
      if (this.filtrarMinimo !== null && !isNaN(this.filtrarMinimo)) {
        this.filtro = this.filtro.filter((op) => op.money >= this.filtrarMinimo);
      }
      if (this.filtrarFecha) {
        this.filtro = this.filtro.filter((op) => {
          const fechaOp = new Date(op.datetime).toISOString().split('T')[0];
          return fechaOp === this.filtrarFecha;
        });
      }
    },
    formatoFecha(datetime) {
      if (!datetime) return 'N/A';
      return new Date(datetime).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
    detallesOperacion(id) {
      this.$router.push({ name: 'DetalleTransaccionView', params: { transactionId: id } });
    },
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

.Título {
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 20px;
  border-radius: 10px;
  display: inline-block;
  margin: auto;
}

.FiltroFondo {
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
  padding: 8px;
  width: 160px;
  border-radius: 5px;
  border: none;
  background-color: #ffffff;
  color: #333;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
}

.BotonFiltro {
  display: flex;
  justify-content: center;
}

.TablaFiltro {
  position: relative;
  z-index: 2;
  margin: 20px auto;
  max-width: 90%;
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
  text-align: left;
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

h2 {
  font-size: 2rem;
  padding: 10px;
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
}

p {
  font-size: 1.2rem;
  padding: 10px;
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
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