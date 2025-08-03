
function signUp() {

    const newEmailCredentials = {}
    newEmailCredentials.email = document.getElementById("email-sign-up").value
    newEmailCredentials.password = document.getElementById("password-sign-up").value

    if (localStorage.length === 0) {
        localStorage.setItem(`email${localStorage.length + 1}`, JSON.stringify(newEmailCredentials))
        alert("Haz sido registrado con éxito")
        return
    }

    for (i = 0; i < localStorage.length; i++) {

        const emailExist = JSON.parse(localStorage.getItem(`email${i + 1}`))

        if (emailExist.email === newEmailCredentials.email
            && emailExist.password === newEmailCredentials.password
        ) {
            alert("El email ya existe")
            return
        }
    }
    localStorage.setItem(`email${localStorage.length + 1}`, JSON.stringify(newEmailCredentials))
    alert("Haz sido registrado con éxito")
}