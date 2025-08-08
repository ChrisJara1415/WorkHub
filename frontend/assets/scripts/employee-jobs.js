// Variables globales
let allJobs = []
let filteredJobs = []
let currentPage = 1
const jobsPerPage = 6
let currentViewMode = "grid"
let currentCategory = "Todas"
let currentSort = "newest"
let currentJobId = null
const OFFERS_STORAGE_KEY = "employer_offers"
const APPLICATIONS_STORAGE_KEY = "employer_applications"
const bootstrap = window.bootstrap

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Cargar ofertas desde localStorage
  loadJobs()

  // Configurar botones
  document.getElementById("submitApplicationBtn").addEventListener("click", submitApplication)
  document.getElementById("applyJobBtn").addEventListener("click", openApplyModal)

  // Establecer modo de vista inicial
  setViewMode("grid")
})

// Cargar ofertas desde localStorage
function loadJobs() {
  const storedOffers = localStorage.getItem(OFFERS_STORAGE_KEY)

  if (storedOffers) {
    // Filtrar solo ofertas activas
    allJobs = JSON.parse(storedOffers).filter((offer) => offer.status === "Activa")
  } else {
    allJobs = []
  }

  // Aplicar filtros iniciales
  applyFilters()
}

// Aplicar filtros y ordenamiento
function applyFilters() {
  // Filtrar por categoría
  if (currentCategory === "Todas") {
    filteredJobs = [...allJobs]
  } else {
    filteredJobs = allJobs.filter((job) => job.category === currentCategory)
  }

  // Aplicar ordenamiento
  sortJobsList(currentSort)

  // Actualizar vista
  updateJobsView()
}

// Ordenar lista de trabajos
function sortJobsList(sortType) {
  currentSort = sortType

  switch (sortType) {
    case "newest":
      filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case "oldest":
      filteredJobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
  }
}

// Actualizar vista de trabajos
function updateJobsView() {
  const container = document.getElementById("jobsContainer")
  const noResultsMessage = document.getElementById("noResultsMessage")

  // Calcular paginación
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const endIndex = Math.min(startIndex + jobsPerPage, filteredJobs.length)
  const currentJobs = filteredJobs.slice(startIndex, endIndex)

  // Mostrar mensaje de no resultados si no hay trabajos
  if (filteredJobs.length === 0) {
    container.innerHTML = ""
    noResultsMessage.classList.remove("d-none")
  } else {
    noResultsMessage.classList.add("d-none")

    // Generar HTML según el modo de vista
    if (currentViewMode === "grid") {
      container.innerHTML = ""
      currentJobs.forEach((job) => {
        container.innerHTML += createJobCardHTML(job)
      })
    } else {
      container.innerHTML = ""
      currentJobs.forEach((job) => {
        container.innerHTML += createJobListItemHTML(job)
      })
    }
  }

  // Actualizar paginación
  updatePagination(totalPages)
}

// Crear HTML para tarjeta de trabajo (vista de cuadrícula)
function createJobCardHTML(job) {
  // Determinar imagen según categoría
  const categoryImage = getCategoryImage(job.category)

  return `
        <div class="col-md-6 col-lg-4">
            <div class="job-card">
                <div class="job-card-header">
                    <img src="${categoryImage}" alt="${job.category}">
                    <div class="job-card-category">${job.category}</div>
                </div>
                <div class="job-card-body">
                    <h3 class="job-card-title">${job.title}</h3>
                    <div class="job-card-company">
                        <img src="../assets/img/profile-img/profile-picture.png?height=32&width=32" alt="Logo empleador">
                        <span>${job.employer || "Empleador"}</span>
                    </div>
                    <div class="job-card-details">
                        <div class="job-card-detail">
                            <i class="bi bi-geo-alt"></i> ${job.location}
                        </div>
                        ${
                          job.salary
                            ? `
                        <div class="job-card-detail">
                            <i class="bi bi-cash"></i> $${job.salary}
                        </div>`
                            : ""
                        }
                        <div class="job-card-detail">
                            <i class="bi bi-calendar"></i> Hasta: ${formatDate(job.deadline)}
                        </div>
                    </div>
                    <p class="job-card-description">${truncateText(job.description, 100)}</p>
                </div>
                <div class="job-card-footer">
                    <span class="job-card-date">Publicado: ${job.date}</span>
                    <button class="btn btn-sm btn-warning text-white" onclick="viewJobDetails('${job.id}')">Ver detalles</button>
                </div>
            </div>
        </div>
    `
}

