const generateBtn = document.getElementById('generateBtn');
const themeInput = document.getElementById('theme');
const numberInput = document.getElementById('number');
const modelSelect = document.getElementById('modelSelect');
const languageSelect = document.getElementById('languageSelect');
const resultDiv = document.getElementById('result');

generateBtn.addEventListener('click', async () => {
  const theme = themeInput.value.trim();
  const numberOfData = parseInt(numberInput.value, 10);
  const selectedModel = modelSelect.value;
  const selectedLanguage = languageSelect.value;

  if (!theme || !numberOfData) {
    resultDiv.textContent = 'Please enter a valid topic and number.';
    return;
  }

  resultDiv.textContent = 'Generating datasets... Please wait.';

  try {
    // IPC-Aufruf an main-Prozess 
    // => Dort werden trainData zurückgegeben (als JSON-String)
    const trainDataJSON = await window.electronAPI.generateDatasets(
      theme,
      numberOfData,
      selectedModel,
      selectedLanguage
    );

    // Versuch, das Ergebnis als JSON zu parsen (trainData-Array)
    let trainData;
    try {
      trainData = JSON.parse(trainDataJSON);
    } catch (parseErr) {
      // Falls kein valides JSON
      resultDiv.innerHTML = `
        <p>Response from Zurd SynthDataGen:</p>
        <pre>${trainDataJSON}</pre>
        <p>Could not parse as JSON: ${parseErr.message}</p>
      `;
      return;
    }

    // Falls ein Array, bauen wir eine Tabelle
    if (Array.isArray(trainData)) {
      let tableHTML = `
        <p>Showing only TRAIN dataset entries:</p>
        <table class="highlight">
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
      `;

      trainData.forEach(item => {
        tableHTML += `
          <tr>
            <td>${item.question || ''}</td>
            <td>${item.answer || ''}</td>
          </tr>
        `;
      });

      tableHTML += `
          </tbody>
        </table>
        <p>Files appended to "train.jsonl", "val.jsonl", "test.jsonl" in "data/".</p>
      `;

      // Tabelle ausgeben (nur TRAIN)
      resultDiv.innerHTML = tableHTML;
    } else {
      // Nicht Array => zeige direkt an
      resultDiv.innerHTML = `
        <p>Response from Zurd SynthDataGen (not an array):</p>
        <pre>${trainDataJSON}</pre>
      `;
    }
  } catch (error) {
    console.error('Error:', error);
    resultDiv.textContent = `Error generating datasets: ${error.message}`;
  }
});
