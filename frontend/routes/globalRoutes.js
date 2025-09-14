import { Router } from "express"
import apiService from "../services/apiService.js"

const router = Router()

// Dashboard
router.get("/", async (req, res) => {
  try {
    const stats = await apiService.getDashboardStats()
    res.render("pages/admin/dashboard", {
      title: "Dashboard - Panel de Administración",
      activeMenu: "dashboard",
      stats,
      error: null,
    })
  } catch (error) {
    console.error("Error en dashboard:", error.message)
    res.render("pages/admin/dashboard", {
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
    const { q = "", rol = "", municipio = "" } = req.query
    const usersResp = await apiService.getUsers(1, 1000, rol || undefined)
    let list = usersResp.data || []

    const qLower = q.toString().toLowerCase()
    if (qLower) {
      list = list.filter(u =>
        (u.nombres || "").toLowerCase().includes(qLower) ||
        (u.apellidos || "").toLowerCase().includes(qLower) ||
        (u.email || "").toLowerCase().includes(qLower) ||
        (u.telefono || "").toLowerCase().includes(qLower)
      )
    }
    if (municipio) list = list.filter(u => (u.municipio || "") === municipio)

    const total = list.length
    const start = (page - 1) * limit
    const end = start + limit
    const pageItems = list.slice(start, end)

    res.render("pages/admin/users/index", {
      title: "Gestión de Usuarios",
      activeMenu: "users",
      users: pageItems,
      q, rol, municipio,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message)
    res.render("pages/admin/users/index", {
      title: "Gestión de Usuarios",
      activeMenu: "users",
      users: [],
      q: req.query.q || "", rol: req.query.rol || "", municipio: req.query.municipio || "",
      pagination: { currentPage: 1, totalPages: 0, total: 0, limit: Number.parseInt(req.query.limit) || 10 },
      error: error.message,
    })
  }
})

router.get("/usuarios/crear", (req, res) => {
  res.render("pages/admin/users/create", {
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
    res.render("pages/admin/users/create", {
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
    res.render("pages/admin/users/edit", {
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
    res.render("pages/admin/users/edit", {
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
    const { q = "", categoria = "", visible = "" } = req.query
    const offersResp = await apiService.getOffers(1, 1000)
    let list = offersResp.data || []

    // Filtros
    const qLower = q.toString().toLowerCase()
    if (qLower) {
      list = list.filter(o =>
        (o.nombreServicio || "").toLowerCase().includes(qLower) ||
        ((o.empleador && o.empleador.nombre) || "").toLowerCase().includes(qLower)
      )
    }
    if (categoria) list = list.filter(o => o.categoria === categoria)
    if (visible === 'true' || visible === 'false') list = list.filter(o => String(!!o.visible) === visible)

    const total = list.length
    const start = (page - 1) * limit
    const end = start + limit
    const pageItems = list.slice(start, end)

    res.render("pages/admin/offers/index", {
      title: "Gestión de Ofertas",
      activeMenu: "offers",
      offers: pageItems,
      q, categoria, visible,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener ofertas:", error.message)
    res.render("pages/admin/offers/index", {
      title: "Gestión de Ofertas",
      activeMenu: "offers",
      offers: [], q: req.query.q || "", categoria: req.query.categoria || "", visible: req.query.visible || "",
      pagination: { currentPage: 1, totalPages: 0, total: 0, limit: Number.parseInt(req.query.limit) || 10 },
      error: error.message,
    })
  }
})

router.get("/ofertas/crear", async (req, res) => {
  try {
    const empResp = await apiService.getUsers(1, 100, 'empleador')
    const employers = empResp?.data || empResp || []
    res.render("pages/admin/offers/create", {
      title: "Crear Oferta",
      activeMenu: "offers",
      error: null,
      formData: {},
      employers,
    })
  } catch (error) {
    console.error("Error al cargar empleadores:", error.message)
    res.render("pages/admin/offers/create", {
      title: "Crear Oferta",
      activeMenu: "offers",
      error: "No se pudo cargar la lista de empleadores",
      formData: {},
      employers: [],
    })
  }
})

router.post("/ofertas", async (req, res) => {
  try {
    await apiService.createOffer(req.body)
    res.redirect("/admin/ofertas?success=Oferta creada exitosamente")
  } catch (error) {
    console.error("Error al crear oferta:", error?.response?.data || error.message)
    // Re-cargar empleadores para evitar ReferenceError en la vista
    let employers = []
    try {
      const empResp = await apiService.getUsers(1, 100, 'empleador')
      employers = empResp?.data || empResp || []
    } catch (e) {
      console.error("Error recargando empleadores:", e.message)
    }
  res.status(400).render("pages/admin/offers/create", {
      title: "Crear Oferta",
      activeMenu: "offers",
      error: (error?.response?.data?.message || error.message || "No se pudo crear la oferta"),
      formData: req.body,
      employers,
    })
  }
})

router.get("/ofertas/:id/editar", async (req, res) => {
  try {
    const [offer, employers] = await Promise.all([
      apiService.getOfferById(req.params.id),
      apiService.getUsers(1, 100, 'empleador'),
    ])
    res.render("pages/admin/offers/edit", {
      title: "Editar Oferta",
      activeMenu: "offers",
      offer: offer.data || offer,
      employers: employers.data || [],
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener oferta:", error.message)
    res.redirect("/admin/ofertas?error=" + encodeURIComponent(error.message))
  }
})

router.get("/ofertas/:id", async (req, res) => {
  try {
    const offer = await apiService.getOfferById(req.params.id)
    res.render("pages/admin/offers/show", {
      title: "Detalle de Oferta",
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
    res.render("pages/admin/offers/edit", {
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
    const { q = "", estado = "" } = req.query

    const resp = await apiService.getContracts(1, 1000)
    let list = resp.data || []

    const qLower = q.toString().toLowerCase()
    if (qLower) {
      list = list.filter(c =>
        ((c.oferta && c.oferta.nombreOferta) || "").toLowerCase().includes(qLower) ||
        ((c.empleado && c.empleado.nombre) || "").toLowerCase().includes(qLower) ||
        ((c.empleador && c.empleador.nombre) || "").toLowerCase().includes(qLower)
      )
    }
    if (estado) list = list.filter(c => c.estado === estado)

    const total = list.length
    const start = (page - 1) * limit
    const end = start + limit
    const pageItems = list.slice(start, end)

    res.render("pages/admin/contracts/index", {
      title: "Gestión de Contratos",
      activeMenu: "contracts",
      contracts: pageItems,
      q, estado,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener contratos:", error.message)
    res.render("pages/admin/contracts/index", {
      title: "Gestión de Contratos",
      activeMenu: "contracts",
      contracts: [],
      q: req.query.q || "", estado: req.query.estado || "",
      pagination: { currentPage: 1, totalPages: 0, total: 0, limit: Number.parseInt(req.query.limit) || 10 },
      error: error.message,
    })
  }
})

router.get("/contratos/crear", async (req, res) => {
  try {
    const [offers, empleados, empleadores] = await Promise.all([
      apiService.getOffers(1, 1000),
      apiService.getUsers(1, 1000, 'empleado'),
      apiService.getUsers(1, 1000, 'empleador'),
    ])
    res.render("pages/admin/contracts/create", {
      title: "Crear Contrato",
      activeMenu: "contracts",
      error: null,
      formData: {},
      offers: offers.data || [],
      empleados: empleados.data || [],
      empleadores: empleadores.data || [],
    })
  } catch (error) {
    console.error("Error al cargar datos de contrato:", error.message)
    res.render("pages/admin/contracts/create", {
      title: "Crear Contrato",
      activeMenu: "contracts",
      error: "No se pudieron cargar listas para el formulario",
      formData: {},
      offers: [], empleados: [], empleadores: [],
    })
  }
})

router.post("/contratos", async (req, res) => {
  try {
    await apiService.createContract(req.body)
    res.redirect("/admin/contratos?success=Contrato creado exitosamente")
  } catch (error) {
    console.error("Error al crear contrato:", error?.response?.data || error.message)
    res.status(400).render("pages/admin/contracts/create", {
      title: "Crear Contrato",
      activeMenu: "contracts",
      error: (error?.response?.data?.message || error.message || "No se pudo crear el contrato"),
      formData: req.body,
      offers,
      empleados,
      empleadores,
    })
  }
})

router.get("/contratos/:id/editar", async (req, res) => {
  try {
    const [contract, offers, empleados, empleadores] = await Promise.all([
      apiService.getContractById(req.params.id),
      apiService.getOffers(1, 1000),
      apiService.getUsers(1, 1000, 'empleado'),
      apiService.getUsers(1, 1000, 'empleador'),
    ])
    res.render("pages/admin/contracts/edit", {
      title: "Editar Contrato",
      activeMenu: "contracts",
      contract: contract.data || contract,
      offers: offers.data || [],
      empleados: empleados.data || [],
      empleadores: empleadores.data || [],
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
    res.render("pages/admin/contracts/edit", {
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

// Detalle de contrato
router.get("/contratos/:id", async (req, res) => {
  try {
    const contract = await apiService.getContractById(req.params.id)
    res.render("pages/admin/contracts/show", {
      title: "Detalle de Contrato",
      activeMenu: "contracts",
      contract: contract.data || contract,
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener contrato:", error.message)
    res.redirect("/admin/contratos?error=" + encodeURIComponent(error.message))
  }
})

// ===== RUTAS DE POSTULACIONES =====
router.get("/postulaciones", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const { q = "", estado = "" } = req.query

    const resp = await apiService.getApplyments(1, 1000)
    let list = resp.data || []

    const qLower = q.toString().toLowerCase()
    if (qLower) {
      list = list.filter(a =>
        ((a.servicio && a.servicio.nombreServicio) || "").toLowerCase().includes(qLower) ||
        ((a.empleado && a.empleado.nombre) || "").toLowerCase().includes(qLower)
      )
    }
    if (estado) list = list.filter(a => a.estado === estado)

    const total = list.length
    const start = (page - 1) * limit
    const end = start + limit
    const pageItems = list.slice(start, end)

    res.render("pages/admin/applyments/index", {
      title: "Gestión de Postulaciones",
      activeMenu: "applyments",
      applyments: pageItems,
      q, estado,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener postulaciones:", error.message)
    res.render("pages/admin/applyments/index", {
      title: "Gestión de Postulaciones",
      activeMenu: "applyments",
      applyments: [],
      q: req.query.q || "", estado: req.query.estado || "",
      pagination: { currentPage: 1, totalPages: 0, total: 0, limit: Number.parseInt(req.query.limit) || 10 },
      error: error.message,
    })
  }
})

router.get("/postulaciones/crear", async (req, res) => {
  try {
    const [offers, empleados] = await Promise.all([
      apiService.getOffers(1, 1000),
      apiService.getUsers(1, 1000, 'empleado'),
    ])
    res.render("pages/admin/applyments/create", {
      title: "Crear Postulación",
      activeMenu: "applyments",
      error: null,
      formData: {},
      offers: offers.data || [],
      empleados: empleados.data || [],
    })
  } catch (error) {
    console.error("Error al cargar datos de postulación:", error.message)
    res.render("pages/admin/applyments/create", {
      title: "Crear Postulación",
      activeMenu: "applyments",
      error: "No se pudieron cargar listas para el formulario",
      formData: {},
      offers: [], empleados: [],
    })
  }
})

router.post("/postulaciones", async (req, res) => {
  try {
    await apiService.createApplyment(req.body)
    res.redirect("/admin/postulaciones?success=Postulación creada exitosamente")
  } catch (error) {
    console.error("Error al crear postulación:", error.message)
    res.render("pages/admin/applyments/create", {
      title: "Crear Postulación",
      activeMenu: "applyments",
      error: error.message,
      formData: req.body,
    })
  }
})

router.get("/postulaciones/:id/editar", async (req, res) => {
  try {
    const [applyment, offers, empleados] = await Promise.all([
      apiService.getApplymentById(req.params.id),
      apiService.getOffers(1, 1000),
      apiService.getUsers(1, 1000, 'empleado'),
    ])
    res.render("pages/admin/applyments/edit", {
      title: "Editar Postulación",
      activeMenu: "applyments",
      applyment: applyment.data || applyment,
      offers: offers.data || [],
      empleados: empleados.data || [],
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
    res.render("pages/admin/applyments/edit", {
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

// Detalle de postulación
router.get("/postulaciones/:id", async (req, res) => {
  try {
    const applyment = await apiService.getApplymentById(req.params.id)
    res.render("pages/admin/applyments/show", {
      title: "Detalle de Postulación",
      activeMenu: "applyments",
      applyment: applyment.data || applyment,
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener postulación:", error.message)
    res.redirect("/admin/postulaciones?error=" + encodeURIComponent(error.message))
  }
})

// ===== RUTAS DE REPORTES =====
router.get("/reportes", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const { q = "", estado = "", tipo = "", prioridad = "" } = req.query

    const resp = await apiService.getReports(1, 1000)
    let list = resp.data || []

    const qLower = q.toString().toLowerCase()
    if (qLower) {
      list = list.filter(r =>
        (r.titulo || "").toLowerCase().includes(qLower) ||
        ((r.usuario && r.usuario.nombre) || "").toLowerCase().includes(qLower) ||
        (r.descripcion || "").toLowerCase().includes(qLower)
      )
    }
    if (estado) list = list.filter(r => r.estado === estado)
    if (tipo) list = list.filter(r => r.tipo === tipo)
    if (prioridad) list = list.filter(r => r.prioridad === prioridad)

    const total = list.length
    const start = (page - 1) * limit
    const end = start + limit
    const pageItems = list.slice(start, end)

    res.render("pages/admin/reports/index", {
      title: "Gestión de Reportes",
      activeMenu: "reports",
      reports: pageItems,
      q, estado, tipo, prioridad,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener reportes:", error.message)
    res.render("pages/admin/reports/index", {
      title: "Gestión de Reportes",
      activeMenu: "reports",
      reports: [],
      q: req.query.q || "", estado: req.query.estado || "", tipo: req.query.tipo || "", prioridad: req.query.prioridad || "",
      pagination: { currentPage: 1, totalPages: 0, total: 0, limit: Number.parseInt(req.query.limit) || 10 },
      error: error.message,
    })
  }
})

router.get("/reportes/crear", async (req, res) => {
  try {
    const users = await apiService.getUsers(1, 1000)
    res.render("pages/admin/reports/create", {
      title: "Crear Reporte",
      activeMenu: "reports",
      error: null,
      formData: {},
      users: users.data || [],
    })
  } catch (error) {
    console.error("Error al cargar usuarios para reporte:", error.message)
    res.render("pages/admin/reports/create", {
      title: "Crear Reporte",
      activeMenu: "reports",
      error: "No se pudo cargar la lista de usuarios",
      formData: {},
      users: [],
    })
  }
})

router.post("/reportes", async (req, res) => {
  try {
    await apiService.createReport(req.body)
    res.redirect("/admin/reportes?success=Reporte creado exitosamente")
  } catch (error) {
    console.error("Error al crear reporte:", error.message)
    res.render("pages/admin/reports/create", {
      title: "Crear Reporte",
      activeMenu: "reports",
      error: error.message,
      formData: req.body,
    })
  }
})

router.get("/reportes/:id/editar", async (req, res) => {
  try {
    const [report, users] = await Promise.all([
      apiService.getReportById(req.params.id),
      apiService.getUsers(1, 1000),
    ])
    res.render("pages/admin/reports/edit", {
      title: "Editar Reporte",
      activeMenu: "reports",
      report: report.data || report,
      users: users.data || [],
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
    res.render("pages/admin/reports/edit", {
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

// Detalle de reporte
router.get("/reportes/:id", async (req, res) => {
  try {
    const report = await apiService.getReportById(req.params.id)
    res.render("pages/admin/reports/show", {
      title: "Detalle de Reporte",
      activeMenu: "reports",
      report: report.data || report,
      error: null,
    })
  } catch (error) {
    console.error("Error al obtener reporte:", error.message)
    res.redirect("/admin/reportes?error=" + encodeURIComponent(error.message))
  }
})

export default router