<template>
  <teleport to="body">
    <div class="notification-container">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="[`notification-${notification.type}`]"
        >
          <div class="notification-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          
          <div class="notification-content">
            <div v-if="notification.title" class="notification-title">
              {{ notification.title }}
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
          </div>
          
          <button
            class="notification-close"
            @click="removeNotification(notification.id)"
            title="关闭通知"
          >
            ✕
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script>
import { computed } from 'vue'
import { useAppStore } from '@store/app'

export default {
  name: 'Notification',
  
  setup() {
    const appStore = useAppStore()
    
    const notifications = computed(() => appStore.notifications)
    
    const getNotificationIcon = (type) => {
      const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      }
      return icons[type] || icons.info
    }
    
    const removeNotification = (id) => {
      appStore.removeNotification(id)
    }
    
    return {
      notifications,
      getNotificationIcon,
      removeNotification
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-notification);
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  min-width: 320px;
  max-width: 480px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  position: relative;
}

.notification-info {
  border-left: 4px solid var(--info-color);
}

.notification-success {
  border-left: 4px solid var(--success-color);
}

.notification-warning {
  border-left: 4px solid var(--warning-color);
}

.notification-error {
  border-left: 4px solid var(--error-color);
}

.notification-icon {
  font-size: var(--font-lg);
  margin-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.notification-message {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  margin-top: -4px;
  margin-right: -4px;
}

.notification-close:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* 动画效果 */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
