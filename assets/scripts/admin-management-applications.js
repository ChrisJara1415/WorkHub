let applications = []
let filteredApplications = []
let editIndex = null
let deleteIndex = null
let confirmDeleteModal = null
let isMobile = window.innerWidth < 768
const STORAGE_KEY = "admin_applications"
const JOBS_STORAGE_KEY = "admin_offers" // Para obtener las ofertas disponibles
const bootstrap = window.bootstrap // Declare the bootstrap variable

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el modal de confirmación
    confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"))

    // Configurar el botón de confirmación
    document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
        if (deleteIndex !== null) {
            applications.splice(deleteIndex, 1)
            saveToLocalStorage()
            filteredApplications = [...applications]
            updateView()
            confirmDeleteModal.hide()
            createToast("Postulación eliminada correctamente", "success")
        }
    })

    // Configurar el botón de guardar postulación
    document.getElementById("saveApplicationBtn").addEventListener("click", saveApplication)

    // Cargar datos desde localStorage
    loadFromLocalStorage()

    // Cargar ofertas disponibles para el select
    loadAvailableJobs()

    // Detectar cambios en el tamaño de la ventana
    window.addEventListener("resize", () => {
        isMobile = window.innerWidth < 768
        updateView()
    })

    // Posicionar el contenedor de toasts según el dispositivo
    updateToastContainerPosition()
})

function updateToastContainerPosition() {
    const toastContainer = document.getElementById("toastContainer")
    if (window.innerWidth < 768) {
        toastContainer.classList.remove("bottom-0", "end-0")
        toastContainer.classList.add("top-0", "start-50", "translate-middle-x")
    } else {
        toastContainer.classList.remove("top-0", "start-50", "translate-middle-x")
        toastContainer.classList.add("bottom-0", "end-0")
    }
}

// Funciones para localStorage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
}

function loadFromLocalStorage() {
    const storedApplications = localStorage.getItem(STORAGE_KEY)
    if (storedApplications) {
        applications = JSON.parse(storedApplications)
        filteredApplications = [...applications]
        updateView()
    } else {
        // Inicializar con array vacío
        applications = []
        filteredApplications = []
        updateView()
    }
}

function loadAvailableJobs() {
    // Cargar ofertas desde localStorage
    const storedJobs = localStorage.getItem(JOBS_STORAGE_KEY)
    let jobs = []

    if (storedJobs) {
        jobs = JSON.parse(storedJobs)
    } else {
        // Inicializar con array vacío
        jobs = []
    }

    // Llenar el select de ofertas en el modal
    const jobSelect = document.getElementById("applicationJob")
    jobSelect.innerHTML = '<option value="">Seleccionar oferta</option>'

    jobs.forEach((job) => {
        jobSelect.innerHTML += `<option value="${job.id}" data-employer="${job.employer}">${job.title}</option>`
    })

    // Llenar el select de ofertas en el filtro
    const filterJobSelect = document.getElementById("filterOferta")
    filterJobSelect.innerHTML = '<option value="">Todas</option>'

    jobs.forEach((job) => {
        filterJobSelect.innerHTML += `<option value="${job.id}">${job.title}</option>`
    })

    // Evento para autocompletar el empleador al seleccionar una oferta
    jobSelect.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex]
        if (selectedOption.value) {
            const employer = selectedOption.getAttribute("data-employer")
            document.getElementById("applicationCompany").value = employer || ""
        }
    })
}

function getTodayDate() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")
    return `${dd}/${mm}/${yyyy}`
}

function openApplicationModal(index = null) {
    // Resetear el formulario y quitar clases de validación
    const form = document.getElementById("applicationForm")
    form.reset()
    form.classList.remove("was-validated")

    // Quitar clases de validación de los campos
    document.getElementById("applicationJob").classList.remove("is-invalid")
    document.getElementById("applicationCandidate").classList.remove("is-invalid")
    document.getElementById("applicationCompany").classList.remove("is-invalid")

    editIndex = index
    if (index !== null) {
        const application = applications[index]
        document.getElementById("applicationJob").value = application.jobId || ""
        document.getElementById("applicationCandidate").value = application.candidate || ""
        document.getElementById("applicationCompany").value = application.company || ""
        document.getElementById("applicationStatus").value = application.status
        document.getElementById("applicationNotes").value = application.notes || ""
        document.getElementById("applicationModalLabel").innerText = "Editar Postulación"
    } else {
        document.getElementById("applicationModalLabel").innerText = "Registrar Postulación"
        // Valores por defecto para una nueva postulación
        document.getElementById("applicationStatus").value = "Pendiente"
    }
    new bootstrap.Modal(document.getElementById("applicationModal")).show()
}

