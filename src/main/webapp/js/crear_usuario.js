document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("usuarioForm").addEventListener("submit", guardarUsuario);
    document.getElementById("cancelarEdicion").addEventListener("click", limpiarFormulario);
});

async function guardarUsuario(event) {
    event.preventDefault();

    const usuario = {
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        departamento: document.getElementById("departamento").value.trim(),
        rol: document.getElementById("rol").value,
        contrasena: document.getElementById("contrasena").value
    };

    mostrarMensaje("", "");

    try {
        const response = await fetch(API_URL + "/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "No se pudo guardar el usuario");
        }

        mostrarMensaje(data.mensaje || "Usuario creado correctamente", "ok");
        limpiarFormulario();
		
		setTimeout(() => {
		    window.location.href = "login.html";
		}, 1500);

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

function limpiarFormulario() {
    document.getElementById("usuarioForm").reset();
    document.getElementById("usuarioId").value = "";
    document.getElementById("tituloFormulario").textContent = "Crear Usuario";
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = texto;
    mensaje.className = texto ? `message show ${tipo}` : "message";
}
