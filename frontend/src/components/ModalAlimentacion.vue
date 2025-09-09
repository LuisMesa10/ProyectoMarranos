<template>
  <div class="modal-overlay" @click.self="cerrar">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-apple-alt"></i>
          {{ alimentacion ? 'Editar Alimentación' : 'Nueva Alimentación' }}
        </h3>
        <button @click="cerrar" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="guardar" class="modal-body">
        <!-- Descripción -->
        <div class="form-group">
          <label for="descripcion" class="form-label required">
            <i class="fas fa-tag"></i>
            Descripción del Alimento
          </label>
          <input
            id="descripcion"
            type="text"
            v-model="form.descripcion"
            :class="['form-control', { 'error': errores.descripcion }]"
            placeholder="Ej: Concentrado de Crecimiento Premium"
            maxlength="200"
            @input="validarCampo('descripcion')"
          >
          <div v-if="errores.descripcion" class="error-message">
            {{ errores.descripcion }}
          </div>
          <div class="form-help">
            <i class="fas fa-info-circle"></i>
            Sea específico: tipo de alimento, marca, propósito (crecimiento, engorde, etc.)
          </div>
        </div>

        <!-- Dosis -->
        <div class="form-group">
          <label for="dosis" class="form-label">
            <i class="fas fa-prescription-bottle"></i>
            Dosis Recomendada
          </label>
          <input
            id="dosis"
            type="text"
            v-model="form.dosis"
            class="form-control"
            placeholder="Ej: 2.5 kg por día, 3 veces al día"
            maxlength="100"
          >
          <div class="form-help">
            <i class="fas fa-lightbulb"></i>
            Incluya cantidad, frecuencia y cualquier instrucción especial
          </div>
        </div>

        <!-- Ejemplos de alimentaciones comunes -->
        <div class="examples-section">
          <h4>
            <i class="fas fa-list"></i>
            Ejemplos Comunes
          </h4>
          <div class="examples-grid">
            <button 
              v-for="ejemplo in ejemplosAlimentacion" 
              :key="ejemplo.id"
              type="button"
              @click="aplicarEjemplo(ejemplo)"
              class="example-button"
            >
              <div class="example-title">{{ ejemplo.descripcion }}</div>
              <div class="example-dosis">{{ ejemplo.dosis }}</div>
            </button>
          </div>
        </div>

        <!-- Vista previa -->
        <div v-if="form.descripcion.trim()" class="preview-card">
          <h4>
            <i class="fas fa-eye"></i>
            Vista Previa
          </h4>
          <div class="preview-content">
            <div class="preview-main">
              <strong>{{ form.descripcion }}</strong>
            </div>
            <div v-if="form.dosis.trim()" class="preview-dosis">
              <i class="fas fa-prescription-bottle"></i>
              {{ form.dosis }}
            </div>
            <div v-else class="preview-dosis no-dosis">
              <i class="fas fa-exclamation-triangle"></i>
              Sin dosis especificada
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
            {{ guardando ? 'Guardando...' : 'Guardar Alimentación' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { validaciones } from '@/services/apiService'

export default {
  name: 'ModalAlimentacion',
  props: {
    alimentacion: {
      type: Object,
      default: null
    }
  },
  emits: ['guardar', 'cerrar'],
  setup(props, { emit }) {
    // Estado del formulario
    const form = reactive({
      descripcion: '',
      dosis: ''
    })

    // Estado de validación
    const errores = reactive({})
    const guardando = ref(false)

    // Ejemplos de alimentaciones comunes
    const ejemplosAlimentacion = ref([
      {
        id: 1,
        descripcion: 'Concentrado de Crecimiento Premium',
        dosis: '2.5 kg por día'
      },
      {
        id: 2,
        descripcion: 'Alimento Balanceado Engorde',
        dosis: '3.0 kg por día'
      },
      {
        id: 3,
        descripcion: 'Suplemento Nutricional Vitamínico',
        dosis: '1.8 kg por día'
      },
      {
        id: 4,
        descripcion: 'Concentrado Inicial Lechones',
        dosis: '1.2 kg por día dividido en 4 tomas'
      },
      {
        id: 5,
        descripcion: 'Alimento Reproductoras Gestación',
        dosis: '2.8 kg por día en 2 tomas'
      },
      {
        id: 6,
        descripcion: 'Concentrado Finalización',
        dosis: '3.5 kg por día hasta sacrificio'
      }
    ])

    // Computed
    const formularioValido = computed(() => {
      return !errores.descripcion && 
             form.descripcion.trim()
    })

    // Métodos de validación
    const validarCampo = (campo) => {
      const valor = form[campo]?.trim()

      switch (campo) {
        case 'descripcion':
          errores.descripcion = validaciones.descripcionAlimentacion(valor)
          break
      }
    }

    const validarFormulario = () => {
      validarCampo('descripcion')
      return formularioValido.value
    }

    // Métodos principales
    const inicializarFormulario = () => {
      if (props.alimentacion) {
        // Modo edición - cargar datos existentes
        form.descripcion = props.alimentacion.descripcion || ''
        form.dosis = props.alimentacion.dosis || ''
      } else {
        // Modo creación - limpiar formulario
        form.descripcion = ''
        form.dosis = ''
      }

      // Limpiar errores
      Object.keys(errores).forEach(key => {
        delete errores[key]
      })
    }

    const aplicarEjemplo = (ejemplo) => {
      form.descripcion = ejemplo.descripcion
      form.dosis = ejemplo.dosis

      // Validar después de aplicar ejemplo
      validarCampo('descripcion')

      // Focus en el campo de descripción para que el usuario pueda editarlo
      setTimeout(() => {
        const input = document.getElementById('descripcion')
        if (input) {
          input.focus()
          input.select() // Seleccionar todo el texto para fácil edición
        }
      }, 100)
    }

    const guardar = async () => {
      if (!validarFormulario()) {
        return
      }

      guardando.value = true

      try {
        // Preparar datos para enviar
        const alimentacionData = {
          descripcion: form.descripcion.trim(),
          dosis: form.dosis.trim()
        }

        // Emitir evento de guardado
        emit('guardar', alimentacionData)
      } catch (error) {
        console.error('Error al guardar alimentación:', error)
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
    watch(() => props.alimentacion, () => {
      inicializarFormulario()
    }, { immediate: true })

    // Lifecycle
    onMounted(() => {
      // Agregar listener para tecla ESC
      document.addEventListener('keydown', handleEscKey)

      // Auto-focus en el primer campo
      setTimeout(() => {
        const firstInput = document.getElementById('descripcion')
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
      ejemplosAlimentacion,
      formularioValido,
      validarCampo,
      aplicarEjemplo,
      guardar,
      cerrar
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
  font-style: italic;
}

/* Sección de ejemplos */
.examples-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-200);
}

.examples-section h4 {
  margin: 0 0 1rem 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.example-button {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  padding: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s;
}

.example-button:hover {
  border-color: var(--primary-color);
  box-shadow: var(--box-shadow);
  transform: translateY(-2px);
}

.example-title {
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.example-dosis {
  color: var(--gray-600);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.example-dosis::before {
  content: '📏';
  font-size: 0.7rem;
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-main {
  font-size: 1.125rem;
  color: var(--gray-800);
}

.preview-dosis {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.9rem;
}

.preview-dosis.no-dosis {
  color: var(--warning-color);
  font-style: italic;
}

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

  .examples-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }

  .examples-section {
    padding: 1rem;
  }
}
</style>