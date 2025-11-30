Vue.component('app-modal', {
  props: ['show'],
  template: `
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <slot></slot>
    </div>
  </div>
  `
});
