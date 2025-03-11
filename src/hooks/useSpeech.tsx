import { useCallback, useEffect, useRef, useState } from 'react';

export const useSpeech = (initialText = '') => {
    const [text, setText] = useState(initialText);
    const [isPlaying, setIsPlaying] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isMobileOrTV = useRef(false);

    // Detectar si es un dispositivo móvil o TV
    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        isMobileOrTV.current =
            /iphone|ipad|ipod|android|mobile|tv|smart-tv|smarttv|tizen|webos|netcast/i.test(
                userAgent,
            );
    }, []);

    const updateText = useCallback((newText: string) => {
        setText(newText);
    }, []);

    // Solución para el problema de los tiempos de espera en móviles
    const handleMobileSpeech = useCallback(() => {
        // Dividir el texto en fragmentos pequeños si es muy largo
        const textChunks = text.match(/.{1,150}(?:\s|$)/g) || [];
        let currentChunk = 0;

        const speakNextChunk = () => {
            if (currentChunk < textChunks.length) {
                const chunkUtterance = new SpeechSynthesisUtterance(textChunks[currentChunk]);
                chunkUtterance.lang = 'es-ES';
                chunkUtterance.rate = 1;
                chunkUtterance.pitch = 1;
                chunkUtterance.volume = 1;

                if (currentChunk === 0) {
                    chunkUtterance.onstart = () => setIsPlaying(true);
                }

                if (currentChunk === textChunks.length - 1) {
                    chunkUtterance.onend = () => setIsPlaying(false);
                } else {
                    chunkUtterance.onend = speakNextChunk;
                }

                currentChunk++;
                speechSynthesis.speak(chunkUtterance);
            }
        };

        speakNextChunk();
    }, [text]);

    // Función para verificar si la síntesis de voz está disponible
    const isSpeechSynthesisAvailable = useCallback(() => {
        return typeof window !== 'undefined' && 'speechSynthesis' in window;
    }, []);

    const play = useCallback(() => {
        if (!text || !isSpeechSynthesisAvailable()) return;

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = event => {
            console.error('Error de síntesis de voz:', event);
            setIsPlaying(false);
        };

        utteranceRef.current = utterance;

        if (isMobileOrTV.current) {
            // Usar la solución específica para móviles
            handleMobileSpeech();
        } else {
            // En desktop funciona bien la implementación normal
            speechSynthesis.speak(utterance);
        }

        // Solución para el bug de Chrome que pausa la síntesis después de 15 segundos
        if ('chrome' in window) {
            const intervalId = setInterval(() => {
                if (speechSynthesis.speaking && !speechSynthesis.paused) {
                    speechSynthesis.pause();
                    speechSynthesis.resume();
                } else {
                    clearInterval(intervalId);
                }
            }, 10000);
        }
    }, [text, handleMobileSpeech, isSpeechSynthesisAvailable]);

    const stop = useCallback(() => {
        if (isSpeechSynthesisAvailable()) {
            speechSynthesis.cancel();
            setIsPlaying(false);
        }
    }, [isSpeechSynthesisAvailable]);

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (isSpeechSynthesisAvailable()) {
                speechSynthesis.cancel();
            }
        };
    }, [isSpeechSynthesisAvailable]);

    return {
        text,
        isPlaying,
        updateText,
        play,
        stop,
        isSupported: isSpeechSynthesisAvailable(),
    };
};
