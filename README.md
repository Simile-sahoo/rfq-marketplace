# RFQ Marketplace - B2B Mini Marketplace

🔗 **Live Demo:** https://rfq-marketplace-pink.vercel.app
🔗 **Backend API Docs:** https://rfq-marketplace-rdnv.onrender.com/docs
🔗 **Repo:** https://github.com/Simile-sahoo/rfq-marketplace

A full-stack B2B platform where Buyers post RFQs and Vendors/Suppliers submit competitive quotations.

### ✨ Features Implemented (100% as per assignment)

**For BUYER:**
- Create RFQ (product_name, quantity, delivery_location, deadline, description) with validation
- View My RFQs
- Edit RFQ (PUT /rfq/{id})
- Delete RFQ (DELETE /rfq/{id})
- View all quotations received for an RFQ (GET /quote/rfq/{id})

**For VENDOR / SUPPLIER:**
- Browse All RFQs (GET /rfq/list)
- Search/Filter RFQs by product_name (?search=)
- Submit Quotation (price, delivery_days, notes)
- View My Submitted Quotations History (GET /quote/my)
- Loading, Empty, Error states handled

**Common:**
- JWT Auth (24h expiry) + Role-based access (BUYER/VENDOR)
- Responsive UI - Tailwind CSS
- Input validation & Error handling

### 🛠️ Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Axios - Deployed on Vercel
- **Backend:** FastAPI + SQLAlchemy ORM + SQLite (auto-seeded, Postgres ready) - Deployed on Render
- **Auth:** JWT (jose) + pbkdf2_sha256 hashing

### 🔑 Test Credentials (Auto-seeded - Render SQLite wipe fix)
- Buyer: `buyer1@gmail.com / 123456`
- Vendor: `vendor1@gmail.com / 123456`
- Vendor: `vendor2@gmail.com / 123456`

### 🚀 How to Run Locally
**Backend:**
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

**Frontend:**
cd frontend
npm install
npm run dev
VITE_API_URL=https://rfq-marketplace-rdnv.onrender.com
