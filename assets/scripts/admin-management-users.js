let users = [];
let filteredUsers = [];
let editIndex = null;
let deleteIndex = null;
let confirmDeleteModal = null;
let isMobile = window.innerWidth < 768;
const STORAGE_KEY = 'admin_users';

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el modal de confirmación
    confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    
    // Configurar el botón de confirmación
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        if (deleteIndex !== null) {
            users.splice(deleteIndex, 1);
            saveToLocalStorage();
            filteredUsers = [...users];
            updateView();
            confirmDeleteModal.hide();
            createToast("Usuario eliminado correctamente", "success");
        }
    });
    
    // Configurar el botón de guardar usuario
    document.getElementById('saveUserBtn').addEventListener('click', saveUser);
    
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function loadFromLocalStorage() {
    const storedUsers = localStorage.getItem(STORAGE_KEY);
    if (storedUsers) {
        users = JSON.parse(storedUsers);
        filteredUsers = [...users];
        updateView();
    } else {
        // Inicializar con array vacío
        users = [];
        filteredUsers = [];
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
    const form = document.getElementById('userForm');
    form.reset();
    form.classList.remove('was-validated');
    
    // Quitar clases de validación de los campos
    document.getElementById('userName').classList.remove('is-invalid');
    document.getElementById('userEmail').classList.remove('is-invalid');
    
    editIndex = index;
    if (index !== null) {
        const u = users[index];
        document.getElementById('userName').value = u.name || '';
        document.getElementById('userEmail').value = u.email || '';
        document.getElementById('userTipo').value = u.tipo;
        document.getElementById('userEstado').value = u.estado;
        document.getElementById('userModalLabel').innerText = 'Editar Usuario';
    } else {
        document.getElementById('userModalLabel').innerText = 'Registrar Usuario';
    }
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

function validateForm() {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    
    let isValid = true;
    let errors = [];
    
    // Validar nombre
    if (!nameInput.value.trim()) {
        nameInput.classList.add('is-invalid');
        errors.push('El nombre no puede estar vacío');
        isValid = false;
    } else {
        nameInput.classList.remove('is-invalid');
    }
    
    // Validar email - formato
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailInput.value.trim()) {
        emailInput.classList.add('is-invalid');
        errors.push('El correo electrónico no puede estar vacío');
        isValid = false;
    } else if (!emailPattern.test(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        errors.push('Por favor ingrese un correo electrónico válido');
        isValid = false;
    } else {
        // Validar email - duplicado
        const isDuplicate = editIndex === null && 
            users.some(user => user.email && user.email.toLowerCase() === emailInput.value.toLowerCase());
        
        if (isDuplicate) {
            emailInput.classList.add('is-invalid');
            errors.push('Este correo electrónico ya está registrado');
            isValid = false;
        } else {
            emailInput.classList.remove('is-invalid');
        }
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

function saveUser() {
    // Validar el formulario
    if (!validateForm()) {
        return;
    }
    
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const tipo = document.getElementById('userTipo').value;
    const estado = document.getElementById('userEstado').value;
    const fecha = getTodayDate();

    if (editIndex !== null) {
        users[editIndex] = { ...users[editIndex], name, email, tipo, estado };
        createToast("Usuario actualizado correctamente", "success");
    } else {
        // Generar un ID único basado en el máximo ID existente + 1
        const maxId = users.length > 0 ? Math.max(...users.map(user => user.id)) : 0;
        const id = maxId + 1;
        users.push({ id, name, email, tipo, estado, fecha });
        createToast("Usuario creado correctamente", "success");
    }
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Actualizar la vista
    filteredUsers = [...users];
    updateView();
    
    // Cerrar el modal
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('userModal'));
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
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">No hay usuarios para mostrar</td>
            </tr>`;
        return;
    }
    
    filteredUsers.forEach((user, i) => {
        const userIndex = users.findIndex(u => u.id === user.id);
        tbody.innerHTML += `
            <tr>
                <td><input type="checkbox"></td>
                <td>${user.id}</td>
                <td>${user.name || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.tipo}</td>
                <td><span class="status-badge ${user.estado === 'Activo' ? 'status-activo' : 'status-inactivo'}">${user.estado}</span></td>
                <td>${user.fecha}</td>
                <td>
                    <div class="dropdown action-dropdown">
                        <button class="btn btn-light border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">⋮</button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#"><i class="bi bi-eye me-2"></i> Ver perfil</a></li>
                            <li><a class="dropdown-item" href="#" onclick="openRegisterModal(${userIndex})"><i class="bi bi-pencil me-2"></i> Editar</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="confirmDelete(${userIndex})"><i class="bi bi-trash me-2"></i> Eliminar</a></li>
                        </ul>
                    </div>
                </td>
            </tr>`;
    });
}

function updateCardView() {
    const cardContainer = document.getElementById('userCardContainer');
    cardContainer.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        cardContainer.innerHTML = `
            <div class="alert alert-info text-center">
                No hay usuarios para mostrar
            </div>`;
        return;
    }
    
    filteredUsers.forEach((user, i) => {
        const userIndex = users.findIndex(u => u.id === user.id);
        cardContainer.innerHTML += `
            <div class="user-card">
                <div class="user-card-header">
                    <h6 class="mb-0">${user.name || 'Sin nombre'}</h6>
                    <span class="status-badge ${user.estado === 'Activo' ? 'status-activo' : 'status-inactivo'}">${user.estado}</span>
                </div>
                <div class="user-card-body">
                    <div class="user-card-item">
                        <span class="user-card-label">ID:</span>
                        <span>${user.id}</span>
                    </div>
                    <div class="user-card-item">
                        <span class="user-card-label">Email:</span>
                        <span>${user.email || ''}</span>
                    </div>
                    <div class="user-card-item">
                        <span class="user-card-label">Tipo:</span>
                        <span>${user.tipo}</span>
                    </div>
                    <div class="user-card-item">
                        <span class="user-card-label">Fecha:</span>
                        <span>${user.fecha}</span>
                    </div>
                </div>
                <div class="user-card-footer">
                    <button class="btn btn-sm btn-outline-primary" onclick="openRegisterModal(${userIndex})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${userIndex})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>`;
    });
}

// Búsqueda en tiempo real
function searchUsers(term) {
    if (!term.trim()) {
        filteredUsers = [...users];
    } else {
        term = term.toLowerCase();
        filteredUsers = users.filter(user => 
            (user.id.toString().includes(term)) ||
            (user.name && user.name.toLowerCase().includes(term)) ||
            (user.email && user.email.toLowerCase().includes(term)) ||
            (user.tipo && user.tipo.toLowerCase().includes(term))
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
    document.getElementById('filterEstado').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
}

function applyFilters() {
    const tipo = document.getElementById('filterTipo').value;
    const estado = document.getElementById('filterEstado').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    // Convertir fechas a formato comparable
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    filteredUsers = users.filter(user => {
        // Filtrar por tipo
        if (tipo && user.tipo !== tipo) return false;
        
        // Filtrar por estado
        if (estado && user.estado !== estado) return false;
        
        // Filtrar por fecha
        if (fromDate || toDate) {
            const parts = user.fecha.split('/');
            const userDate = new Date(parts[2], parts[1] - 1, parts[0]);
            
            if (fromDate && userDate < fromDate) return false;
            if (toDate && userDate > toDate) return false;
        }
        
        return true;
    });
    
    updateView();
    toggleFilterPanel(); // Ocultar el panel después de aplicar filtros
}

function toggleAll(source) {
    const checkboxes = document.querySelectorAll('#userTableBody input[type="checkbox"]');
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