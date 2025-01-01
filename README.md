# SheetFlow

**SheetFlow** is an open-source platform that turns your spreadsheets (Google Sheets, Excel, etc.) into powerful, customizable REST APIs. Designed for developers and non-developers alike, SheetFlow enables seamless data integration and management, making spreadsheets act as lightweight, dynamic databases.

---

## Features

### Core Features:
- **Spreadsheet-to-API Conversion**: Instantly convert your Google Sheets or Excel files into RESTful APIs.
- **Real-Time Data Sync**: Reflect changes in your spreadsheet in real-time via the API.
- **Custom Endpoints**: Tailor API endpoints to suit your application’s needs.
- **Data Querying and Filtering**: Retrieve specific data with advanced filters and query parameters.
- **Secure API Access**: Authentication options to protect your data.

### Advanced Features:
- **Self-Hosting**: Deploy SheetFlow on your own server for complete control and privacy.
- **Webhooks**: Trigger events when spreadsheet data is updated.
- **Multi-Source Support**: Integrate data from Google Sheets, Excel, and more.
- **Analytics**: Gain insights into API usage with built-in analytics tools.

---

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- Google Sheets API credentials (for Google Sheets integration)
- [Optional] Docker (for self-hosted deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sheetflow.git
   cd sheetflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your Google Sheets API credentials.

4. Start the development server:
   ```bash
   npm start
   ```

5. Access the app at `http://localhost:3000`.

---

## API Usage

### Base URL
```
http://localhost:3000/api
```

### Endpoints
#### 1. **GET /sheet/:sheetId**
Retrieve data from a specified sheet.

Example:
```bash
GET /sheet/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

#### 2. **POST /sheet/:sheetId**
Insert new data into the sheet.

Example:
```bash
POST /sheet/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
{
  "name": "John",
  "age": 30
}
```

#### 3. **PUT /sheet/:sheetId/:rowId**
Update a specific row in the sheet.

#### 4. **DELETE /sheet/:sheetId/:rowId**
Delete a specific row from the sheet.

---

## Contributing
We welcome contributions from the community! To get started:
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/my-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add my new feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/my-feature
   ```
5. Submit a pull request.

---

## License
SheetFlow is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute this project as per the terms of the license.

---

## Community and Support
- **GitHub Discussions**: Join the conversation and share your ideas.
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/your-username/sheetflow/issues).
- **Email**: Reach out to us at support@sheetflow.io.

---

## Roadmap
- **v1.0**:
  - Google Sheets support
  - Basic API features (CRUD)
- **v1.1**:
  - Excel file support
  - Advanced filtering and analytics
- **v2.0**:
  - Webhooks and self-hosted version
  - Multi-source integrations

---

## Acknowledgments
Special thanks to the open-source community and projects like [SheetDB.io](https://sheetdb.io/) for inspiring the development of SheetFlow.

