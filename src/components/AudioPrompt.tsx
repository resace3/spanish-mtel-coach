import { Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export function AudioPrompt({ script, submitted }: { script: string; submitted: boolean }): JSX.Element {
  const [revealed, setRevealed] = useState(false);
  const spanishVoice = useMemo(() => {
    if (!('speechSynthesis' in window)) return undefined;
    return window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('es'));
  }, []);

  function play(): void {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = spanishVoice?.lang ?? 'es-US';
    if (spanishVoice) utterance.voice = spanishVoice;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="audio-prompt" aria-label="Listening prompt">
      <button className="icon-text-button" type="button" onClick={play}>
        <Volume2 size={18} />
        <span>Play Spanish prompt</span>
      </button>
      {!submitted && !revealed ? (
        <button className="secondary-button compact" type="button" onClick={() => setRevealed(true)}>
          Reveal transcript fallback
        </button>
      ) : null}
      {submitted || revealed ? (
        <div className="transcript">
          <strong>Transcript</strong>
          <p>{script}</p>
        </div>
      ) : (
        <p className="muted">Transcript is hidden during listening practice unless you use the accessibility fallback.</p>
      )}
    </section>
  );
}
