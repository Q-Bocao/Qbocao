// app.js
const grid = document.getElementById('grid');
const year = document.getElementById('year');

// Año automático en el footer
if (year) year.textContent = new Date().getFullYear();

// Cargar productos desde el JSON (en data/postres.json)
fetch('data/postres.json')
  .then(r => r.json())
  .then(items => {
    // Ordenar disponibles primero
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
      `;
      card.appendChild(c);
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  })
  .catch(err => {
    grid.innerHTML = '<p>Error cargando los postres. Verificá el archivo data/postres.json</p>';
    console.error(err);
  });
