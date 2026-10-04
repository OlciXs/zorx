// ======== KONFIGURACJA ========
const API_URL = 'https://zorx-backend.onrender.com';

// ======== MENU KONTEKSTOWE ========

chrome.runtime.onInstalled.addListener(() => {
  // Menu główne
  chrome.contextMenus.create({
    id: "wordSaverMenu",
    title: "Flipify",
    contexts: ["selection"]
  });

  // Opcja 1: Przetłumacz i zapisz
  chrome.contextMenus.create({
    id: "saveAndTranslate",
    parentId: "wordSaverMenu",
    title: "Przetłumacz i zapisz: '%s'",
    contexts: ["selection"]
  });

  // Opcja 2: Dodaj własną definicję
  chrome.contextMenus.create({
    id: "saveWithCustomDefinition",
    parentId: "wordSaverMenu",
    title: "Dodaj własną definicję dla: '%s'",
    contexts: ["selection"]
  });
});

// ======== TŁUMACZENIE ========

async function translateText(text) {
  try {
    const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const dataEn = await resEn.json();
    const detectedLang = dataEn[2];

    if (detectedLang === 'pl') {
      return dataEn[0][0][0];
    } else {
      const resPl = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pl&dt=t&q=${encodeURIComponent(text)}`);
      const dataPl = await resPl.json();
      return dataPl[0][0][0];
    }
  } catch (error) {
    console.error("Błąd tłumaczenia:", error);
    return "brak tłumaczenia";
  }
}

// ======== WYSYŁANIE DO API ========

async function sendFlashcardToAPI(word, translation) {
  try {
    const result = await chrome.storage.local.get({ authToken: null });
    
    if (!result.authToken) {
      console.log('Brak tokena — fiszka zapisana tylko lokalnie.');
      return false;
    }

    const response = await fetch(`${API_URL}/flashcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.authToken}`,
      },
      body: JSON.stringify({ word, translation }),
    });

    if (response.status === 401) {
      // Token wygasł
      await chrome.storage.local.remove(['authToken', 'userEmail']);
      console.warn('Token wygasł. Wylogowano.');
      return false;
    }

    if (!response.ok) {
      console.error('Błąd wysyłania fiszki:', response.statusText);
      return false;
    }

    console.log('✅ Fiszka wysłana do bazy:', word, '->', translation);
    return true;
  } catch (err) {
    console.error('Błąd połączenia z API:', err);
    return false;
  }
}

// ======== FUNKCJA ZAPISU ========

function saveWord(originalWord, definitionText) {
  chrome.storage.local.get({ savedWords: [] }, async (result) => {
    const words = result.savedWords;
    
    const exists = words.some(item => 
      (typeof item === 'string' ? item : item.original).toLowerCase() === originalWord.toLowerCase()
    );

    if (!exists) {
      // Spróbuj wysłać do API
      const synced = await sendFlashcardToAPI(originalWord, definitionText);
      
      words.push({ original: originalWord, translation: definitionText, synced: synced });
      chrome.storage.local.set({ savedWords: words }, () => {
        console.log("Zapisano:", originalWord, "->", definitionText, synced ? "(zsynchronizowano)" : "(tylko lokalnie)");
      });
    }
  });
}

// ======== MODAL DEFINICJI (wstrzykiwany do strony) ========

// Funkcja wstrzykiwana bezpośrednio do przeglądanej strony
function showCustomDefinitionModal(selectedText) {
  // Usuń stare okienko, jeśli już istnieje
  const existingModal = document.getElementById('word-saver-modal');
  if (existingModal) existingModal.remove();

  // Tworzenie tła (overlay)
  const modal = document.createElement('div');
  modal.id = 'word-saver-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(74, 13, 49, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    font-family: Arial, sans-serif;
  `;

  // Zawartość okienka
  modal.innerHTML = `
    <div style="
      background: linear-gradient(145deg, #ffffff, #fff0f8);
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #f0c9df;
      box-shadow: 0 20px 50px rgba(154, 0, 88, 0.2);
      width: 320px;
      color: #24101d;
      box-sizing: border-box;
    ">
      <h3 style="margin-top:0; margin-bottom: 10px; font-size:15px; color:#222222;">
        Definicja dla: <span style="color:#d10078;">"${selectedText}"</span>
      </h3>
      <textarea id="word-saver-input" rows="3" placeholder="Wpisz własne znaczenie..." style="
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
        border: 1px solid #df9fc3;
        border-radius: 8px;
        resize: vertical;
        font-family: Arial, sans-serif;
        font-size: 13px;
        margin-bottom: 12px;
      "></textarea>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button id="word-saver-cancel" style="
          padding: 6px 12px;
          background: #fff0f8;
          color: #70445e;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        ">Anuluj</button>
        <button id="word-saver-save" style="
          padding: 6px 12px;
          background: linear-gradient(135deg, #d10078, #f02b9f);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        ">Zapisz</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const input = document.getElementById('word-saver-input');
  const saveBtn = document.getElementById('word-saver-save');
  const cancelBtn = document.getElementById('word-saver-cancel');

  input.focus();

  // Zapis do pamięci przeglądarki
  saveBtn.addEventListener('click', () => {
    const definition = input.value.trim();
    if (definition) {
      chrome.storage.local.get({ savedWords: [] }, (result) => {
        const words = result.savedWords;
        const exists = words.some(item => 
          (typeof item === 'string' ? item : item.original).toLowerCase() === selectedText.toLowerCase()
        );

        if (!exists) {
          // Zapisujemy jako niesynchronizowane — synchronizacja nastąpi w background.js
          words.push({ original: selectedText, translation: definition, synced: false });
          chrome.storage.local.set({ savedWords: words }, () => {
            // Wyślij wiadomość do service workera, żeby zsynchronizował
            chrome.runtime.sendMessage({ 
              action: 'syncWord', 
              word: selectedText, 
              translation: definition 
            });
            modal.remove();
          });
        } else {
          modal.remove();
        }
      });
    }
  });

  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
}

// ======== OBSŁUGA MENU KONTEKSTOWEGO ========

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText ? info.selectionText.trim() : "";
  if (!selectedText) return;

  if (info.menuItemId === "saveAndTranslate") {
    const translation = await translateText(selectedText);
    saveWord(selectedText, translation);
  } 
  else if (info.menuItemId === "saveWithCustomDefinition") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showCustomDefinitionModal,
      args: [selectedText]
    });
  }
});

// ======== OBSŁUGA WIADOMOŚCI Z CONTENT SCRIPT ========

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'syncWord') {
    // Próbuj zsynchronizować słowo dodane z modala na stronie
    sendFlashcardToAPI(message.word, message.translation).then(synced => {
      if (synced) {
        // Zaktualizuj flagę synced w storage
        chrome.storage.local.get({ savedWords: [] }, (result) => {
          const words = result.savedWords;
          const idx = words.findIndex(item => 
            typeof item === 'object' && item.original.toLowerCase() === message.word.toLowerCase()
          );
          if (idx !== -1) {
            words[idx].synced = true;
            chrome.storage.local.set({ savedWords: words });
          }
        });
      }
    });
  }
});