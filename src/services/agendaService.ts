import api from './api';
import type { Agendamento } from '../core/domain/agenda';

const agendaService = {
  async buscarTodos(dataInicio: string, dataFim: string): Promise<Agendamento[]> {
    const response = await api.get<{ dados: Agendamento[] }>('/api/Agenda/BuscarTodos', {
      params: {
        dataInicio,
        dataFim
      }
    });
    return response.data.dados || [];
  },
};

export default agendaService;
