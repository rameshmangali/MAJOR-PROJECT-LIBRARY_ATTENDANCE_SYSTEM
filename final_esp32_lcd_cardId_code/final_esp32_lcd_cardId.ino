/*
  📡 ESP32 (30-pin) + RC522 RFID + 16x2 I2C LCD + WiFi + HTTP API (Google Apps Script / Backend)
  ---------------------------------------------------------------------------------------------

  🔌 RC522 RFID Connections:
  --------------------------
  RC522     →   ESP32
  --------------------------
  SDA (SS)  →   GPIO5
  SCK       →   GPIO18
  MOSI      →   GPIO23
  MISO      →   GPIO19
  RST       →   GPIO4
  3.3V      →   3.3V
  GND       →   GND

  💡 I2C LCD (16x2 @ 0x27 or 0x3F) Connections:
  --------------------------------------------
  LCD       →   ESP32
  --------------------------
  VCC       →   VIN (5V)
  GND       →   GND
  SDA       →   GPIO21
  SCL       →   GPIO22

  🛜 WiFi Credentials:
  --------------------
  SSID:     Ramesh
  Password: Ramesh123

  🌐 Backend Endpoint:
  --------------------
  https://library-attendance-backend.onrender.com/api/attendance/scan?cardId=<cardId>

  🕒 Flow:
  --------
  1️⃣ Scan RFID card
  2️⃣ Get UID (8 HEX chars)
  3️⃣ Send to backend
  4️⃣ Show response (scroll if long)
  5️⃣ Return to "Scan your card" AFTER scrolling finishes
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define SS_PIN   5   // RC522 SDA/SS
#define RST_PIN  4   // RC522 RST

MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// WiFi
const char* ssid = "Ramesh";
const char* password = "Ramesh123";

// Backend
String serverUrl = "https://library-attendance-backend.onrender.com/api/attendance/scan?cardId=";

// Scroll timing (ms)
const unsigned int scrollDelayMs = 300;  // time between each scroll step
const unsigned int noScrollDisplayMs = 2000; // if <=32 chars, show for 2s

void setup() {
  Serial.begin(115200);
  // Explicit SPI pins for ESP32
  SPI.begin(18, 19, 23, 5); // SCK, MISO, MOSI, SS
  mfrc522.PCD_Init();

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0,0); lcd.print("Connecting WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  lcd.clear(); lcd.print("WiFi Connected!");
  delay(1000);
  lcd.clear(); lcd.print("Scan your card");
  Serial.println("Ready for RFID scan...");
}

void loop() {
  // Wait for new card
  if (!mfrc522.PICC_IsNewCardPresent()) { delay(100); return; }
  if (!mfrc522.PICC_ReadCardSerial()) { delay(100); return; }

  // Build 4-byte ID (last 4 bytes if UID longer; left-pad with 0x00 if shorter)
  byte *uid = mfrc522.uid.uidByte;
  byte uidSize = mfrc522.uid.size;
  byte idBytes[4] = {0,0,0,0};

  if (uidSize >= 4) {
    for (uint8_t i = 0; i < 4; ++i) idBytes[i] = uid[uidSize - 4 + i];
  } else {
    for (uint8_t i = 0; i < uidSize; ++i) idBytes[4 - uidSize + i] = uid[i];
  }

  // Format to exactly 8 uppercase hex chars, no spaces
  char idStr[9];
  snprintf(idStr, sizeof(idStr), "%02X%02X%02X%02X",
           idBytes[0], idBytes[1], idBytes[2], idBytes[3]);

  String cardId = String(idStr);
  Serial.print("cardId: ");
  Serial.println(cardId);

  // Show UID on LCD briefly
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Card:");
  lcd.setCursor(0,1);
  lcd.print(cardId);

  delay(2000); // 2s display / debounce

  // Send to backend
  String fullUrl = serverUrl + cardId;
  Serial.println("Sending: " + fullUrl);
  String response = sendRequest(fullUrl);
  Serial.println("Server Response: " + response);

  // ---------- NEW: display response with scrolling ----------
  showResponseWithScroll(response);
  // ---------------------------------------------------------

  // tidy up MFRC522
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

  // After scrolling completes, show prompt and ensure card is removed
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Scan your card");

  // Block until the card is removed (prevents immediate re-read while card still present)
  while (mfrc522.PICC_IsNewCardPresent()) {
    delay(100);
  }

  // small extra debounce
  delay(200);
}

/*
  Show the server response on 16x2 LCD.
  - If response length <= 32: show it statically for noScrollDisplayMs.
  - If response length > 32: scroll a 32-character window across the response (left->right),
    updating every scrollDelayMs. The function returns only after the complete scroll finishes.
  The response is treated as a single line that flows across both LCD rows.
*/
void showResponseWithScroll(const String &response) {
  if (response.length() == 0) {
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("No response");
    delay(noScrollDisplayMs);
    return;
  }

  // Prepare a working string (no CR/LF). Replace newline with space.
  String resp = response;
  for (int i = 0; i < resp.length(); ++i) if (resp[i] == '\n' || resp[i] == '\r') resp[i] = ' ';

  // If short enough to fit in 32 chars, show statically
  if (resp.length() <= 32) {
    lcd.clear();
    String line1 = resp.substring(0, min(16, (int)resp.length()));
    lcd.setCursor(0,0); lcd.print(line1);
    if (resp.length() > 16) {
      String line2 = resp.substring(16, min(32, (int)resp.length()));
      lcd.setCursor(0,1); lcd.print(line2);
    }
    delay(noScrollDisplayMs);
    return;
  }

  // For scrolling: create padded string so we can slide a 32-char window across it smoothly.
  String pad = "                                "; // 32 spaces
  String big = resp + pad; // allow trailing blank space at end of scroll
  int totalLen = big.length();
  int window = 32;
  int maxStart = totalLen - window; // inclusive start positions

  // Scroll left->right: start=0 shows first 32 chars, then shift by 1, ... up to maxStart
  for (int start = 0; start <= maxStart; ++start) {
    String win = big.substring(start, start + window);
    String top = win.substring(0, 16);
    String bot = win.substring(16, 32);
    lcd.clear();
    lcd.setCursor(0,0); lcd.print(top);
    lcd.setCursor(0,1); lcd.print(bot);
    delay(scrollDelayMs);
  }

  // Optional short pause at the end so last frame is visible
  delay(500);
}

String sendRequest(String url) {
  if (WiFi.status() != WL_CONNECTED) return "WiFi not connected";

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST("{}"); // keep same behavior as your working code

  String resp = "";
  if (httpCode > 0) {
    resp = http.getString();
  } else {
    resp = "HTTP Error: " + String(httpCode);
  }

  http.end();
  return resp;
}
