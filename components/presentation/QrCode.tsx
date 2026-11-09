import React, { useEffect, useState } from 'react';

/**
 * QR da proposta completa, para quem esta na mesa abrir no proprio celular.
 *
 * A biblioteca entra por import dinamico: ela so pesa no bundle de quem abre a
 * apresentacao, nao no site publico.
 */
export default function QrCode({ value, size = 168 }: { value: string; size?: number }) {
    const [src, setSrc] = useState<string>('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const QR = await import('qrcode');
                const url = await QR.toDataURL(value, {
                    margin: 1,
                    width: size * 2,
                    color: { dark: '#0B1426', light: '#F4F6F8' },
                    errorCorrectionLevel: 'M',
                });
                if (!cancelled) setSrc(url);
            } catch {
                // Sem QR, o endereco escrito abaixo continua resolvendo.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [value, size]);

    if (!src) {
        return (
            <div
                className="rounded-2xl border border-hf-line/70 bg-hf-surface-2"
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <img
            src={src}
            alt={`QR code para ${value}`}
            width={size}
            height={size}
            className="rounded-2xl border border-hf-ice/15"
            style={{ width: size, height: size }}
        />
    );
}
