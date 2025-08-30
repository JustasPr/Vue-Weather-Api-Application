<script setup>
import { ref } from 'vue'


const cityName = ref('');
const currentDateTime = ref('');

const dateArray = ref({});
const loading = ref(false);

const formatDate = (date) => {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day} 12:00:00`;
}

const getDayLabel = (dateStr) => {

  dateStr = dateStr.slice(0, 10);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  if (dateStr === todayStr) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";

  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

const weathers = async () => {

  try {
    loading.value = true;
    const url = `http://localhost:3000/api/weather/${cityName.value}`;
    const response = await fetch(url);

    if(!response.ok) {
      throw new Error(`Serverio kladia: ${response.status}`);
    }

    const data = await response.json();
    
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, 0);

    currentDateTime.value = `${year}-${month}-${day} ${hour}:00:00`;
    // Su siandiena iskaitant pasiimam 3 dienas.
    const days = [
      currentDateTime.value,
      formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
      formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)),
    ];

    days.forEach(dayArr => {
      dateArray.value[dayArr] = data.forecastTimestamps
        .filter(day => day.forecastTimeUtc === dayArr)
        .map(day => ({
            date: day.forecastTimeUtc,
            city: data.place.name,
            temp: day.airTemperature,
            wind: day.windSpeed,
            condition: day.conditionCode,
            humidity: day.relativeHumidity,
        }));
    });
    
    console.log(dateArray.value);
  } catch (error) {
    console.error('Klaida', error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <header>
        <h1>Lithuania weathers</h1>
        <p>Best weather application in the Lithuania! haha</p>
  </header>
  <main>
    <div class="place__input">
      <input v-model="cityName" @keyup.enter="weathers" type="text" class="place__field" placeholder="Enter city name.." />
    </div>
    <div v-if="loading" class="loader">
      <i class="fas fa-circle-notch fa-spin fa-3x"></i>
      
    </div>
    <div v-else class="weather__box">
      <div 
        class="weather-card" 
        :class="{ 'todaysCard': getDayLabel(day) === 'Today'}"
        v-for="(forecasts, day) in dateArray" :key="day"
      >
        <div v-for="(f, index) in forecasts" :key="index">
          <h2>{{ f.city }} - {{ getDayLabel(f.date) }}</h2>
          <p class="condition"> {{ f.condition }} </p>
          <p class="temperature">{{ f.temp }}°C</p>
          <div class="details">
            <span> Humidity {{ f.humidity }}</span>
            <span> Wind {{ f.wind }} km/h</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>