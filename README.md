<p align="center"><img src="https://download.kykms.cn/logo_keyi.png" alt="kmatrix" width="100" /></p>
<h1 align="center">KMatrix - AI-enhanced Enterprise Knowledge Base Platform</h1>

<p align="center">
    <strong>A next-generation AI knowledge base workflow platform built based on RuoYi-Vue-Plus and LangChain4j</strong>
</p>

<p align="center">
    <a href="https://github.com/mahoneliu/KMatrix-service">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    </a>
    <a href="https://spring.io/projects/spring-boot">
        <img src="https://img.shields.io/badge/Spring%20Boot-3.5.7-green.svg" alt="Spring Boot" />
    </a>
    <a href="https://vuejs.org/">
        <img src="https://img.shields.io/badge/Vue-3.5.25-4FC08D.svg" alt="Vue 3" />
    </a>
    <a href="https://www.postgresql.org/">
        <img src="https://img.shields.io/badge/PostgreSQL-17+-336791.svg" alt="PostgreSQL" />
    </a>
</p>

-----------------------------------

## 📖 Introduction

**KMatrix** is a completely reconstructed version of **Keyi Knowledge Base (KYKMS)**, focusing on the deep integration of traditional document management with advanced AI technology.

In the digital age, enterprises accumulate massive amounts of unstructured data, but often find it difficult to utilize effectively. KMatrix is committed to solving this pain point, transforming static documents into dynamic knowledge services through **RAG (Retrieval-Augmented Generation)** technology and **visual workflow orchestration**.

KMatrix is not just a document repository, but also an **AI Agent incubation platform**. Users can easily build intelligent Q&A assistants, document analysis experts, or business auxiliary robots based on local knowledge bases through a drag-and-drop workflow designer, or query databases via natural language to solve long-tail business needs.

-----------------------------------

## 📂 Project Description

- This project is the frontend part of KMatrix. For specific introduction and deployment details, please refer to the backend project: [https://github.com/mahoneliu/KMatrix-service](https://github.com/mahoneliu/KMatrix-service)

-----------------------------------

## ✨ Core Highlights

- **🚀 Modern Technology Stack**: Back-end based on **RuoYi-Vue-Plus (Spring Boot 3 + JDK 17)**, front-end based on **Soybean Admin (Vue 3 + Vite + Naive UI)**, keeping up with technical trends with excellent performance and development experience.
- **🧠 Powerful AI Engine**: Deeply integrated with **LangChain4j** and **LangGraph4j**, providing the strongest AI application development experience in the Java ecosystem.
- **⛓️ Visual Workflow**: Built-in workflow orchestration engine based on **Vue Flow**, supporting node dragging and connection configuration. Users can customize AI processing flows (e.g., Knowledge Retrieval -> LLM Thinking -> Result Formatting).
- **📚 Enhanced RAG**: Supports **PostgreSQL + pgvector** for efficient vector retrieval, combined with **Elasticsearch** (planned) hybrid search, providing precise document Q&A capabilities. Supports parsing of multiple formats like PDF, Word, and Markdown.
- **🔌 Seamless Embedding**: Copy a single line of script to embed into third-party business systems, allowing existing systems to quickly acquire intelligent Q&A capabilities.
- **🌍 Model Neutral**: Supports integration with various large models, including local private models (DeepSeek R1 / Llama 3 / Qwen 2, etc.), domestic public models (Tongyi Qianwen / ByteDance Doubao / Zhipu AI / Kimi, etc.), and foreign public models (OpenAI / Gemini, etc.).
- **🧩 Modular Design**: Back-end and front-end are completely separated.
  - **kmatrix-service**: Powerful back-end service with RBAC permission support.
  - **kmatrix-ui**: Monorepo architecture, including admin dashboard (`@km/admin`) and embedded chat window (`@km/chat`).
- **🎨 Ultimate UI Experience**: Uses the Naive UI component library, with carefully polished interface interaction, supporting dark mode and theme customization, providing a smooth orchestration experience similar to Dify.
- **🔒 Secure and Controllable**: Supports full private deployment, combined with Sa-Token authentication and fine-grained permission control to ensure the security of corporate knowledge assets.

-----------------------------------

## 🛠️ Tech Architecture

### Backend (kmatrix-service)

- **Foundation**: Spring Boot 3.5.7
- **Language**: Java 17+
- **ORM**: MyBatis Plus 3.5.14 + Dynamic Datasource
- **Database**: PostgreSQL (Recommended, with pgvector) / MySQL / Oracle
- **AI Framework**: LangChain4j, LangGraph4j
- **Auth**: Sa-Token 1.44.0 (JWT)
- **Cache**: Redis 5+ (Redisson)
- **Utilities**: Hutool, Lombok, Knife4j

### Frontend (kmatrix-ui)

- **Framework**: Vue 3.5.25
- **Build Tool**: Vite 7.2.6
- **Language**: TypeScript 5.9.3
- **UI Framework**: Naive UI 2.43.2 + TailwindCSS (UnoCSS)
- **Workflow**: Vue Flow 1.48.1
- **Scaffold**: Soybean Admin
- **Package Manager**: pnpm (Monorepo)

-----------------------------------

## 🤝 Special Thanks

This project stands on the shoulders of giants. Special thanks to the following excellent open-source projects:

- **RuoYi-Vue-Plus**: [https://gitee.com/dromara/RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus)
- **Soybean Admin**: [https://github.com/soybeanjs/soybean-admin](https://github.com/soybeanjs/soybean-admin)
- **LangChain4j**: [https://github.com/langchain4j/langchain4j](https://github.com/langchain4j/langchain4j)
- **Vue Flow**: [https://github.com/bcakmakoglu/vue-flow](https://github.com/bcakmakoglu/vue-flow)

-----------------------------------

## 📄 License

The software is open-sourced under the **MIT** license. You are free to use, modify, and distribute it, but please keep the original author's copyright notice.
