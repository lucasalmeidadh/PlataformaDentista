import api from './api';
import type { TipoAgendamento, CreateTipoAgendamentoRequest, UpdateTipoAgendamentoRequest } from '../core/domain/tipoAgendamento';

const tipoAgendamentoService = {
  async buscarTodos(): Promise<TipoAgendamento[]> {
    const response = await api.get<{ dados: TipoAgendamento[] }>('/api/TipoAgendamento/BuscarTodos');
    return response.data.dados || [];
  },

  async buscarPorId(id: string): Promise<TipoAgendamento> {
    const response = await api.get<{ dados: TipoAgendamento }>(`/api/TipoAgendamento/BuscarPorId/${id}`);
    return response.data.dados;
  },

  async criar(data: CreateTipoAgendamentoRequest): Promise<TipoAgendamento> {
    const response = await api.post<{ dados: TipoAgendamento }>('/api/TipoAgendamento/Criar', data);
    return response.data.dados;
  },

  async atualizar(id: string, data: UpdateTipoAgendamentoRequest): Promise<TipoAgendamento> {
    const response = await api.put<{ dados: TipoAgendamento }>(`/api/TipoAgendamento/Atualizar/${id}`, data);
    return response.data.dados;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/api/TipoAgendamento/Excluir/${id}`);
  },
};

export default tipoAgendamentoService;
