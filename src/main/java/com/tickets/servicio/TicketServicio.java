package com.tickets.servicio;

<<<<<<< HEAD
=======
import com.tickets.dao.TicketDAO;
import com.tickets.dao.TimeLineDAO;
import com.tickets.servicio.TimeLineServicio;
import com.tickets.modelo.Ticket;
import com.tickets.modelo.EstadoTicket;
import com.tickets.modelo.LineaTiempoEvento;
import com.tickets.util.CodigoTicketUtil;

>>>>>>> c605451392086a836a064003b72863b35400bad8
import java.util.List;

import com.tickets.dao.TicketDAO;
import com.tickets.modelo.EstadoTicket;
import com.tickets.modelo.Ticket;
import com.tickets.util.CodigoTicketUtil;

public class TicketServicio {

    private TicketDAO ticketDAO = new TicketDAO();
    private TimeLineServicio timelineServicio = new TimeLineServicio();


    public Ticket crear(String descripcion, int creadoPor) throws Exception {


        if (descripcion == null || descripcion.trim().isEmpty()) {
            throw new Exception("La descripción no puede estar vacía");
        }

<<<<<<< HEAD

=======
        int idGenerado = ticketDAO.obtenerSiguienteId();
        String codigo = CodigoTicketUtil.generarCodigo(idGenerado);
        
>>>>>>> c605451392086a836a064003b72863b35400bad8
        Ticket ticket = new Ticket();
        ticket.setId(idGenerado);
        ticket.setCodigo(codigo);
        ticket.setDescripcion(descripcion);
        ticket.setCreadoPor(creadoPor);
        ticket.setEstadoActual(EstadoTicket.CREADO);
        ticket.setCodigo("TMP-" + System.nanoTime());


<<<<<<< HEAD
        int idGenerado = ticketDAO.crear(ticket);


        String codigo = CodigoTicketUtil.generarCodigo(idGenerado);

        ticketDAO.actualizarCodigo(idGenerado, codigo);


        ticket.setId(idGenerado);
        ticket.setCodigo(codigo);
=======
        ticketDAO.crear(ticket);

        timelineServicio.registrarEvento(
                idGenerado,
                creadoPor,
                EstadoTicket.CREADO.name(),
                "Ticket creado"
        );
>>>>>>> c605451392086a836a064003b72863b35400bad8

        return ticket;
    }

    public Ticket buscarPorId(int id) throws Exception {

        Ticket ticket = ticketDAO.buscarPorId(id);

        if (ticket == null) {
            throw new Exception("Ticket no encontrado con id: " + id);
        }

        return ticket;
    }

    public List<Ticket> listar() throws Exception {
        return ticketDAO.listar();
    }

    public void cambiarEstado(int id, EstadoTicket nuevoEstado, int actorId,
            String observacion, int AsignadoA) throws Exception {


        Ticket ticket = ticketDAO.buscarPorId(id);

        if (ticket == null) {
            throw new Exception("Ticket no encontrado con id: " + id);
        }


        validarCambioEstado(ticket.getEstadoActual(), nuevoEstado);
<<<<<<< HEAD


        ticketDAO.actualizarEstado(id, nuevoEstado);
=======
        ticketDAO.actualizarEstado(id, nuevoEstado, AsignadoA);
        
        
        timelineServicio.registrarEvento(
        		id,
        		actorId,
        		nuevoEstado.name(),
        		observacion
        );
>>>>>>> c605451392086a836a064003b72863b35400bad8
    }
    
    

    public void eliminar(int id) throws Exception {

        Ticket ticket = ticketDAO.buscarPorId(id);

        if (ticket == null) {
            throw new Exception("Ticket no encontrado con id: " + id);
        }

        ticketDAO.eliminar(id);
    }

    private void validarCambioEstado(EstadoTicket actual, EstadoTicket nuevo) throws Exception {

        boolean permitido = switch (actual) {
            case CREADO     -> nuevo == EstadoTicket.ASIGNADO || nuevo == EstadoTicket.RECHAZADO;
            case ASIGNADO   -> nuevo == EstadoTicket.VALIDACION || nuevo == EstadoTicket.RECHAZADO;
            case VALIDACION -> nuevo == EstadoTicket.FINALIZADO || nuevo == EstadoTicket.DEVUELTO;
            case DEVUELTO   -> nuevo == EstadoTicket.ASIGNADO;
            case FINALIZADO -> false;
            case RECHAZADO  -> false;
        };

        if (!permitido) {
            throw new Exception(
                "Cambio de estado no permitido: " + actual + " → " + nuevo
            );
        }
    }
}
