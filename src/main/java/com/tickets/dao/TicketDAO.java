package com.tickets.dao;

import com.tickets.modelo.Ticket;
import com.tickets.modelo.EstadoTicket;
import com.tickets.util.ConexionDB;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class TicketDAO {

    public int crear(Ticket ticket) throws Exception {

        String sql = """
                INSERT INTO tickets(
                codigo,
                descripcion,
                estado_actual,
                creado_por
                )
                VALUES (?, ?, ?, ?)
                """;

        try (
                Connection con = ConexionDB.obtenerConexion();
                PreparedStatement ps = con.prepareStatement(
                        sql,
                        Statement.RETURN_GENERATED_KEYS
                )
        ) {

            ps.setString(1, ticket.getCodigo());
            ps.setString(2, ticket.getDescripcion());
            ps.setString(3, ticket.getEstadoActual().name()); // Enum → String
            ps.setInt(4, ticket.getCreadoPor());

            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();

            if (rs.next()) {
                return rs.getInt(1);
            }
        }

        return 0;
    }

    public Ticket buscarPorId(int id) throws Exception {

        String sql = "SELECT * FROM tickets WHERE id = ?";

        try (
                Connection con = ConexionDB.obtenerConexion();
                PreparedStatement ps = con.prepareStatement(sql)
        ) {

            ps.setInt(1, id);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                Ticket ticket = new Ticket();

                ticket.setId(rs.getInt("id"));
                ticket.setCodigo(rs.getString("codigo"));
                ticket.setDescripcion(rs.getString("descripcion"));
                ticket.setEstadoActual(
                    EstadoTicket.valueOf(rs.getString("estado_actual")) // String → Enum
                );
                ticket.setCreadoPor(rs.getInt("creado_por"));

                Timestamp fechaCreacion = rs.getTimestamp("fecha_creacion");
                if (fechaCreacion != null) {
                    ticket.setFechaCreacion(fechaCreacion.toLocalDateTime());
                }

                Timestamp fechaCierre = rs.getTimestamp("fecha_cierre");
                if (fechaCierre != null) {
                    ticket.setFechaCierre(fechaCierre.toLocalDateTime());
                }

                int asignadoA = rs.getInt("asignado_a");
                if (!rs.wasNull()) {
                    ticket.setAsignadoA(asignadoA);
                }

                return ticket;
            }
        }

        return null;
    }

    public List<Ticket> listar() throws Exception {

        List<Ticket> lista = new ArrayList<>();

        String sql = "SELECT * FROM tickets ORDER BY id DESC";

        try (
                Connection con = ConexionDB.obtenerConexion();
                PreparedStatement ps = con.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()
        ) {

            while (rs.next()) {

                Ticket ticket = new Ticket();

                ticket.setId(rs.getInt("id"));
                ticket.setCodigo(rs.getString("codigo"));
                ticket.setDescripcion(rs.getString("descripcion"));
                ticket.setEstadoActual(
                    EstadoTicket.valueOf(rs.getString("estado_actual")) // String → Enum
                );
                ticket.setCreadoPor(rs.getInt("creado_por"));

                Timestamp fechaCreacion = rs.getTimestamp("fecha_creacion");
                if (fechaCreacion != null) {
                    ticket.setFechaCreacion(fechaCreacion.toLocalDateTime());
                }

                int asignadoA = rs.getInt("asignado_a");
                if (!rs.wasNull()) {
                    ticket.setAsignadoA(asignadoA);
                }

                lista.add(ticket);
            }
        }

        return lista;
    }

    public void actualizarEstado(int id, EstadoTicket estado) throws Exception {

        String sql = """
                UPDATE tickets
                SET estado_actual = ?
                WHERE id = ?
                """;

        try (
                Connection con = ConexionDB.obtenerConexion();
                PreparedStatement ps = con.prepareStatement(sql)
        ) {

            ps.setString(1, estado.name()); // Enum → String
            ps.setInt(2, id);

            ps.executeUpdate();
        }
    }
}