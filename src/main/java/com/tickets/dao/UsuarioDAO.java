package com.tickets.dao;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import com.tickets.modelo.Usuario;
import com.tickets.util.ConexionDB;


public class UsuarioDAO {
	public List<Usuario> obtenerTodos(){
		List<Usuario> lista = new ArrayList<>();
		String sql = "SELECT * FROM autores";
		try (Connection con = ConexionDB.obtener();
	         Statement  st  = con.createStatement();
	         ResultSet  rs  = st.executeQuery(sql)) {
			 while (rs.next()) {
				Usuario a = new Usuario();
                a.setId(rs.getInt("id"));
                a.setNombre(rs.getString("nombre"));
                a.setCorreo(rs.getString("correo"));
                a.setDepartamento(rs.getString("departamento"));
                a.setRol(rs.getString("rol"));
                a.setFecha_creacion(rs.getTimestamp("fecha_creacion"));
                a.setContrasena(rs.getString("contrasena"));
                lista.add(a);
		}
		} catch (SQLException e) {
            e.printStackTrace();
        }
		return lista;
		
	}
}
