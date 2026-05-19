package com.tickets.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {
    
    private static final String URL = "jdbc:postgresql://localhost:5432/gestor_tareas";
    private static final String USER = "postgres";
    private static final String PASSWORD = "umg"; 
 
    
    public static Connection obtenerConexion() throws SQLException {
	    try {
	    	Class.forName("org.postgresql.Driver");
	    }catch (ClassNotFoundException e) {
	    	throw new SQLException("Driver PostSQL no encontrado", e);
	    }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
 
   
    public static boolean probarConexion() {
        try (Connection con = obtenerConexion()) {
            System.out.println("Conexión a PostgreSQL exitosa!");
            System.out.println("Base de datos: " + con.getSchema());
            return true;
        } catch (SQLException e) {
            System.err.println("❌ Error de conexión: " + e.getMessage());
            System.err.println("Verifica: PostgreSQL activo, credenciales, puerto 5432");
            return false;
        }
    }

}
