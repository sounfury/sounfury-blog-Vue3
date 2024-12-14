<template>
  <Card class="cardContainer">
    <div class="weatherCard">
      <p class="city">{{ position.city }}</p>
      <p class="weather">Today Weather</p>

      <i :class="position.weathericon"></i>
      <p class="temp">{{ position.temp }}°</p>
      <div class="minmaxContainer">
        <div class="min">
          <p class="minHeading">Min</p>
          <p class="minTemp">{{ position.min }}°</p>
        </div>
        <div class="max">
          <p class="maxHeading">Max</p>
          <p class="maxTemp">{{ position.max }}°</p>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { reactive, ref } from "vue"
import Card from "@/components/card/BaseCard/card.vue"
import axios from "axios"
import "qweather-icons/font/qweather-icons.css"

const position = reactive({
  location: ref(""), // 位置信息的默认值暂时为空
  city: ref("--"),
  weathericon: ref("qi-day"), // 天气图标的默认值为"qi-day"
  temp: ref("--"),
  min: ref("--"),
  max: ref("--"),
})

//使用高德api获取ip与地址
//使用和风api

let myAPIKey_HF = "fa89d24764794fdc8c94ee2419506b1b"
let myAPIKey_GD = "e1267e7c36d567b74c2f2c4b7cefb7e7"
let dayilyWeatherUrl = ``
let nowWeatherUrl = ``

import { getIp } from "@/api/ip"


let ip = ""
let positionUrl = `https://restapi.amap.com/v3/ip?key=${myAPIKey_GD}&ip=${ip}`

const showWeather = async () => {
  try {
    ip = await getIp().then((res) => {
      return res.data
    })
    positionUrl = `https://restapi.amap.com/v3/ip?key=${myAPIKey_GD}&ip=${ip}`
    await getposition()
    getWeather()
  } catch (error) {
    // 处理错误
  }
}

const getposition = async () => {
  try {
    const response = await axios.get(positionUrl)

    //为position赋值
    position.city = response.data.city
    position.location = response.data.rectangle.split(";")[1]
    dayilyWeatherUrl = `https://devapi.qweather.com/v7/grid-weather/3d?location=${position.location}&key=${myAPIKey_HF}`
    console.log(dayilyWeatherUrl)
    nowWeatherUrl = `https://devapi.qweather.com/v7/grid-weather/now?location=${position.location}&key=${myAPIKey_HF}`

    return response.data
  } catch (error) {
    throw error // 抛出错误以便上层调用处理
  }
}

const getWeather = async () => {
  try {
    const [response, nowresponse] = await Promise.all([
      axios.get(dayilyWeatherUrl),
      axios.get(nowWeatherUrl),
    ])

    const { temp, icon } = nowresponse.data.now
    const { textDay, tempMin, tempMax } = response.data.daily[0]
    //为position赋值
    Object.assign(position, {
      weathericon: "qi-" + icon,
      temp: temp,
      min: tempMin,
      max: tempMax,
    })
    return response.data
  } catch (error) {
    throw error // 抛出错误以便上层调用处理
  }
}

showWeather()
</script>

<style scoped>
i {
  font-size: 50px;
}

.cardContainer {
  padding: 0px !important ;
  position: relative;
  /* display: flex;
  align-items: center;
  justify-content: center; */
}

.weatherCard {
  position: relative;
  /* width: 220px; */
  width: 100%;
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20px 10px;
  border-radius: 10px;
  backdrop-filter: blur(30px);
  /* background-color: rgba(244, 242, 242, 0.308); */
  border: 1px solid rgba(255, 255, 255, 0.089);
  cursor: pointer;
}

.city {
  font-weight: 700;
  font-size: 0.9em;
  letter-spacing: 1.2px;
  color: var(--font-color);
}

.weather {
  font-weight: 500;
  font-size: 0.7em;
  letter-spacing: 1.2px;
  color: var(--title-color);
}

.temp {
  font-size: 1.8em;
  color: var(--font-color);
}

.minmaxContainer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.min,
.max {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding: 0px 20px;
  gap: 4px;
}

.max {
  align-items: flex-start;
  border-left: 2px solid var(--font-color);
}

.maxHeading,
.minHeading {
  font-size: 0.7em;
  font-weight: 600;
  color: var(--font-color);
}

.maxTemp,
.minTemp {
  font-size: 0.6em;
  font-weight: 500;
  color: var(--font-color);
}

.cardContainer::before {
  width: 100px;
  height: 100px;
  content: "";
  position: absolute;
  background-color: rgb(144, 161, 255);
  z-index: -1;
  border-radius: 50%;
  left: 100px;
  top: 50px;
  transition: all 1s;
}

.cardContainer:hover::before {
  transform: translate(-50px, 50px);
}
</style>
