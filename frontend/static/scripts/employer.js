(function(){
  function readCurrentUser(){
    const el = document.getElementById('CURRENT_USER_DATA')
    try { return el ? JSON.parse(el.textContent||'null') : null } catch { return null }
  }
  const CURRENT_USER = readCurrentUser()

  // Simple toast helper (Bootstrap 5)
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
    toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`
    container.appendChild(toastEl)
    const t = new bootstrap.Toast(toastEl, { delay: 3000 })
    t.show()
    toastEl.addEventListener('hidden.bs.toast', ()=> toastEl.remove())
  }

  async function api(path, options = {}){
    const res = await fetch(path, { credentials:'include', headers:{ 'Content-Type':'application/json' }, ...options })
    const body = await res.json().catch(()=>({}))
    if (!res.ok) {
      const details = Array.isArray(body?.errors) ? body.errors.join(' \n') : ''
      const msg = body?.message || 'Error'
      throw new Error(details ? `${msg}:\n${details}` : msg)
    }
    return body
  }

  function renderMyOffers(offers){
    const tbody = document.getElementById('myOffersTableBody')
    tbody.innerHTML = offers.map(o=>{
      const fecha = o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleDateString('es-CO') : ''
      const postCount = Number(o.postulacionesCount||0)
      const estadoBadge = o.visible ? '<span class="badge text-bg-success">Activa</span>' : '<span class="badge text-bg-secondary">Oculta</span>'
      return `<tr>
        <td>${o.nombreServicio||'—'}</td>
        <td>${o.categoria||'—'}</td>
        <td>${estadoBadge}</td>
        <td>${postCount}</td>
        <td>${fecha}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" title="Ver detalles" data-view-offer="${o._id}"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary" data-edit="${o._id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-del="${o._id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`
    }).join('')
  }

  function renderRecentApplyments(rows){
    const tbody = document.getElementById('recentApplymentsBody')
    tbody.innerHTML = rows.map(r=>{
      const fecha = r.fechaPostulacion ? new Date(r.fechaPostulacion).toLocaleDateString('es-CO') : ''
      return `<tr>
        <td>${r.empleado?.nombre||'—'}</td>
        <td>${r.servicio?.nombreServicio||'—'}</td>
        <td>${fecha}</td>
        <td><span class="badge text-bg-success">${r.estado||'Pendiente'}</span></td>
        <td><button class="btn btn-sm btn-outline-primary" data-viewapp="${r._id}">Ver detalles</button></td>
      </tr>`
    }).join('')
  }

  function setMetrics({ offers, applyments }){
  const currentId = String(CURRENT_USER?.sub || CURRENT_USER?._id || CURRENT_USER?.id || '')
  const myOffers = offers.filter(o=> String(o.empleador?.idUsuario||'') === currentId)
    const offersCount = myOffers.length
    const offerIds = new Set(myOffers.map(o=>String(o._id)))
    const myApplyments = applyments.filter(a=> offerIds.has(String(a.servicio?.idServicio)))
    const applymentsCount = myApplyments.length
    const views = myOffers.reduce((acc,o)=> acc + Number(o.visualizaciones||0), 0)
    document.getElementById('metricOffers').textContent = offersCount
    document.getElementById('metricApplyments').textContent = applymentsCount
    document.getElementById('metricViews').textContent = views

    // attach counts to offers
    const countsByOffer = {}
    for (const a of myApplyments) {
      const k = String(a.servicio?.idServicio)
      countsByOffer[k] = (countsByOffer[k]||0)+1
    }
    myOffers.forEach(o=> o.postulacionesCount = countsByOffer[String(o._id)]||0)
    renderMyOffers(myOffers)
    renderRecentApplyments(myApplyments.slice(0,10))
  }

  async function loadAll(){
    try {
      const [offersRes, applyRes] = await Promise.all([
        api('/api/ofertas'),
        api('/api/postulaciones')
      ])
      const offers = Array.isArray(offersRes?.data) ? offersRes.data : []
      const applyments = Array.isArray(applyRes?.data) ? applyRes.data : []
      setMetrics({ offers, applyments })
    } catch(e){ console.error(e) }
  }

  // Modal create
  const modalEl = document.getElementById('offerModal')
  const offerModal = modalEl ? new bootstrap.Modal(modalEl) : null
  const btnNew = document.getElementById('btnNewOffer') || document.getElementById('newOfferBtn')
  if (btnNew && offerModal) btnNew.addEventListener('click', ()=>{ document.getElementById('offerForm').reset(); offerModal.show() })

  const saveBtn = document.getElementById('saveOfferBtn')
  if (saveBtn) saveBtn.addEventListener('click', async ()=>{
    const form = document.getElementById('offerForm')
    const fd = new FormData(form)
    const payload = Object.fromEntries(fd.entries())
    // visible puede venir como 'on' -> boolean
    payload.visible = !!payload.visible

    // Leer imágenes 1..5 como base64 (solo obligatorias al crear)
    const files = Array.from(document.getElementById('offerImages')?.files || [])
    async function toBase64(file){
      return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file) })
    }
    if (files.length){
      if (files.length > 5) { showToast('Máximo 5 imágenes', 'warning'); return }
      payload.imagenes = await Promise.all(files.map(toBase64))
    }

    // Enviar JSON al backend (empleador se infiere por sesión)
    try {
      const editId = form.dataset.editId
      if (editId){
        await api(`/api/ofertas/${editId}`, { method:'PUT', body: JSON.stringify(payload) })
      } else {
        if (!files.length){ showToast('Debes subir al menos una imagen', 'danger'); return }
        await api('/api/ofertas', { method:'POST', body: JSON.stringify(payload) })
      }
      offerModal.hide()
      loadAll()
      showToast(editId ? 'Oferta actualizada' : 'Oferta creada correctamente', 'success')
      form.dataset.editId = ''
      form.reset()
    } catch(e){ showToast(e.message || 'No se pudo crear la oferta', 'danger') }
  })

  loadAll()

  // Delegación de eventos para acciones en tablas
  document.addEventListener('click', async (e)=>{
    const btnEdit = e.target.closest('[data-edit]')
    if (btnEdit){
      const id = btnEdit.getAttribute('data-edit')
      try{
        const { data } = await api(`/api/ofertas/${id}`)
        const form = document.getElementById('offerForm')
        form.dataset.editId = id
        form.querySelector('[name="nombreServicio"]').value = data.nombreServicio||''
        form.querySelector('[name="municipio"]').value = data.municipio?.nombre||''
        form.querySelector('[name="categoria"]').value = data.categoria||''
        form.querySelector('[name="precioReferencia"]').value = data.precioReferencia||''
        form.querySelector('[name="personasRequeridas"]').value = data.personasRequeridas||1
        form.querySelector('[name="descripcion"]').value = data.descripcion||''
        form.querySelector('[name="detalleRequerimiento"]').value = data.detalleRequerimiento||''
        form.querySelector('[name="fechaLimite"]').value = data.fechaLimite ? new Date(data.fechaLimite).toISOString().slice(0,10) : ''
        form.querySelector('[name="visible"]').checked = !!data.visible
        // No pre-cargamos imágenes por simplicidad; si el usuario sube nuevas, se reemplazan.
        document.getElementById('offerImages').value = ''
        offerModal.show()
      }catch(err){ showToast(err.message||'Error cargando oferta', 'danger') }
      return
    }
    const btnDel = e.target.closest('[data-del]')
    if (btnDel){
      const id = btnDel.getAttribute('data-del')
      try{
        const resp = await fetch(`/api/ofertas/${id}`, { method:'DELETE', credentials:'include', headers:{ 'Content-Type':'application/json' }})
        const body = await resp.json().catch(()=>({}))
        if(!resp.ok) throw new Error(body?.message||'No se pudo eliminar')
        showToast('Oferta eliminada', 'success')
        loadAll()
      }catch(err){ showToast(err.message||'Error eliminando', 'danger') }
      return
    }

    const btnViewOffer = e.target.closest('[data-view-offer]')
    if (btnViewOffer){
      const id = btnViewOffer.getAttribute('data-view-offer')
      try{
        const { data } = await api(`/api/ofertas/${id}`)
        const body = document.getElementById('offerDetailsBody')
        const fechaLim = data.fechaLimite ? new Date(data.fechaLimite).toLocaleDateString('es-CO') : ''
        body.innerHTML = `
          <div class="mb-3">
            <h5 class="mb-1">${data.nombreServicio||''}</h5>
            <div class="text-muted small">${data.municipio?.nombre||''} • $ ${Number(data.precioReferencia||0).toLocaleString('es-CO')} • Hasta: ${fechaLim}</div>
          </div>
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="rounded-circle bg-secondary" style="width:40px;height:40px"></div>
            <div>
              <div class="fw-semibold">${data.empleador?.nombre||'Empleador'}</div>
              <div class="small text-muted">Publicado: ${data.fechaCreacion ? new Date(data.fechaCreacion).toLocaleDateString('es-CO') : ''}</div>
            </div>
          </div>
          <div class="mb-2"><strong>Descripción</strong><div>${data.descripcion||''}</div></div>
          <div class="mb-2"><strong>Requisitos</strong><div>${data.detalleRequerimiento||''}</div></div>
        `
        new bootstrap.Modal(document.getElementById('offerDetailsModal')).show()
      }catch(err){ showToast(err.message||'Error cargando detalles', 'danger') }
      return
    }

    const btnViewApply = e.target.closest('[data-viewapp]')
    if (btnViewApply){
      const id = btnViewApply.getAttribute('data-viewapp')
      try{
        // En este MVP, la tabla ya contiene los datos necesarios; si tuvieras endpoint por id, podrías traerlo aquí.
        // Para enriquecer con correo, intenta obtener el usuario por id si viene en la fila, si no lo dejamos en blanco.
        const rows = (await api('/api/postulaciones')).data||[]
        const item = rows.find(r=> String(r._id) === String(id))
        if (!item) throw new Error('Postulación no encontrada')

        let email = ''
        if (item.empleado?.idUsuario){
          try{ const u = await api(`/api/usuarios/${item.empleado.idUsuario}`); email = u?.data?.email||'' }catch{}
        }
        const fecha = item.fechaPostulacion ? new Date(item.fechaPostulacion).toLocaleDateString('es-CO') : ''
        const body = document.getElementById('applyDetailsBody')
        body.innerHTML = `
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="rounded-circle bg-secondary" style="width:48px;height:48px"></div>
            <div>
              <div class="fw-semibold">${item.empleado?.nombre||''}</div>
              <div class="small text-muted">${email}</div>
            </div>
          </div>
          <div class="mb-2"><strong>Postulación para:</strong><div>${item.servicio?.nombreServicio||''}</div></div>
          <div class="mb-2"><strong>Estado actual:</strong> <span class="badge ${item.estado==='Aceptada'?'text-bg-success':item.estado==='Rechazada'?'text-bg-danger':'text-bg-primary'}">${item.estado||'Pendiente'}</span></div>
          <div class="mb-2"><strong>Mensaje del candidato:</strong><div>${item.mensaje||''}</div></div>
          <div class="mb-2"><strong>Fecha:</strong> ${fecha}</div>
          <hr class="my-2"/>
          <div class="small text-muted">Historial de la postulación:</div>
          <div class="mt-2">
            <div class="d-flex align-items-start gap-2 mb-2"><span class="text-primary">•</span><div><div class="fw-semibold">Postulación recibida</div><div class="text-muted small">El candidato ha aplicado a la oferta.</div></div></div>
            ${item.estado && item.estado!=='Pendiente' ? `<div class="d-flex align-items-start gap-2"><span class="text-primary">•</span><div><div class="fw-semibold">Estado actualizado</div><div class="text-muted small">La postulación ha sido ${item.estado.toLowerCase()}.</div></div></div>`:''}
          </div>
        `
        document.getElementById('btnAcceptApply').dataset.id = id
        document.getElementById('btnRejectApply').dataset.id = id
        new bootstrap.Modal(document.getElementById('applyDetailsModal')).show()
      }catch(err){ showToast(err.message||'Error cargando postulación', 'danger') }
      return
    }
  })

  // Aceptar / Rechazar postulación
  const btnAccept = document.getElementById('btnAcceptApply')
  const btnReject = document.getElementById('btnRejectApply')
  async function setApplyStatus(id, estado){
    try{
      const r = await api(`/api/postulaciones/${id}`, { method:'PATCH', body: JSON.stringify({ estado }) })
      showToast(`Postulación ${estado.toLowerCase()}`, 'success')
      loadAll()
    }catch(err){ showToast(err.message||'No se pudo actualizar', 'danger') }
  }
  if (btnAccept) btnAccept.addEventListener('click', ()=>{ const id = btnAccept.dataset.id; if(id) setApplyStatus(id,'Aceptada') })
  if (btnReject) btnReject.addEventListener('click', ()=>{ const id = btnReject.dataset.id; if(id) setApplyStatus(id,'Rechazada') })
})()