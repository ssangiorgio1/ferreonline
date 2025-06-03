// Actualizar valor del filtro de precio
document.getElementById("precio").addEventListener("input", function() {
    document.getElementById("precio-value").innerText = `$${this.value}`;
  });
// Manejo del botón "Comprar"
document.addEventListener("DOMContentLoaded", function () {
  const comprarBtn = document.querySelector(".btn-comprar");

  if (comprarBtn) {
    comprarBtn.addEventListener("click", function () {
      const usuario = localStorage.getItem("usuario"); // Verifica si hay sesión

      if (!usuario) {
        // Si no hay sesión, redirige a login
        window.location.href = "login.html";
      } else {
        // Si hay sesión, continúa al pago
        window.location.href = "/api/checkout"; // Ajustá esta ruta según cómo manejes el pago
      }
    });
  }
});
