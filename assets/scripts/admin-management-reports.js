let reports = [];
let filteredReports = [];
let editIndex = null;
let deleteIndex = null;
let confirmDeleteModal = null;
let isMobile = window.innerWidth < 768;
const STORAGE_KEY = 'admin_reports';

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar el modal de confirmación
    confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));

    // Configurar el botón de confirmación
    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        if (deleteIndex !== null) {
            reports.splice(deleteIndex, 1);
            saveToLocalStorage();
            filteredReports = [...reports];
            updateView();
            confirmDeleteModal.hide();
            createToast("Reporte eliminado correctamente", "success");
        }
    });

    // Configurar el botón de guardar reporte
    document.getElementById('saveReportBtn').addEventListener('click', saveReport);

    // Cargar datos desde localStorage
    loadFromLocalStorage();

    // Detectar cambios en el tamaño de la ventana
    window.addEventListener('resize', function () {
        isMobile = window.innerWidth < 768;
        updateToastContainerPosition();
    });

    // Posicionar el contenedor de toasts según el dispositivo
    updateToastContainerPosition();
});

function updateToastContainerPosition() {
    const toastContainer = document.getElementById('toastContainer');
    if (window.innerWidth < 768) {
        toastContainer.classList.remove('bottom-0', 'end-0');
        toastContainer.classList.add('top-0', 'start-50', 'translate-middle-x');
    } else {
        toastContainer.classList.remove('top-0', 'start-50', 'translate-middle-x');
        toastContainer.classList.add('bottom-0', 'end-0');
    }
}

// Funciones para localStorage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function loadFromLocalStorage() {
    const storedReports = localStorage.getItem(STORAGE_KEY);
    if (storedReports) {
        reports = JSON.parse(storedReports);
        filteredReports = [...reports];
        updateView();
    } else {
        // Inicializar con array vacío
        reports = [];
        filteredReports = [];
        updateView();
    }
}

function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
}

function openReportModal(index = null) {
    // Resetear el formulario y quitar clases de validación
    const form = document.getElementById('reportForm');
    form.reset();
    form.classList.remove('was-validated');

    // Quitar clases de validación de los campos
    document.getElementById('reportTitle').classList.remove('is-invalid');
    document.getElementById('reportUser').classList.remove('is-invalid');
    document.getElementById('reportDescription').classList.remove('is-invalid');

    editIndex = index;
    if (index !== null) {
        const report = reports[index];
        document.getElementById('reportTitle').value = report.title || '';
        document.getElementById('reportUser').value = report.user || '';
        document.getElementById('reportType').value = report.type;
        document.getElementById('reportPriority').value = report.priority;
        document.getElementById('reportStatus').value = report.status;
        document.getElementById('reportDescription').value = report.description || '';
        document.getElementById('reportSolution').value = report.solution || '';
        document.getElementById('reportModalLabel').innerText = 'Editar Reporte';
    } else {
        document.getElementById('reportModalLabel').innerText = 'Registrar Reporte';
        // Valores por defecto para un nuevo reporte
        document.getElementById('reportStatus').value = 'Abierto';
        document.getElementById('reportPriority').value = 'Media';
    }
    new bootstrap.Modal(document.getElementById('reportModal')).show();
}

function validateForm() {
    const titleInput = document.getElementById('reportTitle');
    const userInput = document.getElementById('reportUser');
    const descriptionInput = document.getElementById('reportDescription');

    let isValid = true;
    let errors = [];

    // Validar título
    if (!titleInput.value.trim()) {
        titleInput.classList.add('is-invalid');
        errors.push('El título no puede estar vacío');
        isValid = false;
    } else {
        titleInput.classList.remove('is-invalid');
    }

    // Validar usuario
    if (!userInput.value.trim()) {
        userInput.classList.add('is-invalid');
        errors.push('El usuario no puede estar vacío');
        isValid = false;
    } else {
        userInput.classList.remove('is-invalid');
    }

    // Validar descripción
    if (!descriptionInput.value.trim()) {
        descriptionInput.classList.add('is-invalid');
        errors.push('La descripción no puede estar vacía');
        isValid = false;
    } else {
        descriptionInput.classList.remove('is-invalid');
    }

    // En móvil, mostrar solo un toast con todos los errores
    if (errors.length > 0) {
        if (isMobile) {
            createToast(errors.join('<br>'), 'error');
        } else {
            // En escritorio, mostrar múltiples toasts
            errors.forEach(error => {
                createToast(error, 'error');
            });
        }
    }

    return isValid;
}

