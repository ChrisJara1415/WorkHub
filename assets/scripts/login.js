const adminCredentials = {
    email: "admin@prueba.com",
    password: 12345
}

function validateLogin() {

    const email = document.getElementById("email").value
    const password = parseInt(document.getElementById("password").value)

    if (email == adminCredentials.email && password == adminCredentials.password) {

        console.log('funciona')
        window.open('../pages/admin-management-dashboard.html')

    }
    else {

        for (i = 0; i < localStorage.length; i++) {

            const emailExist = JSON.parse(localStorage.getItem(`email${i + 1}`))

            if (email == emailExist.email && password == emailExist.password) {
                alert("Bienvenido")
                return
            }
        }

        alert("Cuenta no existente. Registrate")
    }

}

/*Registro */