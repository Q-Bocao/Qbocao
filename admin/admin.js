// Cargar el JSON de postres
fetch('../data/postres.json')
  .then(r => r.json())
  .then(data => {
    buildTable(data);
  });

let products = [];

function buildTable(data){
  products = data;
  const container = document.getElementById('tableContainer');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th>Nombre</th>
    <th>Descripción</th>
    <th>Precio</th>
    <th>Disponible</th>
    <th>Imagen</th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach((item,i)=>{
    const tr = document.createElement('tr');

    // Nombre
    let tdNombre = document.createElement('td');
    let inputNombre = document.createElement('input');
    inputNombre.value = item.nombre;
    inputNombre.oninput = ()=>products[i].nombre = inputNombre.value;
    tdNombre.appendChild(inputNombre);
    tr.appendChild(tdNombre);

    // Descripción
    let tdDesc = document.createElement('td');
    let inputDesc = document.createElement('input');
    inputDesc.value = item.descripcion;
    inputDesc.oninput = ()=>products[i].descripcion = inputDesc.value;
    tdDesc.appendChild(inputDesc);
    tr.appendChild(tdDesc);

    // Precio
    let tdPrecio = document.createElement('td');
    let inputPrecio = document.createElement('input');
    inputPrecio.type='number';
    inputPrecio.value = item.precio;
    inputPrecio.oninput = ()=>products[i].precio = parseFloat(inputPrecio.value);
    tdPrecio.appendChild(inputPrecio);
    tr.appendChild(tdPrecio);

    // Disponible
    let tdDisp = document.createElement('td');
    let selectDisp = document.createElement('select');
    selectDisp.innerHTML = `<option value="true">Sí</option><option value="false">No</option>`;
    selectDisp.value = item.disponible;
    selectDisp.onchange = ()=>products[i].disponible = (selectDisp.value==='true');
    tdDisp.appendChild(selectDisp);
    tr.appendChild(tdDisp);

    // Imagen
    let tdImg = document.createElement('td');
    let inputImg = document.createElement('input');
    inputImg.value = item.imagen;
    inputImg.oninput = ()=>products[i].imagen = inputImg.value;
    tdImg.appendChild(inputImg);
    tr.appendChild(tdImg);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.innerHTML='';
  container.appendChild(table);
}

// Descargar JSON modificado
document.getElementById('downloadBtn').onclick = ()=>{
  const blob = new Blob([JSON.stringify(products,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'postres.json';
  a.click();
  URL.revokeObjectURL(url);
};