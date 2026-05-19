package com.tickets.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import com.tickets.modelo.LineaTiempoEvento;
import com.tickets.util.ConexionDB;

public class TimeLineDAO {
<<<<<<< HEAD

	public void registrar(LineaTiempoEvento timeline)
=======
	
	public void registrar(LineaTiempoEvento timeline) throws Exception
>>>>>>> c605451392086a836a064003b72863b35400bad8
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

