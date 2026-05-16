package java.tickets.dto;

import java.time.LocalDateTime;

public class TimeLineResponseDTO {

	private int id;
    private int ticketId;
    private String actor;
    private String estado;
    private String observacion;
    private LocalDateTime fechaEvento;
    
    public TimeLineResponseDTO() {}

	public TimeLineResponseDTO(int id, int ticketId, String actor, String estado, String observacion,
			LocalDateTime fechaEvento) {
		this.id = id;
		this.ticketId = ticketId;
		this.actor = actor;
		this.estado = estado;
		this.observacion = observacion;
		this.fechaEvento = fechaEvento;
	}

	public int getId() {
		return id;
	}

	public int getTicketId() {
		return ticketId;
	}

	public String getActor() {
		return actor;
	}

	public String getEstado() {
		return estado;
	}

	public String getObservacion() {
		return observacion;
	}

	public LocalDateTime getFechaEvento() {
		return fechaEvento;
	}
    
    
}
