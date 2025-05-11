// js/main.js
const btnScan = document.getElementById('btnScan');
const scanner = document.getElementById('scanner');
const video   = document.getElementById('cam');
const canvas  = document.getElementById('canvas');
const ctx     = canvas.getContext('2d');
const form    = document.getElementById('form');
const idIn    = document.getElementById('idArticulo');
const msg     = document.getElementById('mensaje');
let streaming = false;

// Iniciar escáner al pulsar el botón
btnScan.addEventListener('click', () => {
  btnScan.hidden = true;
  scanner.hidden = false;
  form.hidden    = true;
  msg.textContent = '';

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      video.srcObject = stream;
      streaming       = true;
      requestAnimationFrame(scanQR);
    })
    .catch(err => {
      console.error('Error cámara:', err);
      msg.style.color = 'red';
      msg.textContent = 'Error: no se pudo acceder a la cámara.';
      btnScan.hidden = false;
    });
});

// Función de escaneo continuo
function scanQR() {
  if (!streaming) return;
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code      = jsQR(imageData.data, imageData.width, imageData.height);
    if (code && code.data) {
      idIn.value   = code.data;
      form.hidden  = false;
      streaming    = false;
      // Detener cámara
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
      }
    }
  }
  if (streaming) {
    requestAnimationFrame(scanQR);
  }
}

// Manejar envío del formulario de préstamo
form.addEventListener('submit', async e => {
  e.preventDefault();
  msg.style.color = 'black';
  msg.textContent = 'Enviando...';

  const payload = {
    id:       idIn.value,
    usuario:  document.getElementById('usuario').value.trim(),
    cantidad: parseInt(document.getElementById('cantidad').value, 10),
    duracion: parseInt(document.getElementById('duracion').value, 10)
  };

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error('Error de red: ' + response.status);
    }
    const data = await response.json();
    console.log('Respuesta del préstamo:', data);
    if (data.result === 'loan_success' || data.result === 'éxito') {
      msg.style.color = 'green';
      msg.textContent = '✅ Préstamo registrado.';
      form.reset();
      form.hidden = true;
      btnScan.hidden = false;
    } else {
      throw new Error('Resultado inesperado: ' + data.result);
    }
  } catch (err) {
    console.error('Error al registrar préstamo:', err);
    msg.style.color = 'red';
    msg.textContent = '❌ Error al registrar préstamo. Revisa la consola.';
    btnScan.hidden = false;
  }
});