function validateForm() {
    const jobSelect = document.getElementById("applicationJob")
    const candidateInput = document.getElementById("applicationCandidate")
    const companyInput = document.getElementById("applicationCompany")

    let isValid = true
    const errors = []

    // Validar oferta
    if (!jobSelect.value) {
        jobSelect.classList.add("is-invalid")
        errors.push("Debe seleccionar una oferta")
        isValid = false
    } else {
        jobSelect.classList.remove("is-invalid")
    }

    // Validar candidato
    if (!candidateInput.value.trim()) {
        candidateInput.classList.add("is-invalid")
        errors.push("El candidato no puede estar vacío")
        isValid = false
    } else {
        candidateInput.classList.remove("is-invalid")
    }

    // Validar empleador
    if (!companyInput.value.trim()) {
        companyInput.classList.add("is-invalid")
        errors.push("El empleador no puede estar vacía")
        isValid = false
    } else {
        companyInput.classList.remove("is-invalid")
    }

    // En móvil, mostrar solo un toast con todos los errores
    if (errors.length > 0) {
        if (isMobile) {
            createToast(errors.join("<br>"), "error")
        } else {
            // En escritorio, mostrar múltiples toasts
            errors.forEach((error) => {
                createToast(error, "error")
            })
        }
    }

    return isValid
}

function saveApplication() {
    // Validar el formulario
    if (!validateForm()) {
        return
    }

    const jobSelect = document.getElementById("applicationJob")
    const jobId = jobSelect.value
    const job = jobSelect.options[jobSelect.selectedIndex].text
    const candidate = document.getElementById("applicationCandidate").value
    const company = document.getElementById("applicationCompany").value
    const status = document.getElementById("applicationStatus").value
    const notes = document.getElementById("applicationNotes").value
    const date = getTodayDate()

    if (editIndex !== null) {
        applications[editIndex] = {
            ...applications[editIndex],
            jobId,
            job,
            candidate,
            company,
            status,
            notes,
        }
        createToast("Postulación actualizada correctamente", "success")
    } else {
        // Generar un ID único para la postulación
        const maxId =
            applications.length > 0 ? Math.max(...applications.map((app) => Number.parseInt(app.id.replace("APP-", "")))) : 0
        const id = `${maxId + 1}`

        applications.push({
            id,
            jobId,
            job,
            candidate,
            company,
            status,
            notes,
            date,
        })
        createToast("Postulación creada correctamente", "success")
    }

    // Guardar en localStorage
    saveToLocalStorage()

    // Actualizar la vista
    filteredApplications = [...applications]
    updateView()

    // Cerrar el modal
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById("applicationModal"))
    if (modalInstance) {
        modalInstance.hide()
    }
}

function confirmDelete(index) {
    deleteIndex = index
    confirmDeleteModal.show()
}

function updateView() {
    // Actualizar la vista según el dispositivo
    if (isMobile) {
        updateCardView()
    } else {
        updateTableView()
    }
}

