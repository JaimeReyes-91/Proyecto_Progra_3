package com.tickets.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import com.tickets.modelo.Usuario;
import com.tickets.util.ConexionDB;


public class UsuarioDAO {

    public void crearUsuario(Usuario usuario) throws Exception {

        String sql = """
                INSERT INTO usuarios(
                nombre,
                correo,
                departamento,
                rol,
				contrasena
                )
                VALUES (?, ?, ?, ?, ?)
                """;

        try (Connection con = ConexionDB.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getCorreo());
            ps.setString(3, usuario.getDepartamento());
            ps.setString(4, usuario.getRol());
			ps.setString(5, usuario.getContrasena());
            ps.executeUpdate();
        }
    }

    public List<Usuario> listarUsuarios() throws Exception {

        List<Usuario> lista = new ArrayList<>();

        String sql = "SELECT * FROM usuarios ORDER BY id";

        try (Connection con = ConexionDB.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {

                Usuario usuario = new Usuario();

                usuario.setId(rs.getInt("id"));
                usuario.setNombre(rs.getString("nombre"));
                usuario.setCorreo(rs.getString("correo"));
                usuario.setDepartamento(
                        rs.getString("departamento")
                );
                usuario.setRol(rs.getString("rol"));
				usuario.setFecha_creacion(rs.getTimestamp("fecha_creacion"));
				usuario.setContrasena(rs.getString("contrasena"));

                lista.add(usuario);
            }
        }

        return lista;
    }
}


	

