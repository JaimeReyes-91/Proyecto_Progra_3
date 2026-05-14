package com.tickets.servicio;

import java.util.List;

import com.tickets.dao.UsuarioDAO;
import com.tickets.modelo.Usuario;

public class UsuarioServicio {
    private final UsuarioDAO usuarioDAO = new UsuarioDAO();

        public void crearUsuario(Usuario usuario) throws Exception {

            usuarioDAO.crearUsuario(usuario);
        }

        public List<Usuario> listarUsuarios() throws Exception {

            return usuarioDAO.listarUsuarios();
        }
}


