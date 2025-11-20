SmartOfficeServer
Demo:  https://www.youtube.com/watch?v=jFLDCIVzdI0

SmartOfficeServer is a backend system for a Smart Office environment, enabling management and monitoring of office devices, including sensors, lights, automatic doors, and a web interface for real-time status tracking.

🚀 Features

Communicates with IoT devices via Arduino and Raspberry Pi 4.

Backend built with Node.js / Express, providing REST APIs for device management.

Web frontend using EJS templates to display device status and control devices.

Stores device data and user states.

Modular design allows easy extension: new devices or modules can be added with minimal changes.

📂 Project Structure
SmartOfficeServer/
├── Arduino/          # Arduino code for IoT devices
├── PythonPi4/        # Python scripts for Raspberry Pi 4
├── models/           # Data models / ORM
├── routes/           # Server API routes
├── views/            # EJS templates for the web interface
├── public/           # Static assets (CSS, JS, images)
├── index.js          # Main server entrypoint
├── package.json      # Node.js dependencies

⚙️ Installation

Clone the repository:

git clone https://github.com/duongviethuy/SmartOfficeServer.git
cd SmartOfficeServer


Install Node.js dependencies:

npm install


Configure environment variables:

Create a .env file if needed (e.g., PORT, database credentials).

Run the server:

node index.js
