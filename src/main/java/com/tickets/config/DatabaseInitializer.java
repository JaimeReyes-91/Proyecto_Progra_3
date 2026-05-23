package com.tickets.config;

import java.sql.Connection;
import java.sql.Statement;

import com.tickets.util.ConexionDB;

// Esta clase es la encargada de inicializar la base de datos con toda su estructura para el funcionamiento del proyecto
public class DatabaseInitializer {

	// Acá se crean las tablas necesarias
	public static void inicializar() {

        // El try está empleado para garantizar el cierre de los Statements, aunque hayan errores.
		try (
            Connection con = ConexionDB.obtenerConexion(); // Acá se establece la conexión a la base de datos
            Statement st = con.createStatement()
        ) {
			
			// Con estas sentencias se ejecutan los Scripts de SQL escritos en ScriptsSQL.java
            st.execute(ScriptsSQL.TABLA_USUARIOS);

            st.execute(ScriptsSQL.TABLA_TICKETS);

            st.execute(ScriptsSQL.TABLA_TICKET_ADJUNTOS);

            st.execute(ScriptsSQL.TABLA_TICKET_TIMELINE);

            System.out.println(
                "Base de datos inicializada correctamente"
            );

        } catch (Exception e) {
        	// Con el catch se registra todo error encontrado.
        	System.err.println("Error inicializando base de datos");
        	System.err.println(e.getMessage());
            e.printStackTrace();
        }
    }
}
