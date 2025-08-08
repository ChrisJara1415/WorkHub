

function includeHTML(selector, file) {
  fetch(file)
    .then(response => {
      if (!response.ok) throw new Error(`Cannot load ${file}`);
      return response.text();
    })
    .then(data => {
      document.querySelector(selector).innerHTML = data;
    })
    .catch(error => {
      console.error('Error loading HTML:', error)
    })
}
const getPath = () => {
  const depth = location.pathname.split("/").length;
  return depth > 2 ? "../partials/" : "./partials/";
};
window.addEventListener("DOMContentLoaded", () => {
  const path = getPath();
  includeHTML("#header", `${path}header.html`);
  includeHTML("#footer", `${path}footer.html`);
  includeHTML("#admin-header", `${path}admin-header.html`);
  includeHTML("#admin-sidebar", `${path}admin-sidebar.html`);
  includeHTML("#modal-login", `${path}modal-login.html`);
  includeHTML("#modal-signup", `${path}modal-signup.html`);
  includeHTML("#user-header", `${path}user-header.html`);

}); 