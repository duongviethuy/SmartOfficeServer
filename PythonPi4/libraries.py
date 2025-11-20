from mfrc522 import SimpleMFRC522
import RPi.GPIO as GPIO
import spidev
from time import sleep

class NFC():
    def __init__(self, bus=0, device=0, spd=1000000):
        self.reader = SimpleMFRC522()
        self.close()
        self.boards = {}
        
        self.bus = bus
        self.device = device
        self.spd = spd

    def reinit(self):
        self.reader.READER.spi = spidev.SpiDev()
        self.reader.READER.spi.open(self.bus, self.device)
        self.reader.READER.spi.max_speed_hz = self.spd
        self.reader.READER.MFRC522_Init()

    def close(self):
        self.reader.READER.spi.close()

    def addBoard(self, rid, pin):
        self.boards[rid] = pin

    def selectBoard(self, rid):
        if not rid in self.boards:
            print("readerid " + rid + " not found")
            return False

        for loop_id in self.boards:
            GPIO.output(self.boards[loop_id], loop_id == rid)
        return True

    def read(self, rid):
        if not self.selectBoard(rid):
            return None

        self.reinit()
        cid, val = self.reader.read_no_block()
        self.close()
        return val

    def write(self, rid, value):
        if not self.selectBoard(rid):
            return False

        self.reinit()
        self.reader.write_no_block(value)
        self.close()
        return True

    def readID(self, rid): 
        if not self.selectBoard(rid):
            return None

        self.reinit()
        val = self.reader.read_id_no_block()
        self.close()
        return val



import urllib3
http = urllib3.PoolManager()
import json

api_server = 'http://169.254.255.68:3000/api'

def getData(route, body = {}):
	r = http.request('GET', api_server + route,
                 headers={'Content-Type': 'application/json'},
                 body = json.dumps(body))
	return json.loads(r.data.decode('utf-8'))
	
def postData(route, body = {}):
	r = http.request('POST', api_server + route,
                 headers={'Content-Type': 'application/json'},
                 body = json.dumps(body))


import serial #import thư viện serial
ser = serial.Serial('/dev/ttyACM0', 9600) #nhận dữ liệu từ cổng Serial ttyACM0

def postSerialData():	
	try:
		signal = ser.readline()
		data = signal.decode('utf-8').rstrip()		
		ser.reset_input_buffer()
		json.loads(data) ##check data xem có đúng dạng json không
	except:
		ser.reset_input_buffer()
	else:				
		http.request('POST', api_server + '/officeStatus',
			headers={'Content-Type': 'application/json'},
			body = data) # Gửi dữ liệu nhận được sang máy chủ NodeJS
		
GPIO.setmode(GPIO.BCM)	
GPIO.setup(20, GPIO.OUT)
GPIO.setup(21, GPIO.OUT)

servoPK = GPIO.PWM(21, 50) 
servoPK.start(0)

def openParking():
	servoPK.ChangeDutyCycle(8)
	sleep(0.1)
	servoPK.ChangeDutyCycle(0)
	
def closeParking():
	servoPK.ChangeDutyCycle(2)
	sleep(0.1)
	servoPK.ChangeDutyCycle(0)

servoWR = GPIO.PWM(20, 50) 
servoWR.start(0)
	
def closeWorkroom():
	servoWR.ChangeDutyCycle(9)
	sleep(0.1)
	servoWR.ChangeDutyCycle(0)

def openWorkroom():
	servoWR.ChangeDutyCycle(2)
	sleep(0.1)
	servoWR.ChangeDutyCycle(0)

def closeAllServo():
	closeWorkroom()
	closeParking()
	
import libcamera
from picamera2 import Picamera2, Preview
import base64

picam2 = Picamera2()
preview_config = picam2.create_preview_configuration(main={"size": (640, 480)})
preview_config["transform"] = libcamera.Transform(hflip=1, vflip=1)
picam2.configure(preview_config)
picam2.start()

def captureImg(): 
	request = picam2.capture_request()
	request.save("main", "data.jpg")
	request.release()
	
	img = {}
	with open('data.jpg', mode='rb') as file:
		img = file.read()
	img = base64.encodebytes(img).decode('utf-8')
	
	send_data = {
		"img": img
	}	
	
	r = http.request("POST", api_server + '/captureImg',
				headers={'Content-Type': 'application/json'},
				body = json.dumps(send_data))

	
from rpi_lcd import LCD
lcd = LCD()

def LCDWrite(str1, str2):
	lcd.text(str1, 1)
	lcd.text(str2, 2)

