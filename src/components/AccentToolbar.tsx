const accents = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'];

export function AccentToolbar({ onInsert }: { onInsert: (character: string) => void }): JSX.Element {
  return (
    <div className="accent-toolbar" aria-label="Spanish accent toolbar">
      {accents.map((accent) => (
        <button key={accent} type="button" className="accent-button" onClick={() => onInsert(accent)} aria-label={`Insert ${accent}`}>
          {accent}
        </button>
      ))}
    </div>
  );
}
