let usuarios = [];

document.addEventListener("DOMContentLoaded", () => {
    protegerSesion();
    prepararNavegacion();
    prepararFormulario();
    listarUsuarios();
});

function protegerSesion() {
    if (!localStorage.getItem("usuarioId")) {
        window.location.href = "login.html";
        return;
    }

    if (localStorage.getItem("rol") !== "SOPORTE") {
        window.location.href = "dashboard.html";
    }
}

function prepararNavegacion() {
    const nombre = localStorage.getItem("nombre") || "Usuario";
    const rol = localStorage.getItem("rol") || "";

    document.getElementById("usuarioActivo").textContent = `${nombre} · ${rol}`;
    document.getElementById("logoutLink").addEventListener("click", cerrarSesion);
}

function prepararFormulario() {
    document.getElementById("usuarioForm").addEventListener("submit", guardarUsuario);
    document.getElementById("cancelarEdicion").addEventListener("click", limpiarFormulario);
    document.getElementById("filtroUsuarios").addEventListener("input", renderUsuarios);
}

async function listarUsuarios() {
    try {
        const response = await fetch(API_URL + "/usuarios");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los usuarios");
        }

        usuarios = await response.json();
        renderUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

function renderUsuarios() {
    const tabla = document.getElementById("tablaUsuarios");
    const filtro = document.getElementById("filtroUsuarios").value.trim().toLowerCase();
    const visibles = usuarios.filter(usuario => {
        const texto = [
            usuario.id,
            usuario.nombre,
            usuario.correo,
            usuario.departamento,
            usuario.rol
        ].join(" ").toLowerCase();

        return texto.includes(filtro);
    });

    if (!visibles.length) {
        tabla.innerHTML = `<tr><td class="empty" colspan="6">No hay usuarios para mostrar.</td></tr>`;
        return;
    }

    tabla.innerHTML = visibles.map(usuario => `
        <tr>
            <td>${usuario.id}</td>
            <td>${escapar(usuario.nombre || "-")}</td>
            <td>${escapar(usuario.correo || "-")}</td>
            <td>${escapar(usuario.departamento || "-")}</td>
            <td><span class="badge ${usuario.rol}">${escapar(usuario.rol || "-")}</span></td>
            <td>
                <div class="actions">
                    <button class="btn small secondary" type="button" onclick="editarUsuario(${usuario.id})">Editar</button>
                    <button class="btn small danger" type="button" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join("");
}

async function guardarUsuario(event) {
    event.preventDefault();

    const id = document.getElementById("usuarioId").value;
    const usuario = {
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        departamento: document.getElementById("departamento").value.trim(),
        rol: document.getElementById("rol").value,
        contrasena: document.getElementById("contrasena").value
    };

    mostrarMensaje("", "");

    try {
        const response = await fetch(API_URL + "/usuarios" + (id ? "/" + id : ""), {
            method: id ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "No se pudo guardar el usuario");
        }

        mostrarMensaje(data.mensaje || "Usuario guardado", "ok");
        limpiarFormulario();
        await listarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

function editarUsuario(id) {
    const usuario = usuarios.find(item => item.id === id);

    if (!usuario) {
        return;
    }

    document.getElementById("usuarioId").value = usuario.id;
    document.getElementById("nombre").value = usuario.nombre || "";
    document.getElementById("correo").value = usuario.correo || "";
    document.getElementById("departamento").value = usuario.departamento || "";
    document.getElementById("rol").value = usuario.rol || "SOLICITANTE";
    document.getElementById("contrasena").value = "";
    document.getElementById("tituloFormulario").textContent = "Editar usuario";
    document.getElementById("nombre").focus();
}

async function eliminarUsuario(id) {
    if (!confirm("¿Eliminar este usuario?")) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/usuarios/" + id, {
            method: "DELETE"
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "No se pudo eliminar el usuario");
        }

        mostrarMensaje("Usuario eliminado", "ok");
        await listarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

function limpiarFormulario() {
    document.getElementById("usuarioForm").reset();
    document.getElementById("usuarioId").value = "";
    document.getElementById("tituloFormulario").textContent = "Crear usuario";
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");

    mensaje.textContent = texto;
    mensaje.className = texto ? `message show ${tipo}` : "message";
}

function escapar(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function cerrarSesion(event) {
    event.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
}
