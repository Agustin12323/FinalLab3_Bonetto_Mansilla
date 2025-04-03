<template>
  <div class="Login">
    <div class="Login-caja">
      <h2>Iniciar sesión</h2>
      <input v-model="userId" type="text" placeholder="Ingrese su ID" />
      <button @click="iniciarSesion">Entrar</button>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  setup() {
    const router = useRouter();
    const userId = ref("");

    const iniciarSesion = () => {
      if (userId.value.trim()) {
        localStorage.setItem("userId", userId.value);
        router.push("/"); 
      } else {
        alert("Por favor, ingrese un ID válido.");
      }
    };

    return {
      userId,
      iniciarSesion,
    };
  },
};
</script>

<style scoped>
.Login {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("/public/images/cryptovault2.png");
  background-size: cover;
}


.Login-caja {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-top: 100px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 300px;
  height: 150px;
}


h2 {
  margin-bottom: 1rem;
  color: #333;
}


input {
  width: 100%;
  padding: 10px;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #2a5298;
}


button {
  width: 100%;
  padding: 10px;
  background-color: #2a5298;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {

  background-color: #1e3c72;
}
</style>