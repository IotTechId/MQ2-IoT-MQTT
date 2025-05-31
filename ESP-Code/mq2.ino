#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char* ssid = "<WIFI SSID>";
const char* password = "<WIFI Password";

const char* mqtt_server = "<IP or Url of your MQTT Broker";

WiFiClient espClient;
PubSubClient client(espClient);

#define MQ2_PIN A0

unsigned long lastMsg = 0;
const long interval = 200; // Sending data around 2 miliseconds 

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting To ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi Connected");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop sampai terhubung
  while (!client.connected()) {
    Serial.print("Connecting To MQTT...");
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("Connected");
    } else {
      Serial.print("Fail, rc=");
      Serial.print(client.state());
      Serial.println(" Try Again on 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;

    int mq2Value = analogRead(MQ2_PIN);     
    
    char mq2Str[8];
    dtostrf(mq2Value, 1, 0, mq2Str);

    client.publish("<Insert Your MQTT Topic>", mq2Str);

    Serial.print("MQ2: ");
    Serial.println(mq2Str);
  }
}
