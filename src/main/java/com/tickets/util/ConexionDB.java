package com.tickets.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

// Esta clase permite obtener las distintas conexiones a la base de datos.
public class ConexionDB {

	//Esta url se conecta directamente a la base de datos.
    private static final String URL =
            "jdbc:postgresql://localhost:5432/apirest_db";

    private static final String USUARIO = // Verifica el Id registrado en nuestra db.
            "postgres";

    private static final String PASSWORD =
            "1234";

    private ConexionDB() {
    }

    // Inicializa una nueva conexión, la maneja con try y catch como lo habíamos visto en obtenerConexion..
    public static Connection obtenerConexion()
            throws SQLException {

        return DriverManager.getConnection(
                URL,
                USUARIO,
                PASSWORD
        );
    }
}
