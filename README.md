# Google-Cloud

## English

### Overview
This is a Node.js web application that provides a CRUD (Create, Read, Update, Delete) service for managing files on Google Drive. Users authenticate via Google OAuth2 and can upload, list, preview, download, delete, and share files through a simple web interface. Files are stored in a dedicated "Cloud" folder in the user's Google Drive. The backend uses Express.js, MongoDB for metadata storage, and integrates with the Google Drive API. The frontend is a single HTML page with JavaScript for dynamic interactions.

### Features
- **Google Authentication**: Secure login with OAuth2, including refresh tokens for persistent access.
- **File Upload**: Upload files to a "Cloud" folder in Google Drive.
- **File Management**: List files with details (name, size, upload date), preview, download, and delete.
- **Public Sharing**: Generate direct web links for streaming files without authentication.
- **Automatic Folder Handling**: Creates the "Cloud" folder if it doesn't exist.
- **Token Refresh**: Automatic handling of access token expiration.

### Technologies
- Node.js and Express.js for the server.
- MongoDB with Mongoose for database.
- Google APIs (Drive v3, OAuth2).
- Multer for file uploads.
- Tailwind CSS and JavaScript for the frontend.

### Requirements
- Node.js (v14+)
- MongoDB instance
- Google Cloud Project with Drive API enabled and OAuth credentials
- Environment variables in `.env` (use `.env.dist` as template):
  ```
  PORT=8080
  MONGO_URI=mongodb://localhost:27017/googlecloud
  GOOGLE_CLIENT_ID=your_client_id
  GOOGLE_CLIENT_SECRET=your_client_secret
  GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
  SESSION_SECRET=your_secret
  ```

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/DilyorbekAbdujabborov/Google-Cloud.git
   cd Google-Cloud
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up `.env` file with required variables.
4. Start the server:
   ```
   node app.js
   ```

### Usage
- Visit `http://localhost:8080/` to be redirected to Google login.
- After authentication, manage files via the UI at `/file`.
- Upload files, view list, and use actions like preview, download, copy web link, or delete.
- Web links (e.g., `/files/web/:id`) provide direct access to files.

### Project Structure
- `app.js`: Main application entry point.
- `models/`: Database schemas (User.js, File.js).
- `routes/`: API routes (auth.js, files.js).
- `src/index.html`: Frontend UI.
- `.env.dist`: Environment variable template.
- `.gitignore`: Git ignore file.

### Notes
- Files are made publicly accessible (anyone with link) upon upload.
- Scope limited to app-created files (`drive.file`).
- Use HTTPS in production for security.

### License
MIT License.

## O'zbekcha

### Umumiy ma'lumot
Bu Node.js veb-ilovasi bo'lib, Google Drive'dagi fayllarni CRUD (Yaratish, O'qish, Yangilash, O'chirish) xizmati orqali boshqarish imkonini beradi. Foydalanuvchilar Google OAuth2 orqali autentifikatsiya qiladi va oddiy veb-interfeys orqali fayllarni yuklaydi, ro'yxatlaydi, ko'radi, yuklab oladi, o'chiradi va ulashadi. Fayllar foydalanuvchining Google Drive'idagi maxsus "Cloud" papkasida saqlanadi. Backend Express.js'dan foydalanadi, metama'lumotlar uchun MongoDB, va Google Drive API bilan integratsiya qilingan. Frontend bitta HTML sahifasi bo'lib, JavaScript bilan dinamik interaktsiyalarni ta'minlaydi.

### Xususiyatlar
- **Google Autentifikatsiyasi**: OAuth2 bilan xavfsiz kirish, doimiy kirish uchun refresh tokenlar.
- **Fayl Yuklash**: Fayllarni Google Drive'ning "Cloud" papkasiga yuklash.
- **Fayl Boshqaruvi**: Fayllarni ro'yxatlash (nomi, hajmi, yuklangan sana), ko'rish, yuklab olish va o'chirish.
- **Umumiy Ulashish**: Autentifikatsiyasiz fayllarni oqimlash uchun to'g'ridan-to'g'ri veb-havolalar yaratish.
- **Avtomatik Papka Boshqaruvi**: "Cloud" papkasi mavjud bo'lmasa yaratadi.
- **Token Yangilash**: Access token muddatining avtomatik boshqaruvi.

### Texnologiyalar
- Server uchun Node.js va Express.js.
- Ma'lumotlar bazasi uchun MongoDB va Mongoose.
- Google API'lari (Drive v3, OAuth2).
- Fayl yuklash uchun Multer.
- Frontend uchun Tailwind CSS va JavaScript.

### Talablar
- Node.js (v14+)
- MongoDB nusxasi
- Drive API faollashtirilgan Google Cloud loyihasi va OAuth ma'lumotlari
- `.env` faylida atrof-muhit o'zgaruvchilari (`.env.dist` ni shablon sifatida foydalaning):
  ```
  PORT=8080
  MONGO_URI=mongodb://localhost:27017/googlecloud
  GOOGLE_CLIENT_ID=sizning_client_id
  GOOGLE_CLIENT_SECRET=sizning_client_secret
  GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
  SESSION_SECRET=sizning_maxfiy
  ```

