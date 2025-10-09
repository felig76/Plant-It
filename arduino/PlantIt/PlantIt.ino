#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <NimBLEDevice.h>

#include "config.h"

// ----- DHT -----
#define DHTTYPE DHT11 // Cambia a DHT11 si corresponde
DHT dht(PIN_DHT, DHTTYPE);

// ----- NVS -----
Preferences prefs;

// ----- BLE -----
NimBLEServer *pServer = nullptr;
NimBLECharacteristic *pWriteChar = nullptr;
NimBLECharacteristic *pStatusChar = nullptr;
bool bleClientConnected = false;

// ----- Estado guardado -----
String cfgSsid, cfgPass, cfgApiBase, cfgPlantId, cfgDeviceId;

// ----- Helpers -----
static float readBatteryPct() {
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_BAT_ADC, ADC_11db);
  int raw = analogRead(PIN_BAT_ADC);
  float vAdc = (raw / 4095.0f) * ADC_FULL_SCALE_V;
  float vBat = vAdc / BAT_DIVIDER_RATIO;
  float pct = (vBat - 3.3f) / (4.2f - 3.3f) * 100.0f;
  pct = constrain(pct, 0.0f, 100.0f);
  return pct;
}

static int readSoilPct() {
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_SOIL_ADC, ADC_11db);
  int raw = analogRead(PIN_SOIL_ADC);
  int inv = 4095 - raw;
  int pct = map(inv, 0, 4095, 0, 100);
  return constrain(pct, 0, 100);
}

static int readLdrLevel() {
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LDR_ADC, ADC_11db);
  int raw = analogRead(PIN_LDR_ADC);
  int level = map(raw, 0, 4095, 0, 1000);
  return constrain(level, 0, 1000);
}

// Forward declarations for use in callbacks
static bool connectWiFiWithTimeout(uint32_t ms);
static void notifyStatusConnected();

static void saveIfNotEmpty(const char *key, const String &val) {
  if (val.length()) prefs.putString(key, val);
}

static void loadConfig() {
  prefs.begin("plantit", true);
  cfgSsid = prefs.getString("ssid", "");
  cfgPass = prefs.getString("pass", "");
  cfgApiBase = prefs.getString("api", "");
  cfgPlantId = prefs.getString("plant", "");
  cfgDeviceId = prefs.getString("device", "");
  prefs.end();
}

static void saveConfig() {
  prefs.begin("plantit", false);
  saveIfNotEmpty("ssid", cfgSsid);
  saveIfNotEmpty("pass", cfgPass);
  saveIfNotEmpty("api", cfgApiBase);
  saveIfNotEmpty("plant", cfgPlantId);
  saveIfNotEmpty("device", cfgDeviceId);
  prefs.end();
}

class ServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* server) { bleClientConnected = true; }
  void onDisconnect(NimBLEServer* server) { bleClientConnected = false; server->getAdvertising()->start(); }
};

class WriteCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic *ch) {
    std::string value = ch->getValue();
    if (value.empty()) return;

    StaticJsonDocument<384> doc;
    DeserializationError err = deserializeJson(doc, value);
    if (err) return;

    bool updated = false;
    if (doc.containsKey("ssid")) { cfgSsid = String(doc["ssid"].as<const char*>()); updated = true; }
    if (doc.containsKey("password")) { cfgPass = String(doc["password"].as<const char*>()); updated = true; }
    if (doc.containsKey("apiBase")) { cfgApiBase = String(doc["apiBase"].as<const char*>()); updated = true; }
    if (doc.containsKey("plantId")) { cfgPlantId = String(doc["plantId"].as<const char*>()); updated = true; }
    if (doc.containsKey("deviceId")) { cfgDeviceId = String(doc["deviceId"].as<const char*>()); updated = true; }

    if (updated) {
      saveConfig();
      // Intentar conectar inmediatamente tras recibir credenciales y notificar estado
      if (connectWiFiWithTimeout(30000)) {
        notifyStatusConnected();
      }
    }
  }
};

static void startBLE() {
  NimBLEDevice::init(BLE_DEVICE_NAME);
  NimBLEDevice::setDeviceName(BLE_DEVICE_NAME);
  pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  NimBLEService *service = pServer->createService(BLE_SERVICE_UUID);
  pWriteChar = service->createCharacteristic(BLE_WRITE_UUID, NIMBLE_PROPERTY::WRITE);
  pWriteChar->setCallbacks(new WriteCallbacks());

  pStatusChar = service->createCharacteristic(BLE_STATUS_UUID, (NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::READ));

  service->start();
  // Mejorar advertising: incluir UUID del servicio
  NimBLEAdvertising* adv = pServer->getAdvertising();
  adv->addServiceUUID(BLE_SERVICE_UUID);
  adv->start();
}

