// WhatsApp-like sound effects and call ringtones using Web Audio API

class SoundManager {
    constructor() {
        this.ctx = null;
        this.ringInterval = null;
    }

    init() {
        if (!this.ctx && typeof window !== "undefined") {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    playSent() {
        try {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === "suspended") {
                this.ctx.resume();
            }

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {}
    }

    playReceived() {
        try {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === "suspended") {
                this.ctx.resume();
            }

            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = "sine";
            osc2.type = "triangle";

            osc1.frequency.setValueAtTime(1046.5, this.ctx.currentTime);
            osc2.frequency.setValueAtTime(1318.5, this.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);

            osc1.start();
            osc2.start(this.ctx.currentTime + 0.05);
            osc1.stop(this.ctx.currentTime + 0.15);
            osc2.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }

    startRingtone() {
        this.stopRingtone();
        const playRingPulse = () => {
            try {
                this.init();
                if (!this.ctx) return;
                if (this.ctx.state === "suspended") this.ctx.resume();

                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc1.type = "sine";
                osc2.type = "sine";
                osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
                osc2.frequency.setValueAtTime(480, this.ctx.currentTime);

                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime + 1.2);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.3);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.ctx.destination);

                osc1.start();
                osc2.start();
                osc1.stop(this.ctx.currentTime + 1.3);
                osc2.stop(this.ctx.currentTime + 1.3);
            } catch (e) {}
        };

        playRingPulse();
        this.ringInterval = setInterval(playRingPulse, 3000);
    }

    stopRingtone() {
        if (this.ringInterval) {
            clearInterval(this.ringInterval);
            this.ringInterval = null;
        }
    }
}

export const sounds = new SoundManager();

