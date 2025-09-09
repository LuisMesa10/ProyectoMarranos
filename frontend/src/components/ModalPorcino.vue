<template>
  <div class="modal-overlay" @click.self="cerrar">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-pig"></i>
          {{ porcino ? 'Editar Porcino' : 'Nuevo Porcino' }}
        </h3>
        <button @click="cerrar" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="guardar" class="modal-body">
        <!-- Identificación -->
        <div class="form-group">
          <label for="identificacion" class="form-label required">
            <i class="fas fa-tag"></i>
            Identificación
          </label>
          <input
            id="identificacion"
            type="text"
            v-model="form.identificacion"
            :class="['form-control', { 'error': errores.identificacion }]"
            placeholder="Ej: P001, PORCINO-001"
            maxlength="20"
            @input="validarCampo('identificacion')"
          >
          <div v-if="errores.identificacion" class="error-message">
            {{ errores.identificacion }}
          </div>
        </div>

        <!-- Raza -->
        <div class="form-group">
          <label for="raza" class="form-label required">
            <i class="fas fa-dna"></i>
            Raza
          </label>
          <select
            id="raza"
            v-model="form.raza"
            :class="['form-control', { 'error': errores.raza }]"
            @change="validarCampo('raza')"
          >
            <option value="">Seleccione una raza</option>
            <option value="1">York</option>
            <option value="2">Hampshire</option>
            <option value="3">Duroc</option>
          </select>
          <div v-if="errores.raza" class="error-message">
            {{ errores.raza }}
          </div>
        </div>

        <!-- Edad y Peso en la misma fila -->
        <div class="form-row">
          <div class="form-group">
            <label for="edad" class="form-label required">
              <i class="fas fa-calendar-alt"></i>
              Edad (meses)
            </label>
            <input
              id="edad"
              type="number"
              v-model="form.edad"
              :class="['form-control', { 'error': errores.edad }]"
              placeholder="0"
              min="0"
              max="120"
              @input="validarCampo('edad')"
            >
            <div v-if="errores.edad" class="error-message">
              {{ errores.edad }}
            </div>
          </div>

          <div class="form-group">
            <label for="peso" class="form-label required">
              <i class="fas fa-weight"></i>
              Peso (kg)
            </label>
            <input
              id="peso"
              type="number"
              v-model="form.peso"
              :class="['form-control', { 'error': errores.peso }]"
              placeholder="0.0"
              min="0"
              max="500"
              step="0.1"
              @input="validarCampo('peso')"
            >
            <div v-if="errores.peso" class="error-message">
              {{ errores.peso }}
            </div>
          </div>
        </div>

        <!-- Alimentación -->
        <div class="form-group">
          <label for="alimentacionId" class="form-label required">
            <i class="fas fa-apple-alt"></i>
            Alimentación
          </label>
          <select
            id="alimentacionId"
            v-model="form.alimentacionId"
            :class="['form-control', { 'error': errores.alimentacionId }]"
            @change="validarCampo('alimentacionId')"
          >
            <option value="">Seleccione una alimentación</option>
            <option 
              v-for="alimentacion in alimentaciones" 
              :key="alimentacion._id || alimentacion.id"
              :value="alimentacion._id || alimentacion.id"
            >
              {{ alimentacion.descripcion }}
              <span v-if="alimentacion.dosis"> - {{ alimentacion.dosis }}</span>
            </option>
          </select>
          <div v-if="errores.alimentacionId" class="error-message">
            {{ errores.alimentacionId }}
          </div>
          <div v-if="alimentaciones.length === 0" class="form-help">
            <i class="fas fa-exclamation-triangle"></i>
            No hay alimentaciones disponibles. 
            <a href="#" @click.prevent="$emit('crearAlimentacion')" class="link">
              Crear una nueva alimentación
            </a>
          </div>
        </div>

        <!-- Vista previa de datos -->
        <div v-if="formularioValido" class="preview-card">
          <h4>
            <i class="fas fa-eye"></i>
            Vista Previa
          </h4>
          <div class="preview-content">
            <div class="preview-item">
              <strong>ID:</strong> {{ form.identificacion }}
            </div>
            <div class="preview-item">
              <strong>Raza:</strong> 
              <span :class="'raza-badge raza-' + form.raza">
                {{ getRazaNombre(parseInt(form.raza)) }}
              </span>
            </div>
            <div class="preview-item">
              <strong>Edad:</strong> {{ form.edad }} meses
            </div>
            <div class="preview-item">
              <strong>Peso:</strong> {{ form.peso }} kg
            </div>
            <div class="preview-item">
              <strong>Alimentación:</strong> {{ getAlimentacionNombre() }}
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="modal-footer">
          <button 
            type="button"
            @click="cerrar"
            class="btn btn-secondary"
          >
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="!formularioValido || guardando"
            class="btn btn-primary"
          >
            <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ guardando ? 'Guardando...' : 'Guardar Porcino' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { validaciones, getRazaNombre } from '@/services/apiService'

