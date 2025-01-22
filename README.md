# Zurd SynthDataGen

This Electron project uses the OpenAI API (ChatCompletion) to generate synthetic datasets in either German or English on any given topic. Each request is split into three JSONL files (train, val, test), and new data is **appended** to those files. In the UI, however, you only see the **train** data in a table.

## Features

- **Electron app** (GUI) with Materialize CSS in dark mode style  
- **Language selection** (DE/EN)  
- **Model selection** (e.g., `gpt-4`, `gpt-4o`, etc.)  
- **Continuous appending** to `train.jsonl`, `val.jsonl`, and `test.jsonl` (no overwriting)  
- **UI table** only shows the entries from `train.jsonl` (train split)

---

## Requirements

1. **Node.js** (version 14 or higher)  
2. **OpenAI API Key** (a valid key in `.env` or set as an environment variable)  

---

## Installation & Setup

1. **Clone** the repository:
   ```bash
   git clone https://github.com/zurd46/ZurdSynthDataGen.git
   cd ZurdSynthDataGen
```
Install dependencies:

## 2. 
```bash
   npm install
```
## Set up your OpenAI API key:
   Create a .env file in the project root and add:

   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx

   (Ensure .env is in your .gitignore so it isn’t accidentally committed.)


## Start the app:
```
npm start
```
This will open an Electron window with the Zurd SynthDataGen interface.