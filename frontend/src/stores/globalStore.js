import {
  reactive
} from 'vue'
import {
  utilsService
} from '@/services/apiService'

// Store global usando Composition API
export const useGlobalStore = () => {
  const state = reactive({
    // Loading states
    isLoading: false,
    loadingMessage: '',

    // Notifications
    notifications: [],
    notificationId: 0,

    // Backend connection
    backendConnected: false,

    // Cache de datos
    clientesCache: [],
    alimentacionesCache: [],

    // Estados de formularios
    modalStates: {
      clienteModal: false,
      porcinoModal: false,
      alimentacionModal: false,
      confirmModal: false
    }
  })

  // Loading methods
  const setLoading = (loading, message = 'Cargando...') => {
    state.isLoading = loading
    state.loadingMessage = message
  }

  // Notification methods
  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = ++state.notificationId
    const notification = {
      id,
      message,
      type, // success, error, warning, info
      timestamp: Date.now()
    }

    state.notifications.push(notification)

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = state.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      state.notifications.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    state.notifications = []
  }

  // Modal methods CORREGIDOS
  const openModal = (modalName) => {
    if (modalName in state.modalStates) { // ✅ CORREGIDO
      state.modalStates[modalName] = true
    }
  }

  const closeModal = (modalName) => {
    if (modalName in state.modalStates) { // ✅ CORREGIDO
      state.modalStates[modalName] = false
    }
  }


  const closeAllModals = () => {
    Object.keys(state.modalStates).forEach(key => {
      state.modalStates[key] = false
    })
  }

  // Backend connection
  const checkBackendConnection = async () => {
    try {
      setLoading(true, 'Verificando conexión...')
      const connected = await utilsService.verificarConexion()
      state.backendConnected = connected

      if (connected) {
        showNotification('Conectado al servidor', 'success', 3000)
      } else {
        showNotification('Error de conexión con el servidor', 'error', 0)
      }

      return connected
    } catch (error) {
      console.error('[Backend Connection Error]:', error) // ✅ USAR la variable
      state.backendConnected = false
      showNotification('Error de conexión con el servidor', 'error', 0)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Cache methods
  const updateClientesCache = (clientes) => {
    state.clientesCache = clientes
  }

  const updateAlimentacionesCache = (alimentaciones) => {
    state.alimentacionesCache = alimentaciones
  }

  const getClienteFromCache = (id) => {
    return state.clientesCache.find(c => c._id === id)
  }

  const getAlimentacionFromCache = (id) => {
    return state.alimentacionesCache.find(a => a._id === id)
  }

  // Error handling helper
  const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
    console.error('[Global Store] API Error:', error)

    let message = defaultMessage
    if (error.message) {
      message = error.message
    }

    showNotification(message, 'error', 8000)
    setLoading(false)
  }

  // Success helper
  const handleSuccess = (message) => {
    showNotification(message, 'success', 4000)
  }

  return {
    // State
    ...state,

    // Loading
    setLoading,

    // Notifications
    showNotification,
    removeNotification,
    clearNotifications,

    // Modals
    openModal,
    closeModal,
    closeAllModals,

    // Backend
    checkBackendConnection,

    // Cache
    updateClientesCache,
    updateAlimentacionesCache,
    getClienteFromCache,
    getAlimentacionFromCache,

    // Helpers
    handleApiError,
    handleSuccess
  }
}

// Composable para usar en componentes
export default useGlobalStore
