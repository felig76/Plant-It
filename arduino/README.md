# Plant-It ESP32 Firmware

Este firmware permite:

- Provisión BLE de credenciales WiFi desde la app web (Web Bluetooth).
- Asociación de `plantId` y `deviceId` al firmware.
- Lectura de sensores: humedad de tierra (analógico), humedad/temperatura de aire (DHT), luz (LDR) y batería (divisor a ADC).
- Envío HTTP al backend: `POST /api/plants/ingest/:plantId` con header `x-device-id`.
- Deep Sleep: despierta cada 15 minutos, publica por ~3s y vuelve a dormir.

## Cableado sugerido

- DHT11/DHT22: pin `GPIO 4` (configurable).
- Humedad de tierra (módulo analógico): `GPIO 34` (ADC1_CH6).
- LDR con resistor a VCC: `GPIO 35` (ADC1_CH7).
- Batería a través de divisor: `GPIO 36` (VP / ADC1_CH0). Asegurate de usar divisor adecuado (ej. 100k/220k) para no superar 1.1V/3.3V según atenuación.

Ajusta pines en `config.h`.

## BLE

- Service: `12345678-1234-5678-1234-56789abcdef0`
- Write characteristic (desde la web hacia ESP32): `abcdef01-1234-5678-1234-56789abcdef0`
- Status/notify characteristic (desde ESP32): `abcdef02-1234-5678-1234-56789abcdef0`

Mensajes esperados (JSON):

1) Provisionar WiFi
```
{"ssid":"<SSID>","password":"<PASS>"}
```
Respuesta por notify: `{ "connected": true }` cuando logra IP.

2) Asociar planta
```
{"plantId":"<mongoId>","apiBase":"https://<host>","deviceId":"<bleDeviceName>"}
```
Queda persistido en NVS (Preferences).

## Compilación

- Plataforma: Arduino ESP32 (esp32 >= 2.0.x).
- Librerías:
  - ESP32 BLE Arduino (o NimBLE-Arduino)
  - ArduinoJson
  - DHT sensor library (Adafruit)
  - HTTPClient
  - Preferences

## Funcionamiento

- Si hay `ssid` guardado y se puede conectar, lee sensores, hace POST y entra en deep sleep por 15 min.
- Si no hay WiFi, habilita BLE para recibir credenciales. Una vez conectado, envía `{connected:true}` por notify.

## Endpoint

`POST {apiBase}/api/plants/ingest/{plantId}`

Body JSON:
```
{
  "groundHumedity": <0-100>,
  "airHumedity": <0-100>,
  "lightExposure": <lux aproximado o valor ADC>,
  "temperature": <°C>,
  "batteryLevel": <0-100>,
  "deviceId": "<string>"
}
```
Header: `x-device-id: <deviceId>`

