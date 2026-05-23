// Al cargar la página conecta el formulario con la función guardarUsuario
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("usuarioForm").addEventListener("submit", guardarUsuario);
});
 
// Recoge los datos del formulario y los envía al backend para crear el usuario
async function guardarUsuario(event) {
    event.preventDefault();
 
    // Construye el objeto con los datos ingresados en el formulario
    const usuario = {
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        departamento: document.getElementById("departamento").value.trim(),
        rol: document.getElementById("rol").value,
        contrasena: document.getElementById("contrasena").value
    };
 
    mostrarMensaje("", "");
 
    try {
 
        // Envía el objeto usuario al endpoint de creación
        const response = await fetch(API_URL + "/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });
 
        const data = await response.json();
 
        // Si el backend rechaza la solicitud lanza el error recibido
        if (!response.ok) {
            throw new Error(data.error || "No se pudo crear el usuario");
        }
 
        // Si todo salió bien muestra el modal de éxito y limpia el formulario
        mostrarExito(data.mensaje || "Usuario creado correctamente");
        document.getElementById("usuarioForm").reset();
 
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}
 
// Muestra un modal de confirmación al crear el usuario exitosamente
function mostrarExito(texto) {
 
    // Crea el fondo oscuro que cubre toda la pantalla
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
    `;
 
    // Construye el contenido del modal con el mensaje y el botón OK
    overlay.innerHTML = `
        <div style="
            background: white; border-radius: 12px;
            padding: 2rem; max-width: 320px; width: 90%;
            text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        ">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">✅</div>
            <p style="margin: 0 0 1.5rem; font-size: 1rem; color: #333;">${texto}</p>
            <button id="btnOkExito" style="
                background: #2563eb; color: white;
                border: none; border-radius: 8px;
                padding: 0.6rem 2rem; font-size: 1rem;
                cursor: pointer;
            ">OK</button>
        </div>
    `;
 
    // Agrega el modal al body para que sea visible
    document.body.appendChild(overlay);
 
    // Si el usuario hace click en OK lo lleva al login
    document.getElementById("btnOkExito").addEventListener("click", () => {
        window.location.href = "login.html";
    });
 
    // Si el usuario no hace nada redirige al login automáticamente después de 5 segundos
    setTimeout(() => {
        window.location.href = "login.html";
    }, 5000);
}
 
// Muestra u oculta el mensaje de error debajo del formulario
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = texto;
    mensaje.className = texto ? `message show ${tipo}` : "message";
}