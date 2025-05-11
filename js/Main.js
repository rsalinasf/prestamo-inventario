const btnScan = document.getElementById('btnScan');
const scanner = document.getElementById('scanner');
const video   = document.getElementById('cam');
const canvas  = document.getElementById('canvas');
const ctx     = canvas.getContext('2d');
const form    = document.getElementById('form');
const idIn    = document.getElementById('idArticulo');
const msg     = document.getElementById('mensaje');
let streaming = false;

// Arrancar escáner al pulsar el botón
btnScan.addEventListener('click', () => {
    btnScan.hidden  = true;
    scanner.hidden  = false;
    form.hidden     = true;
    msg.textContent = '';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        video.srcObject  = stream;
        streaming        = true;
        requestAnimationFrame(scanQR);
    })
    .catch(() => {
        msg.style.color = 'red';
        msg.textContent = 'Error: no se pudo acceder a la cámara.';
    });
});

// Escaneo continuo
function scanQR() {
    if (!streaming) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code      = jsQR(imageData.data, imageData.width, imageData.height);
    if (code?.data) {
        idIn.value        = code.data;
        form.hidden       = false;
        streaming         = false;
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    }
    if (streaming) requestAnimationFrame(scanQR);
}

// Envío del formulario
form.addEventListener('submit', e => {
    e.preventDefault();
    const payload = {
    id:       idIn.value,
    usuario:  document.getElementById('usuario').value.trim(),
    cantidad: parseInt(document.getElementById('cantidad').value, 10),
    duracion: parseInt(document.getElementById('duracion').value, 10)
    };
    msg.style.color = 'black';
    msg.textContent = 'Enviando…';

    fetch('https://script.google.com/macros/s/AKfycbxWQx6aPTk9fWdBG8ruRnjl_KmKb-tAzS2F-sy92-KosTKFne1_unvFECi9quWGmE2evg/exec', {
    method: 'POST',
    body:   JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
    if (data.result === 'éxito') {
        msg.style.color = 'green';
        msg.textContent = '✅ Préstamo registrado.';
        form.reset();
        form.hidden = true;
        btnScan.hidden = false;
    } else throw new Error();
    })
    .catch(() => {
    msg.style.color = 'red';
    msg.textContent = '❌ Error al registrar. Intenta de nuevo.';
    btnScan.hidden = false;
    });
});