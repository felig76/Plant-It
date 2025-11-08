export const PLANT_RANGES = {
  potus: {
    groundHumidity: { min: 40, max: 60 },
    light: { min: 1000, max: 2500 },
    temperature: { min: 18, max: 27 },
  },
  sansevieria: {
    groundHumidity: { min: 20, max: 40 },
    light: { min: 500, max: 2000 },
    temperature: { min: 15, max: 29 },
  },
  suculenta: {
    groundHumidity: { min: 15, max: 35 },
    light: { min: 2000, max: 4000 },
    temperature: { min: 18, max: 30 },
  },
  cactus: {
    groundHumidity: { min: 10, max: 30 },
    light: { min: 3000, max: 6000 },
    temperature: { min: 20, max: 35 },
  },
  ficus: {
    groundHumidity: { min: 40, max: 65 },
    light: { min: 1500, max: 3000 },
    temperature: { min: 16, max: 24 },
  },
  helecho: {
    groundHumidity: { min: 60, max: 80 },
    light: { min: 800, max: 1500 },
    temperature: { min: 15, max: 24 },
  },
  monstera: {
    groundHumidity: { min: 45, max: 65 },
    light: { min: 1500, max: 3000 },
    temperature: { min: 18, max: 27 },
  },
  aromaticas: {
    groundHumidity: { min: 40, max: 60 },
    light: { min: 2500, max: 5000 },
    temperature: { min: 15, max: 25 },
  },
  geranio: {
    groundHumidity: { min: 35, max: 55 },
    light: { min: 2000, max: 4500 },
    temperature: { min: 15, max: 28 },
  },
}

export function getPlantMood(type, groundHumidity, light, temperature) {
  const ranges = PLANT_RANGES[type?.toLowerCase()] || PLANT_RANGES.potus
  
  const mood = {
    thirsty: false,
    sad: false,
    squinting: false,
    hot: false,
    cold: false,
  }

  if (groundHumidity != null && groundHumidity < ranges.groundHumidity.min) {
    mood.thirsty = true
  }

  if (light != null) {
    if (light < ranges.light.min) {
      mood.sad = true
    } else if (light > ranges.light.max) {
      mood.squinting = true
    }
  }

  if (temperature != null) {
    if (temperature > ranges.temperature.max) {
      mood.hot = true
    } else if (temperature < ranges.temperature.min) {
      mood.cold = true
    }
  }

  return mood
}
