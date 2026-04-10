import { useState, useEffect } from 'react';
import { PROCEDURES_CATALOG, type Procedure } from '../constants/procedures';

export const useProcedures = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('procedures_catalog');
    if (saved) {
      setProcedures(JSON.parse(saved));
    } else {
      setProcedures(PROCEDURES_CATALOG);
    }
  }, []);

  const saveProcedures = (newProcedures: Procedure[]) => {
    setProcedures(newProcedures);
    localStorage.setItem('procedures_catalog', JSON.stringify(newProcedures));
  };

  return { procedures, setProcedures: saveProcedures };
};
