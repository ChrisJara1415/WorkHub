(function(){
  async function api(path, options = {}) {
    const res = await fetch(path, { credentials: 'include', ...options })
    const ct = res.headers.get('content-type')||''
    const body = ct.includes('application/json') ? await res.json().catch(()=>({})) : {}
    if (!res.ok) throw new Error(body.message || 'Error de red')
    return body
  }

  // Toast helper (Bootstrap 5)
  function showToast(message, type = 'info'){
    let container = document.getElementById('toastContainer')
    if (!container){
      container = document.createElement('div')
      container.id = 'toastContainer'
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3'
      document.body.appendChild(container)
    }
    const toastEl = document.createElement('div')
    toastEl.className = `toast align-items-center text-bg-${type} border-0`
    toastEl.role = 'alert'
    toastEl.ariaLive = 'assertive'
    toastEl.ariaAtomic = 'true'
    toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type=\"button\" class=\"btn-close btn-close-white me-2 m-auto\" data-bs-dismiss=\"toast\" aria-label=\"Close\"></button></div>`
    container.appendChild(toastEl)
    const t = new bootstrap.Toast(toastEl, { delay: 3000 })
    t.show()
    toastEl.addEventListener('hidden.bs.toast', ()=> toastEl.remove())
  }

  function offerCard(o){
    const title = o.nombreServicio || o.nombre || 'Oferta'
    const categoria = o.categoria || 'General'
    const precio = typeof o.precioReferencia === 'number' ? `$ ${o.precioReferencia.toLocaleString('es-CO')}` : ''
    const muni = o.municipio?.nombre || ''
    const fechaLim = o.fechaLimite ? new Date(o.fechaLimite).toLocaleDateString('es-CO') : ''
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-1">${title}</h5>
            <div class="small text-muted mb-2">${categoria} • ${muni}</div>
            <p class="card-text flex-grow-1">${(o.descripcion||'').slice(0,140)}${(o.descripcion||'').length>140?'…':''}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <span class="fw-semibold">${precio}</span>
              <button class="btn btn-warning btn-sm" data-action="details" data-id="${o._id}">Ver detalles</button>
            </div>
            <div class="text-end mt-1 small text-muted">Hasta: ${fechaLim}</div>
          </div>
        </div>
      </div>`
  }

  async function loadOffers(){
    try{
      const { data = [] } = await api('/api/ofertas')
      const list = Array.isArray(data) ? data : []
      const container = document.getElementById('offersList')
      container.innerHTML = list.map(offerCard).join('')
    }catch(e){
      console.error(e)
    }
  }

  async function openDetails(id){
    try{
      const { data } = await api(`/api/ofertas/${id}`)
      if (!data) return
      await api(`/api/ofertas/${id}/view`, { method: 'POST' }).catch(() => {})
      const body = document.getElementById('jobDetailsBody')
      body.innerHTML = `
        <h5 class="mb-1">${data.nombreServicio || 'Oferta'}</h5>
        <div class="small text-muted mb-2">${data.categoria} • ${data.municipio?.nombre||''}</div>
        <p>${data.descripcion||''}</p>
        <p class="mb-1"><strong>Precio:</strong> $ ${Number(data.precioReferencia||0).toLocaleString('es-CO')}</p>
        <p class="mb-1"><strong>Personas requeridas:</strong> ${data.personasRequeridas||1}</p>
        <p class="mb-1"><strong>Fecha límite:</strong> ${data.fechaLimite ? new Date(data.fechaLimite).toLocaleDateString('es-CO') : ''}</p>
      `
      const modal = new bootstrap.Modal(document.getElementById('jobDetailsModal'))
      modal.show()
      const applyBtn = document.getElementById('applyBtn')
      applyBtn.onclick = async () => {
        try{
          const payload = { servicio: { idServicio: data._id, nombreServicio: data.nombreServicio || '' }, estado:'Pendiente' }
          const r = await api('/api/postulaciones', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
          modal.hide()
          showToast('Postulación enviada', 'success')
        }catch(err){ showToast('No se pudo postular', 'danger') }
      }
    }catch(e){ console.error(e) }
  }

  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-action="details"]')
    if(btn){ openDetails(btn.dataset.id) }
  })

  loadOffers()
})()