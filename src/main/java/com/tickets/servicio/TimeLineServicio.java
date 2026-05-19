package com.tickets.servicio;

import com.tickets.dao.TimeLineDAO;
import com.tickets.modelo.LineaTiempoEvento;
public class TimeLineServicio {

	private TimeLineDAO dao = new TimeLineDAO();
<<<<<<< HEAD

	public void registrarEvento(int ticketId, int actorId, String estado, String observacion) {
=======
	
	public void registrarEvento(int ticketId, int actorId, String estado, String observacion) throws Exception{
>>>>>>> c605451392086a836a064003b72863b35400bad8
		LineaTiempoEvento evento = new LineaTiempoEvento(ticketId, actorId, estado, observacion);

		dao.registrar(evento);
	}
}
