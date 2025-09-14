const grid = document.getElementById('grid');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Cargar productos
fetch('data/postres.json')
  .then(r => r.json())
  .then(items => {
    items.sort((a,b)=> (b.disponible - a.disponible) || a.nombre.localeCompare(b.nombre));
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
      c.innerHTML = `
        <h3>${item.nombre}</h3>
        <p>${item.descripcion}</p>
        <div class="price-row">
          <span class="price">$ ${Number(item.precio).toLocaleString('es-AR')}</span>
          <span class="badge ${item.disponible ? 'ok':''}">${item.disponible ? 'Disponible' : 'Agotado'}</span>
        </div>
        <button class="add-to-cart" data-nombre="${item.nombre}" data-precio="${item.precio}" ${!item.disponible ? 'disabled':''}>Agregar al carrito</button>
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
  if(e.target.classList.contains('add-to-cart')){
    const nombre = e.target.dataset.nombre;
    const precio = parseFloat(e.target.dataset.precio);
    cart.push({nombre,precio});
    updateCart();
  }
});

function updateCart(){
  cartItemsList.innerHTML = '';
  let total = 0;
  cart.forEach((item,i)=>{
    total += item.precio;
    const li = document.createElement('li');
    li.textContent = `${item.nombre} - $${item.precio}`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.onclick = ()=>{ cart.splice(i,1); updateCart(); };
    li.appendChild(removeBtn);
    cartItemsList.appendChild(li);
  });
  cartTotal.textContent = `Total: $ ${total.toLocaleString('es-AR')}`;
  cartCount.textContent = cart.length;
}

openCartBtn.onclick = ()=>{ cartModal.style.display='block'; };
closeCartBtn.onclick = ()=>{ cartModal.style.display='none'; };
cartModal.onclick = (e)=>{ if(e.target===cartModal) cartModal.style.display='none'; };

// --- Checkout modal ---
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const closeCheckoutBtn = document.querySelector('.close-checkout');
const transferInfo = document.getElementById('transferInfo');

checkoutBtn.onclick = ()=>{
  if(cart.length===0){ alert('El carrito está vacío'); return;}
  checkoutModal.style.display='block';
};

closeCheckoutBtn.onclick = ()=>{ checkoutModal.style.display='none'; };
checkoutModal.onclick = (e)=>{ if(e.target===checkoutModal) checkoutModal.style.display='none'; };

// Mostrar info transferencia según selección
checkoutForm.pago.addEventListener('change', ()=>{
  if(checkoutForm.pago.value==='transferencia'){
    transferInfo.style.display='block';
  }else{
    transferInfo.style.display='none';
  }
});

// Enviar pedido
checkoutForm.addEventListener('submit', e=>{
  e.preventDefault();
  const nombre = checkoutForm.nombre.value;
  const direccion = checkoutForm.direccion.value;
  const cp = checkoutForm.cp.value;
  const piso = checkoutForm.piso.value;
  const pago = checkoutForm.pago.value;

  let mensaje = `Pedido:\n`;
  cart.forEach(it=>mensaje+=`- ${it.nombre} $${it.precio}\n`);
  mensaje+=`Total: $${cart.reduce((t,it)=>t+it.precio,0)}\n\n`;
  mensaje+=`Cliente: ${nombre}\nDirección: ${direccion} CP:${cp} ${piso? 'Piso/Depto:'+piso:''}\n`;
  if(pago==='transferencia'){
    mensaje+=`\nMétodo de pago: Transferencia\nAlias: TU.ALIAS.AQUI\nCBU: TU.CBU.AQUI\n`;
  }else{
    mensaje+=`\nMétodo de pago: Efectivo\n`;
  }
  const url = `https://wa.me/5491154815519?text=${encodeURIComponent(mensaje)}`;
  window.open(url,'_blank');
  checkoutModal.style.display='none';
  cart = [];
  updateCart();
});