export default {
  name: 'ModalPorcino',
  props: {
    porcino: {
      type: Object,
      default: null
    },
    clienteId: {
      type: String,
      required: true
    },
    alimentaciones: {
      type: Array,
      default: () => []
    }
  },
  emits: ['guardar', 'cerrar', 'crearAlimentacion'],
  setup(props, { emit }) {
    // Estado del formulario
    const form = reactive({
      identificacion: '',
      raza: '',
      edad: '',
      peso: '',
      alimentacionId: ''
    })

    // Estado de validación
    const errores = reactive({})
    const guardando = ref(false)

    // Computed
    const formularioValido = computed(() => {
      return !errores.identificacion && 
             !errores.raza && 
             !errores.edad && 
             !errores.peso && 
             !errores.alimentacionId &&
             form.identificacion.trim() &&
             form.raza &&
             form.edad &&
             form.peso &&
             form.alimentacionId
    })

    // Métodos de validación
    const validarCampo = (campo) => {
      const valor = form[campo]?.toString().trim()

      switch (campo) {
        case 'identificacion':
          errores.identificacion = validaciones.identificacionPorcino(valor)
          break
        case 'raza':
          errores.raza = validaciones.raza(valor)
          break
        case 'edad':
          errores.edad = validaciones.edad(valor)
          break
        case 'peso':
          errores.peso = validaciones.peso(valor)
          break
        case 'alimentacionId':
          if (!valor) {
            errores.alimentacionId = 'Debe seleccionar una alimentación'
          } else {
            errores.alimentacionId = null
          }
          break
      }
    }

    const validarFormulario = () => {
      validarCampo('identificacion')
      validarCampo('raza')
      validarCampo('edad')
      validarCampo('peso')
      validarCampo('alimentacionId')

      return formularioValido.value
    }

    // Métodos auxiliares
    const getAlimentacionNombre = () => {
      if (!form.alimentacionId) return ''
      const alimentacion = props.alimentaciones.find(a => 
        (a._id === form.alimentacionId) || (a.id === form.alimentacionId)
      )
      return alimentacion ? alimentacion.descripcion : ''
    }

    // Métodos principales
    const inicializarFormulario = () => {
      if (props.porcino) {
        // Modo edición - cargar datos existentes
        form.identificacion = props.porcino.identificacion || ''
        form.raza = props.porcino.raza?.toString() || ''
        form.edad = props.porcino.edad?.toString() || ''
        form.peso = props.porcino.peso?.toString() || ''

        // Manejar alimentacionId que puede ser objeto o ID
        if (props.porcino.alimentacionId) {
          if (typeof props.porcino.alimentacionId === 'object') {
            form.alimentacionId = props.porcino.alimentacionId._id || props.porcino.alimentacionId.id
          } else {
            form.alimentacionId = props.porcino.alimentacionId
          }
        } else {
          form.alimentacionId = ''
        }
      } else {
        // Modo creación - limpiar formulario
        Object.keys(form).forEach(key => {
          form[key] = ''
        })
      }

      // Limpiar errores
      Object.keys(errores).forEach(key => {
        delete errores[key]
      })
    }

    const guardar = async () => {
      if (!validarFormulario()) {
        return
      }

      guardando.value = true

      try {
        // Preparar datos para enviar
        const porcinoData = {
          identificacion: form.identificacion.trim().toUpperCase(),
          raza: parseInt(form.raza),
          edad: parseInt(form.edad),
          peso: parseFloat(form.peso),
          alimentacionId: form.alimentacionId,
          clienteId: props.clienteId
        }

        // Emitir evento de guardado
        emit('guardar', porcinoData)
      } catch (error) {
        console.error('Error al guardar porcino:', error)
      } finally {
        guardando.value = false
      }
    }

    const cerrar = () => {
      emit('cerrar')
    }

    // Manejar tecla ESC
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        cerrar()
      }
    }

    // Watchers
    watch(() => props.porcino, () => {
      inicializarFormulario()
    }, { immediate: true })

    watch(() => props.alimentaciones, () => {
      // Si se actualiza la lista de alimentaciones y no hay una seleccionada,
      // seleccionar la primera disponible
      if (props.alimentaciones.length > 0 && !form.alimentacionId) {
        // Solo en modo creación
        if (!props.porcino) {
          form.alimentacionId = props.alimentaciones[0]._id || props.alimentaciones[0].id
        }
      }
    })

    // Lifecycle
    onMounted(() => {
      // Agregar listener para tecla ESC
      document.addEventListener('keydown', handleEscKey)

      // Auto-focus en el primer campo
      setTimeout(() => {
        const firstInput = document.getElementById('identificacion')
        if (firstInput) {
          firstInput.focus()
        }
      }, 100)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleEscKey)
    })

    return {
      form,
      errores,
      guardando,
      formularioValido,
      validarCampo,
      guardar,
      cerrar,
      getRazaNombre,
      getAlimentacionNombre
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.modal-title {
  margin: 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--gray-200);
  color: var(--gray-600);
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-label.required::after {
  content: '*';
  color: var(--danger-color);
  margin-left: 0.25rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(46, 125, 94, 0.1);
}

.form-control.error {
  border-color: var(--danger-color);
}

.form-control.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.error-message {
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message::before {
  content: '⚠';
  font-size: 0.75rem;
}

.form-help {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-help .link {
  color: var(--primary-color);
  text-decoration: none;
}

.form-help .link:hover {
  text-decoration: underline;
}

/* Vista previa */
.preview-card {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.preview-card h4 {
  margin: 0 0 1rem 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.preview-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.preview-item {
  font-size: 0.875rem;
}

.preview-item strong {
  color: var(--gray-700);
}

.raza-badge {
  background: var(--primary-color);
  color: var(--white);
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
}

.raza-1 { background: #28a745; } /* York - Verde */
.raza-2 { background: #007bff; } /* Hampshire - Azul */
.raza-3 { background: #fd7e14; } /* Duroc - Naranja */

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .preview-content {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }
}
</style>