import { Router } from "express"
import apiService from "../services/apiService.js"

const router = Router()

// Dashboard
router.get("/admin", async (req, res) => {
  try {
    const stats = await apiService.getDashboardStats()
    res.render("admin/dashboard", {
      title: "Dashboard - Panel de Administración",
      activeMenu: "dashboard",
      stats,
      error: null,
    })
  } catch (error) {
    console.error("Error en dashboard:", error.message)
    res.render("admin/dashboard", {
      title: "Dashboard - Panel de Administración",
      activeMenu: "dashboard",
      stats: {
        totalUsers: 0,
        totalOffers: 0,
        totalContracts: 0,
        totalApplyments: 0,
        totalReports: 0,
      },
      error: "Error al cargar las estadísticas",
    })
  }
})

// ===== RUTAS DE USUARIOS =====
router.get("/usuarios", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const users = await apiService.getUsers(page, limit)

    res.render("admin/users/index", {
      title: "Gestión de Usuarios",
      activeMenu: "users",
      users: users.data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((users.total || 0) / limit),
        total: users.total || 0,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message)
    res.render("admin/users/index", {
      title: "Gestión de Usuarios",
      activeMenu: "users",
      users: [],
      pagination: { currentPage: 1, totalPages: 0, total: 0 },
      error: error.message,
    })
  }
})

router.get("/usuarios/crear", (req, res) => {
  res.render("admin/users/create", {
    title: "Crear Usuario",
    activeMenu: "users",
    error: null,
    formData: {},
  })
})

router.post("/usuarios", async (req, res) => {
  try {
    await apiService.createUser(req.body)
    res.redirect("/admin/usuarios?success=Usuario creado exitosamente")
  } catch (error) {
    console.error("Error al crear usuario:", error.message)
    res.render("admin/users/create", {
      title: "Crear Usuario",
      activeMenu: "users",
      error: error.message,
      formData: req.body,
    })
  }
})