function updateTableView() {
    const tbody = document.getElementById("applicationTableBody")
    tbody.innerHTML = ""

    if (filteredApplications.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">No hay postulaciones para mostrar</td>
            </tr>`
        return
    }

    filteredApplications.forEach((application, i) => {
        const applicationIndex = applications.findIndex((a) => a.id === application.id)
        tbody.innerHTML += `
            <tr>
                <td><input type="checkbox"></td>
                <td>${application.id}</td>
                <td>${application.job || ""}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="" alt="Perfil" class="candidate-img">
                        <span>${application.candidate || ""}</span>
                    </div>
                </td>
                <td>${application.company || ""}</td>
                <td><span class="status-badge status-${application.status.toLowerCase()}">${application.status}</span></td>
                <td>${application.date}</td>
                <td>
                    <div class="dropdown action-dropdown">
                        <button class="btn btn-light border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">⋮</button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="viewApplicationDetails(${applicationIndex})"><i class="bi bi-eye me-2"></i> Ver detalles</a></li>
                            <li><a class="dropdown-item" href="#" onclick="openApplicationModal(${applicationIndex})"><i class="bi bi-pencil me-2"></i> Editar</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="confirmDelete(${applicationIndex})"><i class="bi bi-trash me-2"></i> Eliminar</a></li>
                        </ul>
                    </div>
                </td>
            </tr>`
    })
}

function updateCardView() {
    const cardContainer = document.getElementById("applicationCardContainer")
    cardContainer.innerHTML = ""

    if (filteredApplications.length === 0) {
        cardContainer.innerHTML = `
            <div class="alert alert-info text-center">
                No hay postulaciones para mostrar
            </div>`
        return
    }

    filteredApplications.forEach((application, i) => {
        const applicationIndex = applications.findIndex((a) => a.id === application.id)
        cardContainer.innerHTML += `
            <div class="application-card">
                <div class="application-card-header">
                    <h6 class="mb-0">${application.job || "Sin título"}</h6>
                    <span class="status-badge status-${application.status.toLowerCase()}">${application.status}</span>
                </div>
                <div class="application-card-body">
                    <div class="application-card-item">
                        <span class="application-card-label">ID:</span>
                        <span>${application.id}</span>
                    </div>
                    <div class="application-card-item">
                        <span class="application-card-label">Candidato:</span>
                        <span>${application.candidate || ""}</span>
                    </div>
                    <div class="application-card-item">
                        <span class="application-card-label">Empleador:</span>
                        <span>${application.company || ""}</span>
                    </div>
                    <div class="application-card-item">
                        <span class="application-card-label">Fecha:</span>
                        <span>${application.date}</span>
                    </div>
                </div>
                <div class="application-card-footer">
                    <button class="btn btn-sm btn-outline-primary" onclick="openApplicationModal(${applicationIndex})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <div>
                        <button class="btn btn-sm btn-outline-secondary me-1" onclick="viewApplicationDetails(${applicationIndex})">
                            <i class="bi bi-eye"></i> Detalles
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${applicationIndex})">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>`
    })
}

