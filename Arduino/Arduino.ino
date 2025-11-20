#include "DHT.h" // Thêm thư viện DHT

#define ParkingSlot 4 // Số lượng chỗ đậu xe
#define DHTTYPE DHT22 // Loại cảm biến DHT
#define DHTPIN 12 // Chân cắm DHT

// Các hàm sẽ sử dụng 
String FreeParkingSlot (int ParkingPin[]); // Hàm có tác dụng quét qua các cảm biến vật cản và trả về vị trí trống
String TempandHum(int DHT_pin); // Hàm trả về kết quả đo nhiệt độ, độ ẩm

String DataToJSON(int ParkingPin[]); // Hàm chuyển đổi text sang dạng dữ liệu JSON 
void SendJSONtoSerial(); // Gửi JSON đã chuyển đổi qua cổng Serial


int ParkingPin[ParkingSlot] = {8, 9, 10, 11}; // Chân cắm của các cảm biến vật cản
DHT dht(DHTPIN, DHTTYPE); // Khởi tạo cảm biến DHT


void setup() {
  dht.begin();
  Serial.begin(9600); // Khởi tạo cổng Serial
  delay(500); // chờ 500ms cho cổng Serial khởi động

  // quét qua tất cả chân cắm của cảm biến vật cản và gắn mode input
  for(int i = 0; i< ParkingSlot; i++) {
    pinMode(ParkingPin[i], INPUT);
  }

  // gắn mode input cho cảm biến DHT
  pinMode(DHTPIN, INPUT);  
  
}

void loop() {
  SendJSONtoSerial();  
  delay(500);
}

String FreeParkingSlot (int ParkingPin[]) {
  int tmp;
  int count = 0;
  String data = "[";
  for (int i = 0 ; i < ParkingSlot; i++) {
    tmp = digitalRead(ParkingPin[i]);
    if(tmp == 1) {         
      if(count == 0) {        
        data += i+1;
        count++;
      }
      else {
        data += ",";
        data += i+1;
      }
    }
  }
  data += "]";
  return data;
}

String TempandHum(int DHT_pin) {
  String data = "";
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    data += "Temp:";
    data += "-100";
    data += ",";
    data += "Hum:";
    data += "-100";
    return data;
  }
  
  data += '"';
  data += "Temp";  
  data += '"';
  data += ':';
  data += t;
  data += ",";
  data += '"';  
  data += "Hum";
  data += '"';
  data += ':';
  data += h;
  return data;
}



String DataToJSON() {
  String data = "{";
  data += '"';
  data += "FreeSlot";
  data += '"';
  data += ':';
  data += FreeParkingSlot(ParkingPin);
  data += ",";
  data += TempandHum(DHTPIN);
  return data + "}";
}

void SendJSONtoSerial() {
  Serial.println(DataToJSON());
}