router.get("/usuarios/:id/editar", async (req, res) => {
  try {
    const user = await apiService.getUserById(req.params.id)
    res.render("admin/users/edit", {
      title: "Editar Usuario",
      activeMenu: "users",
      user: user.data || user,
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener usuario:", error.message)
    res.redirect("/admin/usuarios?error=" + encodeURIComponent(error.message))
  }
})

router.put("/usuarios/:id", async (req, res) => {
  try {
    await apiService.updateUser(req.params.id, req.body)
    res.redirect("/admin/usuarios?success=Usuario actualizado exitosamente")
  } catch (error) {
    console.error("Error al actualizar usuario:", error.message)
    const user = await apiService.getUserById(req.params.id).catch(() => ({}))
    res.render("admin/users/edit", {
      title: "Editar Usuario",
      activeMenu: "users",
      user: user.data || user,
      error: error.message,
    })
  }
})

router.delete("/usuarios/:id", async (req, res) => {
  try {
    await apiService.deleteUser(req.params.id)
    res.redirect("/admin/usuarios?success=Usuario eliminado exitosamente")
  } catch (error) {
    console.error("Error al eliminar usuario:", error.message)
    res.redirect("/admin/usuarios?error=" + encodeURIComponent(error.message))
  }
})

// ===== RUTAS DE OFERTAS =====
router.get("/ofertas", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offers = await apiService.getOffers(page, limit)

    res.render("admin/offers/index", {
      title: "Gestión de Ofertas",
      activeMenu: "offers",
      offers: offers.data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((offers.total || 0) / limit),
        total: offers.total || 0,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener ofertas:", error.message)
    res.render("admin/offers/index", {
      title: "Gestión de Ofertas",
      activeMenu: "offers",
      offers: [],
      pagination: { currentPage: 1, totalPages: 0, total: 0 },
      error: error.message,
    })
  }
})

router.get("/ofertas/crear", (req, res) => {
  res.render("admin/offers/create", {
    title: "Crear Oferta",
    activeMenu: "offers",
    error: null,
    formData: {},
  })
})

router.post("/ofertas", async (req, res) => {
  try {
    await apiService.createOffer(req.body)
    res.redirect("/admin/ofertas?success=Oferta creada exitosamente")
  } catch (error) {
    console.error("Error al crear oferta:", error.message)
    res.render("admin/offers/create", {
      title: "Crear Oferta",
      activeMenu: "offers",
      error: error.message,
      formData: req.body,
    })
  }
})

router.get("/ofertas/:id/editar", async (req, res) => {
  try {
    const offer = await apiService.getOfferById(req.params.id)
    res.render("admin/offers/edit", {
      title: "Editar Oferta",
      activeMenu: "offers",
      offer: offer.data || offer,
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener oferta:", error.message)
    res.redirect("/admin/ofertas?error=" + encodeURIComponent(error.message))
  }
})

router.put("/ofertas/:id", async (req, res) => {
  try {
    await apiService.updateOffer(req.params.id, req.body)
    res.redirect("/admin/ofertas?success=Oferta actualizada exitosamente")
  } catch (error) {
    console.error("Error al actualizar oferta:", error.message)
    const offer = await apiService.getOfferById(req.params.id).catch(() => ({}))
    res.render("admin/offers/edit", {
      title: "Editar Oferta",
      activeMenu: "offers",
      offer: offer.data || offer,
      error: error.message,
    })
  }
})

router.delete("/ofertas/:id", async (req, res) => {
  try {
    await apiService.deleteOffer(req.params.id)
    res.redirect("/admin/ofertas?success=Oferta eliminada exitosamente")
  } catch (error) {
    console.error("Error al eliminar oferta:", error.message)
    res.redirect("/admin/ofertas?error=" + encodeURIComponent(error.message))
  }
})

// ===== RUTAS DE CONTRATOS =====
router.get("/contratos", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const contracts = await apiService.getContracts(page, limit)

    res.render("admin/contracts/index", {
      title: "Gestión de Contratos",
      activeMenu: "contracts",
      contracts: contracts.data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((contracts.total || 0) / limit),
        total: contracts.total || 0,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener contratos:", error.message)
    res.render("admin/contracts/index", {
      title: "Gestión de Contratos",
      activeMenu: "contracts",
      contracts: [],
      pagination: { currentPage: 1, totalPages: 0, total: 0 },
      error: error.message,
    })
  }
})

router.get("/contratos/crear", (req, res) => {
  res.render("admin/contracts/create", {
    title: "Crear Contrato",
    activeMenu: "contracts",
    error: null,
    formData: {},
  })
})

router.post("/contratos", async (req, res) => {
  try {
    await apiService.createContract(req.body)
    res.redirect("/admin/contratos?success=Contrato creado exitosamente")
  } catch (error) {
    console.error("Error al crear contrato:", error.message)
    res.render("admin/contracts/create", {
      title: "Crear Contrato",
      activeMenu: "contracts",
      error: error.message,
      formData: req.body,
    })
  }
})

router.get("/contratos/:id/editar", async (req, res) => {
  try {
    const contract = await apiService.getContractById(req.params.id)
    res.render("admin/contracts/edit", {
      title: "Editar Contrato",
      activeMenu: "contracts",
      contract: contract.data || contract,
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener contrato:", error.message)
    res.redirect("/admin/contratos?error=" + encodeURIComponent(error.message))
  }
})

router.put("/contratos/:id", async (req, res) => {
  try {
    await apiService.updateContract(req.params.id, req.body)
    res.redirect("/admin/contratos?success=Contrato actualizado exitosamente")
  } catch (error) {
    console.error("Error al actualizar contrato:", error.message)
    const contract = await apiService.getContractById(req.params.id).catch(() => ({}))
    res.render("admin/contracts/edit", {
      title: "Editar Contrato",
      activeMenu: "contracts",
      contract: contract.data || contract,
      error: error.message,
    })
  }
})

router.delete("/contratos/:id", async (req, res) => {
  try {
    await apiService.deleteContract(req.params.id)
    res.redirect("/admin/contratos?success=Contrato eliminado exitosamente")
  } catch (error) {
    console.error("Error al eliminar contrato:", error.message)
    res.redirect("/admin/contratos?error=" + encodeURIComponent(error.message))
  }
})

// ===== RUTAS DE POSTULACIONES =====
router.get("/postulaciones", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const applyments = await apiService.getApplyments(page, limit)

    res.render("admin/applyments/index", {
      title: "Gestión de Postulaciones",
      activeMenu: "applyments",
      applyments: applyments.data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((applyments.total || 0) / limit),
        total: applyments.total || 0,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener postulaciones:", error.message)
    res.render("admin/applyments/index", {
      title: "Gestión de Postulaciones",
      activeMenu: "applyments",
      applyments: [],
      pagination: { currentPage: 1, totalPages: 0, total: 0 },
      error: error.message,
    })
  }
})

router.get("/postulaciones/crear", (req, res) => {
  res.render("admin/applyments/create", {
    title: "Crear Postulación",
    activeMenu: "applyments",
    error: null,
    formData: {},
  })
})

router.post("/postulaciones", async (req, res) => {
  try {
    await apiService.createApplyment(req.body)
    res.redirect("/admin/postulaciones?success=Postulación creada exitosamente")
  } catch (error) {
    console.error("Error al crear postulación:", error.message)
    res.render("admin/applyments/create", {
      title: "Crear Postulación",
      activeMenu: "applyments",
      error: error.message,
      formData: req.body,
    })
  }
})

router.get("/postulaciones/:id/editar", async (req, res) => {
  try {
    const applyment = await apiService.getApplymentById(req.params.id)
    res.render("admin/applyments/edit", {
      title: "Editar Postulación",
      activeMenu: "applyments",
      applyment: applyment.data || applyment,
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener postulación:", error.message)
    res.redirect("/admin/postulaciones?error=" + encodeURIComponent(error.message))
  }
})

router.put("/postulaciones/:id", async (req, res) => {
  try {
    await apiService.updateApplyment(req.params.id, req.body)
    res.redirect("/admin/postulaciones?success=Postulación actualizada exitosamente")
  } catch (error) {
    console.error("Error al actualizar postulación:", error.message)
    const applyment = await apiService.getApplymentById(req.params.id).catch(() => ({}))
    res.render("admin/applyments/edit", {
      title: "Editar Postulación",
      activeMenu: "applyments",
      applyment: applyment.data || applyment,
      error: error.message,
    })
  }
})

router.delete("/postulaciones/:id", async (req, res) => {
  try {
    await apiService.deleteApplyment(req.params.id)
    res.redirect("/admin/postulaciones?success=Postulación eliminada exitosamente")
  } catch (error) {
    console.error("Error al eliminar postulación:", error.message)
    res.redirect("/admin/postulaciones?error=" + encodeURIComponent(error.message))
  }
})

// ===== RUTAS DE REPORTES =====
router.get("/reportes", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const reports = await apiService.getReports(page, limit)

    res.render("admin/reports/index", {
      title: "Gestión de Reportes",
      activeMenu: "reports",
      reports: reports.data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((reports.total || 0) / limit),
        total: reports.total || 0,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener reportes:", error.message)
    res.render("admin/reports/index", {
      title: "Gestión de Reportes",
      activeMenu: "reports",
      reports: [],
      pagination: { currentPage: 1, totalPages: 0, total: 0 },
      error: error.message,
    })
  }
})

router.get("/reportes/crear", (req, res) => {
  res.render("admin/reports/create", {
    title: "Crear Reporte",
    activeMenu: "reports",
    error: null,
    formData: {},
  })
})

router.post("/reportes", async (req, res) => {
  try {
    await apiService.createReport(req.body)
    res.redirect("/admin/reportes?success=Reporte creado exitosamente")
  } catch (error) {
    console.error("Error al crear reporte:", error.message)
    res.render("admin/reports/create", {
      title: "Crear Reporte",
      activeMenu: "reports",
      error: error.message,
      formData: req.body,
    })
  }
})

router.get("/reportes/:id/editar", async (req, res) => {
  try {
    const report = await apiService.getReportById(req.params.id)
    res.render("admin/reports/edit", {
      title: "Editar Reporte",
      activeMenu: "reports",
      report: report.data || report,
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener reporte:", error.message)
    res.redirect("/admin/reportes?error=" + encodeURIComponent(error.message))
  }
})

router.put("/reportes/:id", async (req, res) => {
  try {
    await apiService.updateReport(req.params.id, req.body)
    res.redirect("/admin/reportes?success=Reporte actualizado exitosamente")
  } catch (error) {
    console.error("Error al actualizar reporte:", error.message)
    const report = await apiService.getReportById(req.params.id).catch(() => ({}))
    res.render("admin/reports/edit", {
      title: "Editar Reporte",
      activeMenu: "reports",
      report: report.data || report,
      error: error.message,
    })
  }
})

router.delete("/reportes/:id", async (req, res) => {
  try {
    await apiService.deleteReport(req.params.id)
    res.redirect("/admin/reportes?success=Reporte eliminado exitosamente")
  } catch (error) {
    console.error("Error al eliminar reporte:", error.message)
    res.redirect("/admin/reportes?error=" + encodeURIComponent(error.message))
  }
})

export default router