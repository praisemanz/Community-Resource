import { Printer, X } from 'lucide-react';
import { useState } from 'react';

type RedCardViewerProps = {
  onClose: () => void;
};

export function RedCardViewer({ onClose }: RedCardViewerProps) {
  const [language, setLanguage] = useState<'english' | 'spanish'>('english');

  const handlePrint = () => {
    window.print();
  };

  const content = {
    english: {
      title: "KNOW YOUR RIGHTS CARD",
      subtitle: "If approached by immigration officers or police",
      rights: [
        "You have the right to remain silent.",
        "You do not have to discuss your immigration or citizenship status with police, immigration agents, or other officials.",
        "If you are not a U.S. citizen and an immigration agent requests your papers, you must show them if you have them.",
        "You have the right to speak to a lawyer. You have the right to make a local phone call.",
        "Do not sign anything without reading and understanding it.",
        "You do not have to open your door to officers without a valid warrant signed by a judge.",
      ],
      statement: "I am exercising my right to remain silent. I do not wish to answer any questions. I wish to speak with my attorney. I do not consent to a search.",
      warning: "Present this card to an officer by holding it up or placing it on a surface. Do not physically hand it to them.",
    },
    spanish: {
      title: "TARJETA DE CONOZCA SUS DERECHOS",
      subtitle: "Si es abordado por oficiales de inmigración o policía",
      rights: [
        "Usted tiene el derecho de permanecer callado.",
        "No tiene que discutir su estado de inmigración o ciudadanía con la policía, agentes de inmigración u otros oficiales.",
        "Si no es ciudadano de EE.UU. y un agente de inmigración le pide sus papeles, debe mostrarlos si los tiene.",
        "Tiene el derecho de hablar con un abogado. Tiene el derecho de hacer una llamada telefónica local.",
        "No firme nada sin leerlo y entenderlo.",
        "No tiene que abrir su puerta a oficiales sin una orden válida firmada por un juez.",
      ],
      statement: "Estoy ejerciendo mi derecho a permanecer callado. No deseo contestar ninguna pregunta. Deseo hablar con mi abogado. No consiento a una búsqueda.",
      warning: "Presente esta tarjeta a un oficial sosteniéndola o colocándola en una superficie. No se la entregue físicamente.",
    },
  };

  const selectedContent = content[language];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--surface)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 print:hidden"
          style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Know Your Rights Card</h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'english' | 'spanish')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="english">English</option>
              <option value="spanish">Español</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:opacity-70"
              aria-label="Close"
            >
              <X size={20} style={{ color: 'var(--foreground-muted)' }} />
            </button>
          </div>
        </div>

        {/* Card Content — always white with dark text for printing */}
        <div className="p-6 print:p-4" style={{ backgroundColor: 'var(--surface)' }}>
          <div
            className="border-4 rounded-lg p-6"
            style={{ backgroundColor: '#ffffff', borderColor: '#dc2626', color: '#111827' }}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#dc2626' }}>
                {selectedContent.title}
              </h1>
              <p className="text-sm italic" style={{ color: '#374151' }}>{selectedContent.subtitle}</p>
            </div>

            <div className="mb-6">
              <ul className="space-y-3">
                {selectedContent.rights.map((right, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="font-bold mr-2 shrink-0" style={{ color: '#dc2626' }}>{index + 1}.</span>
                    <span style={{ color: '#111827' }}>{right}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-lg p-4 mb-4"
              style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}
            >
              <p className="text-sm font-semibold leading-relaxed" style={{ color: '#111827' }}>
                {selectedContent.statement}
              </p>
            </div>

            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: '#fefce8', border: '2px solid #eab308' }}
            >
              <p className="text-xs" style={{ color: '#1f2937' }}>
                <strong>⚠️ Important:</strong> {selectedContent.warning}
              </p>
            </div>

            <div className="mt-6 pt-4 text-center" style={{ borderTop: '2px solid #d1d5db' }}>
              <p className="text-xs" style={{ color: '#4b5563' }}>
                Emergency Legal Hotline: <strong>1-800-123-4567</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
