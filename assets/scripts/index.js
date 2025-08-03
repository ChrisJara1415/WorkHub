
/* Carrusel jobs*/
document.addEventListener('DOMContentLoaded', function () {
  new Splide('#thumbnail-carousel', {
    type: 'loop',

    fixedWidth: 250,
    fixedHeight: 250,
    arrows: false,
    gap: 50,
    rewind: true,
    pagination: false,
    focus: 'start',
    breakpoints: {

      992: {
        perPage: 4,

      },
      768: {
        fixedWidth: 200,
        fixedHeight: 200,

      },
    },
  }).mount();

  var splide = new Splide('#ldg-pro', {
    type: 'loop',
    perPage: 4,
    perMove: 2,
    breakpoints: {
      992: {
        perPage: 2,
        perMove: 1,
      },
      768: {
        perPage: 1,
        perMove: 1,
      },
    },

  });

  splide.mount();
});


/* Icono mostrar/ocultar login*/

function togglePassword() {
  const input = document.getElementById("password");
  const icon = document.querySelector(".toggle-icon");
  if (input.type === "password") {
    input.type = "text";
    icon.innerHTML = `
    <path d="M1 8.64235C12 18.5285 18.5 18.5285 28.5 8.64235" stroke="white" stroke-width="1.5" stroke-linecap="round"/>`;
  } else {
    input.type = "password";
    icon.innerHTML = `<path d="M2 9.11384C13 19 19.5 19 29.5 9.11384C18.8789 -1.37506 13.259 -2.02927 2 9.11384Z" stroke="white" stroke-width="1.5"/>
                  <path d="M16 13.0284C18.4853 13.0284 20.5 11.0137 20.5 8.52844C20.5 6.04316 18.4853 4.02844 16 4.02844C13.5147 4.02844 11.5 6.04316 11.5 8.52844C11.5 11.0137 13.5147 13.0284 16 13.0284Z" fill="white" stroke="white"/>`;
  }
}

/* Icono mostrar/ocultar signup*/

function signupTogglePassword() {
  const input = document.getElementById("loginPassword");
  const icon = document.querySelector(".toggle-icon");
  if (input.type === "password") {
    input.type = "text";
    icon.innerHTML = `
    <path d="M1 8.64235C12 18.5285 18.5 18.5285 28.5 8.64235" stroke="white" stroke-width="1.5" stroke-linecap="round"/>`;
  } else {
    input.type = "password";
    icon.innerHTML = `<path d="M2 9.11384C13 19 19.5 19 29.5 9.11384C18.8789 -1.37506 13.259 -2.02927 2 9.11384Z" stroke="white" stroke-width="1.5"/>
                  <path d="M16 13.0284C18.4853 13.0284 20.5 11.0137 20.5 8.52844C20.5 6.04316 18.4853 4.02844 16 4.02844C13.5147 4.02844 11.5 6.04316 11.5 8.52844C11.5 11.0137 13.5147 13.0284 16 13.0284Z" fill="white" stroke="white"/>`;
  }
}
