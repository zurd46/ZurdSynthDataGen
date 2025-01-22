/****************************************
 * main.js (vollständige Version)
 ****************************************/
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config(); // Lädt .env, falls vorhanden
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

// OpenAI-Konfiguration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

/**
 * Erstellt das Hauptfenster deiner Electron-App.
 */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Lädt index.html aus dem Ordner "renderer"
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

/**
 * IPC-Handler 'generate-datasets':
 * Bekommt Thema, Anzahl, Modell, Sprache.
 * Ruft OpenAI auf und verteilt die Antwort in train.jsonl, val.jsonl, test.jsonl.
 * Anstatt die komplette GPT-Antwort zurückzugeben,
 * wird nur trainData (als JSON-String) an den Renderer geschickt.
 */
ipcMain.handle('generate-datasets', async (event, { theme, numberOfData, model, language }) => {
  try {
    // Wir wollen 3 * numberOfData Datensätze insgesamt
    const totalCount = numberOfData * 3;
    
    // Modell-Fallback: Falls das Modell nicht in allowedModels vorkommt => 'gpt-4'
    let chosenModel = model || 'gpt-4';
    const allowedModels = ['gpt-4', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini']; // Beispiel-Liste
    if (!allowedModels.includes(chosenModel)) {
      console.warn(`Model "${chosenModel}" nicht erlaubt. Fallback auf "gpt-4".`);
      chosenModel = 'gpt-4';
    }

    // Standard: Deutsch, wenn keine Sprache angegeben
    const chosenLanguage = language || 'DE';

    // Prompt DE
    const promptDE = `
Erstelle bitte ${totalCount} kurze Datensätze zum Thema "${theme}" auf Deutsch.
Gib die Datensätze als reines JSON-Array (ohne zusätzlichen Text) zurück.
Jeder Datensatz soll folgendes Format haben:
{
  "question": "...",
  "answer": "..."
}`;

    // Prompt EN
    const promptEN = `
Create ${totalCount} short datasets on the topic "${theme}" in English.
Return them as a pure JSON array (no extra text).
Each dataset should have the following format:
{
  "question": "...",
  "answer": "..."
}`;

    // Wähle passendes Prompt
    const finalPrompt = (chosenLanguage === 'EN') ? promptEN : promptDE;

    // OpenAI ChatCompletion-Aufruf
    const response = await openai.createChatCompletion({
      model: chosenModel,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: finalPrompt }
      ],
      temperature: 0.7
    });

    // GPT-Antwort
    const gptAnswer = response.data.choices[0].message.content.trim();

    // Parsing der Antwort als JSON
    let datasets;
    try {
      datasets = JSON.parse(gptAnswer);
    } catch (err) {
      throw new Error('Parsing GPT answer as JSON failed: ' + err.message);
    }

    // Fall: GPT gibt weniger Einträge als erwartet => Fehler
    if (!Array.isArray(datasets) || datasets.length < totalCount) {
      throw new Error(`Expected ${totalCount} items, but got ${datasets.length}.`);
    }

    // Fall: GPT gibt mehr Einträge => auf totalCount kürzen
    if (datasets.length > totalCount) {
      console.warn(`GPT lieferte ${datasets.length} Einträge, benötigt werden nur ${totalCount}. Kürzen...`);
      datasets = datasets.slice(0, totalCount);
    }

    // Aufteilen in train, val, test
    const trainData = datasets.slice(0, numberOfData);
    const valData   = datasets.slice(numberOfData, 2 * numberOfData);
    const testData  = datasets.slice(2 * numberOfData, 3 * numberOfData);

    // Datensätze in JSONL anhängen (train, val, test)
    appendJSONLFile('train.jsonl', trainData);
    appendJSONLFile('val.jsonl', valData);
    appendJSONLFile('test.jsonl', testData);

    // **Nur trainData zurückgeben** => damit wir in der UI nur "train" anzeigen
    return JSON.stringify(trainData);

  } catch (error) {
    console.error('Error generating datasets:', error);
    throw error;
  }
});

/**
 * Append-Funktion: Liest existierende JSONL-Datei (Zeile für Zeile),
 * hängt neue Datensätze an und schreibt sie zurück.
 */
function appendJSONLFile(filename, dataArray) {
  // Ordner data/ (eine Ebene höher als this file)
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, filename);
  let existingData = [];

  // Falls Datei existiert, laden wir sie
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    for (const line of lines) {
      try {
        existingData.push(JSON.parse(line));
      } catch (err) {
        console.warn(`Error parsing line in ${filename}: ${err.message}`);
      }
    }
  }

  // Neue Einträge anhängen
  existingData = existingData.concat(dataArray);

  // Alles wieder ins JSONL-Format bringen
  const jsonlData = existingData.map(item => JSON.stringify(item)).join('\n');
  fs.writeFileSync(filePath, jsonlData, 'utf8');
}

/**
 * Electron-App starten
 */
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
