const grid = document.getElementById('grid');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Cargar productos
fetch('data/postres.json')
  .then(r => r.json())
  .then(items => {
    items.sort((a, b) => (b.disponible - a.disponible) || a.nombre.localeCompare(b.nombre));

    const frag = document.createDocumentFragment();
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';

      const img = document.createElement('img');
      img.alt = item.nombre;
      img.src = item.imagen && item.imagen.trim() ? item.imagen : 'images/logo.png';
      card.appendChild(img);

      const c = document.createElement('div');
      c.className = 'card-content';

      let sizeOptions = '';
      if (item.tamaños && item.tamaños.length) {
        sizeOptions = `<label style="display:block;margin-top:5px;">Tamaño:
          <select class="size-select" data-nombre="${item.nombre}">
          ${item.tamaños.map(t=>`<option value="${t.precio}">${t.nombre} - $${t.precio.toLocaleString('es-AR')}</option>`).join('')}
          </select>
        </label>`;
      }

      c.innerHTML = `
        <h3>${item.nombre}</h3>
        <p>${item.descripcion}</p>
        <div class="price-row">
          <span class="badge ${item.disponible ? 'ok':''}">${item.disponible ? 'Disponible' : 'Agotado'}</span>
        </div>
        ${sizeOptions}
        <button class="add-to-cart" data-nombre="${item.nombre}" ${!item.disponible ? 'disabled':''}>Agregar al carrito</button>
      `;
      card.appendChild(c);
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  });

// --- Carrito ---
let cart = [];
const cartModal = document.getElementById('cartModal');
const cartItemsList = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.querySelector('.close-cart');
const cartCount = document.getElementById('cartCount');

grid.addEventListener('click', e => {
  if (e.target.classList.contains('add-to-cart')) {
    const nombre = e.target.dataset.nombre;
    const sizeSelect = e.target.parentElement.querySelector('.size-select');
    let precio = 0;
    let detalle = '';
    if (sizeSelect) {
      precio = parseFloat(sizeSelect.value);
      detalle = sizeSelect.options[sizeSelect.selectedIndex].text.split('-')[0].trim();
    }

    const existente = cart.find(it => it.nombre === nombre && it.detalle === detalle);
    if (existente) {
      existente.cantidad++;
    } else {
      cart.push({ nombre, precio, detalle, cantidad: 1 });
    }
    updateCart();
  }
});

function updateCart() {
  cartItemsList.innerHTML = '';
  let total = 0;
  cart.forEach((item, i) => {
    total += item.precio * item.cantidad;
    const li = document.createElement('li');
    li.textContent = `${item.nombre} ${item.detalle? '('+item.detalle+')':''} x${item.cantidad} - $${(item.precio*item.cantidad).toLocaleString('es-AR')}`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => { cart.splice(i, 1); updateCart(); };
    li.appendChild(removeBtn);
    cartItemsList.appendChild(li);
  });
  cartTotal.textContent = `Total: $ ${total.toLocaleString('es-AR')}`;
  cartCount.textContent = cart.reduce((t,it)=>t+it.cantidad,0);
}

openCartBtn.onclick = () => { cartModal.style.display = 'block'; };
closeCartBtn.onclick = () => { cartModal.style.display = 'none'; };
cartModal.onclick = (e) => { if (e.target === cartModal) cartModal.style.display = 'none'; };

// --- Checkout modal ---
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const closeCheckoutBtn = document.querySelector('.close-checkout');
const transferInfo = document.getElementById('transferInfo');
const pedidoResumen = document.getElementById('pedidoResumen');

checkoutBtn.onclick = () => {
  if (cart.length === 0) { alert('El carrito está vacío'); return; }
  renderResumen();
  checkoutModal.style.display = 'block';
};

