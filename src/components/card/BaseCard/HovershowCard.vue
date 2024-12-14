<template>
  <ul class="item_child">
    <li v-for="index in numberOfLi" :key="index">
      <slot name="item" :index="index">{{ index }}</slot>
    </li>
  </ul>
</template>

<script setup>


const props = defineProps(["numberOfLi"])
</script>

<style scoped>
/*导航栏样式*/
.item_child {
  position: absolute;
  right: 0;
  /* display: none; */
  margin-top: 8px;
  padding: 0;
  width: 100%;
  border-radius: 5px;
  box-shadow: 0 5px 20px -4px rgba(0, 0, 0, 0.5);
  background-color: var(--sidebar-bg);
  animation: sub_menus 0.3s 0.1s ease both;
}
@keyframes sub_menus {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.item_child li {
  & :deep(a) {
    display: inline-block;
    padding: 8px 16px;
    width: 100%;
    color: var(--nav-font-color) !important;
    text-shadow: none !important;
  }
  &:hover {
    background-color: var(--hover--color);
    &:first-child {
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }
    &:last-child {
      border-bottom-right-radius: 5px;
      border-bottom-left-radius: 5px;
    }
  }
}
.item_child:before {
  position: absolute;
  top: -8px;
  left: 0;
  width: 100%;
  height: 20px;
  content: "";
}
</style>
