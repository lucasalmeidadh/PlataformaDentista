import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, DollarSign, Activity, AlertCircle, Check, Search, Eraser } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { type Procedure } from '../../constants/procedures';
import { useProcedures } from '../../hooks/useProcedures';

// Types
export type ToothFace = 'V' | 'L' | 'M' | 'D' | 'O';
export type FaceStatus = 'normal' | 'problem' | 'planned' | 'done' | 'missing';

export interface TreatmentItem {
  id: string;
  tooth: number;
  faces?: ToothFace[];
  procedure: string;
  price: number;
  status: 'planned' | 'done';
}

export interface ToothState {
  status: FaceStatus; // Overall status (e.g., missing)
  faces: Partial<Record<ToothFace, FaceStatus>>;
  notes?: string;
}

// Usamos PROCEDURES_CATALOG do arquivo de constantes

interface OdontogramProps {
  onStartAttendance: () => void;
  treatments?: TreatmentItem[];
  onChangeTreatments?: (treatments: TreatmentItem[]) => void;
  teethStatus?: Record<number, ToothState | string>;
  onChangeTeethStatus?: (status: Record<number, ToothState | string>) => void;
  onApproveBudget?: (treatments: TreatmentItem[]) => void;
}

// Helpers
const getFaceLabel = (area: 'top' | 'bottom' | 'left' | 'right' | 'center', number: number): ToothFace => {
  if (area === 'center') return 'O';
  const quadrant = Math.floor(number / 10);
  const isUpper = quadrant === 1 || quadrant === 2;
  const isRightSide = quadrant === 1 || quadrant === 4; // Right side of patient (Left visually on screen)

  switch(area) {
    case 'top': return isUpper ? 'V' : 'L'; // Em cima: Maxila = Vestibular. Mandíbula = Lingual.
    case 'bottom': return isUpper ? 'L' : 'V'; // Embaixo: Maxila = Palatina(L). Mandíbula = Vestibular.
    case 'left': return isRightSide ? 'D' : 'M'; 
    case 'right': return isRightSide ? 'M' : 'D'; 
  }
};

const getFaceColor = (status?: FaceStatus) => {
  switch(status) {
    case 'problem': return '#ef4444'; // red
    case 'planned': return '#3b82f6'; // blue
    case 'done': return '#10b981'; // green
    case 'missing': return '#4b5563'; // dark gray
    default: return '#ffffff'; // normal
  }
};

