export interface Procedure {
  id: string;
  name: string;
  price: number;
  category?: string;
  estimatedTime?: number; // in minutes
}

export const PROCEDURES_CATALOG: Procedure[] = [
  { id: 'p1', name: 'Restauração em Resina', price: 200, category: 'Dentística', estimatedTime: 45 },
  { id: 'p2', name: 'Extração Simples', price: 150, category: 'Cirurgia', estimatedTime: 30 },
  { id: 'p3', name: 'Tratamento de Canal', price: 800, category: 'Endodontia', estimatedTime: 90 },
  { id: 'p4', name: 'Limpeza (Profilaxia)', price: 120, category: 'Prevenção', estimatedTime: 30 },
  { id: 'p5', name: 'Clareamento Dental', price: 600, category: 'Estética', estimatedTime: 60 },
  { id: 'p6', name: 'Coroa de Porcelana', price: 1200, category: 'Prótese', estimatedTime: 60 },
  { id: 'p7', name: 'Implante Dentário', price: 2500, category: 'Implantodontia', estimatedTime: 120 },
  { id: 'p8', name: 'Aparelho Ortodôntico', price: 1500, category: 'Ortodontia', estimatedTime: 45 },
];
