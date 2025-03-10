import { useCallback, useEffect, useRef, useState } from 'react';

export const useSpeech = (initialText = '') => {
    const [text, setText] = useState(initialText);
    const [isPlaying, setIsPlaying] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const updateText = useCallback((newText: string) => {
        setText(newText);
    }, []);

    const play = useCallback(() => {
        console.log('play');
        if (!text) return;

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);

        utteranceRef.current = utterance;

        speechSynthesis.speak(utterance);
    }, [text]);

    const stop = useCallback(() => {
        speechSynthesis.cancel();
        setIsPlaying(false);
    }, []);

    useEffect(() => {
        return () => {
            speechSynthesis.cancel();
        };
    }, []);

    return {
        text,
        isPlaying,
        updateText,
        play,
        stop,
    };
};
