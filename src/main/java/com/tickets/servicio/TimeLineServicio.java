package com.tickets.servicio;

import java.util.List;

import com.tickets.dao.TimeLineDAO;
import com.tickets.modelo.LineaTiempoEvento;

// Es la que gestiona los eventos registrado de los tickets

public class TimeLineServicio {

	private final TimeLineDAO dao = new TimeLineDAO();

	public void registrarEvento(int ticketId, int actorId, String estado, String observacion) throws Exception {

		LineaTiempoEvento evento = new LineaTiempoEvento(ticketId, actorId, estado, observacion);
		dao.registrar(evento);
	}

	public List<LineaTiempoEvento> listarPorTicket(int ticketId) throws Exception {
		return dao.listarPorTicket(ticketId);
	}
}