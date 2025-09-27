# Dementia Detection Website (SIH 2025)

This repository hosts the code for the **Dementia Detection Website**, developed for the **Smart India Hackathon 2025 (SIH 2025)**. This platform is designed to assist in the **early-stage detection and analysis of dementia**, offering users a detailed, preliminary analysis.

WARNING: This tool is for informational and preliminary analysis purposes only. **Always consult a doctor or a medical professional** for accurate diagnosis, as AI models cannot be perfectly accurate.

---

## Collaborators

* ARJUN-R-DEVADIGA ([@ARJUN-R-DEVADIGA](https://github.com/ARJUN-R-DEVADIGA))

---

## Features

* **User-Friendly Web Interface:** Intuitive and easy-to-navigate design.
* **Responsive Design:** Optimized for seamless use across various devices (desktop, tablet, mobile).
* **Robust Backend:** Built with **Node.js / Express.js** for reliable performance.
* **Detailed Analysis:** Provides comprehensive, easy-to-understand insights into the detection results.

---

## Tech Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React.js** | Core JavaScript library for building the UI. |
| **TypeScript** | Ensures type safety and enhances code quality. |
| **Styling (CSS/HTML)** | Foundational markup and responsive, user-friendly styling. |
| **State Management** | **Redux** or **Context API** for centralized state handling. |
| **Styling Framework** | **Tailwind CSS** or **Bootstrap** for rapid, consistent styling. |
| **HTTP Client** | **Axios** or **Fetch API** for making API requests. |
| **Build Tool** | **Vite** for fast development and optimized production builds. |

### Backend & Infrastructure
| Technology | Purpose |
| :--- | :--- |
| **Backend** | **Node.js** and **Express.js** (Server-side runtime and framework). |
| **Database** | **Supabase** (Realtime database and services). |
| **Authentication** | **Supabase Auth** or **JWT** (User sign-in/security). |
| **Environment** | **dotenv** (Configuration and secret management). |

---

## Getting Started

### Prerequisites

You will need **Node.js** and **npm** installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPO_URL]
    cd dementia-detection-website
    ```

2.  **Install dependencies:**
    The repository only contains `package.json` and `package-lock.json`. Restore all necessary dependencies using npm.

    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root directory and add your configuration variables (e.g., Supabase keys, server port, etc.). Refer to the environment management section for specifics.
