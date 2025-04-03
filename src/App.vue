<template>
  <div id="app">
    <div id="cabecera">
      <div id="logo"></div>
      <div class="button-group">
        <button v-if="$route.name !== 'Home' && $route.name !== 'Login'" class="btn-inicio" @click="volverHome">Inicio</button>
        <button class="logout-btn" @click="cerrarSesion">Cerrar Sesión</button>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      UserLogged: !!localStorage.getItem('userId'),
    };
  },
  methods: {
    cerrarSesion() {
      localStorage.removeItem('userId');
      this.UserLogged = false;
      this.$router.push("/login");
    },
    volverHome() {
      this.$router.push("/");
    },
  },
  created() {
    this.UserLogged = !!localStorage.getItem('userId');
  },
  watch: {
    UserLogged(newVal) {
      if (newVal) {
        localStorage.setItem('userId', '');
      } else {
        localStorage.removeItem('userId');
      }
    },
  },
};
</script>

<style scoped>
#app {
  position: relative;
  min-height: 100vh;
}

#cabecera {
  background-color: black;
  height: 50px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between; 
  padding: 0 20px;
}

#logo {
  background: url("/public/images/cryptowallet.png") no-repeat center;
  background-size: contain;
  width: 100px; 
  height: 40px; 
  margin-left: 10px; 
}

.button-group {
  display: flex;
  gap: 10px; 
}

.btn-inicio {
  padding: 8px 16px;
  background-color: #0646db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-inicio:hover {
  background-color: #053bb8; 
}

.logout-btn {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background-color: #c0392b; 
}
</style>