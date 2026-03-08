import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../translations';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state } = useStore();
  const t = useTranslation(state.settings.language);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        // parse error, ignore it.
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode scanner. ", error);
      });
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>
        
        <h2 className="mb-4 text-xl font-bold text-gray-900">{t.scanBarcode}</h2>
        
        <div id="reader" className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300"></div>
        
        <p className="mt-4 text-center text-sm text-gray-500">
          {t.pointCamera}
        </p>
      </div>
    </div>
  );
};
