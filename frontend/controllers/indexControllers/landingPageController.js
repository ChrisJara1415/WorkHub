const renderLandingPage = async (req, res) => {
    try {
        res.render("pages/landingPage", {
            title: "Work Hub - Landing Page"
    })
    } catch (error) {
        console.error('Error al renderizar la página de inicio:', error)
    }
}

export { renderLandingPage }