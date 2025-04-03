<template>
  <div class="Home">
    <div class="Titulo">
    <h1>Bienvenido a CriptoWallet</h1>
    <p>Gestiona tus criptomonedas de manera fácil y segura.</p>
  </div>/>
    <div class="botones">
      <button @click="CriptoPrecios">Compra/Venta</button>
      <button @click="Historial">Historial</button>
      <button @click="CajadeAhorro">Caja de Ahorro</button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: "HomeView",
  setup() {
    const router = useRouter();
    const CriptoPrecios = () => {
      router.push('/CriptoPrecios');
    };
    const Historial = () => {
      router.push('/Historial');
    };
    const CajadeAhorro = () => {
      router.push('/CajadeAhorro');
    };
    return {
      CriptoPrecios,
      Historial,
      CajadeAhorro,
    };
  },
};
</script>

<style scoped>
.Home {
  text-align: center;
  min-height: 100vh;
  background-image: url('/public/images/crypto2.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}


.Titulo {
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.6); 
  padding: 20px 20px;
  border-radius: 10px;
  display: inline-block; 
  margin: 0 auto; 
}

h1 {
  font-size: 2.5rem;
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
  color: #ffffff; 
  font-weight: bold;
}

p {
  font-size: 1.2rem;
  margin-bottom: 0; 
  color: #ffffff;
  font-weight: 500;
}

.botones {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}
</style>