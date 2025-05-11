// 1) Define tu inventario: ID y nombre de cada artículo
const items = [
    { id: 'tablet-001', nombre: 'Tablet Sala 1' },
    { id: 'tablet-002', nombre: 'Tablet Sala 2' },
    // … agrega aquí todos tus IDs con sus nombres
];

// 2) Genera un bloque por cada artículo
const cont = document.getElementById('lista');
items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item';
    card.innerHTML = `
    <h4>${item.nombre}</h4>
    <div id="qr-${item.id}"></div>
    <small>${item.id}</small>
    `;
    cont.appendChild(card);

    // 3) Genera el QR con el texto = el ID
    new QRCode(document.getElementById(`qr-${item.id}`), {
    text: item.id,
    width: 128,
    height: 128
    });
});