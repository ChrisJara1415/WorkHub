function changeModal() {
    const modalLogin = document.getElementById("modalLogin");
    const modalSignup = document.getElementById("modalSignUp");

    if (modalLogin.open) {
        modalLogin.close();
        modalSignup.showModal();
    }
}

function closeModalLogin(event){
    event.preventDefault()
    const modalLogin = document.getElementById('modalLogin')
    modalLogin.close()
}

function closeModalSignUp(event){
    event.preventDefault()
    const modalSignUp = document.getElementById('modalSignUp')
    modalSignUp.close()
}