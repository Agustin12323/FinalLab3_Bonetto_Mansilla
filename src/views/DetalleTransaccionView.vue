<template>
  <div>
    <h2>Detalles de la Transacción</h2>

    <div v-if="transaccion">
      <form @submit.prevent="guardarCambios">
        <div>
          <label>Usuario ID:</label>
          <input type="text" v-model="transaccion.user_id" disabled />
        </div>
        <div>
          <label>Acción:</label>
          <select v-model="transaccion.action">
            <option value="purchase">Compra</option>
            <option value="sale">Venta</option>
          </select>
        </div>
        <div>
          <label>Moneda:</label>
          <select v-model="transaccion.crypto_code">
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="dogecoin">Dogecoin</option>
          </select>
        </div>
        <div>
          <label>Exchange:</label>
          <select v-model="transaccion.exchange">
            <option value="satoshitango">SatoshiTango</option>
            <option value="buenbit">BuenBit</option>
            <option value="criptofacil">CriptoFacil</option>
            <option value="letsbit">Let'sBit</option>
          </select>
        </div>
        <div>
          <label>Cantidad:</label>
          <input type="number" v-model.number="transaccion.crypto_amount" min="0" />
        </div>
        <div>
          <label>Total (ARS):</label>
          <input type="number" :value="totalCalculado" disabled />
        </div>
        <div>
          <label>Fecha:</label>
          <input type="datetime-local" v-model="transaccion.datetime" />
        </div>
        <button type="submit">Guardar Cambios</button>
        <button type="button" @click="eliminarTransaccion">Eliminar</button>
        <button type="button" @click="volver">Volver</button>
      </form>
    </div>
    <div v-else>
      <p>No se encontró la transacción.</p>
    </div>
  </div>
</template>

<script>
import { obtenerPrecio } from '@/services/criptoYaService';
import apiClient from '@/services/apiClient';

export default {
  props: ['transactionId'],
  data() {
    return {
      transaccion: null,
      precios: [],
    };
  },
  computed: {
    totalCalculado() {
      const criptoSeleccionada = this.precios.find(
        (cripto) => cripto.nombre.toLowerCase() === this.transaccion.crypto_code
      );
      return criptoSeleccionada
        ? criptoSeleccionada.precio * (this.transaccion.crypto_amount || 0)
        : 0;
    },
  },
  async created() {
    await this.obtenerPrecios();
    await this.cargarTransaccion();
  },
  methods: {
    async obtenerPrecios() {
      try {
        const [btcData, ethData, dogeData] = await Promise.all([
          obtenerPrecio("satoshitango", "btc", "ars"),
          obtenerPrecio("satoshitango", "eth", "ars"),
          obtenerPrecio("satoshitango", "doge", "ars"),
        ]);

        this.precios = [
          { nombre: "Bitcoin", moneda: "ARS", precio: btcData.ask },
          { nombre: "Ethereum", moneda: "ARS", precio: ethData.ask },
          { nombre: "Dogecoin", moneda: "ARS", precio: dogeData.ask },
        ];
      } catch (error) {
        console.error("Error al obtener precios:", error);
      }
    },
    async cargarTransaccion() {
      try {
        const response = await apiClient.obtenerTransaccionId(this.transactionId);
        this.transaccion = response.data;
        if (this.transaccion.datetime) {
          const fecha = new Date(this.transaccion.datetime);
          this.transaccion.datetime = fecha.toISOString().slice(0, 16);
        }
      } catch (error) {
        alert("Error al cargar la transacción: " + error.message);
        this.transaccion = null;
      }
    },
    async guardarCambios() {
      if (!this.transaccion) return;

      try {
        await apiClient.insertarTransaccion(
          this.transactionId,
          this.transaccion.user_id,
          this.transaccion.action,
          this.transaccion.crypto_code,
          this.transaccion.crypto_amount,
          this.totalCalculado,
          this.transaccion.datetime,
          this.transaccion.exchange,
          { edited: true }
        );
        alert("Cambios guardados con éxito");
        this.$router.push('/Historial');
      } catch (error) {
        alert("Error al guardar cambios: " + error.message);
      }
    },
    async eliminarTransaccion() {
      if (confirm("¿Estás seguro de que deseas eliminar esta transacción del historial? Esto no afectará tu caja de ahorro.")) {
        try {
          await apiClient.deleteTransaccion(this.transactionId);
          alert("Transacción eliminada del historial con éxito");
          this.$router.push('/Historial');
        } catch (error) {
          alert("Error al eliminar la transacción: " + error.message);
          console.error("Detalles del error al eliminar:", error);
        }
      }
    },
    volver() {
      this.$router.push('/Historial');
    },
  },
};
</script>

<style scoped>
div { margin-bottom: 10px; }
label { display: inline-block; width: 100px; }
input, select { padding: 5px; width: 200px; }
button { margin-right: 10px; padding: 5px 10px; cursor: pointer; }
</style>