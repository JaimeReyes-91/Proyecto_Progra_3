document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("usuarioForm").addEventListener("submit", guardarUsuario);
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
            throw new Error(data.error || "No se pudo crear el usuario");
        }

        mostrarExito(data.mensaje || "Usuario creado correctamente");
        document.getElementById("usuarioForm").reset();

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

function mostrarExito(texto) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
    `;

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

    document.body.appendChild(overlay);

    document.getElementById("btnOkExito").addEventListener("click", () => {
        window.location.href = "login.html";
    });

    setTimeout(() => {
        window.location.href = "login.html";
    }, 5000);
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = texto;
    mensaje.className = texto ? `message show ${tipo}` : "message";
}