function viewApplicationDetails(index) {
    const application = applications[index]
    const detailsContent = document.getElementById("applicationDetailsContent")

    // Generar el contenido del modal de detalles
    detailsContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="detail-item">
                    <span class="detail-label">ID de Postulación</span>
                    <span class="detail-value">${application.id}</span>
                </div>
            </div>
            <div class="col-md-6">
                <div class="detail-item">
                    <span class="detail-label">Fecha</span>
                    <span class="detail-value">${application.date}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-item">
            <span class="detail-label">Oferta</span>
            <span class="detail-value">${application.job}</span>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="detail-item">
                    <span class="detail-label">Candidato</span>
                    <div class="d-flex align-items-center">
                        <img src="/placeholder.svg?height=48&width=48" alt="Perfil" class="candidate-img" style="width: 48px; height: 48px;">
                        <span>${application.candidate}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="detail-item">
                    <span class="detail-label">Empleador</span>
                    <span class="detail-value">${application.company}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-item">
            <span class="detail-label">Estado</span>
            <span class="status-badge status-${application.status.toLowerCase()}">${application.status}</span>
        </div>
        
        <div class="detail-item">
            <span class="detail-label">Notas</span>
            <div class="detail-notes">${application.notes || "Sin notas adicionales."}</div>
        </div>
        
        <div class="detail-item">
            <span class="detail-label">Historial</span>
            <div class="timeline">
                <div class="timeline-item active">
                    <div class="timeline-date">${application.date}</div>
                    <div class="timeline-title">Postulación recibida</div>
                    <div class="timeline-content">Se ha registrado la postulación en el sistema.</div>
                </div>
                ${application.status !== "Pendiente"
            ? `
                <div class="timeline-item ${application.status === "Aceptada" || application.status === "Rechazada" || application.status === "Finalizada" ? "active" : ""}">
                    <div class="timeline-date">${application.date}</div>
                    <div class="timeline-title">Revisión inicial</div>
                    <div class="timeline-content">Se ha revisado la postulación y se ha programado una entrevista.</div>
                </div>`
            : ""
        }
                ${application.status === "Aceptada" ||
            application.status === "Rechazada" ||
            application.status === "Finalizada"
            ? `
                <div class="timeline-item active">
                    <div class="timeline-date">${application.date}</div>
                    <div class="timeline-title">Entrevista realizada</div>
                    <div class="timeline-content">Se ha completado la entrevista con el candidato.</div>
                </div>`
            : ""
        }
                ${application.status === "Aceptada" || application.status === "Finalizada"
            ? `
                <div class="timeline-item active">
                    <div class="timeline-date">${application.date}</div>
                    <div class="timeline-title">Candidato aceptado</div>
                    <div class="timeline-content">Se ha aceptado al candidato para el puesto.</div>
                </div>`
            : ""
        }
                ${application.status === "Rechazada"
            ? `
                <div class="timeline-item active">
                    <div class="timeline-date">${application.date}</div>
                    <div class="timeline-title">Candidato rechazado</div>
                    <div class="timeline-content">Se ha rechazado al candidato para el puesto.</div>
                </div>`
            : ""
        }
                ${application.status === "Finalizada"
            ? `
                <div class="timeline-item active">
                    <div class="timeline-date">${application.date}</div>
                    <div class="timeline-title">Proceso finalizado</div>
                    <div class="timeline-content">El proceso de contratación ha sido completado.</div>
                </div>`
            : ""
        }
            </div>
        </div>
    `

    // Mostrar el modal
    new bootstrap.Modal(document.getElementById("applicationDetailsModal")).show()
}

// Búsqueda
function searchApplications(term) {
    if (!term.trim()) {
        filteredApplications = [...applications]
    } else {
        term = term.toLowerCase()
        filteredApplications = applications.filter(
            (application) =>
                application.id.toString().toLowerCase().includes(term) ||
                (application.job && application.job.toLowerCase().includes(term)) ||
                (application.candidate && application.candidate.toLowerCase().includes(term)) ||
                (application.company && application.company.toLowerCase().includes(term)),
        )
    }
    updateView()
}

// Funciones para el panel de filtros
function toggleFilterPanel() {
    const filterPanel = document.getElementById("filterPanel")
    filterPanel.classList.toggle("d-none")
}

function resetFilters() {
    document.getElementById("filterEstado").value = ""
    document.getElementById("filterOferta").value = ""
    document.getElementById("filterDateFrom").value = ""
    document.getElementById("filterDateTo").value = ""
}

function applyFilters() {
    const estado = document.getElementById("filterEstado").value
    const oferta = document.getElementById("filterOferta").value
    const dateFrom = document.getElementById("filterDateFrom").value
    const dateTo = document.getElementById("filterDateTo").value

    // Convertir fechas a formato comparable
    const fromDate = dateFrom ? new Date(dateFrom) : null
    const toDate = dateTo ? new Date(dateTo) : null

    filteredApplications = applications.filter((application) => {
        // Filtrar por estado
        if (estado && application.status !== estado) return false

        // Filtrar por oferta
        if (oferta && application.jobId !== oferta) return false

        // Filtrar por fecha
        if (fromDate || toDate) {
            const parts = application.date.split("/")
            const applicationDate = new Date(parts[2], parts[1] - 1, parts[0])

            if (fromDate && applicationDate < fromDate) return false
            if (toDate && applicationDate > toDate) return false
        }

        return true
    })

    updateView()
    toggleFilterPanel() // Ocultar el panel después de aplicar filtros
}

function toggleAll(source) {
    const checkboxes = document.querySelectorAll('#applicationTableBody input[type="checkbox"]')
    checkboxes.forEach((cb) => (cb.checked = source.checked))
}

// Sistema de toasts
function createToast(message, type = "error") {
    // Limitar el número de toasts en móvil
    const toastContainer = document.getElementById("toastContainer")
    if (isMobile && toastContainer.children.length >= 2) {
        // Eliminar el toast más antiguo
        toastContainer.removeChild(toastContainer.children[0])
    }

    // Crear un ID único para el toast
    const toastId = "toast_" + Date.now()

    // Determinar el color y título según el tipo
    let bgColor, title
    switch (type) {
        case "success":
            bgColor = "bg-success"
            title = "Éxito"
            break
        case "warning":
            bgColor = "bg-warning"
            title = "Advertencia"
            break
        case "info":
            bgColor = "bg-info"
            title = "Información"
            break
        default: // error
            bgColor = "bg-danger"
            title = "Error de Validación"
    }

    // Crear el HTML del toast
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${bgColor} text-white">
                <strong class="me-auto">${title}</strong>
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
        delay: isMobile ? 3000 : 5000, // Menos tiempo en móvil
    })

    toast.show()

    // Eliminar el toast del DOM cuando se oculte
    toastElement.addEventListener("hidden.bs.toast", () => {
        toastElement.remove()
    })

    return toast
}