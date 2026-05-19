package com.tickets.servicio;

import com.tickets.dao.TimeLineDAO;
import com.tickets.modelo.LineaTiempoEvento;
public class TimeLineServicio {

	private TimeLineDAO dao = new TimeLineDAO();
	
	public void registrarEvento(int ticketId, int actorId, String estado, String observacion) {
		LineaTiempoEvento evento = new LineaTiempoEvento(ticketId, actorId, estado, observacion);
	
		dao.registrar(evento);
	}
}