// Crear HTML para elemento de lista de trabajo (vista de lista)
function createJobListItemHTML(job) {
  return `
        <div class="col-12">
            <div class="job-list-item">
                <div class="job-list-header">
                    <div>
                        <h3 class="job-list-title">${job.title}</h3>
                        <div class="job-list-company">
                            <img src="../assets/img/profile-img/profile-picture.png?height=32&width=32" alt="Logo empleador">
                            <span>${job.employer || "Empleador"}</span>
                        </div>
                    </div>
                    <div class="job-list-category">${job.category}</div>
                </div>
                <div class="job-list-details">
                    <div class="job-list-detail">
                        <i class="bi bi-geo-alt"></i> ${job.location}
                    </div>
                    ${
                      job.salary
                        ? `
                    <div class="job-list-detail">
                        <i class="bi bi-cash"></i> $${job.salary}
                    </div>`
                        : ""
                    }
                    <div class="job-list-detail">
                        <i class="bi bi-calendar"></i> Hasta: ${formatDate(job.deadline)}
                    </div>
                </div>
                <p>${truncateText(job.description, 150)}</p>
                <div class="job-list-footer">
                    <span class="job-list-date">Publicado: ${job.date}</span>
                    <button class="btn btn-warning text-white" onclick="viewJobDetails('${job.id}')">Ver detalles</button>
                </div>
            </div>
        </div>
    `
}