### O'rnatish
1. Repozitoriyani klonlash:
   ```
   git clone https://github.com/DilyorbekAbdujabborov/Google-Cloud.git
   cd Google-Cloud
   ```
2. Bog'liqliklarni o'rnatish:
   ```
   npm install
   ```
3. Kerakli o'zgaruvchilar bilan `.env` faylini sozlash.
4. Serverni ishga tushirish:
   ```
   node app.js
   ```

### Foydalanish
- `http://localhost:8080/` ga kirib, Google kirishiga yo'naltiriladi.
- Autentifikatsiyadan keyin `/file` da UI orqali fayllarni boshqaring.
- Fayllarni yuklang, ro'yxatni ko'ring va ko'rish, yuklab olish, veb-havolani nusxalash yoki o'chirish kabi amallarni bajaring.
- Veb-havolalar (masalan, `/files/web/:id`) fayllarga to'g'ridan-to'g'ri kirishni ta'minlaydi.

### Loyiha Tuzilishi
- `app.js`: Asosiy ilova kirish nuqtasi.
- `models/`: Ma'lumotlar bazasi sxemalari (User.js, File.js).
- `routes/`: API yo'llari (auth.js, files.js).
- `src/index.html`: Frontend UI.
- `.env.dist`: Atrof-muhit o'zgaruvchilari shabloni.
- `.gitignore`: Git e'tiborsiz fayllar.

### Eslatmalar
- Yuklash vaqtida fayllar umumiy kirishli (havola bilan har kim) qilinadi.
- Scope ilova yaratgan fayllar bilan cheklangan (`drive.file`).
- Ishlab chiqarishda xavfsizlik uchun HTTPSdan foydalaning.

### Litsenziya
MIT Litsenziyasi.

## Русский

### Обзор
Это веб-приложение на Node.js, предоставляющее сервис CRUD (Create, Read, Update, Delete) для управления файлами в Google Drive. Пользователи аутентифицируются через Google OAuth2 и могут загружать, просматривать список, предпросматривать, скачивать, удалять и делиться файлами через простой веб-интерфейс. Файлы хранятся в специальной папке "Cloud" в Google Drive пользователя. Backend использует Express.js, MongoDB для хранения метаданных и интегрируется с API Google Drive. Frontend — это одна HTML-страница с JavaScript для динамических взаимодействий.

### Функции
- **Аутентификация Google**: Безопасный вход с OAuth2, включая refresh-токены для постоянного доступа.
- **Загрузка файлов**: Загрузка файлов в папку "Cloud" Google Drive.
- **Управление файлами**: Список файлов с деталями (имя, размер, дата загрузки), предпросмотр, скачивание и удаление.
- **Публичный обмен**: Генерация прямых веб-ссылок для потоковой передачи файлов без аутентификации.
- **Автоматическая обработка папки**: Создает папку "Cloud", если она не существует.
- **Обновление токенов**: Автоматическая обработка истечения access-токенов.

### Технологии
- Node.js и Express.js для сервера.
- MongoDB с Mongoose для базы данных.
- API Google (Drive v3, OAuth2).
- Multer для загрузки файлов.
- Tailwind CSS и JavaScript для frontend.

### Требования
- Node.js (v14+)
- Экземпляр MongoDB
- Проект Google Cloud с включенным API Drive и учетными данными OAuth
- Переменные окружения в `.env` (используйте `.env.dist` как шаблон):
  ```
  PORT=8080
  MONGO_URI=mongodb://localhost:27017/googlecloud
  GOOGLE_CLIENT_ID=your_client_id
  GOOGLE_CLIENT_SECRET=your_client_secret
  GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
  SESSION_SECRET=your_secret
  ```

### Установка
1. Клонируйте репозиторий:
   ```
   git clone https://github.com/DilyorbekAbdujabborov/Google-Cloud.git
   cd Google-Cloud
   ```
2. Установите зависимости:
   ```
   npm install
   ```
3. Настройте файл `.env` с необходимыми переменными.
4. Запустите сервер:
   ```
   node app.js
   ```

### Использование
- Посетите `http://localhost:8080/`, чтобы быть перенаправленным на вход в Google.
- После аутентификации управляйте файлами через UI на `/file`.
- Загружайте файлы, просматривайте список и используйте действия, такие как предпросмотр, скачивание, копирование веб-ссылки или удаление.
- Веб-ссылки (например, `/files/web/:id`) предоставляют прямой доступ к файлам.

### Структура проекта
- `app.js`: Основная точка входа приложения.
- `models/`: Схемы базы данных (User.js, File.js).
- `routes/`: Маршруты API (auth.js, files.js).
- `src/index.html`: UI frontend.
- `.env.dist`: Шаблон переменных окружения.
- `.gitignore`: Файл игнорирования Git.

### Примечания
- Файлы делаются публично доступными (любой со ссылкой) при загрузке.
- Область ограничена файлами, созданными приложением (`drive.file`).
- Используйте HTTPS в продакшене для безопасности.

### Лицензия
Лицензия MIT.****
