import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        responsiveVoice: {
            speak: (text: string, voice: string, options?: unknown) => void;
            cancel: () => void;
            isPlaying: () => boolean;
            getVoices: () => string[];
            setDefaultVoice: (voice: string) => void;
        };
    }
}

export const useSpeech = (initialText = '') => {
    const [text, setText] = useState(initialText);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scriptRef = useRef<HTMLScriptElement | null>(null);

    // Cargar la biblioteca ResponsiveVoice
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.responsiveVoice && !scriptRef.current) {
            const script = document.createElement('script');
            script.src = 'https://code.responsivevoice.org/responsivevoice.js?key=FTE7HVpn';
            script.async = true;
            script.onload = () => {
                setIsLoaded(true);
                if (window.responsiveVoice) {
                    // Establecer la voz por defecto en español
                    window.responsiveVoice.setDefaultVoice('Spanish Female');
                }
            };
            script.onerror = () => {
                setError('No se pudo cargar la biblioteca de síntesis de voz');
            };

            document.body.appendChild(script);
            scriptRef.current = script;

            return () => {
                if (scriptRef.current && document.body.contains(scriptRef.current)) {
                    document.body.removeChild(scriptRef.current);
                }
            };
        } else if (window.responsiveVoice) {
            setIsLoaded(true);
        }
    }, []);

    const updateText = useCallback((newText: string) => {
        setText(newText);
    }, []);

    const play = useCallback((text: string) => {
        if (!isLoaded || !text || !window.responsiveVoice) return;

        // Detener cualquier reproducción previa
        window.responsiveVoice.cancel();

        // Reproducir el texto con las opciones de configuración
        window.responsiveVoice.speak(text.toLowerCase(), 'Spanish Female', {
            pitch: 1,
            rate: 1,
            volume: 1,
            onstart: () => setIsPlaying(true),
            onend: () => setIsPlaying(false),
            onerror: (error: unknown) => {
                console.error('Error de síntesis de voz:', error);
                setIsPlaying(false);
                setError('Error al reproducir el audio');
            },
        });
    }, [text, isLoaded]);

    const stop = useCallback(() => {
        if (isLoaded && window.responsiveVoice) {
            window.responsiveVoice.cancel();
            setIsPlaying(false);
        }
    }, [isLoaded]);

    // Verificar periódicamente si la reproducción ha terminado (por si el evento onend falla)
    useEffect(() => {
        if (isPlaying && isLoaded && window.responsiveVoice) {
            const interval = setInterval(() => {
                if (!window.responsiveVoice.isPlaying()) {
                    setIsPlaying(false);
                }
            }, 500);

            return () => clearInterval(interval);
        }
    }, [isPlaying, isLoaded]);

    return {
        text,
        isPlaying,
        isLoaded,
        error,
        updateText,
        play,
        stop,
    };
};