// Actualizar paginación
function updatePagination(totalPages) {
  const pagination = document.getElementById("pagination")

  if (totalPages <= 1) {
    pagination.innerHTML = ""
    return
  }

  let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
            <li class="page-item ${currentPage === i ? "active" : ""}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `
  }

  paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `

  pagination.innerHTML = paginationHTML
}

// Cambiar página
function changePage(page) {
  currentPage = page
  updateJobsView()
  // Scroll al inicio de la sección
  document.querySelector(".search-banner").scrollIntoView({ behavior: "smooth" })
}

// Establecer modo de vista (cuadrícula o lista)
function setViewMode(mode) {
  currentViewMode = mode

  // Actualizar botones
  const gridBtn = document.getElementById("gridViewBtn")
  const listBtn = document.getElementById("listViewBtn")

  if (mode === "grid") {
    gridBtn.classList.add("active")
    listBtn.classList.remove("active")
  } else {
    gridBtn.classList.remove("active")
    listBtn.classList.add("active")
  }

  // Actualizar vista
  updateJobsView()
}

// Filtrar por categoría
function filterByCategory(category) {
  currentCategory = category
  currentPage = 1
  applyFilters()
}

// Buscar trabajos
function searchJobs() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim()

  if (searchTerm === "") {
    // Si la búsqueda está vacía, mostrar todos según la categoría actual
    applyFilters()
    return
  }

  // Filtrar por término de búsqueda
  filteredJobs = allJobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(searchTerm) ||
      job.category.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm)
    )
  })

  // Si hay una categoría seleccionada, aplicar ese filtro también
  if (currentCategory !== "Todas") {
    filteredJobs = filteredJobs.filter((job) => job.category === currentCategory)
  }

  // Aplicar ordenamiento
  sortJobsList(currentSort)

  // Resetear a la primera página
  currentPage = 1

  // Actualizar vista
  updateJobsView()
}

// Ordenar trabajos
function sortJobs(sortType) {
  sortJobsList(sortType)
  updateJobsView()
}

// Ver detalles de trabajo
function viewJobDetails(jobId) {
  const job = allJobs.find((j) => j.id === jobId)

  if (!job) return

  currentJobId = jobId

  // Incrementar contador de vistas
  incrementJobViews(jobId)

  const detailsContent = document.getElementById("jobDetailsContent")

  // Determinar imagen según categoría
  const categoryImage = getCategoryImage(job.category)

  detailsContent.innerHTML = `
        <div class="job-details-header">
            <h3 class="mb-2">${job.title}</h3>
            <div class="job-details-company">
                <img src="../assets/img/profile-img/profile-picture.png?height=48&width=48" alt="Logo empleador">
                <div>
                    <p class="mb-0 fw-bold">${job.employer || "Empleador"}</p>
                    <small class="text-muted">Publicado el ${job.date}</small>
                </div>
            </div>
            <div class="job-details-badges">
                <span class="badge bg-primary">${job.category}</span>
                <span class="badge bg-secondary"><i class="bi bi-geo-alt me-1"></i>${job.location}</span>
                ${job.salary ? `<span class="badge bg-success"><i class="bi bi-cash me-1"></i>$${job.salary}</span>` : ""}
                <span class="badge bg-info"><i class="bi bi-calendar me-1"></i>Hasta: ${formatDate(job.deadline)}</span>
            </div>
        </div>
        
        <div class="job-details-section">
            <h5>Descripción</h5>
            <p>${job.description}</p>
        </div>
        
        <div class="job-details-section">
            <h5>Requisitos</h5>
            <p>${job.requirements}</p>
        </div>
        
        <div class="job-details-section">
            <h5>Detalles adicionales</h5>
            <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between">
                    <span>Ubicación:</span>
                    <span class="fw-bold">${job.location}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span>Categoría:</span>
                    <span class="fw-bold">${job.category}</span>
                </li>
                ${
                  job.salary
                    ? `
                <li class="list-group-item d-flex justify-content-between">
                    <span>Salario:</span>
                    <span class="fw-bold">$${job.salary}</span>
                </li>`
                    : ""
                }
                <li class="list-group-item d-flex justify-content-between">
                    <span>Fecha límite:</span>
                    <span class="fw-bold">${formatDate(job.deadline)}</span>
                </li>
            </ul>
        </div>
    `

  const modal = new bootstrap.Modal(document.getElementById("jobDetailsModal"))
  modal.show()
}

// Incrementar contador de vistas
function incrementJobViews(jobId) {
  const storedOffers = localStorage.getItem(OFFERS_STORAGE_KEY)

  if (storedOffers) {
    const offers = JSON.parse(storedOffers)
    const offerIndex = offers.findIndex((o) => o.id === jobId)

    if (offerIndex !== -1) {
      offers[offerIndex].views = (offers[offerIndex].views || 0) + 1
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers))
    }
  }
}

// Abrir modal de postulación
function openApplyModal() {
  // Cerrar el modal de detalles
  const detailsModal = bootstrap.Modal.getInstance(document.getElementById("jobDetailsModal"))
  detailsModal.hide()

  // Resetear formulario
  const form = document.getElementById("applyForm")
  form.reset()
  form.classList.remove("was-validated")

  // Abrir modal de postulación
  const modal = new bootstrap.Modal(document.getElementById("applyModal"))
  modal.show()
}

// Enviar postulación
function submitApplication() {
  const form = document.getElementById("applyForm")

  // Validar formulario
  if (!form.checkValidity()) {
    form.classList.add("was-validated")
    return
  }

  const name = document.getElementById("applyName").value
  const email = document.getElementById("applyEmail").value
  const phone = document.getElementById("applyPhone").value
  const message = document.getElementById("applyMessage").value

  // Obtener datos de la oferta
  const job = allJobs.find((j) => j.id === currentJobId)

  if (!job) {
    createToast("Error al procesar la postulación", "error")
    return
  }

  // Crear nueva postulación
  const newApplication = {
    id: "APP-" + (Math.floor(Math.random() * 9000) + 1000),
    offerId: job.id,
    candidate: name,
    email: email,
    phone: phone,
    message: message,
    status: "Pendiente",
    date: formatDate(new Date().toISOString().split("T")[0]),
    createdAt: new Date().toISOString(),
  }

  // Guardar en localStorage
  const storedApplications = localStorage.getItem(APPLICATIONS_STORAGE_KEY)
  let applications = []

  if (storedApplications) {
    applications = JSON.parse(storedApplications)
  }

  applications.push(newApplication)
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications))

  // Cerrar el modal
  const modal = bootstrap.Modal.getInstance(document.getElementById("applyModal"))
  modal.hide()

  // Mostrar mensaje de éxito
  createToast("Postulación enviada correctamente", "success")
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

// Funciones auxiliares
function truncateText(text, maxLength) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getCategoryImage(category) {
  // Devolver ruta de imagen según la categoría
  switch (category) {
    case "Jardinería":
      return "../assets/img/oficios/jardineria.svg"
    case "Limpieza":
      return "../assets/img/oficios/limpieza.svg"
    case "Piscinero":
      return "../assets/img/oficios/piscinero.svg"
    case "Carpintería":
      return "../assets/img/oficios/carpinteria.svg"
    case "Mantenimiento":
      return "../assets/img/oficios/arreglos.svg"
    case "Plomería":
      return "../assets/img/oficios/arreglos.svg"
    default:
      return "../assets/img/oficios/cargue-y-descargue.svg"
  }
}

// Abrir modal de registro
function openSignupModal() {
  // Implementar lógica para abrir el modal de registro
  // Esta función dependerá de cómo esté implementado el sistema de autenticación
}
