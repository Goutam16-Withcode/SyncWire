// Web Speech Recognition for Real-Time Voice-to-Text Dictation

class SpeechRecognitionManager {
    constructor() {
        this.recognition = null;
        this.isSupported = false;

        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';
                this.isSupported = true;
            }
        }
    }

    start(onResult, onEnd, onError) {
        if (!this.isSupported || !this.recognition) {
            if (onError) onError("Speech recognition not supported in this browser");
            return;
        }

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (onResult && finalTranscript) {
                onResult(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            if (onError) onError(event.error);
        };

        this.recognition.onend = () => {
            if (onEnd) onEnd();
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error(e);
        }
    }

    stop() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
    }
}

export const speechManager = new SpeechRecognitionManager();
