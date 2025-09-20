const grid = document.getElementById('grid');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Cargar productos
fetch('data/postres.json')
  .then(r => r.json())
  .then(items => {
    // ordenar disponibles primero y alfabético después
    items.sort((a, b) => (b.disponible - a.disponible) || a.nombre.localeCompare(b.nombre));

    const frag = document.createDocumentFragment();
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';

      // Imagen
      const img = document.createElement('img');
      img.alt = item.nombre;
      img.src = item.imagen && item.imagen.trim() ? item.imagen : 'images/logo.png';
      card.appendChild(img);

      // Contenido
      const c = document.createElement('div');
      c.className = 'card-content';

      // selector de tamaño
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

// Añadir al carrito
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

    // buscar si ya existe
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
    mensaje += `\nMétodo de pago: Transferencia\nAlias: TU.ALIAS.AQUI\nCBU: TU.CBU.AQUI\n`;
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

function actualizarEstado(){
  const ahora = new Date();
  const hora = ahora.getHours();
  const dia = ahora.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab

  if (dia >= 1 && dia <= 5) { 
    // Lunes a Viernes: 19 a 00 hs
    if (hora >= 19 || hora < 0) {
      estadoLocal.textContent = "Abierto (Lun–Vie 19:00–00:00)";
      estadoLocal.className = "estado-local estado-abierto";
    } else {
      estadoLocal.textContent = "Cerrado (abre a las 19:00)";
      estadoLocal.className = "estado-local estado-cerrado";
    }
  } else if (dia === 6) { 
    // Sábado: 12 a 23 hs
    if (hora >= 12 && hora < 23) {
      estadoLocal.textContent = "Abierto (Sáb 12:00–23:00)";
      estadoLocal.className = "estado-local estado-abierto";
    } else {
      estadoLocal.textContent = "Cerrado (abre el sábado 12:00)";
      estadoLocal.className = "estado-local estado-cerrado";
    }
  } else {
    // Domingo: cerrado
    estadoLocal.textContent = "Cerrado (domingo sin atención)";
    estadoLocal.className = "estado-local estado-cerrado";
  }
}

actualizarEstado();
setInterval(actualizarEstado, 60000); // refrescar cada minuto
