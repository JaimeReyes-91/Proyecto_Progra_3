package com.tickets.servicio;

import java.util.List;

import com.tickets.dao.UsuarioDAO;
import com.tickets.modelo.Usuario;

public class UsuarioServicio {

    private final UsuarioDAO usuarioDAO =
            new UsuarioDAO();

    public void crearUsuario(
            Usuario usuario
    ) throws Exception {

        validar(usuario);

        usuarioDAO.insertar(usuario);
    }

    public List<Usuario> listarUsuarios()
            throws Exception {

        return usuarioDAO.listar();
    }

    public Usuario buscarPorId(
            Integer id
    ) throws Exception {

        return usuarioDAO.buscarPorId(id);
    }

    public Usuario autenticar(
            String correo,
            String contrasena
    ) throws Exception {

        if (correo == null || correo.isBlank()) {
            throw new Exception("Correo obligatorio");
        }

        if (contrasena == null || contrasena.isBlank()) {
            throw new Exception("Contraseña obligatoria");
        }

        Usuario usuario =
                usuarioDAO.buscarPorCorreo(correo);

        if (
            usuario == null
            || !contrasena.equals(usuario.getContrasena())
        ) {

            return null;
        }

        usuario.setContrasena(null);

        return usuario;
    }

    public void actualizarUsuario(
            Integer id,
            Usuario usuario
    ) throws Exception {

        validar(usuario);

        usuarioDAO.actualizar(
                id,
                usuario
        );
    }

    public void eliminarUsuario(
            Integer id
    ) throws Exception {

        usuarioDAO.eliminar(id);
    }

    private void validar(
            Usuario usuario
    ) throws Exception {

        if (
            usuario.getNombre() == null
            || usuario.getNombre().isBlank()
        ) {

            throw new Exception(
                    "Nombre obligatorio"
            );
        }

        if (
            usuario.getCorreo() == null
            || usuario.getCorreo().isBlank()
        ) {

            throw new Exception(
                    "Correo obligatorio"
            );
        }

        if (
            usuario.getContrasena() == null
            || usuario.getContrasena().isBlank()
        ) {

            throw new Exception(
                    "Contraseña obligatoria"
            );
        }
    }
}
