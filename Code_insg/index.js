const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const app = express();
const PORT = 3000;

// JSON-Datei mit Google Sheets Zugangsdaten
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'datenablagerung-85021172cd6d.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// ID deines Google Sheets
const spreadsheetId = '1M4J2cii8MVlIOmNwcVdmqaUhVyZDl68atdMny7xjN10';

// Middleware zum Parsen von JSON-Anfragen
app.use(express.json());
// Statisches Verzeichnis einrichten, damit HTML, CSS und JS-Dateien geladen werden können
app.use(express.static(path.join(__dirname, 'public')));

// Standard-Route für die Startseite (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route zum Abrufen der Daten aus Google Sheets
app.get('/get-data', async (req, res) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const range = 'Tabellenblatt1!A2:D';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (rows.length) {
      res.json({ data: rows });
    } else {
      res.json({ data: [] });
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    res.status(500).send('Fehler beim Abrufen der Daten.');
  }
});

// Route zum Hinzufügen neuer Daten zu Google Sheets
app.post('/add-data', async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Tabellenblatt1!A:E',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[username, password, email, role]],
      },
    });

    res.status(200).send('Daten erfolgreich hinzugefügt.');
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Daten:', error);
    res.status(500).send('Fehler beim Hinzufügen der Daten.');
  }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
      const range = 'Tabellenblatt1!A2:D'; // Bereich anpassen, falls nötig
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
  
      const rows = response.data.values;
      if (rows.length) {
        const user = rows.find(row => row[0] === username && row[1] === password);
        if (user) {
          // Falls der Benutzer gefunden wurde, sende die Rolle zurück
          res.json({ success: true, user: { username: user[0], role: user[3] } });
        } else {
          // Falls der Benutzer nicht gefunden wurde oder das Passwort falsch ist
          res.json({ success: false, message: 'Ungültige Anmeldedaten' });
        }
      } else {
        res.json({ success: false, message: 'Keine Benutzerdaten gefunden' });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      res.status(500).send('Fehler beim Abrufen der Daten.');
    }
  });
  
  app.post('/add-wpf', async (req, res) => {
    const { moduleName, room, professor, maxParticipants } = req.body;
  
    try {
      const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Tabellenblatt1!E:H',  // Dies stellt sicher, dass die Daten in die Spalten E bis H geschrieben werden
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[moduleName, room, professor, maxParticipants]],
        },
      });
  
      res.status(200).send('WPF erfolgreich hinzugefügt.');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der WPF:', error);
      res.status(500).send('Fehler beim Hinzufügen der WPF.');
    }
  });
  

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
