const listElement = document.getElementById('wordList');
const clearBtn = document.getElementById('clearBtn');

// Elementy modala edycji
const editModal = document.getElementById('editModal');
const editOriginalInput = document.getElementById('editOriginalInput');
const editTranslationInput = document.getElementById('editTranslationInput');
const cancelEditBtn = document.getElementById('cancelEdit');
const saveEditBtn = document.getElementById('saveEdit');

let currentEditingIndex = null;
let currentWordsArray = [];

async function fetchTranslation(text) {
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
    return null;
  }
}

function renderWords() {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    listElement.innerHTML = '';
    currentWordsArray = result.savedWords;

    if (currentWordsArray.length === 0) {
      listElement.innerHTML = '<li class="empty">Brak zapisanych słów</li>';
      return;
    }

    currentWordsArray.forEach((item, index) => {
      const isObject = typeof item === 'object' && item !== null;
      const original = isObject ? item.original : item;
      const translation = isObject ? item.translation : 'brak';

      const li = document.createElement('li');
      
      const textDiv = document.createElement('div');
      textDiv.className = 'word-info';
      textDiv.innerHTML = `
        <div class="word-original">${escapeHtml(original)}</div>
        <div class="word-translation">${escapeHtml(translation)}</div>
      `;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn';
      editBtn.title = 'Edytuj wpis';
      editBtn.textContent = '✏️';
      editBtn.onclick = () => {
        currentEditingIndex = index;
        editOriginalInput.value = original;
        editTranslationInput.value = translation;
        editModal.style.display = 'flex';
        editOriginalInput.focus();
      };

      const restoreBtn = document.createElement('button');
      restoreBtn.className = 'action-btn';
      restoreBtn.title = 'Przywróć tłumaczenie Google';
      restoreBtn.textContent = '🔄';
      restoreBtn.onclick = async () => {
        restoreBtn.textContent = '⏳';
        const defaultTrans = await fetchTranslation(original);
        if (defaultTrans) {
          currentWordsArray[index] = { original: original, translation: defaultTrans };
          saveAndRender(currentWordsArray);
        } else {
          alert("Błąd połączenia. Spróbuj ponownie.");
          restoreBtn.textContent = '🔄';
        }
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn';
      deleteBtn.title = 'Usuń z listy';
      deleteBtn.textContent = '❌';
      deleteBtn.onclick = () => {
        currentWordsArray.splice(index, 1);
        saveAndRender(currentWordsArray);
      };

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(restoreBtn);
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(textDiv);
      li.appendChild(actionsDiv);
      listElement.appendChild(li);
    });
  });
}

// Zamknięcie modala
cancelEditBtn.onclick = () => {
  editModal.style.display = 'none';
  currentEditingIndex = null;
};

// Zapisanie zmian w słowie i tłumaczeniu
saveEditBtn.onclick = () => {
  if (currentEditingIndex !== null) {
    const newOriginal = editOriginalInput.value.trim();
    const newTranslation = editTranslationInput.value.trim();

    if (newOriginal !== '' && newTranslation !== '') {
      currentWordsArray[currentEditingIndex] = {
        original: newOriginal,
        translation: newTranslation
      };
      saveAndRender(currentWordsArray);
    }
    
    editModal.style.display = 'none';
    currentEditingIndex = null;
  }
};

// Obsługa klawisza Enter w polach tekstowych
[editOriginalInput, editTranslationInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveEditBtn.click();
    }
  });
});

function saveAndRender(wordsArray) {
  chrome.storage.local.set({ savedWords: wordsArray }, () => {
    renderWords();
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

clearBtn.addEventListener('click', () => {
  if (confirm('Czy na pewno chcesz usunąć wszystkie zapisane słowa?')) {
    chrome.storage.local.set({ savedWords: [] }, () => {
      renderWords();
    });
  }
});

renderWords();