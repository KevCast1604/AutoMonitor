# AutoMonitor: Full-Stack Change Detection Ecosystem

**AutoMonitor** is a comprehensive solution designed to automate the tracking, analysis, and visualization of changes within JSON-based product feeds. The system bridges the gap between raw data streams and actionable insights by providing a robust background processing engine and a high-fidelity monitoring dashboard.



## Project Vision

The core objective of AutoMonitor is to eliminate the manual overhead of auditing data feeds. Whether it's tracking inventory fluctuations, price changes, or catalog updates, the system ensures that every modification is detected, categorized, and recorded for historical analysis.

---

## System Architecture

The ecosystem is composed of two distinct but deeply integrated layers:

### 1. The Intelligence Layer (Backend)
Built with **Python** and **FastAPI**, this layer serves as the "brain" of the operation. It handles the lifecycle of data through three specific sub-systems:
* **Comparison Engine:** A specialized logic that performs a granular "diff" between the current state of a remote feed and the last known version.
* **State Persistence:** A managed SQLite database that stores a permanent, immutable record of all detected events.
* **Alerting Gateway:** An integrated Telegram bot service that pushes instant notifications to stakeholders as soon as a significant change is detected.

### 2. The Visualization Layer (Frontend)
A modern Single Page Application (SPA) crafted with **React**, **TypeScript**, and **Tailwind CSS**. It transforms technical logs into a clean, human-centric monitoring experience:
* **Real-time Metrics:** High-level overview of system health and cumulative change statistics.
* **Event Timeline:** A chronological history of all data mutations, allowing users to navigate through past states.
* **Deep Inspection:** A detailed view for every event, providing exact counts of added, removed, or updated items and a safe viewer for the raw JSON payload.



---

## Operational Workflow

1.  **Polling:** The system retrieves the latest data from the configured source URL.
2.  **Analysis:** The engine identifies which elements are new, which have disappeared, and which have been modified.
3.  **Persistence:** The results are serialized and saved to the event history.
4.  **Notification:** If changes exist, a summary is broadcasted via Telegram.
5.  **Review:** Users access the web dashboard to inspect the impact and specific details of the update.

---

## Core Technologies

* **Core Logic:** Python 3.9+ / FastAPI
* **Scheduling:** APScheduler (for persistent watch mode)
* **Database:** SQLite (Relational persistence)
* **UI Framework:** React 18+ / Vite
* **Styles:** Tailwind CSS (with Dark Mode support)
* **Communications:** Telegram Bot API / REST API

---

## Target Use Cases

* **E-commerce Auditing:** Monitor competitor pricing or internal stock fluctuations.
* **API Drift Tracking:** Detect structural or content changes in third-party data providers.
* **Content Monitoring:** Track updates in dynamic catalogs or news feeds.
