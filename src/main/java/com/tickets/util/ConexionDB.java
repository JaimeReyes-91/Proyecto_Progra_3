package com.tickets.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {
    // ── Parámetros de conexión ────────────────────────────────────
    // Formato: jdbc:postgresql://HOST:PUERTO/NOMBRE_BASE_DE_DATOS
    private static final String URL  =
        "jdbc:postgresql://localhost:5432/apirest_db";
 
    private static final String USER     = "postgres";
    private static final String PASSWORD = "1234"; // <-- cambia si es diferente
 
    /**
     * Retorna una nueva conexión abierta a PostgreSQL.
     * IMPORTANTE: el llamador es responsable de cerrarla con con.close().
     * Siempre úsala dentro de un bloque try-with-resources:
     *   try (Connection con = Conexion.obtener()) { ... }
     */
    public static Connection obtener() throws SQLException {
	    try {
	    	Class.forName("org.postgresql.Driver");
	    }catch (ClassNotFoundException e) {
	    	throw new SQLException("Driver PostSQL no encontrado", e);
	    }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
 
    /**
     * Verifica si la conexión funciona. Llama este método UNA vez
     * para confirmar que la configuración es correcta.
     */
    public static boolean probarConexion() {
        try (Connection con = obtener()) {
            System.out.println("✅ Conexión a PostgreSQL exitosa!");
            System.out.println("   Base de datos: " + con.getCatalog());
            return true;
        } catch (SQLException e) {
            System.err.println("❌ Error de conexión: " + e.getMessage());
            System.err.println("   Verifica: PostgreSQL activo, credenciales, puerto 5432");
            return false;
        }
    }

}
