let offers = [];
let filteredOffers = [];
let editIndex = null;
let deleteIndex = null;
let confirmDeleteModal = null;
let isMobile = window.innerWidth < 768;
const STORAGE_KEY = 'admin_offers';

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el modal de confirmación
    confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    
    // Configurar el botón de confirmación
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        if (deleteIndex !== null) {
            offers.splice(deleteIndex, 1);
            saveToLocalStorage();
            filteredOffers = [...offers];
            updateView();
            confirmDeleteModal.hide();
            createToast("Oferta eliminada correctamente", "success");
        }
    });
    
    // Configurar el botón de guardar oferta
    document.getElementById('saveOfferBtn').addEventListener('click', saveOffer);
    
    // Cargar datos desde localStorage
    loadFromLocalStorage();
    
    // Detectar cambios en el tamaño de la ventana
    window.addEventListener('resize', function() {
        isMobile = window.innerWidth < 768;
        updateView();
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
}

function loadFromLocalStorage() {
    const storedOffers = localStorage.getItem(STORAGE_KEY);
    if (storedOffers) {
        offers = JSON.parse(storedOffers);
        filteredOffers = [...offers];
        updateView();
    } else {
        // Inicializar con array vacío
        offers = [];
        filteredOffers = [];
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

function openRegisterModal(index = null) {
    // Resetear el formulario y quitar clases de validación
    const form = document.getElementById('offerForm');
    form.reset();
    form.classList.remove('was-validated');
    
    // Quitar clases de validación de los campos
    document.getElementById('offerTitle').classList.remove('is-invalid');
    document.getElementById('offerEmployer').classList.remove('is-invalid');
    document.getElementById('offerDescription').classList.remove('is-invalid');
    
    editIndex = index;
    if (index !== null) {
        const offer = offers[index];
        document.getElementById('offerTitle').value = offer.title || '';
        document.getElementById('offerEmployer').value = offer.employer || '';
        document.getElementById('offerCategory').value = offer.category;
        document.getElementById('offerStatus').value = offer.status;
        document.getElementById('offerDescription').value = offer.description || '';
        document.getElementById('offerModalLabel').innerText = 'Editar Oferta';
    } else {
        document.getElementById('offerModalLabel').innerText = 'Registrar Oferta';
    }
    new bootstrap.Modal(document.getElementById('offerModal')).show();
}

function validateForm() {
    const titleInput = document.getElementById('offerTitle');
    const employerInput = document.getElementById('offerEmployer');
    const descriptionInput = document.getElementById('offerDescription');
    
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
    
    // Validar empleador
    if (!employerInput.value.trim()) {
        employerInput.classList.add('is-invalid');
        errors.push('El empleador no puede estar vacío');
        isValid = false;
    } else {
        employerInput.classList.remove('is-invalid');
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

function saveOffer() {
    // Validar el formulario
    if (!validateForm()) {
        return;
    }
    
    const title = document.getElementById('offerTitle').value;
    const employer = document.getElementById('offerEmployer').value;
    const category = document.getElementById('offerCategory').value;
    const status = document.getElementById('offerStatus').value;
    const description = document.getElementById('offerDescription').value;
    const fecha = getTodayDate();
    const applications = editIndex !== null ? offers[editIndex].applications || 0 : 0;

    if (editIndex !== null) {
        offers[editIndex] = { 
            ...offers[editIndex], 
            title, 
            employer, 
            category, 
            status, 
            description 
        };
        createToast("Oferta actualizada correctamente", "success");
    } else {
        // Generar un ID único basado en el máximo ID existente + 1
        const maxId = offers.length > 0 ? Math.max(...offers.map(offer => offer.id)) : 0;
        const id = maxId + 1;
        offers.push({ 
            id, 
            title, 
            employer, 
            category, 
            status, 
            description, 
            fecha, 
            applications 
        });
        createToast("Oferta creada correctamente", "success");
    }
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Actualizar la vista
    filteredOffers = [...offers];
    updateView();
    
    // Cerrar el modal
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('offerModal'));
    if (modalInstance) {
        modalInstance.hide();
    }
}

function confirmDelete(index) {
    deleteIndex = index;
    confirmDeleteModal.show();
}

function updateView() {
    // Actualizar la vista según el dispositivo
    if (isMobile) {
        updateCardView();
    } else {
        updateTableView();
    }
}

function updateTableView() {
    const tbody = document.getElementById('offerTableBody');
    tbody.innerHTML = '';
    
    if (filteredOffers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">No hay ofertas para mostrar</td>
            </tr>`;
        return;
    }
    
    filteredOffers.forEach((offer, i) => {
        const offerIndex = offers.findIndex(o => o.id === offer.id);
        tbody.innerHTML += `
            <tr>
                <td><input type="checkbox"></td>
                <td>${offer.id}</td>
                <td>${offer.title || ''}</td>
                <td>${offer.employer || ''}</td>
                <td>${offer.category || ''}</td>
                <td><span class="status-badge ${getStatusClass(offer.status)}">${offer.status}</span></td>
                <td>${offer.applications || 0}</td>
                <td>${offer.fecha}</td>
                <td>
                    <div class="dropdown action-dropdown">
                        <button class="btn btn-light border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">⋮</button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#"><i class="bi bi-eye me-2"></i> Ver detalles</a></li>
                            <li><a class="dropdown-item" href="#" onclick="openRegisterModal(${offerIndex})"><i class="bi bi-pencil me-2"></i> Editar</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="confirmDelete(${offerIndex})"><i class="bi bi-trash me-2"></i> Eliminar</a></li>
                        </ul>
                    </div>
                </td>
            </tr>`;
    });
}

function getStatusClass(status) {
    switch(status) {
        case 'Activa':
            return 'status-activa';
        case 'Pausada':
            return 'status-pausada';
        case 'Cerrada':
            return 'status-cerrada';
        default:
            return '';
    }
}

function updateCardView() {
    const cardContainer = document.getElementById('offerCardContainer');
    cardContainer.innerHTML = '';
    
    if (filteredOffers.length === 0) {
        cardContainer.innerHTML = `
            <div class="alert alert-info text-center">
                No hay ofertas para mostrar
            </div>`;
        return;
    }
    
    filteredOffers.forEach((offer, i) => {
        const offerIndex = offers.findIndex(o => o.id === offer.id);
        cardContainer.innerHTML += `
            <div class="offer-card">
                <div class="offer-card-header">
                    <h6 class="mb-0">${offer.title || 'Sin título'}</h6>
                    <span class="status-badge ${getStatusClass(offer.status)}">${offer.status}</span>
                </div>
                <div class="offer-card-body">
                    <div class="offer-card-item">
                        <span class="offer-card-label">ID:</span>
                        <span>${offer.id}</span>
                    </div>
                    <div class="offer-card-item">
                        <span class="offer-card-label">Empleador:</span>
                        <span>${offer.employer || ''}</span>
                    </div>
                    <div class="offer-card-item">
                        <span class="offer-card-label">Categoría:</span>
                        <span>${offer.category || ''}</span>
                    </div>
                    <div class="offer-card-item">
                        <span class="offer-card-label">Aplicaciones:</span>
                        <span>${offer.applications || 0}</span>
                    </div>
                    <div class="offer-card-item">
                        <span class="offer-card-label">Fecha:</span>
                        <span>${offer.fecha}</span>
                    </div>
                </div>
                <div class="offer-card-footer">
                    <button class="btn btn-sm btn-outline-primary" onclick="openRegisterModal(${offerIndex})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${offerIndex})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>`;
    });
}

// Búsqueda
function searchOffers(term) {
    if (!term.trim()) {
        filteredOffers = [...offers];
    } else {
        term = term.toLowerCase();
        filteredOffers = offers.filter(offer => 
            (offer.id.toString().includes(term)) ||
            (offer.title && offer.title.toLowerCase().includes(term)) ||
            (offer.employer && offer.employer.toLowerCase().includes(term)) ||
            (offer.category && offer.category.toLowerCase().includes(term))
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
    document.getElementById('filterCategoria').value = '';
    document.getElementById('filterEstado').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
}

function applyFilters() {
    const categoria = document.getElementById('filterCategoria').value;
    const estado = document.getElementById('filterEstado').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    // Convertir fechas a formato comparable
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    filteredOffers = offers.filter(offer => {
        // Filtrar por categoría
        if (categoria && offer.category !== categoria) return false;
        
        // Filtrar por estado
        if (estado && offer.status !== estado) return false;
        
        // Filtrar por fecha
        if (fromDate || toDate) {
            const parts = offer.fecha.split('/');
            const offerDate = new Date(parts[2], parts[1] - 1, parts[0]);
            
            if (fromDate && offerDate < fromDate) return false;
            if (toDate && offerDate > toDate) return false;
        }
        
        return true;
    });
    
    updateView();
    toggleFilterPanel(); // Ocultar el panel después de aplicar filtros
}

function toggleAll(source) {
    const checkboxes = document.querySelectorAll('#offerTableBody input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = source.checked);
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
    switch(type) {
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
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
    
    return toast;
}