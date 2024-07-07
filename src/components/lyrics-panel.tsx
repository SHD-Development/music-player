import { useEffect, useState } from "react";

interface LyricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lyrics: string;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  isOpen,
  onClose,
  lyrics,
}) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed top-0 right-0 w-64 h-full bg-zinc-900 p-4 transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button onClick={onClose}>關閉</button>
      <div className="mt-4">{lyrics}</div>
    </div>
  );
};

export default LyricsPanel;
