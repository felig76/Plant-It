 #pragma once

// ====== Pines ======
// Ajusta según tu placa/sensores
#define PIN_DHT 4            // DHT11/DHT22
#define PIN_SOIL_ADC 34      // Humedad de tierra (ADC1_CH6)
#define PIN_LDR_ADC 35       // LDR (ADC1_CH7)
#define PIN_BAT_ADC 36       // Batería (ADC1_CH0 / VP)

// ====== BLE UUIDs ======
// Deben coincidir con el frontend
#define BLE_DEVICE_NAME "ESP32-Setup"
#define BLE_SERVICE_UUID "12345678-1234-5678-1234-56789abcdef0"
#define BLE_WRITE_UUID   "abcdef01-1234-5678-1234-56789abcdef0"
#define BLE_STATUS_UUID  "abcdef02-1234-5678-1234-56789abcdef0"

// ====== Tiempos ======
#define WAKE_WINDOW_MS 3000          // tiempo activo para enviar datos
#define SLEEP_MINUTES 15             // minutos de deep sleep

// ====== ADC y cálculo batería ======
// Ajusta el divisor y referencia para tu hardware.
// Por ejemplo: R1=220k a VBAT, R2=100k a GND, Vadc = VBAT * (R2 / (R1+R2)) ≈ VBAT * 0.3125
#define BAT_DIVIDER_RATIO 0.3125f
// Atenuación por defecto del ADC (ver setAdcAttenuation). Si usas 11dB aprox 3.3V full-scale
#define ADC_FULL_SCALE_V 3.3f

// ====== Endpoint ======
// La URL base y plantId son configurables por BLE y se guardan en NVS.

// ====== LED por defecto ======
#ifndef LED_BUILTIN
#define LED_BUILTIN 2  // muchas ESP32 usan GPIO2 como LED onboard
#endif
