<template>
  <div class="detalle-cliente">
    <!-- Loading state -->
    <div v-if="cargandoCliente" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información del cliente...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="!cliente" class="error-container">
      <i class="fas fa-user-slash"></i>
      <h3>Cliente no encontrado</h3>
      <p>El cliente solicitado no existe o ha sido eliminado.</p>
      <button @click="$router.push('/')" class="btn btn-primary">
        <i class="fas fa-arrow-left"></i>
        Volver a la Lista
      </button>
    </div>

    <!-- Contenido principal -->
    <div v-else class="cliente-content">
      <!-- Header del cliente -->
      <div class="cliente-header">
        <div class="cliente-info">
          <div class="cliente-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="cliente-datos">
            <h2 class="cliente-nombre">{{ cliente.nombres }} {{ cliente.apellidos }}</h2>
            <p class="cliente-cedula">
              <i class="fas fa-id-card"></i>
              Cédula: {{ cliente.cedula }}
            </p>
            <div class="cliente-meta">
              <span v-if="cliente.telefono" class="meta-item">
                <i class="fas fa-phone"></i>
                {{ cliente.telefono }}
              </span>
              <span v-if="cliente.direccion" class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                {{ cliente.direccion }}
              </span>
            </div>
          </div>
        </div>

        <div class="cliente-stats">
          <div class="stat-card">
            <div class="stat-number">{{ porcinos.length }}</div>
            <div class="stat-label">
              <i class="fas fa-pig"></i>
              Porcinos
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ pesoTotal }} kg</div>
            <div class="stat-label">
              <i class="fas fa-weight"></i>
              Peso Total
            </div>
          </div>
        </div>
      </div>

      <!-- Navegación de pestañas -->
      <nav class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="tabActiva = tab.id"
          :class="['tab-button', { 'active': tabActiva === tab.id }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </button>
      </nav>

      <!-- Contenido de pestañas -->
      <div class="tab-content">
        <!-- Pestaña: Datos del Cliente -->
        <div v-show="tabActiva === 'datos'" class="tab-panel">
          <div class="panel-header">
            <h3>
              <i class="fas fa-user-edit"></i>
              Información del Cliente
            </h3>
            <div class="panel-actions">
              <button @click="modoEdicion = !modoEdicion" class="btn btn-secondary">
                <i :class="modoEdicion ? 'fas fa-times' : 'fas fa-edit'"></i>
                {{ modoEdicion ? 'Cancelar' : 'Editar' }}
              </button>
              <button 
                v-if="modoEdicion"
                @click="guardarCliente"
                :disabled="!clienteModificado"
                class="btn btn-primary"
              >
                <i class="fas fa-save"></i>
                Guardar Cambios
              </button>
            </div>
          </div>

          <form @submit.prevent="guardarCliente" class="cliente-form">
            <div class="form-grid">
              <!-- Cédula -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-id-card"></i>
                  Cédula
                </label>
                <input
                  v-model="clienteEditado.cedula"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="10"
                >
              </div>

              <!-- Nombres -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user"></i>
                  Nombres
                </label>
                <input
                  v-model="clienteEditado.nombres"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="50"
                >
              </div>

              <!-- Apellidos -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user"></i>
                  Apellidos
                </label>
                <input
                  v-model="clienteEditado.apellidos"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="50"
                >
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-phone"></i>
                  Teléfono
                </label>
                <input
                  v-model="clienteEditado.telefono"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="20"
                >
              </div>

              <!-- Dirección -->
              <div class="form-group span-full">
                <label class="form-label">
                  <i class="fas fa-map-marker-alt"></i>
                  Dirección
                </label>
                <input
                  v-model="clienteEditado.direccion"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="100"
                >
              </div>
            </div>
          </form>
        </div>

        <!-- Pestaña: Porcinos -->
        <div v-show="tabActiva === 'porcinos'" class="tab-panel">
          <div class="panel-header">
            <h3>
              <i class="fas fa-pig"></i>
              Porcinos del Cliente
            </h3>
            <div class="panel-actions">
              <button @click="abrirModalPorcino()" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Nuevo Porcino
              </button>
            </div>
          </div>

          <!-- Lista de porcinos -->
          <div v-if="porcinos.length === 0" class="empty-state">
            <i class="fas fa-pig"></i>
            <h4>No hay porcinos registrados</h4>
            <p>Comienza agregando el primer porcino para este cliente.</p>
            <button @click="abrirModalPorcino()" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Agregar Primer Porcino
            </button>
          </div>

          <div v-else class="porcinos-grid">
            <div 
              v-for="porcino in porcinos" 
              :key="porcino._id || porcino.id"
              class="porcino-card"
            >
              <div class="card-header">
                <h4 class="porcino-id">{{ porcino.identificacion }}</h4>
                <div class="card-actions">
                  <button 
                    @click="abrirModalPorcino(porcino)"
                    class="btn btn-sm btn-outline-secondary"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="confirmarEliminarPorcino(porcino)"
                    class="btn btn-sm btn-outline-danger"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="porcino-info">
                  <div class="info-item">
                    <span class="label">Raza:</span>
                    <span class="value raza-badge" :class="'raza-' + porcino.raza">
                      {{ getRazaNombre(porcino.raza) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">Edad:</span>
                    <span class="value">{{ porcino.edad }} meses</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Peso:</span>
                    <span class="value weight">{{ porcino.peso }} kg</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Alimentación:</span>
                    <span class="value">{{ getAlimentacionNombre(porcino.alimentacionId) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña: Alimentaciones -->
        <div v-show="tabActiva === 'alimentacion'" class="tab-panel">
          <div class="panel-header">
            <h3>
              <i class="fas fa-apple-alt"></i>
              Gestión de Alimentaciones
            </h3>
            <div class="panel-actions">
              <button @click="abrirModalAlimentacion()" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Nueva Alimentación
              </button>
            </div>
          </div>

          <!-- Lista de alimentaciones -->
          <div v-if="alimentaciones.length === 0" class="empty-state">
            <i class="fas fa-apple-alt"></i>
            <h4>No hay alimentaciones registradas</h4>
            <p>Las alimentaciones son necesarias para crear porcinos.</p>
            <button @click="abrirModalAlimentacion()" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Agregar Primera Alimentación
            </button>
          </div>

          <div v-else class="alimentaciones-list">
            <div 
              v-for="alimentacion in alimentaciones" 
              :key="alimentacion._id || alimentacion.id"
              class="alimentacion-card"
            >
              <div class="card-content">
                <h4 class="alimentacion-name">{{ alimentacion.descripcion }}</h4>
                <p class="alimentacion-dosis">
                  <i class="fas fa-prescription-bottle"></i>
                  {{ alimentacion.dosis || 'Dosis no especificada' }}
                </p>
              </div>
              <div class="card-actions">
                <button 
                  @click="abrirModalAlimentacion(alimentacion)"
                  class="btn btn-sm btn-outline-secondary"
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="confirmarEliminarAlimentacion(alimentacion)"
                  class="btn btn-sm btn-outline-danger"
                  title="Eliminar"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ModalPorcino 
      v-if="mostrarModalPorcino"
      :porcino="porcinoSeleccionado"
      :cliente-id="clienteId"
      :alimentaciones="alimentaciones"
      @guardar="guardarPorcino"
      @cerrar="cerrarModalPorcino"
    />

    <ModalAlimentacion 
      v-if="mostrarModalAlimentacion"
      :alimentacion="alimentacionSeleccionada"
      @guardar="guardarAlimentacion"
      @cerrar="cerrarModalAlimentacion"
    />

    <ModalConfirmacion 
      v-if="mostrarModalConfirmacion"
      :titulo="confirmacion.titulo"
      :mensaje="confirmacion.mensaje"
      :tipo="confirmacion.tipo"
      @confirmar="ejecutarConfirmacion"
      @cancelar="cerrarModalConfirmacion"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { 
  clienteService, 
  porcinoService, 
  alimentacionService,
  getRazaNombre
} from '@/services/apiService'
import { useGlobalStore } from '@/stores/global'
import ModalPorcino from '@/components/ModalPorcino.vue'
import ModalAlimentacion from '@/components/ModalAlimentacion.vue'
import ModalConfirmacion from '@/components/ModalConfirmacion.vue'

export default {
  name: 'DetalleCliente',
  components: {
    ModalPorcino,
    ModalAlimentacion,
    ModalConfirmacion
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const globalStore = useGlobalStore()

    // Estado principal
    const cliente = ref(null)
    const porcinos = ref([])
    const alimentaciones = ref([])
    const cargandoCliente = ref(false)

    // Estado de pestañas
    const tabActiva = ref('datos')
    const tabs = computed(() => [
      { id: 'datos', label: 'Datos del Cliente', icon: 'fas fa-user-edit' },
      { id: 'porcinos', label: 'Porcinos', icon: 'fas fa-pig', count: porcinos.value.length },
      { id: 'alimentacion', label: 'Alimentaciones', icon: 'fas fa-apple-alt', count: alimentaciones.value.length }
    ])

    // Estado de edición de cliente
    const modoEdicion = ref(false)
    const clienteEditado = reactive({
      cedula: '',
      nombres: '',
      apellidos: '',
      direccion: '',
      telefono: ''
    })

    // Estado de modales
    const mostrarModalPorcino = ref(false)
    const porcinoSeleccionado = ref(null)
    const mostrarModalAlimentacion = ref(false)
    const alimentacionSeleccionada = ref(null)
    const mostrarModalConfirmacion = ref(false)
    const confirmacion = ref({})

    // Computed properties
    const clienteId = computed(() => props.id)
    const pesoTotal = computed(() => {
      return porcinos.value.reduce((total, porcino) => total + (porcino.peso || 0), 0)
    })
    const clienteModificado = computed(() => {
      if (!cliente.value) return false
      return Object.keys(clienteEditado).some(key => 
        clienteEditado[key] !== (cliente.value[key] || '')
      )
    })

    // Métodos principales - aquí iría toda la lógica del script anterior
    // [Todos los métodos del script de DetalleCliente_parte1.vue]

    return {
      // Todos los returns del setup anterior
    }
  }
}
</script>


<style scoped>
.detalle-cliente {
  max-width: 100%;
}

/* Loading & Error states */
.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.loading-container .spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-container i {
  font-size: 4rem;
  color: var(--gray-300);
  margin-bottom: 1rem;
}

.error-container h3 {
  color: var(--gray-600);
  margin-bottom: 0.5rem;
}

.error-container p {
  color: var(--gray-500);
  margin-bottom: 2rem;
}

/* Header del cliente */
.cliente-header {
  background: linear-gradient(135deg, var(--white), var(--gray-50));
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.cliente-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 2rem;
}

.cliente-datos h2 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1.75rem;
  font-weight: 600;
}

.cliente-cedula {
  margin: 0 0 0.75rem 0;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}

.cliente-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-500);
  font-size: 0.875rem;
}

.cliente-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  min-width: 120px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Navegación de pestañas */
.tabs-nav {
  display: flex;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
  overflow: hidden;
}

.tab-button {
  flex: 1;
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  background: var(--gray-50);
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  background: var(--gray-50);
  border-bottom-color: var(--primary-color);
}

.tab-count {
  background: var(--primary-color);
  color: var(--white);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
}

.tab-button.active .tab-count {
  background: var(--white);
  color: var(--primary-color);
}

/* Contenido de pestañas */
.tab-content {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.tab-panel {
  padding: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.panel-header h3 {
  margin: 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
}

.panel-actions {
  display: flex;
  gap: 1rem;
}

/* Formulario de cliente */
.cliente-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.span-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-control:disabled {
  background: var(--gray-50);
  color: var(--gray-600);
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-500);
}

.empty-state i {
  font-size: 3rem;
  color: var(--gray-300);
  margin-bottom: 1rem;
}

.empty-state h4 {
  margin-bottom: 0.5rem;
  color: var(--gray-600);
}

.empty-state p {
  margin-bottom: 2rem;
}

/* Grid de porcinos */
.porcinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.porcino-card {
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all 0.3s;
}

.porcino-card:hover {
  box-shadow: var(--box-shadow);
  transform: translateY(-2px);
}

.porcino-card .card-header {
  background: var(--gray-50);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-200);
}

.porcino-id {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.porcino-card .card-body {
  padding: 1rem;
}

.porcino-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-weight: 500;
  color: var(--gray-600);
}

.info-item .value {
  font-weight: 600;
  color: var(--gray-800);
}

.raza-badge {
  background: var(--primary-color);
  color: var(--white);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.raza-1 { background: #28a745; } /* York - Verde */
.raza-2 { background: #007bff; } /* Hampshire - Azul */
.raza-3 { background: #fd7e14; } /* Duroc - Naranja */

.weight {
  color: var(--success-color);
  font-weight: 700;
}

/* Lista de alimentaciones */
.alimentaciones-list {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alimentacion-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  transition: all 0.3s;
}

.alimentacion-card:hover {
  box-shadow: var(--box-shadow);
  border-color: var(--primary-color);
}

.card-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1.125rem;
}

.alimentacion-dosis {
  margin: 0;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .cliente-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .cliente-info {
    flex-direction: column;
    text-align: center;
  }

  .cliente-stats {
    justify-content: center;
  }

  .tabs-nav {
    flex-direction: column;
  }

  .tab-button {
    justify-content: flex-start;
    text-align: left;
  }

  .panel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .panel-actions {
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .porcinos-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .alimentacion-card {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .card-actions {
    justify-content: center;
  }
}

/* Animaciones */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-panel {
  animation: fadeIn 0.3s ease-out;
}
</style>