export const Odontogram = ({ 
  onStartAttendance, 
  treatments: propTreatments, 
  onChangeTreatments, 
  teethStatus: propTeethStatus, 
  onChangeTeethStatus,
  onApproveBudget
}: OdontogramProps) => {
  const { procedures } = useProcedures();
  const [localTeethStatus, setLocalTeethStatus] = useState<Record<number, ToothState | string>>({});
  const [localTreatments, setLocalTreatments] = useState<TreatmentItem[]>([]);
  
  const teethStatus = propTeethStatus || localTeethStatus;
  const setTeethStatus = onChangeTeethStatus || setLocalTeethStatus;
  
  const treatments = propTreatments || localTreatments;
  const setTreatments = onChangeTreatments || setLocalTreatments;

  const [showBudget, setShowBudget] = useState<boolean>(() => (propTreatments?.length ?? 0) > 0);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedFaces, setSelectedFaces] = useState<ToothFace[]>([]);
  const [procSearch, setProcSearch] = useState('');
  const [isAddingProblem, setIsAddingProblem] = useState(false);
  // problemNotes: chave = face ('V','L','M','D','O') ou 'all' (dente inteiro)
  const [problemNotes, setProblemNotes] = useState<Record<string, string>>({});
  const [sameNoteForAll, setSameNoteForAll] = useState(false);

  const getToothStyle = (number: number, isTop: boolean) => {
    const quadrant = Math.floor(number / 10);
    const index = number % 10;
    
    // curve calculation
    const curveIntensity = 5;
    let yOffset = Math.pow(index - 1, 1.4) * curveIntensity;
    let rotation = (index - 1) * 3.5;
    
    const isRightSide = quadrant === 1 || quadrant === 4;
    
    if (isTop) {
      return { 
        transform: `translateY(${yOffset}px) rotate(${isRightSide ? -rotation : rotation}deg)`,
        transformOrigin: 'top center'
      };
    } else {
      return { 
        transform: `translateY(${-yOffset}px) rotate(${isRightSide ? rotation : -rotation}deg)`,
        transformOrigin: 'bottom center'
      };
    }
  };

  const topArches = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const bottomArches = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const handleToothClick = (e: React.MouseEvent, number: number) => {
    e.stopPropagation();
    setSelectedTooth(number);
    setSelectedFaces([]);
    setProcSearch('');
    setIsAddingProblem(false);
    setProblemNotes({});
    setSameNoteForAll(false);
  };

  const toggleFace = (face: ToothFace) => {
    setSelectedFaces(prev => prev.includes(face) ? prev.filter(f => f !== face) : [...prev, face]);
  };

  const addTreatment = (proc: Procedure) => {
    if (!selectedTooth) return;
    
    const currentData = teethStatus[selectedTooth];
    let newToothState: ToothState = { status: 'normal', faces: {} };
    if (typeof currentData === 'string') {
      newToothState.status = currentData as FaceStatus;
    } else if (currentData) {
      newToothState = { ...currentData, faces: { ...currentData.faces } };
    }

    if (selectedFaces.length > 0) {
      selectedFaces.forEach(f => {
        newToothState.faces[f] = 'planned';
      });
    } else {
      newToothState.status = 'planned';
    }

    const priceMultiplier = selectedFaces.length > 0 ? selectedFaces.length : 1;
    let procName = proc.name;
    if (selectedFaces.length > 0) {
        procName += ` (${selectedFaces.join(', ')})`;
    }

    const newTreatment: TreatmentItem = {
      id: Date.now().toString(),
      tooth: selectedTooth,
      faces: selectedFaces.length > 0 ? [...selectedFaces] : undefined,
      procedure: procName,
      price: proc.price * priceMultiplier,
      status: 'planned'
    };
    
    setTreatments([...treatments, newTreatment]);
    setTeethStatus({ ...teethStatus, [selectedTooth]: newToothState });
    setSelectedTooth(null);
    setSelectedFaces([]);
    setProcSearch('');
    setShowBudget(true);
  };

  const removeTreatment = (id: string, tooth: number) => {
    const newTreatments = treatments.filter(t => t.id !== id);
    setTreatments(newTreatments);
    
    const hasRemaining = newTreatments.some(t => t.tooth === tooth);
    if (!hasRemaining) {
      const newStatus = { ...teethStatus };
      delete newStatus[tooth];
      setTeethStatus(newStatus);
    }
  };

  const confirmProblem = () => {
    if (!selectedTooth) return;
    const currentData = teethStatus[selectedTooth];
    let newToothState: ToothState = { status: 'normal', faces: {} };
    if (typeof currentData === 'string') {
      newToothState.status = currentData as FaceStatus;
    } else if (currentData) {
      newToothState = { ...currentData, faces: { ...currentData.faces } };
    }

    if (selectedFaces.length > 0) {
      selectedFaces.forEach(f => { newToothState.faces[f] = 'problem'; });
    } else {
      newToothState.status = 'problem';
    }

    // Monta as observações por face
    const noteLines: string[] = [];
    if (selectedFaces.length === 0) {
      // Dente inteiro
      const note = (problemNotes['all'] || '').trim();
      if (note) noteLines.push(`- ${note}`);
    } else if (selectedFaces.length === 1) {
      // 1 face — o formulário salva sob a chave 'all'
      const face = selectedFaces[0];
      const note = (problemNotes['all'] || '').trim();
      if (note) noteLines.push(`- Face ${face}: ${note}`);
    } else if (sameNoteForAll) {
      // mesmo problema para todas as faces
      const note = (problemNotes['all'] || '').trim();
      if (note) {
        const facesLabel = selectedFaces.join(', ');
        noteLines.push(`- Faces ${facesLabel}: ${note}`);
      }
    } else {
      selectedFaces.forEach(face => {
        const note = (problemNotes[face] || '').trim();
        if (note) noteLines.push(`- Face ${face}: ${note}`);
      });
    }

    if (noteLines.length > 0) {
      newToothState.notes = newToothState.notes
        ? `${newToothState.notes}\n${noteLines.join('\n')}`
        : noteLines.join('\n');
    }

    setTeethStatus({ ...teethStatus, [selectedTooth]: newToothState });
    // Mantém a modal aberta — só reseta o sub-formulário de problema
    setIsAddingProblem(false);
    setProblemNotes({});
    setSameNoteForAll(false);
  };
  
  const markAsMissing = () => {
    if (!selectedTooth) return;
    setTeethStatus({ ...teethStatus, [selectedTooth]: { status: 'missing', faces: {} } });
    // Mantém modal aberta, apenas reseta seleção de faces e sub-formulário
    setSelectedFaces([]);
    setIsAddingProblem(false);
    setProblemNotes({});
    setSameNoteForAll(false);
  };

  const resetTooth = () => {
    if (!selectedTooth) return;
    const newStatus = { ...teethStatus };
    delete newStatus[selectedTooth];
    const newTreatments = treatments.filter(t => t.tooth !== selectedTooth);
    setTreatments(newTreatments);
    setTeethStatus(newStatus);
    // Mantém modal aberta, apenas reseta seleção de faces e sub-formulário
    setSelectedFaces([]);
    setIsAddingProblem(false);
    setProblemNotes({});
    setSameNoteForAll(false);
  };

  const totalBudget = treatments.reduce((sum, item) => sum + item.price, 0);

  const ToothIcon = ({ number }: { number: number }) => {
    const toothData = teethStatus[number];
    let overallStatus: FaceStatus = 'normal';
    let faces: Partial<Record<ToothFace, FaceStatus>> = {};

    if (typeof toothData === 'string') {
      overallStatus = toothData as FaceStatus;
    } else if (toothData) {
      overallStatus = toothData.status || 'normal';
      faces = toothData.faces || {};
    }

    const isTop = number < 30;

    const renderPolygon = (area: 'top' | 'bottom' | 'left' | 'right' | 'center', points: string) => {
      const faceName = getFaceLabel(area, number);
      const faceStatus = overallStatus === 'missing' ? 'missing' : (faces[faceName] || overallStatus);
      return (
        <polygon 
          points={points} 
          fill={getFaceColor(faceStatus === 'normal' && overallStatus !== 'normal' ? overallStatus : faceStatus)} 
          stroke={faceStatus === 'missing' || overallStatus === 'missing' ? '#4b5563' : '#cbd5e1'} 
          strokeWidth="1"
          className="transition-colors duration-300"
        />
      );
    };

    return (
      <div 
        className="flex flex-col items-center gap-1.5 cursor-pointer group relative transition-transform duration-500 will-change-transform"
        style={getToothStyle(number, isTop)}
        onClick={(e) => handleToothClick(e, number)}
      >
        {isTop && <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-teal-600 transition-colors drop-shadow-sm">{number}</span>}
        <div className="relative">
          <svg width="36" height="36" viewBox="0 0 32 32" className="transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110 drop-shadow-sm sm:w-[36px] sm:h-[36px] bg-white rounded-sm overflow-hidden">
            {renderPolygon('top', "0,0 32,0 24,8 8,8")}
            {renderPolygon('right', "32,0 24,8 24,24 32,32")}
            {renderPolygon('bottom', "0,32 32,32 24,24 8,24")}
            {renderPolygon('left', "0,0 8,8 8,24 0,32")}
            {renderPolygon('center', "8,8 24,8 24,24 8,24")}
          </svg>
          {overallStatus === 'problem' && Object.keys(faces).length === 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse z-10"></div>
          )}
          {overallStatus === 'done' && Object.keys(faces).length === 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm z-10"></div>
          )}
        </div>
        {!isTop && <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-teal-600 transition-colors drop-shadow-sm">{number}</span>}
      </div>
    );
  };

  const SelectedToothDetails = () => {
    if (!selectedTooth) return null;
    
    const toothData = teethStatus[selectedTooth];
    let overallStatus: FaceStatus = 'normal';
    let facesStatus: Partial<Record<ToothFace, FaceStatus>> = {};

    if (typeof toothData === 'string') {
      overallStatus = toothData as FaceStatus;
    } else if (toothData) {
      overallStatus = toothData.status || 'normal';
      facesStatus = toothData.faces || {};
    }

    const renderSelectablePolygon = (area: 'top' | 'bottom' | 'left' | 'right' | 'center', points: string) => {
      const faceName = getFaceLabel(area, selectedTooth);
      const isSelected = selectedFaces.includes(faceName);
      
      const clinicalStatus = overallStatus === 'missing' ? 'missing' : (facesStatus[faceName] || overallStatus);
      const baseColor = getFaceColor(clinicalStatus === 'normal' && overallStatus !== 'normal' ? overallStatus : clinicalStatus);

      return (
        <g className="cursor-pointer group" onClick={() => toggleFace(faceName)}>
          <polygon 
            points={points} 
            fill={isSelected ? '#dbeafe' : baseColor} 
            stroke={isSelected ? '#2563eb' : '#94a3b8'} 
            strokeWidth={isSelected ? "2" : "1"}
            className={`transition-colors duration-200 ${isSelected ? '' : 'hover:opacity-80'}`}
          />
          {isSelected && (
            <circle cx={area === 'center' ? 16 : area === 'top' ? 16 : area === 'bottom' ? 16 : area === 'left' ? 6 : 26} cy={area === 'center' ? 16 : area === 'top' ? 6 : area === 'bottom' ? 26 : area === 'left' ? 16 : 16} r="2" fill="#2563eb" />
          )}
        </g>
      );
    }

    return (
      <div className="flex flex-col items-center mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Selecione as Faces</h5>
        <svg width="80" height="80" viewBox="0 0 32 32" className="drop-shadow-sm bg-white rounded-md overflow-hidden ring-1 ring-slate-200 cursor-pointer">
          {renderSelectablePolygon('top', "0,0 32,0 24,8 8,8")}
          {renderSelectablePolygon('right', "32,0 24,8 24,24 32,32")}
          {renderSelectablePolygon('bottom', "0,32 32,32 24,24 8,24")}
          {renderSelectablePolygon('left', "0,0 8,8 8,24 0,32")}
          {renderSelectablePolygon('center', "8,8 24,8 24,24 8,24")}
        </svg>
        <div className="flex gap-2 mt-4 text-xs font-semibold text-slate-600">
          Faces: {selectedFaces.length > 0 ? <span className="text-teal-600">{selectedFaces.join(', ')}</span> : 'Dente Inteiro'}
        </div>
        <div className="flex gap-2 mt-3 w-full">
           {selectedFaces.length > 0 && (
             <Button variant="outline" size="sm" className="flex-1 text-xs py-1.5 h-auto text-slate-500 bg-white" onClick={() => setSelectedFaces([])}>
               Limpar Seleções
             </Button>
           )}
           {typeof toothData !== 'undefined' && (
             <Button variant="outline" size="sm" className="flex-1 text-xs py-1.5 h-auto text-red-600 border-red-200 hover:bg-red-50 bg-white" onClick={resetTooth}>
               <Eraser size={14} className="mr-1 inline"/> Restaurar Dente
             </Button>
           )}
        </div>
        {typeof toothData !== 'string' && toothData?.notes && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-100 w-full text-left">
            <span className="font-bold flex items-center gap-1.5 mb-1.5"><AlertCircle size={14}/> Observações Clínicas:</span>
            <div className="whitespace-pre-wrap pl-5">{toothData.notes}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[640px] h-full p-2">
      {/* Esquerda: Odontograma Viz */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm relative transition-all duration-300 min-h-[720px]">
        
        {/* Fundo "Boca/Gengiva" sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-2xl h-[400px] bg-red-50/40 rounded-[50%] blur-[60px] md:blur-[80px] -z-10 mix-blend-multiply pointer-events-none"></div>

        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 hidden md:block">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Odontograma Micro</h3>
          <p className="text-[10px] text-slate-500 mt-1">Visão geométrica por faces</p>
        </div>

        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 hidden sm:block">
          <Button onClick={() => onStartAttendance()} className="gap-2 shadow-sm text-xs font-bold" variant="outline">
             Evolução S/ Orçamento
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-4 sm:mb-8 text-[10px] sm:text-xs font-medium text-slate-500 bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm px-4 py-2 rounded-full mt-16 sm:mt-16 md:absolute md:top-5 md:mt-0 z-10">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500"></div> Problema</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500"></div> Orçado</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div> Realizado</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-500"></div> Ausente</div>
        </div>

        <div className="flex flex-col gap-16 sm:gap-24 mt-16 sm:mt-28 w-full max-w-4xl items-center pb-24 relative z-0">
          {/* Superior */}
          <div className="flex justify-center w-full">
            <div className="flex pr-2 sm:pr-8 border-r-2 border-slate-200/60 justify-end w-1/2 pl-4">
              {topArches.slice(0, 8).map(n => <div key={n} className="flex-1 flex justify-center"><ToothIcon number={n} /></div>)}
            </div>
            <div className="flex pl-2 sm:pl-8 justify-start w-1/2 pr-4">
              {topArches.slice(8).map(n => <div key={n} className="flex-1 flex justify-center"><ToothIcon number={n} /></div>)}
            </div>
          </div>
          
          {/* Inferior */}
          <div className="flex justify-center w-full mt-16 sm:mt-20">
            <div className="flex pr-2 sm:pr-8 border-r-2 border-slate-200/60 justify-end w-1/2 pl-4">
              {bottomArches.slice(0, 8).map(n => <div key={n} className="flex-1 flex justify-center"><ToothIcon number={n} /></div>)}
            </div>
            <div className="flex pl-2 sm:pl-8 justify-start w-1/2 pr-4">
              {bottomArches.slice(8).map(n => <div key={n} className="flex-1 flex justify-center"><ToothIcon number={n} /></div>)}
            </div>
          </div>
        </div>

        {/* Botão flutuante: reabre o painel de orçamento quando fechado mas há tratamentos */}
        {treatments.length > 0 && !showBudget && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={() => setShowBudget(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg shadow-teal-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <DollarSign size={14} />
              Ver Orçamento ({treatments.length} procedimento{treatments.length > 1 ? 's' : ''})
            </button>
          </div>
        )}

        {/* Popover de Seleção de Tratamentos e Faces */}
        <AnimatePresence>
          {selectedTooth && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[190] bg-slate-900/20 backdrop-blur-sm" 
                onClick={() => { setSelectedTooth(null); setSelectedFaces([]); }} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
                className="fixed z-[200] left-1/2 top-1/2 bg-white border border-slate-200 shadow-2xl rounded-xl p-5 w-[560px] max-w-[95vw] max-h-[85vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm">Prontuário Dente {selectedTooth}</h4>
                  <button onClick={() => { setSelectedTooth(null); setSelectedFaces([]); setProcSearch(''); }} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors"><X size={16}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  <div>

                    <SelectedToothDetails />

                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Ações Clínicas</div>
                    {isAddingProblem ? (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl shadow-inner space-y-3">
                        <p className="text-[11px] font-bold text-red-800 uppercase tracking-wide">
                          {selectedFaces.length === 0
                            ? 'Observação — Dente Inteiro'
                            : selectedFaces.length === 1
                              ? `Observação — Face ${selectedFaces[0]}`
                              : 'Observação por Face'}
                        </p>

                        {/* Toggle: mesmo problema nas faces — só aparece com 2+ faces */}
                        {selectedFaces.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSameNoteForAll(v => !v);
                              setProblemNotes({});
                            }}
                            className="flex items-center gap-2 w-full text-left"
                          >
                            <div className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors duration-200 ${
                              sameNoteForAll ? 'bg-red-500' : 'bg-slate-300'
                            }`}>
                              <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
                                sameNoteForAll ? 'translate-x-4' : 'translate-x-0'
                              }`} />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600">
                              Mesmo problema em todas as faces ({selectedFaces.join(', ')})
                            </span>
                          </button>
                        )}

                        {/* Dente inteiro, 1 face, ou toggle ativado → campo único */}
                        {(selectedFaces.length <= 1 || sameNoteForAll) && (() => {
                          const key = 'all';
                          return (
                            <textarea
                              key={key}
                              className="w-full text-xs p-3 rounded-lg border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none bg-white text-slate-700"
                              rows={3}
                              placeholder={
                                selectedFaces.length === 0
                                  ? 'Ex: Cárie oculta, dor pulsante...'
                                  : selectedFaces.length === 1
                                    ? `Descrição do problema na face ${selectedFaces[0]}...`
                                    : `Problema em ambas as faces (${selectedFaces.join(', ')})...`
                              }
                              value={problemNotes[key] || ''}
                              onChange={e => setProblemNotes(prev => ({ ...prev, [key]: e.target.value }))}
                              autoFocus
                            />
                          );
                        })()}

                        {/* 2+ faces sem toggle → campo por face */}
                        {selectedFaces.length > 1 && !sameNoteForAll && (
                          <div className="space-y-3">
                            {selectedFaces.map(face => (
                              <div key={face}>
                                <label className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-1 block">Face {face}</label>
                                <textarea
                                  className="w-full text-xs p-2.5 rounded-lg border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none bg-white text-slate-700"
                                  rows={2}
                                  placeholder={`Descreva o problema na face ${face}...`}
                                  value={problemNotes[face] || ''}
                                  onChange={e => setProblemNotes(prev => ({ ...prev, [face]: e.target.value }))}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                          <Button variant="outline" size="sm" onClick={() => { setIsAddingProblem(false); setProblemNotes({}); setSameNoteForAll(false); }} className="bg-white hover:bg-red-50 text-red-700 border-red-200">Cancelar</Button>
                          <Button size="sm" onClick={confirmProblem} className="bg-red-600 hover:bg-red-700 text-white shadow-sm gap-1.5"><AlertCircle size={14}/> Salvar Problema</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mb-6">
                         <button onClick={() => setIsAddingProblem(true)} className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold gap-1.5 border border-red-100 group">
                           <AlertCircle size={16} className="group-hover:scale-110 transition-transform" /> {selectedFaces.length > 0 ? 'Indicar Problema' : 'Problema no Dente'}
                         </button>
                         <button onClick={() => markAsMissing()} className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-semibold gap-1.5 border border-slate-200 group">
                           <X size={16} className="group-hover:scale-110 transition-transform" /> Dente Ausente
                         </button>
                      </div>
                    )}

                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Adicionar Procedimento</div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Buscar procedimento..." 
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition-shadow"
                        value={procSearch}
                        onChange={(e) => setProcSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 pr-2">
                    {procedures.filter(p => p.name.toLowerCase().includes(procSearch.toLowerCase())).map(proc => (
                      <div key={proc.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-teal-50 border border-slate-100 shadow-sm hover:border-teal-200 transition-colors group cursor-pointer" onClick={() => addTreatment(proc)}>
                        <div>
                          <div className="text-sm font-bold text-slate-800 group-hover:text-teal-800 transition-colors">{proc.name}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            R$ {(proc.price * (selectedFaces.length > 0 ? selectedFaces.length : 1)).toFixed(2)}
                            {selectedFaces.length > 1 && <span className="ml-1 text-teal-600 font-medium">({selectedFaces.length} faces)</span>}
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}
                    {procedures.filter(p => p.name.toLowerCase().includes(procSearch.toLowerCase())).length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-500">Nenhum procedimento encontrado.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Direita: Orçamento e Tratamentos */}
      <AnimatePresence>
      {showBudget && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full md:w-80 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden shrink-0"
        >
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <DollarSign size={16} className="text-teal-600" />
                Plano de Tratamento
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Confirme os procedimentos e orçamentos selecionados.</p>
            </div>
            <button onClick={() => setShowBudget(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1.5 shadow-sm border border-slate-200">
              <X size={14}/>
            </button>
          </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
          {treatments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              <Activity size={32} className="mx-auto mb-3 opacity-20" />
              Nenhum tratamento planejado.
            </div>
          ) : (
            treatments.map((t) => (
              <div key={t.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0">{t.tooth}</span>
                    <span className="font-semibold text-slate-800 text-sm leading-tight pr-4">{t.procedure}</span>
                  </div>
                  <button onClick={() => removeTreatment(t.id, t.tooth)} className="text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-1 rounded-md transition-colors shrink-0">
                    <X size={16} />
                  </button>
                </div>
                {t.faces && t.faces.length > 0 && (
                  <div className="mb-2 pl-8 flex gap-1">
                    {t.faces.map(f => (
                      <span key={f} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{f}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-3 pl-8">
                  <span className="text-[10px] font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50 uppercase tracking-wide flex gap-1 items-center">
                    <Check size={10} /> Orçado
                  </span>
                  <span className="font-bold text-slate-700 text-sm">R$ {t.price.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-500">Valor Total Estimado</span>
            <span className="text-lg font-bold text-teal-700">R$ {totalBudget.toFixed(2)}</span>
          </div>
          <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-md mb-2" onClick={() => onApproveBudget?.(treatments)}>
            Ver Orçamento Completo
          </Button>
          <Button variant="outline" className="w-full text-xs font-bold border-slate-200" onClick={() => onStartAttendance()}>
            Evolução S/ Orçamento
          </Button>
        </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
