export interface TipoAgendamento {
  id: string;
  descricao: string;
  isActive: boolean;
}

export interface CreateTipoAgendamentoRequest {
  descricao: string;
  isActive: boolean;
}

export interface UpdateTipoAgendamentoRequest {
  descricao: string;
  isActive: boolean;
}