function renderResumen(){
  let resumen = '<h4>Resumen del pedido:</h4><ul>';
  let total = 0;
  cart.forEach(it=>{
    total += it.precio*it.cantidad;
    resumen += `<li>${it.nombre} ${it.detalle? '('+it.detalle+')':''} x${it.cantidad} - $${(it.precio*it.cantidad).toLocaleString('es-AR')}</li>`;
  });
  resumen += `</ul><p><strong>Total: $${total.toLocaleString('es-AR')}</strong></p>`;
  pedidoResumen.innerHTML = resumen;
}

closeCheckoutBtn.onclick = () => { checkoutModal.style.display = 'none'; };
checkoutModal.onclick = (e) => { if (e.target === checkoutModal) checkoutModal.style.display = 'none'; };

checkoutForm.pago.addEventListener('change', () => {
  transferInfo.style.display = checkoutForm.pago.value === 'transferencia' ? 'block' : 'none';
});

checkoutForm.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = checkoutForm.nombre.value;
  const direccion = checkoutForm.direccion.value;
  const cp = checkoutForm.cp.value;
  const piso = checkoutForm.piso.value;
  const pago = checkoutForm.pago.value;

  let mensaje = `Pedido:\n`;
  cart.forEach(it => mensaje += `- ${it.nombre} ${it.detalle? '('+it.detalle+')':''} x${it.cantidad} $${it.precio}\n`);
  mensaje += `Total: $${cart.reduce((t, it) => t + (it.precio * it.cantidad), 0)}\n\n`;
  mensaje += `Cliente: ${nombre}\nDirección: ${direccion} CP:${cp} ${piso ? 'Piso/Depto:' + piso : ''}\n`;
  if (pago === 'transferencia') {
    mensaje += `\nMétodo de pago: Transferencia\nAlias: roscamacaro.mp\nCBU: 0000003100057371117495\n`;
  } else {
    mensaje += `\nMétodo de pago: Efectivo\n`;
  }
  const url = `https://wa.me/5491152619603?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
  checkoutModal.style.display = 'none';
  cart = [];
  updateCart();
});

// --- Estado abierto/cerrado ---
const estadoLocal = document.getElementById('estadoLocal');

function actualizarEstado() {
  const ahora = new Date();
  const ahoraAR = new Date(
    ahora.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  );

  const hora = ahoraAR.getHours();
  const minuto = ahoraAR.getMinutes();
  const dia = ahoraAR.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb

  const horaActualMin = hora * 60 + minuto;
  let abierto = false;
  let proximaApertura = null;

  if (dia >= 1 && dia <= 5) { // Lunes a Viernes
    const apertura = 19 * 60;
    const cierre = 24 * 60;
    if (horaActualMin >= apertura || horaActualMin < 0) abierto = true;
    else proximaApertura = apertura;
  } else if (dia === 6) { // Sábado
    const apertura = 12 * 60;
    const cierre = 23 * 60;
    if (horaActualMin >= apertura && horaActualMin < cierre) abierto = true;
    else proximaApertura = apertura;
  }

  if (abierto) {
    estadoLocal.innerHTML = `<span class="parpadeo">🟢 Abierto</span>`;
    estadoLocal.className = "estado-local estado-abierto";
  } else if (dia === 0) {
    estadoLocal.textContent = `Cerrado (domingo sin atención)`;
    estadoLocal.className = "estado-local estado-cerrado";
  } else {
    if (proximaApertura !== null) {
      let minutosRestantes = proximaApertura - horaActualMin;
      if (minutosRestantes < 0) minutosRestantes += 24 * 60; // Si ya pasó, hasta el día siguiente
      const horas = Math.floor(minutosRestantes / 60);
      const minutos = minutosRestantes % 60;
      estadoLocal.textContent = `Cerrado (abrimos en ${horas}h ${minutos}min)`;
    } else {
      estadoLocal.textContent = `Cerrado`;
    }
    estadoLocal.className = "estado-local estado-cerrado";
  }
}

actualizarEstado();
setInterval(actualizarEstado, 60000);
