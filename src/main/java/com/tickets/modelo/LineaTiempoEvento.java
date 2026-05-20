package com.tickets.modelo;

//import java.time.LocalDateTime;
public class LineaTiempoEvento {

	private int id;
	private int ticketId;
	private int actorId;
	private String estado;
	private String observacion;
	private String fechaEvento;

	public LineaTiempoEvento() {}

	public LineaTiempoEvento(int ticketId, int actorId, String estado, String observacion) {
		this.ticketId = ticketId;
		this.actorId = actorId;
		this.estado = estado;
		this.observacion = observacion;
	}


	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getTicketId() {
		return ticketId;
	}

	public void setTicketId(int ticketId) {
		this.ticketId = ticketId;
	}

	public int getActorId() {
		return actorId;
	}

	public void setActorId(int actorId) {
		this.actorId = actorId;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

	public String getObservacion() {
		return observacion;
	}

	public void setObservacion(String observacion) {
		this.observacion = observacion;
	}

	public String getFechaEvento() {
		return fechaEvento;
	}

	public void setFechaEvento(String fechaEvento) {
		this.fechaEvento = fechaEvento;
	}

}