function saveReport() {
    // Validar el formulario
    if (!validateForm()) {
        return;
    }

    const title = document.getElementById('reportTitle').value;
    const user = document.getElementById('reportUser').value;
    const type = document.getElementById('reportType').value;
    const priority = document.getElementById('reportPriority').value;
    const status = document.getElementById('reportStatus').value;
    const description = document.getElementById('reportDescription').value;
    const solution = document.getElementById('reportSolution').value;
    const fecha = getTodayDate();

    if (editIndex !== null) {
        reports[editIndex] = {
            ...reports[editIndex],
            title,
            user,
            type,
            priority,
            status,
            description,
            solution,
            updatedAt: fecha
        };
        createToast("Reporte actualizado correctamente", "success");
    } else {
        // Generar un ID único basado en el máximo ID existente + 1
        const maxId = reports.length > 0 ? Math.max(...reports.map(report => report.id)) : 0;
        const id = maxId + 1;
        reports.push({
            id,
            title,
            user,
            type,
            priority,
            status,
            description,
            solution,
            createdAt: fecha,
            updatedAt: fecha
        });
        createToast("Reporte creado correctamente", "success");
    }

    // Guardar en localStorage
    saveToLocalStorage();

    // Actualizar la vista
    filteredReports = [...reports];
    updateView();

    // Cerrar el modal
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
    if (modalInstance) {
        modalInstance.hide();
    }
}

function confirmDelete(index) {
    deleteIndex = index;
    confirmDeleteModal.show();
}

