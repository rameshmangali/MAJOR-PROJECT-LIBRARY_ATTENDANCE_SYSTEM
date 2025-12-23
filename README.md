# 📚 Library Attendance System - Complete Documentation

## 1. Project Overview
This project is a full-stack IoT attendance system designed for efficient tracking of student entry and exit in a library environment. It bridges the physical world (RFID Cards) with a digital dashboard.

### Key Features
- **Real-time Attendance**: Instant "IN" and "OUT" checking using RFID cards.
- **Live Dashboard**: Displays currently active students in the library.
- **Student Management**: Full Create-Read-Update-Delete (CRUD) capabilities for student records.
- **Reporting**: Historical data access to view attendance logs by date.
- **Manual Overrides**: "Force Out" options for end-of-day clearing.

---

## 2. 📂 Detailed File Structure & Explanation

### A. Backend (`Library-manager-backend/`)
This is the "Brain" of the system, handling logic, database storage, and API access.

| File Path | Description | Key Functionality |
| :--- | :--- | :--- |
| **`server.js`** | **The Entry Point** | • Initializes the Express App.<br>• Connects to MongoDB via `db.js`.<br>• Enables CORS (allows frontend to talk to backend).<br>• Defines base API routes (`/api/students`, `/api/attendance`). |
| **`db.js`** | **Database Connector** | • Uses `mongoose.connect()` to establish a connection to your MongoDB Atlas cluster.<br>• Handles connection errors gracefully. |
| **`models/studentModel.js`** | **Data Schema (Student)** | • Defines the structure of a Student document: `rollNumber`, `cardId`, `name`, `branch`, `mobile`, `email`. |
| **`models/attendanceModel.js`**| **Data Schema (Log)** | • Defines an Attendance log: `cardId`, `inTime` (Date), `outTime` (Date), `duration`. |
| **`routes/attendanceRoutes.js`**| **Attendance Logic** | • **`POST /scan`**: The core logic. Checks if student is IN. <br>  - If **NO**: Marks IN (creates record).<br>  - If **YES**: Marks OUT (updates `outTime`, calcs duration).<br>• **`GET /active`**: Returns list of students currently inside.<br>• **`PUT /force-out`**: Clocks out everyone (admin feature). |
| **`routes/studentRoutes.js`** | **Student Management** | • **`POST /add`**: Registers a new student.<br>• **`GET /`**: Fetches all students.<br>• **`DELETE /:id`**: Removes a student.<br>• **`PUT /:id`**: Updates student details. |

### B. Frontend (`Library-manager-frontend/`)
The "Face" of the system, built with React.js for a responsive user interface.

| File Path | Description | Key Functionality |
| :--- | :--- | :--- |
| **`src/index.js`** | **React Entry Point** | • Renders the `App` component into the DOM.<br>• Wraps app in `Strict Mode`. |
| **`src/App.js`** | **Main Layout** | • Manages the active page state (Students vs Attendance vs Reports).<br>• Renders the **Sidebar** and the currently selected **Page**. |
| **`src/api.js`** | **API Service** | • Centralized place for all `fetch` calls to the Backend.<br>• Methods like `api.getStudents()`, `api.manualClockOut()`.<br>• URL is configurable (Local vs Render). |
| **`src/components/Sidebar.js`** | **Navigation** | • Displays navigation buttons (Students, Attendance, Reports).<br>• Highlights the active tab. |
| **`src/pages/Students.js`** | **Student Manager** | • Displays list of students in a table.<br>• Buttons to **Add**, **Edit**, or **Delete** students.<br>• Search functionality by Name or Roll Number. |
| **`src/pages/Attendance.js`** | **Live Dashboard** | • Polls the server every few seconds to show **Active Students**.<br>• Shows "IN Time" and duration for current visitors. |
| **`src/pages/Reports.js`** | **History Viewer** | • Allows selecting a date to view past attendance logs.<br>• Shows total duration for past visits. |

### C. Hardware (`final_esp32_lcd_cardId_code/`)
The physical interface for scanning cards.

| File Path | Description | Key Functionality |
| :--- | :--- | :--- |
| **`final_esp32_lcd_cardId.ino`** | **Firmware Source** | • **`setup()`**: Connects to Wi-Fi, initializes RFID reader & LCD.<br>• **`loop()`**: Constantly checks for a card.<br>• **`sendRequest()`**: Sends HTTP POST to Backend with Card ID.<br>• **`showResponseWithScroll()`**: Handles long server messages by scrolling text on the small LCD. |

---

## 3. 🚀 How to Clone & Run (Step-by-Step)

### Prerequisites
1.  **Node.js**: [Download Here](https://nodejs.org/) (LTS version).
2.  **Git**: [Download Here](https://git-scm.com/).
3.  **Arduino IDE**: For uploading code to ESP32.

### Step 1: Clone the Repository
Open a terminal (Command Prompt or PowerShell) and run:
```bash
git clone https://github.com/rameshmangali/MAJOR-PROJECT-LIBRARY_ATTENDANCE_SYSTEM.git
cd MAJOR-PROJECT-LIBRARY_ATTENDANCE_SYSTEM
```
*(Make sure to use your actual repository URL above)*

---

### Step 2: Run the Backend
1.  Navigate to the backend folder:
    ```bash
    cd Library-manager-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
4.  **Success**: You should see `✅ Server running on port 5000` and `✅ MongoDB Connected`.

---

### Step 3: Run the Frontend
1.  Open a **new** terminal window (keep the backend running).
2.  Navigate to the frontend folder:
    ```bash
    cd Library-manager-frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the React app:
    ```bash
    npm start
    ```
5.  **Success**: Your browser will open `http://localhost:3000` showing the dashboard.

---

### Step 4: Configure & Upload Hardware Code
1.  Connect your **ESP32** to your computer via USB.
2.  Open **Arduino IDE**.
3.  File > Open > `final_esp32_lcd_cardId_code/final_esp32_lcd_cardId.ino`.
4.  **Install Libraries** (Tools > Manage Libraries):
    - `MFRC522`
    - `LiquidCrystal I2C`
5.  **Update Variables**:
    - `ssid` and `password` for your Wi-Fi.
    - `serverUrl`:
        - If running locally: `http://<YOUR_PC_IP>:5000/api/attendance/scan?cardId=`
        - If deployed: `https://your-app-name.onrender.com/api/attendance/scan?cardId=`
6.  Select your Board (ESP32 Dev Module) and Port.
7.  Click **Upload (➡️)**.

---

## 4. Usage Guide
1.  **Add a Student**: Go to the Dashboard > Students > Add Student. Enter details and their specific **Card ID** (you can scan a card on the ESP32 and check the Serial Monitor to find its ID).
2.  **Take Attendance**: Student taps card on the reader.
    - **First Tap**: "IN Scan recorded" (Clock In).
    - **Second Tap**: "OUT Scan recorded" (Clock Out).
3.  **Monitor**: Watch the "Attendance" tab on the dashboard to see live updates.
