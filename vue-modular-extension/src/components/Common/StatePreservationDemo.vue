<template>
  <div class="state-demo">
    <div class="demo-section">
      <h3>状态保留演示</h3>
      <p>在不同页面间切换，观察以下状态是否保留：</p>
      
      <!-- 表单状态演示 -->
      <div class="demo-item">
        <h4>表单状态</h4>
        <form data-preserve-form data-form-key="demo-form">
          <div class="form-group">
            <label>文本输入：</label>
            <input 
              v-model="formData.text" 
              type="text" 
              name="text"
              placeholder="输入一些文字，然后切换页面"
            />
          </div>
          <div class="form-group">
            <label>数字输入：</label>
            <input 
              v-model.number="formData.number" 
              type="number" 
              name="number"
              placeholder="输入数字"
            />
          </div>
          <div class="form-group">
            <label>选择框：</label>
            <select v-model="formData.select" name="select">
              <option value="">请选择</option>
              <option value="option1">选项1</option>
              <option value="option2">选项2</option>
              <option value="option3">选项3</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input 
                v-model="formData.checkbox" 
                type="checkbox" 
                name="checkbox"
              />
              复选框选项
            </label>
          </div>
        </form>
      </div>
      
      <!-- 滚动位置演示 -->
      <div class="demo-item">
        <h4>滚动位置</h4>
        <div 
          class="scroll-container" 
          data-preserve-scroll 
          data-scroll-key="demo-scroll"
        >
          <div class="scroll-content">
            <p v-for="i in 50" :key="i">
              这是第 {{ i }} 行内容，用于测试滚动位置保留。
              滚动到某个位置后切换页面，再回来时应该保持相同的滚动位置。
            </p>
          </div>
        </div>
      </div>
      
      <!-- 计数器状态演示 -->
      <div class="demo-item">
        <h4>组件内部状态</h4>
        <div class="counter">
          <p>计数器：{{ counter }}</p>
          <button @click="counter++">增加</button>
          <button @click="counter--">减少</button>
          <button @click="counter = 0">重置</button>
        </div>
        <p class="hint">
          点击增加/减少按钮，然后切换到其他页面再回来，计数器的值应该保持不变。
        </p>
      </div>
      
      <!-- 时间戳演示 -->
      <div class="demo-item">
        <h4>时间状态</h4>
        <p>组件创建时间：{{ createdTime }}</p>
        <p>最后更新时间：{{ lastUpdateTime }}</p>
        <button @click="updateTime">更新时间</button>
        <p class="hint">
          组件创建时间不会改变，说明组件实例被保留。
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useComplexComponentState } from '@utils/usePageState'

export default {
  name: 'StatePreservationDemo',
  props: {
    pageName: {
      type: String,
      required: true
    }
  },
  
  setup(props) {
    // 使用复杂组件状态管理
    const pageState = useComplexComponentState(props.pageName, {
      autoSave: true,
      saveInterval: 3000,
      preserveScrollPosition: true,
      preserveFormData: true
    })
    
    // 表单数据
    const formData = reactive({
      text: '',
      number: 0,
      select: '',
      checkbox: false
    })
    
    // 计数器
    const counter = ref(0)
    
    // 时间状态
    const createdTime = ref('')
    const lastUpdateTime = ref('')
    
    // 更新时间
    const updateTime = () => {
      lastUpdateTime.value = new Date().toLocaleTimeString()
    }
    
    // 组件挂载时记录创建时间
    onMounted(() => {
      createdTime.value = new Date().toLocaleTimeString()
      lastUpdateTime.value = createdTime.value
      
      // 从状态中恢复数据
      const savedState = pageState.state.value
      if (savedState.formData) {
        Object.assign(formData, savedState.formData)
      }
      if (savedState.counter !== undefined) {
        counter.value = savedState.counter
      }
      if (savedState.createdTime) {
        createdTime.value = savedState.createdTime
      }
      if (savedState.lastUpdateTime) {
        lastUpdateTime.value = savedState.lastUpdateTime
      }
    })
    
    // 监听状态变化并保存
    const saveCurrentState = () => {
      pageState.updateState({
        formData: { ...formData },
        counter: counter.value,
        createdTime: createdTime.value,
        lastUpdateTime: lastUpdateTime.value
      })
    }
    
    // 页面失活时保存状态
    pageState.onDeactivate(() => {
      saveCurrentState()
    })
    
    return {
      formData,
      counter,
      createdTime,
      lastUpdateTime,
      updateTime,
      isActive: pageState.isActive
    }
  }
}
</script>

<style scoped>
.state-demo {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.demo-item {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
}

.demo-item h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--primary-color);
  font-size: var(--font-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
  max-width: 300px;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: var(--spacing-xs);
}

.scroll-container {
  height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
}

.scroll-content {
  padding: var(--spacing-md);
}

.scroll-content p {
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}

.counter {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.counter p {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
}

.counter button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-sm);
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.counter button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.hint {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-style: italic;
  margin-top: var(--spacing-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .state-demo {
    padding: var(--spacing-md);
  }
  
  .demo-section {
    padding: var(--spacing-md);
  }
  
  .counter {
    flex-wrap: wrap;
  }
  
  .form-group input,
  .form-group select {
    max-width: 100%;
  }
}
</style>
