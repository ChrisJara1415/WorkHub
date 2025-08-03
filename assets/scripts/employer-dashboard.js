// Variables globales
let offers = []
let applications = []
let editingOfferId = null
const OFFERS_STORAGE_KEY = "employer_offers"
const APPLICATIONS_STORAGE_KEY = "employer_applications"
const bootstrap = window.bootstrap

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos desde localStorage
  loadFromLocalStorage()

  // Actualizar estadísticas
  updateStats()
})

// Funciones para localStorage
function saveToLocalStorage() {
  localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers))
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications))
}

function loadFromLocalStorage() {
  const storedOffers = localStorage.getItem(OFFERS_STORAGE_KEY)
  const storedApplications = localStorage.getItem(APPLICATIONS_STORAGE_KEY)

  if (storedOffers) {
    offers = JSON.parse(storedOffers)
  } else {
    offers = []
  }

  if (storedApplications) {
    applications = JSON.parse(storedApplications)
  } else {
    applications = []
  }

  // Actualizar las vistas
  updateOffersTable()
  updateApplicationsTable()
}

// Actualizar estadísticas
function updateStats() {
  document.getElementById("totalOffers").textContent = offers.length
  document.getElementById("totalApplications").textContent = applications.length

  // Calcular visualizaciones (suma de las visualizaciones de todas las ofertas)
  const totalViews = offers.reduce((sum, offer) => sum + (offer.views || 0), 0)
  document.getElementById("totalViews").textContent = totalViews
}

// Actualizar tabla de ofertas
function updateOffersTable() {
  const tbody = document.getElementById("offersTableBody")
  tbody.innerHTML = ""

  if (offers.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">No hay ofertas publicadas</td>
            </tr>`
    return
  }

  offers.forEach((offer, index) => {
    // Contar postulaciones para esta oferta
    const offerApplications = applications.filter((app) => app.offerId === offer.id).length

    tbody.innerHTML += `
            <tr>
                <td>${offer.title}</td>
                <td>${offer.category}</td>
                <td><span class="status-badge status-${offer.status.toLowerCase()}">${offer.status}</span></td>
                <td>${offerApplications}</td>
                <td>${offer.date}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="previewOffer(${index})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="editOffer(${index})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteOffer(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`
  })
}

// Actualizar tabla de postulaciones
function updateApplicationsTable() {
  const tbody = document.getElementById("applicationsTableBody")
  tbody.innerHTML = ""

  if (applications.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">No hay postulaciones recibidas</td>
            </tr>`
    return
  }

  // Ordenar por fecha (más recientes primero)
  const sortedApplications = [...applications].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })

  // Mostrar solo las 5 más recientes
  const recentApplications = sortedApplications.slice(0, 5)

  recentApplications.forEach((application, index) => {
    // Encontrar la oferta correspondiente
    const offer = offers.find((o) => o.id === application.offerId) || { title: "Oferta no disponible" }

    tbody.innerHTML += `
            <tr>
                <td>${application.candidate}</td>
                <td>${offer.title}</td>
                <td>${application.date}</td>
                <td><span class="status-badge status-${application.status.toLowerCase()}">${application.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewApplicationDetails(${index})">
                        <i class="bi bi-eye"></i> Ver detalles
                    </button>
                </td>
            </tr>`
  })
}

// Abrir modal para nueva oferta
function openNewOfferModal() {
  editingOfferId = null
  const form = document.getElementById("offerForm")
  form.reset()
  form.classList.remove("was-validated")

  document.getElementById("offerModalLabel").textContent = "Nueva Oferta"

  // Establecer fecha mínima para el deadline (hoy)
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("offerDeadline").min = today

  const modal = new bootstrap.Modal(document.getElementById("offerModal"))
  modal.show()

  // Configurar el event listener del botón guardar solo cuando se abre el modal
  const saveBtn = document.getElementById("saveOfferBtn")
  saveBtn.onclick = () => {
    saveOffer()
  }
}

// Editar oferta existente
function editOffer(index) {
  const offer = offers[index]
  editingOfferId = offer.id

  document.getElementById("offerTitle").value = offer.title
  document.getElementById("offerCategory").value = offer.category
  document.getElementById("offerLocation").value = offer.location
  document.getElementById("offerSalary").value = offer.salary || ""
  document.getElementById("offerDescription").value = offer.description
  document.getElementById("offerRequirements").value = offer.requirements
  document.getElementById("offerDeadline").value = offer.deadline
  document.getElementById("offerStatus").value = offer.status

  document.getElementById("offerModalLabel").textContent = "Editar Oferta"

  const modal = new bootstrap.Modal(document.getElementById("offerModal"))
  modal.show()
}

