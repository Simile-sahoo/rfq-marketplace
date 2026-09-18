# RFQ Marketplace - Vendor & Buyer Platform

A full-stack B2B platform where buyers post RFQs (Request for Quotations) and vendors submit bids. Built for seamless procurement.

🔗 **Live Repo:** https://github.com/Simile-sahoo/rfq-marketplace

### ✨ Features
- **For Buyers:** Create, edit, delete RFQs, view all vendor bids, accept best bid
- **For Vendors:** Browse open RFQs, submit quotations, track bid status
- **Auth:** JWT based login/signup with role-based access (Buyer/Vendor)
- **Dashboard:** Separate dashboards for Buyer and Vendor

### 🛠️ Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React, Vite, Axios, Tailwind CSS
- **Auth:** JWT, Bcrypt

### 🚀 How to Run Locally
**Backend:**
```bash
cd rfq-marketplace
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload