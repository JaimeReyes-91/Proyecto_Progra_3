package com.tickets.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.tickets.modelo.Usuario;
import com.tickets.util.ConexionDB;

public class UsuarioDAO {

    public void insertar(
            Usuario usuario
    ) throws Exception {

        String sql = """
            INSERT INTO usuarios
            (
                nombre,
                correo,
                departamento,
                rol,
                contrasena
            )
            VALUES (?, ?, ?, ?, ?)
        """;

        try (
            Connection con =
                    ConexionDB.obtenerConexion();

            PreparedStatement ps =
                    con.prepareStatement(sql)
        ) {

            ps.setString(
                    1,
                    usuario.getNombre()
            );

            ps.setString(
                    2,
                    usuario.getCorreo()
            );

            ps.setString(
                    3,
                    usuario.getDepartamento()
            );

            ps.setString(
                    4,
                    usuario.getRol()
            );

            ps.setString(
                    5,
                    usuario.getContrasena()
            );

            ps.executeUpdate();
        }
    }

    public List<Usuario> listar()
            throws Exception {

        List<Usuario> lista =
                new ArrayList<>();

        String sql = """
            SELECT
                id,
                nombre,
                correo,
                departamento,
                rol
            FROM usuarios
            ORDER BY id
        """;

        try (
            Connection con =
                    ConexionDB.obtenerConexion();

            PreparedStatement ps =
                    con.prepareStatement(sql);

            ResultSet rs =
                    ps.executeQuery()
        ) {

            while (rs.next()) {

                Usuario usuario =
                        new Usuario();

                usuario.setId(
                        rs.getInt("id")
                );

                usuario.setNombre(
                        rs.getString("nombre")
                );

                usuario.setCorreo(
                        rs.getString("correo")
                );

                usuario.setDepartamento(
                        rs.getString(
                                "departamento"
                        )
                );

                usuario.setRol(
                        rs.getString("rol")
                );

                lista.add(usuario);
            }
        }

        return lista;
    }

    public Usuario buscarPorId(
            Integer id
    ) throws Exception {

        String sql = """
            SELECT *
            FROM usuarios
            WHERE id = ?
        """;

        try (
            Connection con =
                    ConexionDB.obtenerConexion();

            PreparedStatement ps =
                    con.prepareStatement(sql)
        ) {

            ps.setInt(1, id);

            ResultSet rs =
                    ps.executeQuery();

            if (rs.next()) {

                Usuario usuario =
                        new Usuario();

                usuario.setId(
                        rs.getInt("id")
                );

                usuario.setNombre(
                        rs.getString("nombre")
                );

                usuario.setCorreo(
                        rs.getString("correo")
                );

                usuario.setDepartamento(
                        rs.getString(
                                "departamento"
                        )
                );

                usuario.setRol(
                        rs.getString("rol")
                );

                usuario.setContrasena(
                        rs.getString(
                                "contrasena"
                        )
                );

                return usuario;
            }
        }

        return null;
    }

    public Usuario buscarPorCorreo(
            String correo
    ) throws Exception {

        String sql = """
            SELECT *
            FROM usuarios
            WHERE correo = ?
        """;

        try (
            Connection con =
                    ConexionDB.obtenerConexion();

            PreparedStatement ps =
                    con.prepareStatement(sql)
        ) {

            ps.setString(1, correo);

            ResultSet rs =
                    ps.executeQuery();

            if (rs.next()) {

                Usuario usuario =
                        new Usuario();

                usuario.setId(
                        rs.getInt("id")
                );

                usuario.setNombre(
                        rs.getString("nombre")
                );

                usuario.setCorreo(
                        rs.getString("correo")
                );

                usuario.setDepartamento(
                        rs.getString(
                                "departamento"
                        )
                );

                usuario.setRol(
                        rs.getString("rol")
                );

                usuario.setContrasena(
                        rs.getString(
                                "contrasena"
                        )
                );

                return usuario;
            }
        }

        return null;
    }

    public void actualizar(
            Integer id,
            Usuario usuario
    ) throws Exception {

        String sql = """
            UPDATE usuarios
            SET
                nombre = ?,
                correo = ?,
                departamento = ?,
                rol = ?,
                contrasena = ?
            WHERE id = ?
        """;

        try (
            Connection con =
                    ConexionDB.obtenerConexion();

            PreparedStatement ps =
                    con.prepareStatement(sql)
        ) {

            ps.setString(
                    1,
                    usuario.getNombre()
            );

            ps.setString(
                    2,
                    usuario.getCorreo()
            );

            ps.setString(
                    3,
                    usuario.getDepartamento()
            );

            ps.setString(
                    4,
                    usuario.getRol()
            );

            ps.setString(
                    5,
                    usuario.getContrasena()
            );

            ps.setInt(6, id);

            ps.executeUpdate();
        }
    }

    public void eliminar(
            Integer id
    ) throws Exception {

        String sql = """
            DELETE FROM usuarios
            WHERE id = ?
        """;

        try (
            Connection con =
                    ConexionDB.obtenerConexion();

            PreparedStatement ps =
                    con.prepareStatement(sql)
        ) {

            ps.setInt(1, id);

            ps.executeUpdate();
        }
    }
}



