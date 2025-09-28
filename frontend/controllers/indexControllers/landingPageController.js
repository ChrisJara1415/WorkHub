const renderLandingPage = async (req, res) => {
    try {
        res.render("pages/landingPage", {
            title: "Work Hub - Landing Page",
            layout: false,
            user: res.locals.user,
            isAuthenticated: res.locals.isAuthenticated,
            role: res.locals.role
    })
    } catch (error) {
        console.error('Error al renderizar la página de inicio:', error)
    }
}

export { renderLandingPage }