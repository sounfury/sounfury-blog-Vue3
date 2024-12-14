<template>
  <Card class="noticeCard">
    <h2 style="color: var(--title-color);">
      <font-awesome-icon :icon="['fas', 'bullhorn']" style="color: #f00540" />
      公告
    </h2>
    <div class="text">
      {{ useSettingStore.settings.site_notice }}
    </div>
  </Card>

</template>

<script setup>
import Card from "@/components/card/BaseCard/card.vue"
import { ref } from "vue"
import useSettings from "@/store/modules/settings";
const useSettingStore = useSettings();



</script>

<style scoped>
.noticeCard {
  height: 115px;
}
.text {
  height: calc(100% - 1.5em - 28px);
  display: flex;
  align-items: center;
  color: var(--font-color);
  margin-top: 10px;
}
</style>
