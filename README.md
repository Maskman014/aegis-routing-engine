# Aegis Multi-Tier AI Routing Engine

Aegis is an enterprise-grade multi-tier proxy routing engine built to optimize Large Language Model (LLM) inference costs, handle traffic prioritization, and maintain low-latency response speeds. The system intercepts incoming prompt payloads, evaluates their semantic and structural complexity in real-time, and dynamically routes them to the most cost-efficient processing layer.

---

## 🏗️ Core Architecture Overview

The system runs a 4-tier routing matrix designed to balance raw computational power against transactional API overhead:

*   **Tier 1: Ultra-Lightweight Layer (Deterministic)** - Instantly captures and routes basic strings, static commands, and administrative operations using regex and token keyword maps, entirely bypassing LLM compute costs.
*   **Tier 2: Speed & Efficiency Layer** - Handles standard conversational patterns, quick text formatting, and high-velocity tasks through low-latency processing pipelines.
*   **Tier 3: Complex Reasoning Layer** - Leverages deep context matching for high-complexity math parsing, structured data transformations, and advanced logic compilation.
*   **Tier 4: Fallback & Redundancy Tier** - Insulates the core infrastructure against primary gateway connection failures, automatically catching edge cases to ensure processing continuity.

---

## 🛠️ Technology Stack

*   **Frontend User Interface:** React.js, Tailwind CSS (Features real-time performance analytics dashboards and savings trackers)
*   **Backend Application Layer:** Node.js, TypeScript
*   **Execution Infrastructure:** Orchestrated natively via `tsx` (TypeScript Execute) to handle high-performance modern ECMAScript module structures cleanly.

---

## ⚙️ Installation & Local Deployment

Follow these exact steps to clone, configure, and launch the engine locally on your machine.

### 1. Prerequisites
Ensure you have the Node.js runtime installed on your operating system:
*   **Node.js** (v20 or higher recommended)

### 2. Clone the Repository
Open your terminal or command prompt and run the following commands to pull down the source code and step into the project root directory:
```bash
git clone [https://github.com/Maskman014/aegis-routing-engine.git](https://github.com/Maskman014/aegis-routing-engine.git)
cd aegis-routing-engine
```
### 3. Install Project Dependencies
Install all required node packages and project binaries cleanly using npm:
```bash
npm install
```
### 4. Configure Your Environment Variables
Create a file named precisely `.env` in the root of your project directory (`C:\Users\ADMIN\Downloads\aegis-routing-engine\.env`) and insert your access key configuration line:
```env
GEMINI_API_KEY=your_secure_api_key_here

npm run dev
```
