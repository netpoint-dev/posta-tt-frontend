import { useEffect, useRef } from 'react';

export const useBarcodeScanner = (onScan: (code: string) => void) => {
    const buffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            const diff = currentTime - lastKeyTime.current;

            // El umbral suele ser de 30-50ms entre teclas para ser un escáner
            if (diff > 50) {
                buffer.current = '';
            }

            if (e.key === 'Enter') {
                if (buffer.current.length > 2) {
                    onScan(buffer.current);
                    buffer.current = '';
                }
            } else {
                // Ignorar teclas de control como Shift o Ctrl
                if (e.key.length === 1) {
                    buffer.current += e.key;
                }
            }

            lastKeyTime.current = currentTime;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan]);
};