<template>
  <div class="modal-overlay" @click.self="cerrar">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-user"></i>
          {{ cliente ? 'Editar Cliente' : 'Nuevo Cliente' }}
        </h3>
        <button @click="cerrar" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="guardar" class="modal-body">
        <!-- Cédula -->
        <div class="form-group">
          <label for="cedula" class="form-label required">
            <i class="fas fa-id-card"></i>
            Cédula
          </label>
          <input
            id="cedula"
            type="text"
            v-model="form.cedula"
            :class="['form-control', { 'error': errores.cedula }]"
            placeholder="Ingrese la cédula"
            maxlength="10"
            @input="validarCampo('cedula')"
          >
          <div v-if="errores.cedula" class="error-message">
            {{ errores.cedula }}
          </div>
        </div>

        <!-- Nombres -->
        <div class="form-group">
          <label for="nombres" class="form-label required">
            <i class="fas fa-user"></i>
            Nombres
          </label>
          <input
            id="nombres"
            type="text"
            v-model="form.nombres"
            :class="['form-control', { 'error': errores.nombres }]"
            placeholder="Ingrese los nombres"
            maxlength="50"
            @input="validarCampo('nombres')"
          >
          <div v-if="errores.nombres" class="error-message">
            {{ errores.nombres }}
          </div>
        </div>

        <!-- Apellidos -->
        <div class="form-group">
          <label for="apellidos" class="form-label required">
            <i class="fas fa-user"></i>
            Apellidos
          </label>
          <input
            id="apellidos"
            type="text"
            v-model="form.apellidos"
            :class="['form-control', { 'error': errores.apellidos }]"
            placeholder="Ingrese los apellidos"
            maxlength="50"
            @input="validarCampo('apellidos')"
          >
          <div v-if="errores.apellidos" class="error-message">
            {{ errores.apellidos }}
          </div>
        </div>

        <!-- Dirección -->
        <div class="form-group">
          <label for="direccion" class="form-label">
            <i class="fas fa-map-marker-alt"></i>
            Dirección
          </label>
          <input
            id="direccion"
            type="text"
            v-model="form.direccion"
            class="form-control"
            placeholder="Ingrese la dirección (opcional)"
            maxlength="100"
          >
        </div>

        <!-- Teléfono -->
        <div class="form-group">
          <label for="telefono" class="form-label">
            <i class="fas fa-phone"></i>
            Teléfono
          </label>
          <input
            id="telefono"
            type="text"
            v-model="form.telefono"
            :class="['form-control', { 'error': errores.telefono }]"
            placeholder="Ingrese el teléfono (opcional)"
            maxlength="20"
            @input="validarCampo('telefono')"
          >
          <div v-if="errores.telefono" class="error-message">
            {{ errores.telefono }}
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
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { validaciones } from '@/services/apiService'

export default {
  name: 'ModalCliente',
  props: {
    cliente: {
      type: Object,
      default: null
    }
  },
  emits: ['guardar', 'cerrar'],
  setup(props, { emit }) {
    // Estado del formulario
    const form = reactive({
      cedula: '',
      nombres: '',
      apellidos: '',
      direccion: '',
      telefono: ''
    })

    // Estado de validación
    const errores = reactive({})
    const guardando = ref(false)

    // Computed
    const formularioValido = computed(() => {
      return !errores.cedula &&
             !errores.nombres &&
             !errores.apellidos &&
             !errores.telefono &&
             form.cedula.trim() &&
             form.nombres.trim() &&
             form.apellidos.trim()
    })

    // Métodos de validación
    const validarCampo = (campo) => {
      const valor = form[campo]?.trim()

      switch (campo) {
        case 'cedula':
          errores.cedula = validaciones.cedula(valor)
          break
        case 'nombres':
          errores.nombres = validaciones.nombres(valor)
          break
        case 'apellidos':
          errores.apellidos = validaciones.apellidos(valor)
          break
        case 'telefono':
          errores.telefono = validaciones.telefono(valor)
          break
      }
    }

    const validarFormulario = () => {
      validarCampo('cedula')
      validarCampo('nombres')
      validarCampo('apellidos')
      validarCampo('telefono')

      return formularioValido.value
    }

    // Métodos principales
    const inicializarFormulario = () => {
      if (props.cliente) {
        // Modo edición - cargar datos existentes
        form.cedula = props.cliente.cedula || ''
        form.nombres = props.cliente.nombres || ''
        form.apellidos = props.cliente.apellidos || ''
        form.direccion = props.cliente.direccion || ''
        form.telefono = props.cliente.telefono || ''
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
        const clienteData = {
          cedula: form.cedula.trim(),
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          direccion: form.direccion.trim(),
          telefono: form.telefono.trim()
        }

        // Emitir evento de guardado
        emit('guardar', clienteData)
      } catch (error) {
        console.error('Error al guardar cliente:', error)
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
    watch(() => props.cliente, () => {
      inicializarFormulario()
    }, { immediate: true })

    // Lifecycle
    onMounted(() => {
      // Agregar listener para tecla ESC
      document.addEventListener('keydown', handleEscKey)

      // Auto-focus en el primer campo
      setTimeout(() => {
        const firstInput = document.getElementById('cedula')
        if (firstInput) {
          firstInput.focus()
        }
      }, 100)
    })

    // Cleanup
    const cleanup = () => {
      document.removeEventListener('keydown', handleEscKey)
    }

    // onUnmounted equivalente
    const { onBeforeUnmount } = ('vue')
    onBeforeUnmount(cleanup)

    return {
      form,
      errores,
      guardando,
      formularioValido,
      validarCampo,
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
  max-width: 500px;
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
@media (max-width: 576px) {
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

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
