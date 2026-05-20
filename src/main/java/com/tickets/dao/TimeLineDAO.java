package com.tickets.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.tickets.modelo.LineaTiempoEvento;
import com.tickets.util.ConexionDB;

public class TimeLineDAO {

	public void registrar(LineaTiempoEvento timeline) throws Exception {

		String sql = """
				INSERT INTO ticket_timeline(
				    ticket_id,
				    actor_id,
				    estado,
				    observacion
				)
				VALUES (?, ?, ?, ?)
				""";

		try (Connection con = ConexionDB.obtenerConexion(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setInt(1, timeline.getTicketId());
			ps.setInt(2, timeline.getActorId());
			ps.setString(3, timeline.getEstado());
			ps.setString(4, timeline.getObservacion());
			ps.executeUpdate();
		}
	}

	
	public List<LineaTiempoEvento> listarPorTicket(int ticketId) throws Exception {

		List<LineaTiempoEvento> lista = new ArrayList<>();

		String sql = """
				SELECT * FROM ticket_timeline
				WHERE ticket_id = ?
				ORDER BY fecha_evento ASC
				""";

		try (Connection con = ConexionDB.obtenerConexion(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setInt(1, ticketId);
			ResultSet rs = ps.executeQuery();

			while (rs.next()) {
				LineaTiempoEvento evento = new LineaTiempoEvento();
				evento.setId(rs.getInt("id"));
				evento.setTicketId(rs.getInt("ticket_id"));
				evento.setActorId(rs.getInt("actor_id"));
				evento.setEstado(rs.getString("estado"));
				evento.setObservacion(rs.getString("observacion"));

				Timestamp fecha = rs.getTimestamp("fecha_evento");
				if (fecha != null) {
					evento.setFechaEvento(fecha.toLocalDateTime().toString());
				}

				lista.add(evento);
			}
		}

		return lista;
	}
}
