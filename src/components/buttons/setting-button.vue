<template>
    <div>
        <button class="setting-btn">
            <span class="bar bar1"></span>
            <span class="bar bar2"></span>
            <span class="bar bar1"></span>
        </button>

    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
/* From Uiverse.io by vinodjangid07 */
.setting-btn {
    width: 45px;
    height: 45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 10px;
    cursor: pointer;
    border: none;
   
}
.bar {
    @apply bg-gradient-to-r from-violet-500 to-pink-500;
    width: 50%;
    height: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 2px;
}

.bar::before {
    content: "";
    width: 2px;
    height: 2px;
    background-color: rgb(126, 117, 255);
    position: absolute;
    border-radius: 50%;
    border: 2px solid white;
    transition: all 0.3s;
    box-shadow: 0px 0px 5px white;
}

.bar1::before {
    transform: translateX(-4px);
}

.bar2::before {
    transform: translateX(4px);
}

.setting-btn:hover .bar1::before {
    transform: translateX(4px);
}

.setting-btn:hover .bar2::before {
    transform: translateX(-4px);
}
</style>