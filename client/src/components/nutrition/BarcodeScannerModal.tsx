import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Search, Barcode } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let scanner: Html5QrcodeScanner | null = null;

    try {
      scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 160 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          if (scanner) {
            scanner.clear().catch(console.error);
          }
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore frequent frame scan errors
        }
      );
    } catch (err: any) {
      setScannerError('Could not initialize camera scanner. You can enter barcode manually below.');
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScanSuccess(manualBarcode.trim());
    }
  };

  const sampleBarcodes = [
    { code: '3017620422003', label: 'Nutella' },
    { code: '5449000000996', label: 'Coca-Cola' },
    { code: '0028400070560', label: 'Doritos' },
    { code: '038000318214', label: 'Pringles' },
    { code: '044000032029', label: 'Oreo' },
    { code: '5060469982442', label: 'Barebells Bar' },
    { code: '818290013583', label: 'Chobani Yogurt' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-4 sm:pt-8 p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-card max-h-[85vh] overflow-y-auto rounded-2xl border border-emerald-500/30 p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Scan Food Barcode</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-surface text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Scanner Container */}
        <div className="relative overflow-hidden rounded-xl bg-black border border-dark-border min-h-[220px]">
          <div id="reader" className="w-full"></div>
          {scannerError && (
            <div className="p-4 text-xs text-amber-400 text-center font-mono">{scannerError}</div>
          )}
        </div>

        {/* Manual Barcode Input Fallback */}
        <div className="pt-2 border-t border-dark-border space-y-3 font-mono">
          <div className="text-xs font-bold text-gray-300">Or Enter / Search Barcode Number:</div>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-2.5 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                placeholder="e.g. 3017620422003 or 544900..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-dark-bg border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Lookup</span>
            </button>
          </form>

          {/* Sample Barcode Quick Tags */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-gray-400 block">Quick test sample barcodes:</span>
            <div className="flex flex-wrap gap-1.5">
              {sampleBarcodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onScanSuccess(item.code)}
                  className="px-2.5 py-1 rounded-lg bg-dark-surface hover:bg-emerald-500/20 text-emerald-400 font-mono text-[11px] border border-dark-border hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{item.label}</span>
                  <span className="text-gray-500 text-[9px]">({item.code.slice(-4)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
