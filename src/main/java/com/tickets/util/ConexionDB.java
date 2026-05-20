package com.tickets.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {

    private static final String URL =
            "jdbc:postgresql://localhost:5432/gestor_tareas";

    private static final String USUARIO =
            "postgres";

    private static final String PASSWORD =
            "umg";

    private ConexionDB() {
    }

    public static Connection obtenerConexion()
            throws SQLException {

        return DriverManager.getConnection(
                URL,
                USUARIO,
                PASSWORD
        );
    }
}
