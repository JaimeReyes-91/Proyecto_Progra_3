package com.tickets.dao;

import com.tickets.util.ConexionDB;
import com.tickets.modelo.LineaTiempoEvento;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class TimeLineDAO {
	
	public void registrar(LineaTiempoEvento timeline) throws Exception
		{
		String sql = """
                INSERT INTO ticket_timeline(
                ticket_id,
                actor_id,
                estado,
                observacion
                )
                VALUES (?, ?, ?, ?)
                """;
		
		try (Connection con = ConexionDB.obtenerConexion();
                PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, timeline.getTicketId());
            ps.setInt(2, timeline.getActorId());
            ps.setString(3, timeline.getEstado());
            ps.setString(4, timeline.getObservacion());

            ps.executeUpdate();
        }catch (SQLException e) {
        	e.printStackTrace();
        }
		
    }
}

