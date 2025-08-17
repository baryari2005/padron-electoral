(function () {
  const bad = [];
  document.querySelectorAll('label[for]').forEach((lab) => {
    const id = lab.getAttribute('for');
    const el = document.getElementById(id);
    if (!el) {
      bad.push(lab);
      lab.style.outline = '3px solid red';           // resaltado visible
      lab.title = `htmlFor="${id}" SIN elemento #${id}`; // tooltip
      console.warn('Label sin destino:', lab, 'for=', id);
    }
  });
  if (!bad.length) {
    console.log('✅ No se encontraron labels con htmlFor roto.');
  } else {
    console.log(`⚠️ Encontradas ${bad.length} labels con htmlFor roto. Están resaltadas en rojo.`);
  }
})();