document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    if (localStorage.getItem("usuarioId")) {
		const rol = localStorage.getItem("rol");
		window.location.href = rol === "SOLICITANTE" ? "dashboardSolicitante.html" : "dashboard.html";
		return;
    }

    form.addEventListener("submit", login);
});

async function login(event) {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    mostrarMensaje("", "");

    try {
        const response = await fetch(API_URL + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo,
                contrasena
            })
        });

        const data = await response.json();

        if (!response.ok || !data.autenticado) {
            mostrarMensaje(data.mensaje || "No se pudo iniciar sesión", "error");
            return;
        }

        localStorage.setItem("usuarioId", data.usuarioId);
        localStorage.setItem("nombre", data.nombre || correo);
        localStorage.setItem("correo", data.correo || correo);
        localStorage.setItem("rol", data.rol);

        window.location.href = data.rol === "SOLICITANTE" ? "dashboardSolicitante.html" : "dashboard.html";
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con el backend", "error");
    }
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");

    mensaje.textContent = texto;
    mensaje.className = texto ? `message show ${tipo}` : "message";
}
