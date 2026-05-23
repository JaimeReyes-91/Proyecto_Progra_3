package com.tickets.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

// En esta clase se gestiona la base de datos de la aplicación.
public class DatabaseManager {

    private static final String HOST = "jdbc:postgresql://localhost:5432/postgres";

    private static final String DATABASE = "apirest_db";

    private static final String USER = "postgres";

    private static final String PASSWORD = "1234";

    public static void inicializarBaseDatos() {

        try {

            Class.forName(
                    "org.postgresql.Driver"
            );

            try (
                    Connection con =
                            DriverManager.getConnection(
                                    HOST,
                                    USER,
                                    PASSWORD
                            )
            ) {

            	// Acá se verifica de que la base de datos exista, de lo contrario la crea
                if (!existeBaseDatos(con)) {

                    crearBaseDatos(con);

                    System.out.println(
                            "Base de datos creada"
                    );

                } else {

                    System.out.println(
                            "La base de datos ya existe"
                    );
                }
            }

        } catch (Exception e) {

            System.err.println(
                    "Error creando base de datos"
            );

            e.printStackTrace();
        }
    }
    
    // Verifica que la base de datos exista en el servidor de PostgreSQL
    private static boolean existeBaseDatos(
            Connection con
    ) throws Exception {

        String sql = """
                SELECT 1
                FROM pg_database
                WHERE datname = ?
                """;

        try (
                PreparedStatement ps =
                        con.prepareStatement(sql)
        ) {

            ps.setString(1, DATABASE);

            ResultSet rs = ps.executeQuery();

            return rs.next();
        }
    }

    // Con esta instrucción se crea la base de datos en el servidor de PostgreSQL.
    private static void crearBaseDatos(
            Connection con
    ) throws Exception {

        String sql =
                "CREATE DATABASE " + DATABASE;

        try (
                Statement st = con.createStatement()
        ) {

            st.executeUpdate(sql);
        }
    }
}