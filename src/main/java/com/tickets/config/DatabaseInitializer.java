package com.tickets.config;

import com.tickets.util.ConexionDB;

import java.sql.Connection;
import java.sql.Statement;

public class DatabaseInitializer {

	public static void inicializar() {

        try (
            Connection con = ConexionDB.obtenerConexion();
            Statement st = con.createStatement()
        ) {

            st.execute(ScriptsSQL.TABLA_USUARIOS);

            st.execute(ScriptsSQL.TABLA_TICKETS);
            
            st.execute(ScriptsSQL.TABLA_TICKET_ADJUNTOS);
            
            st.execute(ScriptsSQL.TABLA_TICKET_TIMELINE);

            System.out.println(
                "Base de datos inicializada correctamente"
            );

        } catch (Exception e) {
        	System.err.println("Error inicializando base de datos");
        	System.err.println(e.getMessage());
            e.printStackTrace();
        }
    }
}
