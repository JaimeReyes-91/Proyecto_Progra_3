package com.tickets.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {

    private static final String URL =
            "jdbc:postgresql://localhost:5432/apirest_db";

    private static final String USUARIO =
            "postgres";

    private static final String PASSWORD =
            "1234";

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