// Guardar oferta (nueva o editada)
function saveOffer() {
  const form = document.getElementById("offerForm")

  // Validar formulario
  if (!form.checkValidity()) {
    form.classList.add("was-validated")
    return
  }

  const title = document.getElementById("offerTitle").value
  const category = document.getElementById("offerCategory").value
  const location = document.getElementById("offerLocation").value
  const salary = document.getElementById("offerSalary").value
  const description = document.getElementById("offerDescription").value
  const requirements = document.getElementById("offerRequirements").value
  const deadline = document.getElementById("offerDeadline").value
  const status = document.getElementById("offerStatus").value

  if (editingOfferId) {
    // Actualizar oferta existente
    const index = offers.findIndex((o) => o.id === editingOfferId)
    if (index !== -1) {
      offers[index] = {
        ...offers[index],
        title,
        category,
        location,
        salary,
        description,
        requirements,
        deadline,
        status,
        updatedAt: new Date().toISOString(),
      }
      createToast("Oferta actualizada correctamente", "success")
    }
  } else {
    // Crear nueva oferta
    const newId = "JOB-" + (Math.floor(Math.random() * 9000) + 1000)
    const today = new Date().toISOString().split("T")[0]

    offers.push({
      id: newId,
      title,
      category,
      location,
      salary,
      description,
      requirements,
      deadline,
      status,
      date: formatDate(today),
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    createToast("Oferta creada correctamente", "success")
  }

  // Guardar en localStorage
  saveToLocalStorage()

  // Actualizar la vista
  updateOffersTable()
  updateStats()

  // Cerrar el modal
  const modal = bootstrap.Modal.getInstance(document.getElementById("offerModal"))
  modal.hide()
}

// Eliminar oferta
function deleteOffer(index) {
  if (confirm("¿Estás seguro de que deseas eliminar esta oferta? Esta acción no se puede deshacer.")) {
    const offerId = offers[index].id

    // Eliminar la oferta
    offers.splice(index, 1)

    // Eliminar las postulaciones asociadas a esta oferta
    applications = applications.filter((app) => app.offerId !== offerId)

    // Guardar en localStorage
    saveToLocalStorage()

    // Actualizar la vista
    updateOffersTable()
    updateApplicationsTable()
    updateStats()

    createToast("Oferta eliminada correctamente", "success")
  }
}

// Previsualizar oferta
function previewOffer(index) {
  const offer = offers[index]
  const previewContent = document.getElementById("previewOfferContent")

  previewContent.innerHTML = `
        <div class="offer-preview-header">
            <h3 class="mb-2">${offer.title}</h3>
            <div class="d-flex flex-wrap gap-3 mb-3">
                <span class="badge bg-primary">${offer.category}</span>
                <span class="badge bg-secondary"><i class="bi bi-geo-alt me-1"></i>${offer.location}</span>
                ${offer.salary ? `<span class="badge bg-success"><i class="bi bi-cash me-1"></i>$${offer.salary}</span>` : ""}
                <span class="badge bg-info"><i class="bi bi-calendar me-1"></i>Hasta: ${formatDate(offer.deadline)}</span>
            </div>
            <div class="d-flex align-items-center">
                <img src="../assets/img/profile-img/profile-picture.png?height=50&width=50" alt="Logo empleador" class="me-2 rounded-circle">
                <div>
                    <p class="mb-0 fw-bold">Empleador</p>
                    <small class="text-muted">Publicado el ${offer.date}</small>
                </div>
            </div>
        </div>
        
        <div class="offer-preview-section">
            <h5>Descripción</h5>
            <p>${offer.description}</p>
        </div>
        
        <div class="offer-preview-section">
            <h5>Requisitos</h5>
            <p>${offer.requirements}</p>
        </div>
        
        <div class="offer-preview-section">
            <h5>Detalles adicionales</h5>
            <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between">
                    <span>Ubicación:</span>
                    <span class="fw-bold">${offer.location}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span>Categoría:</span>
                    <span class="fw-bold">${offer.category}</span>
                </li>
                ${
                  offer.salary
                    ? `
                <li class="list-group-item d-flex justify-content-between">
                    <span>Salario:</span>
                    <span class="fw-bold">$${offer.salary}</span>
                </li>`
                    : ""
                }
                <li class="list-group-item d-flex justify-content-between">
                    <span>Fecha límite:</span>
                    <span class="fw-bold">${formatDate(offer.deadline)}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span>Estado:</span>
                    <span class="status-badge status-${offer.status.toLowerCase()}">${offer.status}</span>
                </li>
            </ul>
        </div>
    `

  const modal = new bootstrap.Modal(document.getElementById("previewOfferModal"))
  modal.show()
}

// Ver detalles de postulación
function viewApplicationDetails(index) {
  const application = applications[index]
  const offer = offers.find((o) => o.id === application.offerId) || { title: "Oferta no disponible" }

  const detailsContent = document.getElementById("applicationDetailsContent")

  detailsContent.innerHTML = `
        <div class="candidate-info mb-4">
            <img src="../assets/img/profile-img/profile-picture.png?height=50&width=50" alt="Candidato" class="candidate-img">
            <div>
                <h5 class="mb-1">${application.candidate}</h5>
                <p class="text-muted mb-0">${application.email || "Email no disponible"}</p>
            </div>
        </div>
        
        <div class="mb-3">
            <h6>Postulación para:</h6>
            <p class="mb-1"><strong>${offer.title}</strong></p>
            <p class="text-muted mb-0">ID: ${application.id}</p>
        </div>
        
        <div class="mb-3">
            <h6>Estado actual:</h6>
            <span class="status-badge status-${application.status.toLowerCase()}">${application.status}</span>
        </div>
        
        <div class="mb-3">
            <h6>Mensaje del candidato:</h6>
            <p>${application.message || "No hay mensaje del candidato."}</p>
        </div>
        
        <div class="mb-3">
            <h6>Historial de la postulación:</h6>
            <div class="application-timeline">
                <div class="timeline-item active">
                    <div class="timeline-date">${application.date}</div>
                    <div class="timeline-title">Postulación recibida</div>
                    <div class="timeline-content">El candidato ha aplicado a la oferta.</div>
                </div>
                ${
                  application.status !== "Pendiente"
                    ? `
                <div class="timeline-item active">
                    <div class="timeline-date">${application.updatedAt ? formatDate(application.updatedAt) : application.date}</div>
                    <div class="timeline-title">Estado actualizado</div>
                    <div class="timeline-content">La postulación ha sido ${application.status.toLowerCase()}.</div>
                </div>`
                    : ""
                }
            </div>
        </div>
    `

  // Configurar botones según el estado actual
  const acceptBtn = document.getElementById("acceptApplicationBtn")
  const rejectBtn = document.getElementById("rejectApplicationBtn")

  if (application.status === "Pendiente") {
    acceptBtn.style.display = "block"
    rejectBtn.style.display = "block"
  } else {
    acceptBtn.style.display = "none"
    rejectBtn.style.display = "none"
  }

  // Guardar el índice de la aplicación actual para usarlo en los botones de acción
  acceptBtn.dataset.index = index
  rejectBtn.dataset.index = index

  // Configurar event listeners para los botones
  acceptBtn.onclick = () => updateApplicationStatus("Aceptada")
  rejectBtn.onclick = () => updateApplicationStatus("Rechazada")

  const modal = new bootstrap.Modal(document.getElementById("applicationDetailsModal"))
  modal.show()
}

// Actualizar estado de postulación
function updateApplicationStatus(status) {
  const acceptBtn = document.getElementById("acceptApplicationBtn")
  const index = Number.parseInt(acceptBtn.dataset.index)

  if (isNaN(index) || index < 0 || index >= applications.length) {
    return
  }

  applications[index].status = status
  applications[index].updatedAt = new Date().toISOString()

  // Guardar en localStorage
  saveToLocalStorage()

  // Actualizar la vista
  updateApplicationsTable()

  // Cerrar el modal
  const modal = bootstrap.Modal.getInstance(document.getElementById("applicationDetailsModal"))
  modal.hide()

  createToast(`Postulación ${status.toLowerCase()} correctamente`, "success")
}

// Crear toast
function createToast(message, type = "success") {
  const toastContainer = document.getElementById("toastContainer")

  // Crear un ID único para el toast
  const toastId = "toast_" + Date.now()

  // Determinar el color según el tipo
  let bgColor
  switch (type) {
    case "success":
      bgColor = "bg-success"
      break
    case "warning":
      bgColor = "bg-warning"
      break
    case "error":
      bgColor = "bg-danger"
      break
    default:
      bgColor = "bg-primary"
  }

  // Crear el HTML del toast
  const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${bgColor} text-white">
                <strong class="me-auto">WorkHub</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `

  // Añadir el toast al contenedor
  toastContainer.insertAdjacentHTML("beforeend", toastHTML)

  // Inicializar y mostrar el toast
  const toastElement = document.getElementById(toastId)
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 3000,
  })

  toast.show()

  // Eliminar el toast del DOM cuando se oculte
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove()
  })
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}