static bool connectWiFiWithTimeout(uint32_t ms) {
  if (cfgSsid.isEmpty()) return false;
  WiFi.mode(WIFI_STA);
  WiFi.begin(cfgSsid.c_str(), cfgPass.isEmpty() ? nullptr : cfgPass.c_str());
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < ms) {
    delay(300);
  }
  return WiFi.status() == WL_CONNECTED;
}

static void notifyStatusConnected() {
  if (!pStatusChar) return;
  StaticJsonDocument<64> sdoc;
  sdoc["connected"] = true;
  String out;
  serializeJson(sdoc, out);
  pStatusChar->setValue(out.c_str());
  pStatusChar->notify();
}

static bool postTelemetry() {
  if (cfgApiBase.isEmpty() || cfgPlantId.isEmpty() || cfgDeviceId.isEmpty()) {
    Serial.println("ERR: Config incompleta");
    return false;
  }

  int soil = readSoilPct();
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    // reintento rápido
    delay(100);
    h = dht.readHumidity();
    t = dht.readTemperature();
  }
  if (isnan(h)) h = 0;
  if (isnan(t)) t = 0;
  int ldr = readLdrLevel();
  float bat = readBatteryPct();

  String url = cfgApiBase + "/api/plants/ingest/" + cfgPlantId;

  StaticJsonDocument<256> body;
  body["groundHumedity"] = soil;
  body["airHumedity"] = (int)round(h);
  body["lightExposure"] = ldr;
  body["temperature"] = (int)round(t);
  body["batteryLevel"] = (int)round(bat);
  body["deviceId"] = cfgDeviceId;

  String payload;
  serializeJson(body, payload);

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", cfgDeviceId);
  int code = http.POST(payload);
  if (code < 0 || code >= 400) {
    Serial.print("ERR HTTP: ");
    Serial.println(code);
  }
  http.end();
  return code > 0 && code < 400;
}

static void goDeepSleepMinutes(uint32_t minutes) {
  Serial.flush();
  uint64_t uS = (uint64_t)minutes * 60ULL * 1000000ULL;
  esp_sleep_enable_timer_wakeup(uS);
  esp_deep_sleep_start();
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  loadConfig();
  
  Serial.print("WiFi: ");
  Serial.print(cfgSsid.isEmpty() ? "Sin config" : cfgSsid);
  Serial.print("/");
  Serial.println(cfgPass);

  if (cfgSsid.isEmpty()) {
    Serial.println("Modo BLE");
    startBLE();
    // Quedarse en bucle de espera de provisión (hasta que se guarde SSID)
    uint32_t lastBlink = 0;
    pinMode(LED_BUILTIN, OUTPUT);
    while (cfgSsid.isEmpty()) {
      // Parpadeo leve para indicar modo provisión
      if (millis() - lastBlink > 500) {
        digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
        lastBlink = millis();
      }
      // Intento de conectar si ya guardaron credenciales por BLE
      loadConfig();
      if (!cfgSsid.isEmpty() && connectWiFiWithTimeout(15000)) {
        notifyStatusConnected();
        delay(500);
        break;
      }
      delay(50);
    }
  }

  bool wifiOk = connectWiFiWithTimeout(15000);
  if (wifiOk) {
    Serial.print("OK - IP: ");
    Serial.println(WiFi.localIP());
    if (pStatusChar) notifyStatusConnected();
    
    // Enviar datos
    if (!postTelemetry()) Serial.println("ERR: Envio fallo");
    
    // Ventana activa mínima
    uint32_t startActive = millis();
    while (millis() - startActive < WAKE_WINDOW_MS) {
      delay(10);
    }
    
    // Solo dormir si se conectó exitosamente
    goDeepSleepMinutes(SLEEP_MINUTES);
  } else {
    Serial.println("ERR: WiFi fallo");
    if (pServer == nullptr) startBLE();
    // NO entrar en deep sleep, quedarse activo para BLE
  }
}

void loop() {
  // Modo activo para BLE si no hay WiFi
  delay(100);
}
