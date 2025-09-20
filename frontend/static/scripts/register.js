// Validaciones regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEL_REGEX = /^(?:\+57)?3\d{9}$/
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

async function apiJson(url, options = {}) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json', 'x-api-key': 'api-key-mas-segura-del-mundo' }, ...options })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        const err = new Error(data?.message || 'Error')
        err.details = data?.errors
        err.status = res.status
        throw err
    }
    return data
}

const form = document.getElementById('registerForm')
const inputs = {
    nombres: document.getElementById('nombres'),
    apellidos: document.getElementById('apellidos'),
    email: document.getElementById('email'),
    telefono: document.getElementById('telefono'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    rol: document.getElementById('rol')
}

const availability = {
    email: document.getElementById('emailAvailability'),
    telefono: document.getElementById('telAvailability')
}

function setFieldState(input, valid, message = '') {
    input.classList.remove('is-valid', 'is-invalid')
    const feedback = form.querySelector(`.invalid-feedback[data-field="${input.name}"]`)
    if (valid) {
        input.classList.add('is-valid')
        if (feedback) feedback.textContent = ''
    } else {
        input.classList.add('is-invalid')
        if (feedback) feedback.textContent = message
    }
}

let debounceTimers = {}
function debounce(fn, key, delay = 450) {
    clearTimeout(debounceTimers[key])
    debounceTimers[key] = setTimeout(fn, delay)
}

async function checkAvailability(field, value) {
    if (!value) return
    try {
        const data = await apiJson(`/auth/check?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}`)
        const msgEl = availability[field]
        if (!msgEl) return
        if (data.available) {
            msgEl.textContent = 'Disponible'
            msgEl.className = 'availability-msg text-success'
        } else {
            msgEl.textContent = 'Ya registrado'
            msgEl.className = 'availability-msg text-danger'
        }
    } catch (_) { /* silent */ }
}

function validateField(name) {
    const value = inputs[name].value.trim()
    switch (name) {
        case 'nombres':
        case 'apellidos':
            if (value.length < 2) return { valid: false, msg: 'Mínimo 2 caracteres' }
            return { valid: true }
        case 'email':
            if (!EMAIL_REGEX.test(value)) return { valid: false, msg: 'Correo inválido' }
            return { valid: true }
        case 'telefono':
            if (!TEL_REGEX.test(value)) return { valid: false, msg: 'Formato inválido' }
            return { valid: true }
        case 'password':
            if (!PASS_REGEX.test(value)) return { valid: false, msg: '8+ caracteres, mayúscula, minúscula y número' }
            return { valid: true }
        case 'confirmPassword':
            if (value !== inputs.password.value) return { valid: false, msg: 'No coincide con la contraseña' }
            return { valid: true }
        case 'rol':
            if (!value) return { valid: false, msg: 'Seleccione un rol' }
            return { valid: true }
    }
}

Object.keys(inputs).forEach(name => {
    inputs[name].addEventListener('input', () => {
        const { valid, msg } = validateField(name)
        setFieldState(inputs[name], valid, msg)
        if (name === 'email' && valid) debounce(() => checkAvailability('email', inputs[name].value), 'email')
        if (name === 'telefono' && valid) debounce(() => checkAvailability('telefono', inputs[name].value), 'telefono')
    })
    inputs[name].addEventListener('blur', () => {
        const { valid, msg } = validateField(name)
        setFieldState(inputs[name], valid, msg)
    })
})

form.addEventListener('submit', async e => {
    e.preventDefault()
    let allValid = true
    Object.keys(inputs).forEach(name => {
        const { valid, msg } = validateField(name)
        setFieldState(inputs[name], valid, msg)
        if (!valid) allValid = false
    })
    if (!allValid) return

    const submitBtn = document.getElementById('submitBtn')
    const spinner = document.getElementById('loadingSpinner')
    submitBtn.disabled = true
    spinner.classList.remove('d-none')
    try {
        const payload = {
            nombres: inputs.nombres.value.trim(),
            apellidos: inputs.apellidos.value.trim(),
            email: inputs.email.value.trim(),
            telefono: inputs.telefono.value.trim(),
            password: inputs.password.value,
            rol: inputs.rol.value
        }
    await apiJson('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
    // Redirige a landing con flag para mostrar toast
    window.location.href = '/?registered=1'
    } catch (err) {
        const details = err.details || {}
        Object.entries(details).forEach(([field, msg]) => {
            if (inputs[field]) setFieldState(inputs[field], false, msg)
        })
    } finally {
        spinner.classList.add('d-none')
        submitBtn.disabled = false
    }
})

