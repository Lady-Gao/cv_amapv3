# cv_amapv3

基于Vue3 封装的地图组件

### 文档介绍
https://monstergao.gitee.io/cv_amapv3/
https://cv-components-v3-docs.vercel.app/components/amap/Map.html

### 安装
>npm i cv_amapv3 -S


### 引用
```js
import { createApp } from 'vue'
import App from './App.vue'
import cv_amapv3 from 'cv_amapv3'

createApp(App)
        ... 
    .use(cv_amapv3)
    .mount('#app')
```

## 使用
```vue
<template>
  <Map :zoom="3" :center='[116.397428, 39.90923]'>
   </Map>
</template>

<script setup lang="ts">
import { ref } from "vue";

const position=ref([116.497428, 39.20923])

</script>
```