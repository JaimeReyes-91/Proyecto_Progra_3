package com.tickets.dao;

/*En esta clase gestionamos las operaciones con la base de datos
de los ticket */

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.tickets.modelo.EstadoTicket;
import com.tickets.modelo.Ticket;
import com.tickets.util.ConexionDB;

public class TicketDAO {

	// crea tickets
	public int crear(Ticket ticket) throws Exception {

		String sql = """
				INSERT INTO tickets(
				    id,
				    codigo,
				    descripcion,
				    estado_actual,
				    creado_por,
				    asignado_a
				)
				VALUES (?, ?, ?, ?, ?, ?)
				""";

		try (Connection con = ConexionDB.obtenerConexion(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, ticket.getId());
			ps.setString(2, ticket.getCodigo());
			ps.setString(3, ticket.getDescripcion());
			ps.setString(4, ticket.getEstadoActual().name());
			ps.setInt(5, ticket.getCreadoPor());

			if (ticket.getAsignadoA() == null) {
				ps.setObject(6, null);
			} else {
				ps.setInt(6, ticket.getAsignadoA());
			}

			ps.executeUpdate();
			return ticket.getId();
		}
	}

	// obtiene los siguiente tickets por id
	public int obtenerSiguienteId() throws Exception {

		String sql = "SELECT nextval(pg_get_serial_sequence('tickets', 'id'))";

		try (Connection con = ConexionDB.obtenerConexion();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			if (rs.next()) {
				return rs.getInt(1);
			}

			throw new Exception("No se pudo generar el id del ticket");
		}
	}

	// busca los ticket por id
	public Ticket buscarPorId(int id) throws Exception {

		String sql = "SELECT * FROM tickets WHERE id = ?";

		try (Connection con = ConexionDB.obtenerConexion(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);

			try (ResultSet rs = ps.executeQuery()) {

				if (rs.next()) {
					return mapearTicket(rs);
				}
			}
		}

		return null;
	}

	// en lista los todos los tickets

	public List<Ticket> listar() throws Exception {

		List<Ticket> lista = new ArrayList<>();

		String sql = "SELECT * FROM tickets ORDER BY id DESC";

		try (Connection con = ConexionDB.obtenerConexion();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			while (rs.next()) {
				lista.add(mapearTicket(rs));
			}
		}

		return lista;
	}

	// Actualiza el estado actual de un ticket
	public void actualizarEstado(int id, EstadoTicket estado) throws Exception {

		String sql = """
				UPDATE tickets
				SET estado_actual = ?
				WHERE id = ?
				""";

		try (Connection con = ConexionDB.obtenerConexion(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, estado.name());
			ps.setInt(2, id);
			ps.executeUpdate();
		}
	}

	// En este actualiza el estado y tambien el uuario del ticket
	public void actualizarEstado(int id, EstadoTicket estado, Integer asignadoA) throws Exception {

		String sql = """
				UPDATE tickets
				SET estado_actual = ?,
				    asignado_a = ?
				WHERE id = ?
				""";

		try (Connection con = ConexionDB.obtenerConexion(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, estado.name());
			ps.setObject(2, asignadoA);
			ps.setInt(3, id);
			ps.executeUpdate();
		}
	}

	// Esta funcion elimina los ticket por medio del id
	public void eliminar(int id) throws Exception {

		String sql = "DELETE FROM tickets WHERE id = ?";

		try (Connection con = ConexionDB.obtenerConexion(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ps.executeUpdate();
		}
	}

	// Esta funcion lo que hace es armar un objeto para usar con la base de datos de ticket
	private Ticket mapearTicket(ResultSet rs) throws Exception {

		Ticket ticket = new Ticket();

		ticket.setId(rs.getInt("id"));
		ticket.setCodigo(rs.getString("codigo"));
		ticket.setDescripcion(rs.getString("descripcion"));
		ticket.setEstadoActual(EstadoTicket.valueOf(rs.getString("estado_actual")));
		ticket.setCreadoPor(rs.getInt("creado_por"));

		Timestamp fechaCreacion = rs.getTimestamp("fecha_creacion");

		if (fechaCreacion != null) {
			ticket.setFechaCreacion(fechaCreacion.toLocalDateTime().toString());
		}

		Timestamp fechaCierre = rs.getTimestamp("fecha_cierre");

		if (fechaCierre != null) {
			ticket.setFechaCierre(fechaCierre.toLocalDateTime().toString());
		}

		int asignadoA = rs.getInt("asignado_a");

		if (!rs.wasNull()) {
			ticket.setAsignadoA(asignadoA);
		}

		return ticket;
	}
}
