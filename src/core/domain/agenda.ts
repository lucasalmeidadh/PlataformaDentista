export interface Agendamento {
  id: string;
  pacienteNome: string;
  dentistaNome: string;
  dataInicio: string; // ISO 8601
  dataFim: string; // ISO 8601
  status: 'agendado' | 'confirmado' | 'espera' | 'faltou' | 'finalizado';
  tipoAgendamentoId?: string;
  tipoAgendamentoDescricao?: string;
  observacao?: string;
}

export interface BuscarTodosAgendaRequest {
  dataInicio: string;
  dataFim: string;
}
