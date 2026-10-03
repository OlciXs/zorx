chrome.runtime.onInstalled.addListener(() => {
  // Menu główne
  chrome.contextMenus.create({
    id: "wordSaverMenu",
    title: "Zapisywacz Słów",
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    font-family: Arial, sans-serif;
  `;

  // Zawartość okienka
  modal.innerHTML = `
    <div style="
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      width: 320px;
      color: #333333;
      box-sizing: border-box;
    ">
      <h3 style="margin-top:0; margin-bottom: 10px; font-size:15px; color:#222222;">
        Definicja dla: <span style="color:#007bff;">"${selectedText}"</span>
      </h3>
      <textarea id="word-saver-input" rows="3" placeholder="Wpisz własne znaczenie..." style="
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        resize: vertical;
        font-family: Arial, sans-serif;
        font-size: 13px;
        margin-bottom: 12px;
      "></textarea>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button id="word-saver-cancel" style="
          padding: 6px 12px;
          background: #e0e0e0;
          color: #333;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Anuluj</button>
        <button id="word-saver-save" style="
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
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
          words.push({ original: selectedText, translation: definition });
          chrome.storage.local.set({ savedWords: words }, () => {
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

function saveWord(originalWord, definitionText) {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const words = result.savedWords;
    
    const exists = words.some(item => 
      (typeof item === 'string' ? item : item.original).toLowerCase() === originalWord.toLowerCase()
    );

    if (!exists) {
      words.push({ original: originalWord, translation: definitionText });
      chrome.storage.local.set({ savedWords: words }, () => {
        console.log("Zapisano:", originalWord, "->", definitionText);
      });
    }
  });
}