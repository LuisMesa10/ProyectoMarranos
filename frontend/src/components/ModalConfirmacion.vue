<template>
  <div class="modal-overlay" @click.self="cancelar">
    <div class="modal-content" :class="[`modal--${tipo}`]">
      <div class="modal-header">
        <div class="modal-icon">
          <i :class="getIconClass()"></i>
        </div>
        <h3 class="modal-title">{{ titulo }}</h3>
      </div>

      <div class="modal-body">
        <p class="modal-message">{{ mensaje }}</p>
      </div>

      <div class="modal-footer">
        <button 
          @click="cancelar"
          class="btn btn-secondary"
          ref="cancelButton"
        >
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button 
          @click="confirmar"
          :class="getConfirmButtonClass()"
          ref="confirmButton"
        >
          <i :class="getConfirmIconClass()"></i>
          {{ getConfirmText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'ModalConfirmacion',
  props: {
    titulo: {
      type: String,
      default: 'Confirmación'
    },
    mensaje: {
      type: String,
      required: true
    },
    tipo: {
      type: String,
      default: 'info', // info, warning, danger, success
      validator: (value) => ['info', 'warning', 'danger', 'success'].includes(value)
    }
  },
  emits: ['confirmar', 'cancelar'],
  setup(props, { emit }) {
    // Métodos para obtener clases dinámicas
    const getIconClass = () => {
      const icons = {
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle',
        danger: 'fas fa-exclamation-circle',
        success: 'fas fa-check-circle'
      }
      return icons[props.tipo] || icons.info
    }

    const getConfirmButtonClass = () => {
      const classes = {
        info: 'btn btn-primary',
        warning: 'btn btn-warning',
        danger: 'btn btn-danger',
        success: 'btn btn-success'
      }
      return classes[props.tipo] || classes.info
    }

    const getConfirmIconClass = () => {
      const icons = {
        info: 'fas fa-check',
        warning: 'fas fa-check',
        danger: 'fas fa-trash',
        success: 'fas fa-check'
      }
      return icons[props.tipo] || icons.info
    }

    const getConfirmText = () => {
      const texts = {
        info: 'Confirmar',
        warning: 'Continuar',
        danger: 'Eliminar',
        success: 'Confirmar'
      }
      return texts[props.tipo] || texts.info
    }

    // Métodos principales
    const confirmar = () => {
      emit('confirmar')
    }

    const cancelar = () => {
      emit('cancelar')
    }

    // Manejo de teclado
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        cancelar()
      } else if (event.key === 'Enter') {
        confirmar()
      }
    }

    // Lifecycle
    onMounted(() => {
      // Agregar listener de teclado
      document.addEventListener('keydown', handleKeydown)

      // Focus en el botón apropiado según el tipo
      setTimeout(() => {
        if (props.tipo === 'danger') {
          // Para eliminaciones, focus en cancelar por seguridad
          const cancelButton = document.querySelector('.modal-content .btn-secondary')
          if (cancelButton) cancelButton.focus()
        } else {
          // Para otros casos, focus en confirmar
          const confirmButton = document.querySelector('.modal-content .btn-primary, .modal-content .btn-warning, .modal-content .btn-success')
          if (confirmButton) confirmButton.focus()
        }
      }, 100)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeydown)
    })

    return {
      getIconClass,
      getConfirmButtonClass,
      getConfirmIconClass,
      getConfirmText,
      confirmar,
      cancelar
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
  z-index: 1100;
  padding: 1rem;
}

.modal-content {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-lg);
  width: 100%;
  max-width: 450px;
  animation: modalSlideIn 0.3s ease-out;
  border-top: 4px solid;
}

/* Colores por tipo */
.modal--info {
  border-top-color: var(--info-color);
}

.modal--warning {
  border-top-color: var(--warning-color);
}

.modal--danger {
  border-top-color: var(--danger-color);
}

.modal--success {
  border-top-color: var(--success-color);
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
  padding: 2rem 1.5rem 1rem;
  text-align: center;
}

.modal-icon {
  margin-bottom: 1rem;
}

.modal-icon i {
  font-size: 3rem;
}

.modal--info .modal-icon i {
  color: var(--info-color);
}

.modal--warning .modal-icon i {
  color: var(--warning-color);
}

.modal--danger .modal-icon i {
  color: var(--danger-color);
}

.modal--success .modal-icon i {
  color: var(--success-color);
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-800);
}

.modal-body {
  padding: 0 1.5rem 1rem;
  text-align: center;
}

.modal-message {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--gray-600);
}

.modal-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  border-top: 1px solid var(--gray-200);
}

/* Estilos específicos para botones de confirmación */
.btn-warning {
  background-color: var(--warning-color);
  color: var(--white);
  border-color: var(--warning-color);
}

.btn-warning:hover {
  background-color: #e0a800;
  border-color: #d39e00;
}

.btn-warning:focus {
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
}

/* Responsive */
@media (max-width: 576px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-header {
    padding: 1.5rem 1rem 0.5rem;
  }

  .modal-body {
    padding: 0 1rem 0.5rem;
  }

  .modal-footer {
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }

  .modal-icon i {
    font-size: 2.5rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-message {
    font-size: 0.9rem;
  }
}

/* Animación para el foco */
.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb, 46, 125, 94), 0.25);
}

.btn-secondary:focus {
  box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.25);
}

.btn-danger:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
}
</style>