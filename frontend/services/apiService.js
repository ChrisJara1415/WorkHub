import apiClient from "../config/api.js"

class ApiService {
  // Usuarios
  async getUsers(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/workhubApi/clientes?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`)
    }
  }

  async getUserById(id) {
    try {
      const response = await apiClient.get(`/workhubApi/clientes/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`)
    }
  }

  async createUser(userData) {
    try {
      const response = await apiClient.post("/workhubApi/clientes", userData)
      return response.data
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`)
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/workhubApi/clientes/${id}`, userData)
      return response.data
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`)
    }
  }

  async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/workhubApi/clientes/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`)
    }
  }

  // Ofertas
  async getOffers(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/workhubApi/ofertas?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener ofertas: ${error.message}`)
    }
  }

  async getOfferById(id) {
    try {
      const response = await apiClient.get(`/workhubApi/ofertas/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener oferta: ${error.message}`)
    }
  }

  async createOffer(offerData) {
    try {
      const response = await apiClient.post("/workhubApi/ofertas", offerData)
      return response.data
    } catch (error) {
      throw new Error(`Error al crear oferta: ${error.message}`)
    }
  }

  async updateOffer(id, offerData) {
    try {
      const response = await apiClient.put(`/workhubApi/ofertas/${id}`, offerData)
      return response.data
    } catch (error) {
      throw new Error(`Error al actualizar oferta: ${error.message}`)
    }
  }

  async deleteOffer(id) {
    try {
      const response = await apiClient.delete(`/workhubApi/ofertas/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al eliminar oferta: ${error.message}`)
    }
  }

  // Contratos
  async getContracts(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/workhubApi/contratos?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener contratos: ${error.message}`)
    }
  }

  async getContractById(id) {
    try {
      const response = await apiClient.get(`/workhubApi/contratos/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener contrato: ${error.message}`)
    }
  }

  async createContract(contractData) {
    try {
      const response = await apiClient.post("/workhubApi/contratos", contractData)
      return response.data
    } catch (error) {
      throw new Error(`Error al crear contrato: ${error.message}`)
    }
  }

  async updateContract(id, contractData) {
    try {
      const response = await apiClient.put(`/workhubApi/contratos/${id}`, contractData)
      return response.data
    } catch (error) {
      throw new Error(`Error al actualizar contrato: ${error.message}`)
    }
  }

  async deleteContract(id) {
    try {
      const response = await apiClient.delete(`/workhubApi/contratos/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al eliminar contrato: ${error.message}`)
    }
  }

  // Postulaciones
  async getApplyments(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/workhubApi/postulaciones?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener postulaciones: ${error.message}`)
    }
  }

  async getApplymentById(id) {
    try {
      const response = await apiClient.get(`/workhubApi/postulaciones/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener postulación: ${error.message}`)
    }
  }

  async createApplyment(applymentData) {
    try {
      const response = await apiClient.post("/workhubApi/postulaciones", applymentData)
      return response.data
    } catch (error) {
      throw new Error(`Error al crear postulación: ${error.message}`)
    }
  }

  async updateApplyment(id, applymentData) {
    try {
      const response = await apiClient.put(`/workhubApi/postulaciones/${id}`, applymentData)
      return response.data
    } catch (error) {
      throw new Error(`Error al actualizar postulación: ${error.message}`)
    }
  }

  async deleteApplyment(id) {
    try {
      const response = await apiClient.delete(`/workhubApi/postulaciones/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al eliminar postulación: ${error.message}`)
    }
  }

  // Reportes
  async getReports(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/workhubApi/reportes?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener reportes: ${error.message}`)
    }
  }

  async getReportById(id) {
    try {
      const response = await apiClient.get(`/workhubApi/reportes/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al obtener reporte: ${error.message}`)
    }
  }

  async createReport(reportData) {
    try {
      const response = await apiClient.post("/workhubApi/reportes", reportData)
      return response.data
    } catch (error) {
      throw new Error(`Error al crear reporte: ${error.message}`)
    }
  }

  async updateReport(id, reportData) {
    try {
      const response = await apiClient.put(`/workhubApi/reportes/${id}`, reportData)
      return response.data
    } catch (error) {
      throw new Error(`Error al actualizar reporte: ${error.message}`)
    }
  }

  async deleteReport(id) {
    try {
      const response = await apiClient.delete(`/workhubApi/reportes/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error al eliminar reporte: ${error.message}`)
    }
  }

  // Estadísticas para el dashboard
  async getDashboardStats() {
    try {
      const [users, offers, contracts, applyments, reports] = await Promise.all([
        this.getUsers(1, 1),
        this.getOffers(1, 1),
        this.getContracts(1, 1),
        this.getApplyments(1, 1),
        this.getReports(1, 1),
      ])

      return {
        totalUsers: users.total || 0,
        totalOffers: offers.total || 0,
        totalContracts: contracts.total || 0,
        totalApplyments: applyments.total || 0,
        totalReports: reports.total || 0,
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error.message)
      return {
        totalUsers: 0,
        totalOffers: 0,
        totalContracts: 0,
        totalApplyments: 0,
        totalReports: 0,
      }
    }
  }
}

export default new ApiService()