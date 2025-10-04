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
      const err = new Error(details ? `${msg}:\n${details}` : msg)
      err.body = body
      throw err
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
  <td><span class="badge ${r.estado==='Aceptada'?'text-bg-success':r.estado==='Rechazada'?'text-bg-danger':'text-bg-primary'}">${r.estado||'Pendiente'}</span></td>
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
  if (btnNew && offerModal) btnNew.addEventListener('click', ()=>{ 
    const form = document.getElementById('offerForm')
    form.reset();
    form.dataset.editId = ''
    // Reset validation states
    form.querySelectorAll('.is-valid,.is-invalid').forEach(el=>{ el.classList.remove('is-valid','is-invalid') })
    const titleEl = document.getElementById('offerModalLabel'); if (titleEl) titleEl.textContent = 'Crear oferta'
    offerModal.show() 
  })

  // Helper: set inline field state
  function setFieldState(input, ok, message=''){
    if (!input) return;
    const fbId = input.getAttribute('aria-describedby') || ''
    let fb = fbId ? document.getElementById(fbId) : null
    if (!fb){
      fb = document.createElement('div')
      fb.className = 'invalid-feedback'
      input.after(fb)
      input.setAttribute('aria-describedby', `fb-${Math.random().toString(36).slice(2,7)}`)
      fb.id = input.getAttribute('aria-describedby')
    }
    input.classList.remove('is-valid','is-invalid')
    if (ok){ input.classList.add('is-valid'); fb.textContent = '' }
    else { input.classList.add('is-invalid'); fb.textContent = message || 'Campo inválido' }
  }

  // Preconfigurar límites de fecha mínimo/máximo
  (function setDateLimits(){
    const inp = document.querySelector('#offerForm [name="fechaLimite"]')
    if (!inp) return
    const today = new Date(); today.setHours(0,0,0,0)
    const max = new Date(today); max.setMonth(max.getMonth()+1)
    function fmt(d){ return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10) }
    inp.min = fmt(today)
    inp.max = fmt(max)
  })()

  const saveBtn = document.getElementById('saveOfferBtn')
  if (saveBtn) saveBtn.addEventListener('click', async ()=>{
    const form = document.getElementById('offerForm')
    const fd = new FormData(form)
    const payload = Object.fromEntries(fd.entries())
    // visible puede venir como 'on' -> boolean
    payload.visible = !!payload.visible

    // Limpia estados anteriores
    form.querySelectorAll('.is-valid,.is-invalid').forEach(el=>{ el.classList.remove('is-valid','is-invalid') })

    // Validaciones cliente similares a registro
    let valid = true
    const requiredFields = [
      ['nombreServicio','Ingrese un servicio'],
      ['municipio','Seleccione un municipio'],
      ['categoria','Seleccione una categoría'],
      ['precioReferencia','Precio mínimo $50.000'],
      ['personasRequeridas','Debe ser al menos 1'],
      ['descripcion','Campo requerido'],
      ['detalleRequerimiento','Campo requerido'],
      ['fechaLimite','Seleccione una fecha válida']
    ]
    const refs = {}
    requiredFields.forEach(([name,msg])=> refs[name] = form.querySelector(`[name="${name}"]`))
    // Nombre servicio
    if (!payload.nombreServicio || payload.nombreServicio.trim().length<3){ valid=false; setFieldState(refs.nombreServicio,false,'Mínimo 3 caracteres') } else setFieldState(refs.nombreServicio,true)
    // Municipio y categoría
    if (!payload.municipio){ valid=false; setFieldState(refs.municipio,false,'Seleccione un municipio') } else setFieldState(refs.municipio,true)
    if (!payload.categoria){ valid=false; setFieldState(refs.categoria,false,'Seleccione una categoría') } else setFieldState(refs.categoria,true)
    // Precio
    const price = Number(payload.precioReferencia)
    if (!(price>=50000)){ valid=false; setFieldState(refs.precioReferencia,false,'Mínimo $50.000') } else setFieldState(refs.precioReferencia,true)
    // Personas
    const persons = Number(payload.personasRequeridas)
    if (!(persons>=1)){ valid=false; setFieldState(refs.personasRequeridas,false,'Al menos 1 persona') } else setFieldState(refs.personasRequeridas,true)
    // Descripciones
    if (!payload.descripcion || payload.descripcion.trim().length<10){ valid=false; setFieldState(refs.descripcion,false,'Mínimo 10 caracteres') } else setFieldState(refs.descripcion,true)
    if (!payload.detalleRequerimiento || payload.detalleRequerimiento.trim().length<10){ valid=false; setFieldState(refs.detalleRequerimiento,false,'Mínimo 10 caracteres') } else setFieldState(refs.detalleRequerimiento,true)
    // Fecha límite rango [hoy, hoy+1mes]
    if (payload.fechaLimite){
      const today = new Date(); today.setHours(0,0,0,0)
      const max = new Date(today); max.setMonth(max.getMonth()+1)
      const selected = new Date(payload.fechaLimite)
      if (selected < today || selected > max){ valid=false; setFieldState(refs.fechaLimite,false,'Debe estar entre hoy y 1 mes') } else setFieldState(refs.fechaLimite,true)
    } else { valid=false; setFieldState(refs.fechaLimite,false,'Seleccione una fecha') }

    // Imágenes: al crear son obligatorias
    const editId = form.dataset.editId
    const filesInput = document.getElementById('offerImages')
    const files = Array.from(filesInput?.files || [])
    async function toBase64(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file) }) }
    if (!editId){
      if (!files.length){
        valid=false; filesInput.classList.add('is-invalid')
        let fb = filesInput.nextElementSibling; if (fb && !fb.classList.contains('invalid-feedback')) { fb = null }
        if (!fb){ fb = document.createElement('div'); fb.className='invalid-feedback'; filesInput.after(fb) }
        fb.textContent = 'Debes subir al menos una imagen'
      } else if (files.length>5){ valid=false; filesInput.classList.add('is-invalid'); let fb = filesInput.nextElementSibling; if (!fb||!fb.classList.contains('invalid-feedback')){ fb=document.createElement('div'); fb.className='invalid-feedback'; filesInput.after(fb) } fb.textContent='Máximo 5 imágenes' }
    }
    if (!valid) { showToast('Revisa los campos marcados', 'danger'); return }

    if (files.length){
      if (files.length > 5) { showToast('Máximo 5 imágenes', 'warning'); return }
      payload.imagenes = await Promise.all(files.map(toBase64))
    }

    // Enviar JSON al backend (empleador se infiere por sesión)
    try {
      const old = saveBtn.innerHTML; saveBtn.disabled = true; saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando'
      if (editId){
        await api(`/api/ofertas/${editId}`, { method:'PUT', body: JSON.stringify(payload) })
      } else {
        await api('/api/ofertas', { method:'POST', body: JSON.stringify(payload) })
      }
      offerModal.hide()
      loadAll()
      showToast(editId ? 'Oferta actualizada' : 'Oferta creada correctamente', 'success')
      form.dataset.editId = ''
      form.reset()
    } catch(e){
      // Preferir fieldErrors estructurado del backend
      const fieldErrors = e?.body?.fieldErrors || {}
      Object.entries(fieldErrors).forEach(([k,msg])=>{ if (refs[k]) setFieldState(refs[k], false, msg) })
      if (!Object.keys(fieldErrors).length){
        const msg = String(e.message||'')
        const lines = msg.split('\n').map(s=>s.trim()).filter(Boolean)
        if (lines.length>1){
          lines.slice(1).forEach(line=>{
            const mField = line.match(/`?(\w+)`?\s*:/) || line.match(/(nombreServicio|municipio|categoria|precioReferencia|personasRequeridas|descripcion|detalleRequerimiento|fechaLimite)/)
            const field = mField ? (mField[1]||mField[0]) : null
            if (field && refs[field]) setFieldState(refs[field], false, line.replace(/^\w+\s*:?\s*/,'').trim())
          })
        }
      }
      showToast(e?.body?.message || e.message || 'No se pudo crear la oferta', 'danger')
    }
    finally{ saveBtn.disabled = false; saveBtn.innerHTML = old }
  })

  loadAll()

  // Delegación de eventos para acciones en tablas
  document.addEventListener('click', async (e)=>{
    const btnEdit = e.target.closest('[data-edit]')
    if (btnEdit){
      const id = btnEdit.getAttribute('data-edit')
      try{
        // Mostrar modal rápido con loader
        const form = document.getElementById('offerForm')
        document.getElementById('offerModalLabel').textContent = 'Editar oferta'
        offerModal.show()
        // Reset validation states
        form.querySelectorAll('.is-valid,.is-invalid').forEach(el=>{ el.classList.remove('is-valid','is-invalid') })
        const { data } = await api(`/api/ofertas/${id}`)
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
        // Confirm modal
        const html = `
          <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog"><div class="modal-content">
              <div class="modal-header"><h5 class="modal-title">Eliminar oferta</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">Esta acción no se puede deshacer. ¿Deseas eliminar la oferta?</div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Eliminar</button>
              </div>
            </div></div>
          </div>`
        let wrapper = document.getElementById('confirmDeleteWrapper')
        if (!wrapper){ wrapper = document.createElement('div'); wrapper.id='confirmDeleteWrapper'; document.body.appendChild(wrapper) }
        wrapper.innerHTML = html
        const mdlEl = document.getElementById('confirmDeleteModal')
        const mdl = new bootstrap.Modal(mdlEl)
        mdl.show()
        mdlEl.querySelector('#confirmDeleteBtn').onclick = async ()=>{
          try{ 
            const resp = await fetch(`/api/ofertas/${id}`, { method:'DELETE', credentials:'include', headers:{ 'Content-Type':'application/json' }})
            const body = await resp.json().catch(()=>({}))
            if(!resp.ok) throw new Error(body?.message||'No se pudo eliminar')
            mdl.hide()
            showToast('Oferta eliminada', 'success')
            loadAll()
          }catch(err){ showToast(err.message||'Error eliminando', 'danger') }
        }
        mdlEl.addEventListener('hidden.bs.modal', ()=>{ mdlEl.remove() })
      }catch(err){ showToast(err.message||'Error eliminando', 'danger') }
      return
    }

    const btnViewOffer = e.target.closest('[data-view-offer]')
    if (btnViewOffer){
      const id = btnViewOffer.getAttribute('data-view-offer')
      try{
        // Abre modal con spinner mientras carga
        const body = document.getElementById('offerDetailsBody')
        body.innerHTML = '<div class="d-flex align-items-center gap-2"><div class="spinner-border text-primary" role="status" style="width:1.5rem;height:1.5rem"></div><span>Cargando…</span></div>'
        new bootstrap.Modal(document.getElementById('offerDetailsModal')).show()
        const { data } = await api(`/api/ofertas/${id}`)
        const fechaLim = data.fechaLimite ? new Date(data.fechaLimite).toLocaleDateString('es-CO') : ''
        body.innerHTML = `
          <div class="mb-3">
            <h5 class="mb-1">${data.nombreServicio||''}</h5>
            <div class="text-muted small">${data.municipio?.nombre||''} • $ ${Number(data.precioReferencia||0).toLocaleString('es-CO')} • Hasta: ${fechaLim}</div>
          </div>
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="user-avatar rounded-circle" data-user="${data.empleador?.idUsuario||''}" style="width:40px;height:40px;background-image:url('/img/profile-img/default.png');background-size:cover;background-position:center"></div>
            <div>
              <div class="fw-semibold">${data.empleador?.nombre||'Empleador'}</div>
              <div class="small text-muted">Publicado: ${data.fechaCreacion ? new Date(data.fechaCreacion).toLocaleDateString('es-CO') : ''}</div>
            </div>
          </div>
          <div class="mb-2"><strong>Descripción</strong><div>${data.descripcion||''}</div></div>
          <div class="mb-2"><strong>Requisitos</strong><div>${data.detalleRequerimiento||''}</div></div>
        `
        try { if (window.hydrateCurrentUserAvatar) window.hydrateCurrentUserAvatar() } catch {}
      }catch(err){ showToast(err.message||'Error cargando detalles', 'danger') }
      return
    }

    const btnViewApply = e.target.closest('[data-viewapp]')
    if (btnViewApply){
      const id = btnViewApply.getAttribute('data-viewapp')
      try{
  const applyBody = document.getElementById('applyDetailsBody')
  applyBody.innerHTML = '<div class="d-flex align-items-center gap-2"><div class="spinner-border text-primary" role="status" style="width:1.5rem;height:1.5rem"></div><span>Cargando…</span></div>'
        const applyModalEl = document.getElementById('applyDetailsModal')
        const applyModal = bootstrap.Modal.getInstance(applyModalEl) || new bootstrap.Modal(applyModalEl)
        applyModal.show()
        // En este MVP, la tabla ya contiene los datos necesarios; si tuvieras endpoint por id, podrías traerlo aquí.
        // Para enriquecer con correo, intenta obtener el usuario por id si viene en la fila, si no lo dejamos en blanco.
  const rows = (await api('/api/postulaciones')).data||[]
        const item = rows.find(r=> String(r._id) === String(id))
        if (!item) throw new Error('Postulación no encontrada')

        let email = ''
        let fullName = item.empleado?.nombre || ''
        if (item.empleado?.idUsuario){
          try{ const u = await api(`/api/usuarios/${item.empleado.idUsuario}`); email = u?.data?.email||''; const nn = (u?.data?.nombres||'') + (u?.data?.apellidos? ' '+u.data.apellidos : ''); if(nn.trim()) fullName = nn.trim() }catch{}
        }
        const fecha = item.fechaPostulacion ? new Date(item.fechaPostulacion).toLocaleDateString('es-CO') : ''
        const body = document.getElementById('applyDetailsBody')
        body.innerHTML = `
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="user-avatar rounded-circle" data-user="${item.empleado?.idUsuario||''}" style="width:48px;height:48px;background-image:url('/img/profile-img/default.png');background-size:cover;background-position:center"></div>
            <div>
              <div class="fw-semibold">${fullName||''}</div>
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
        try { if (window.hydrateCurrentUserAvatar) window.hydrateCurrentUserAvatar() } catch {}
        document.getElementById('btnAcceptApply').dataset.id = id
        document.getElementById('btnRejectApply').dataset.id = id
        applyModal.show()
      }catch(err){ showToast(err.message||'Error cargando postulación', 'danger') }
      return
    }
  })

  // Aceptar / Rechazar postulación
  const btnAccept = document.getElementById('btnAcceptApply')
  const btnReject = document.getElementById('btnRejectApply')
  async function setApplyStatus(id, estado){
    try{
      const btn = estado==='Aceptada' ? document.getElementById('btnAcceptApply') : document.getElementById('btnRejectApply')
      const oldHtml = btn.innerHTML
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando'
      const r = await api(`/api/postulaciones/${id}`, { method:'PATCH', body: JSON.stringify({ estado }) })
      showToast(`Postulación ${estado.toLowerCase()}`, 'success')
      // Cerrar modal y actualizar tabla sin recargar toda la página
      const modalEl = document.getElementById('applyDetailsModal')
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)
      modal.hide()
      loadAll()
      btn.disabled = false
      btn.innerHTML = oldHtml
    }catch(err){ showToast(err.message||'No se pudo actualizar', 'danger') }
  }
  if (btnAccept) btnAccept.addEventListener('click', ()=>{ const id = btnAccept.dataset.id; if(id) setApplyStatus(id,'Aceptada') })
  if (btnReject) btnReject.addEventListener('click', ()=>{ const id = btnReject.dataset.id; if(id) setApplyStatus(id,'Rechazada') })

  // Limpieza de backdrops cuando se cierran modales, para evitar pantalla bloqueada
  document.addEventListener('hidden.bs.modal', () => {
    document.querySelectorAll('.modal-backdrop.show').forEach(b => b.remove())
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
  })
})()