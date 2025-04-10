// registrazione del servizio worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Servizio Worker registrato con successo.');
      })
      .catch(error => {
        console.error('Errore durante la registrazione del servizio worker:', error);
    });
  });
}
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let stream, sourceNode, analyserNode;

document.getElementById('startStopBtn').addEventListener('click', async () => {
    if (!stream) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startAnalysis();
            document.getElementById('startStopBtn').innerText = 'Stop';
        } catch (e) { console.error("Microphone access denied") }
    } else {
        stopAnalysis();
    }
});

function startAnalysis() {
    const context = audioContext
    sourceNode = context.createMediaStreamSource(stream);
    analyserNode = context.createAnalyser();
    analyserNode.fftSize = 2048;
    
    sourceNode.connect(analyserNode);
    
    drawFrequency();
}

function stopAnalysis() {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
    document.getElementById('startStopBtn').innerText = 'Start';
}

function drawFrequency() {
    if (!analyserNode) return;
    
    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(dataArray);
    
    // Find dominant frequency
    let maxVolumeIndex = 0;
    let maxVolume = 0;
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxVolume) {
            maxVolume = dataArray[i];
            maxVolumeIndex = i;
        }
    }
    
    const sampleRate = analyserNode.context.sampleRate;
    const freqHz = (maxVolumeIndex * sampleRate) / analyserNode.fftSize;
    
    document.getElementById('frequencyValue').innerHTML = `Frequenza: ${freqHz.toFixed(0)} Hz`;
    
    // Draw visual representation
    const canvas = document.getElementById('frequencyDisplay');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < dataArray.length; i++) {
        const x = (canvas.width / analyserNode.frequencyBinCount) * i;
        const barHeight = (canvas.height / 255) * dataArray[i];
        
        ctx.fillStyle = '#3f51b5';
        ctx.fillRect(x, canvas.height - barHeight, 2, barHeight);
    }
    
    requestAnimationFrame(drawFrequency);
}

// Add this to your existing JavaScript
window.addEventListener('resize', () => {
  const canvas = document.getElementById('frequencyDisplay');
  canvas.width = window.innerWidth * 0.9;
  canvas.height = canvas.width * 0.333; // Maintain 3:1 aspect ratio
});