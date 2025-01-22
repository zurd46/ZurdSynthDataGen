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
   git clone <your-repo-url>
   cd your-repo-folder
