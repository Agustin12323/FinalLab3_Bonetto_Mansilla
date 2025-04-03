import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import CriptoPreciosView from "@/views/CriptoPreciosView.vue";
import HistorialView from "@/views/HistorialViews.vue"; 
import CajaAhorroView from "@/views/CajaAhorroView.vue";
import DetalleTransaccionView from "@/views/DetalleTransaccionView.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/CriptoPrecios",
    name: "CriptoPrecios",
    component: CriptoPreciosView,
  },
  {
    path: "/Historial",
    name: "Historial",
    component: HistorialView,
  },
  {
    path: "/CajadeAhorro",
    name: "CajadeAhorro",
    component: CajaAhorroView,
  },
  {
    path: "/detalle-transaccion/:transactionId",
    name: "DetalleTransaccionView",
    component: DetalleTransaccionView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/login"];
  const authRequired = !publicPages.includes(to.path);
  const userId = localStorage.getItem("userId");

  if (authRequired && !userId) {
    next("/login");
  } else {
    next();
  }
});

export default router;