function updateView() {
    const container = document.getElementById('reportCardsContainer');
    container.innerHTML = '';

    if (filteredReports.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-clipboard-x"></i>
                    <h5>No hay reportes para mostrar</h5>
                    <p>Los reportes que se creen aparecerán aquí.</p>
                </div>
            </div>`;
        return;
    }

    filteredReports.forEach((report, i) => {
        const reportIndex = reports.findIndex(r => r.id === report.id);

        // Determinar las clases de estado y prioridad
        const statusClass = getStatusClass(report.status);
        const priorityClass = `priority-${report.priority.toLowerCase()}`;

        container.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="report-card ${priorityClass}">
                    <div class="report-card-header">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="report-card-title">${report.title || 'Sin título'}</h5>
                            <span class="status-badge ${statusClass}">${report.status}</span>
                        </div>
                        <div class="report-card-meta">
                            <span class="type-badge">${report.type}</span>
                            <small class="text-muted">${report.createdAt}</small>
                        </div>
                    </div>
                    <div class="report-card-body">
                        <p class="report-card-description">${report.description || 'Sin descripción'}</p>
                        <div class="report-card-info">
                            <div class="report-card-info-item">
                                <i class="bi bi-person"></i>
                                <span>${report.user || 'Anónimo'}</span>
                            </div>
                            <div class="report-card-info-item">
                                <i class="bi bi-flag"></i>
                                <span>Prioridad: ${report.priority}</span>
                            </div>
                            ${report.solution ? `
                            <div class="report-card-info-item">
                                <i class="bi bi-check-circle"></i>
                                <span>Tiene solución</span>
                            </div>` : ''}
                        </div>
                    </div>
                    <div class="report-card-footer">
                        <button class="btn btn-sm btn-outline-primary" onclick="openReportModal(${reportIndex})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <div class="report-card-actions">
                            <button class="btn btn-sm btn-outline-secondary" onclick="viewReportDetails(${reportIndex})">
                                <i class="bi bi-eye"></i> Detalles
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${reportIndex})">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
}

function getStatusClass(status) {
    switch (status) {
        case 'Abierto':
            return 'status-abierto';
        case 'En proceso':
            return 'status-proceso';
        case 'Resuelto':
            return 'status-resuelto';
        case 'Cerrado':
            return 'status-cerrado';
        default:
            return '';
    }
}

function viewReportDetails(index) {
    // Aquí puedes implementar la lógica para ver los detalles completos
    // Por ejemplo, abrir un modal con todos los detalles del reporte
    const report = reports[index];

    // Por ahora, solo mostraremos un toast con información básica
    createToast(`
        <strong>${report.title}</strong><br>
        Usuario: ${report.user}<br>
        Estado: ${report.status}<br>
        ${report.solution ? `Solución: ${report.solution}` : 'Sin solución registrada'}
    `, 'info');
}

// Búsqueda en tiempo real
function searchReports(term) {
    if (!term.trim()) {
        filteredReports = [...reports];
    } else {
        term = term.toLowerCase();
        filteredReports = reports.filter(report =>
            (report.id.toString().includes(term)) ||
            (report.title && report.title.toLowerCase().includes(term)) ||
            (report.user && report.user.toLowerCase().includes(term)) ||
            (report.description && report.description.toLowerCase().includes(term)) ||
            (report.type && report.type.toLowerCase().includes(term))
        );
    }
    updateView();
}

// Funciones para el panel de filtros
function toggleFilterPanel() {
    const filterPanel = document.getElementById('filterPanel');
    filterPanel.classList.toggle('d-none');
}

function resetFilters() {
    document.getElementById('filterTipo').value = '';
    document.getElementById('filterPrioridad').value = '';
    document.getElementById('filterEstado').value = '';
    document.getElementById('filterDate').value = '';
}

function applyFilters() {
    const tipo = document.getElementById('filterTipo').value;
    const prioridad = document.getElementById('filterPrioridad').value;
    const estado = document.getElementById('filterEstado').value;
    const date = document.getElementById('filterDate').value;

    filteredReports = reports.filter(report => {
        // Filtrar por tipo
        if (tipo && report.type !== tipo) return false;

        // Filtrar por prioridad
        if (prioridad && report.priority !== prioridad) return false;

        // Filtrar por estado
        if (estado && report.status !== estado) return false;

        // Filtrar por fecha
        if (date) {
            const parts = report.createdAt.split('/');
            const reportDate = new Date(parts[2], parts[1] - 1, parts[0]);
            const filterDate = new Date(date);

            // Comparar solo año, mes y día
            if (reportDate.getFullYear() !== filterDate.getFullYear() ||
                reportDate.getMonth() !== filterDate.getMonth() ||
                reportDate.getDate() !== filterDate.getDate()) {
                return false;
            }
        }

        return true;
    });

    updateView();
    toggleFilterPanel(); // Ocultar el panel después de aplicar filtros
}

// Sistema de toasts
function createToast(message, type = 'error') {
    // Limitar el número de toasts en móvil
    const toastContainer = document.getElementById('toastContainer');
    if (isMobile && toastContainer.children.length >= 2) {
        // Eliminar el toast más antiguo
        toastContainer.removeChild(toastContainer.children[0]);
    }

    // Crear un ID único para el toast
    const toastId = 'toast_' + Date.now();

    // Determinar el color y título según el tipo
    let bgColor, title;
    switch (type) {
        case 'success':
            bgColor = 'bg-success';
            title = 'Éxito';
            break;
        case 'warning':
            bgColor = 'bg-warning';
            title = 'Advertencia';
            break;
        case 'info':
            bgColor = 'bg-info';
            title = 'Información';
            break;
        default: // error
            bgColor = 'bg-danger';
            title = 'Error de Validación';
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
    `;

    // Añadir el toast al contenedor
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    // Inicializar y mostrar el toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: isMobile ? 3000 : 5000 // Menos tiempo en móvil
    });

    toast.show();

    // Eliminar el toast del DOM cuando se oculte
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });

    return toast;
}