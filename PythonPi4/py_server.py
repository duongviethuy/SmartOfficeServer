import RPi.GPIO as GPIO
GPIO.setwarnings(False)
from datetime import datetime

from libraries import NFC
from libraries import getData, postData
from libraries import postSerialData
from libraries import openParking, closeParking, openWorkroom, closeWorkroom, closeAllServo
from libraries import captureImg
from libraries import LCDWrite
from time import sleep
import urllib3

http = urllib3.PoolManager()

import json
from rpi_lcd import LCD

api_server = 'http://169.254.255.68:3000/api'

GPIO.setmode(GPIO.BCM)


GPIO.setup(19, GPIO.OUT)
GPIO.setup(26, GPIO.OUT)
nfc = NFC()
nfc.addBoard("readerWorkroom", 19)
nfc.addBoard("readerParking", 26)

def resetOffice():
	closeParking()
	sleep(0.1)
	closeWorkroom()		
	sleep(0.1)
	current_time = datetime.now()
	formatted_time = current_time.strftime("%d/%m/%Y %H:%M")
	
	LCDWrite('Smart Office', formatted_time)

try:
	countTime = 4
	while True:	
		
		if countTime == 4:
			resetOffice()
			countTime = 0
		
		postSerialData()		
		
		
		reqRegister = getData('/reqRegisterCard') 
	#khi nhận tín hiệu yêu cầu cấp quyền thẻ
		if reqRegister['reqRegister'] == True:
			while True: # code chạy liên tục đến khi nao co the duoc dua vao
				LCDWrite('Please place your card here', '------->')
				print("Card Register Require") 
				CardUIDWR = nfc.readID("readerWorkroom")
				print(CardUIDWR)
				if CardUIDWR is not None:
					postData('/cardID', body = {'cardID': CardUIDWR})
					sleep(2)
					break
				sleep(1)
	
		CardUIDPK = nfc.readID("readerParking")
		
		cardAuth = getData('/cardAuthorized', {"cardID": CardUIDPK})
		if cardAuth['cardAuthorized']: 
			LCDWrite('Hello', cardAuth['fullName'])
			openParking()
			sleep(1)
			captureImg()	
			
			
		CardUIDWR = nfc.readID("readerWorkroom")
		print(CardUIDWR)	
		cardAuth = getData('/checkin', {"cardID": CardUIDWR})
		if cardAuth['cardAuthorized']: 
			openWorkroom()	
				
		countTime+= 1
		sleep(1)

except KeyboardInterrupt: # If CTRL+C is pressed, exit cleanly:
	GPIO.cleanup()
	print("Keyboard interrupt")
