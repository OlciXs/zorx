// ======== KONFIGURACJA ========
const API_URL = 'https://zorx-backend.onrender.com';

// ======== ELEMENTY DOM ========
const listElement = document.getElementById('wordList');
const clearBtn = document.getElementById('clearBtn');
const syncAllBtn = document.getElementById('syncAllBtn');

// Elementy modala edycji
const editModal = document.getElementById('editModal');
const editOriginalInput = document.getElementById('editOriginalInput');
const editTranslationInput = document.getElementById('editTranslationInput');
const cancelEditBtn = document.getElementById('cancelEdit');
const saveEditBtn = document.getElementById('saveEdit');

// Elementy autentykacji
const loginForm = document.getElementById('loginForm');
const loggedInInfo = document.getElementById('loggedInInfo');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authStatusEl = document.getElementById('authStatus');
const userEmailEl = document.getElementById('userEmail');
const syncIndicator = document.getElementById('syncIndicator');

let currentEditingIndex = null;
let currentWordsArray = [];

// ======== AUTENTYKACJA ========

function showAuthStatus(message, type) {
  authStatusEl.style.display = 'block';
  authStatusEl.textContent = message;
  authStatusEl.className = `status-${type}`;
}

function hideAuthStatus() {
  authStatusEl.style.display = 'none';
}

async function checkAuthState() {
  const result = await chrome.storage.local.get({ authToken: null, userEmail: null });
  
  if (result.authToken) {
    // Zalogowany
    loginForm.style.display = 'none';
    loggedInInfo.style.display = 'flex';
    userEmailEl.textContent = result.userEmail || '';
    syncAllBtn.style.display = 'block';
    syncIndicator.textContent = '● Połączono';
    syncIndicator.className = 'sync-indicator';
  } else {
    // Niezalogowany
    loginForm.style.display = 'block';
    loggedInInfo.style.display = 'none';
    syncAllBtn.style.display = 'none';
  }
}

loginBtn.addEventListener('click', async () => {
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!email || !password) {
    showAuthStatus('Podaj email i hasło.', 'error');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logowanie...';
  hideAuthStatus();

  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.message || 'Nieprawidłowy email lub hasło.';
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }

    const data = await response.json();
    const token = data.accessToken || data.token || data.access_token;

    if (!token) {
      throw new Error('Serwer nie zwrócił tokena.');
    }

    // Zapisz token i email
    await chrome.storage.local.set({ authToken: token, userEmail: email });
    
    showAuthStatus('Zalogowano pomyślnie!', 'ok');
    loginPasswordInput.value = '';
    
    // Odśwież widok
    await checkAuthState();
    renderWords();

    // Automatycznie zsynchronizuj niesynchronizowane słowa
    await syncUnsyncedWords();

  } catch (err) {
    showAuthStatus(err.message, 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Zaloguj się';
  }
});

// Logowanie przyciskiem Enter
[loginEmailInput, loginPasswordInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });
});

logoutBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove(['authToken', 'userEmail']);
  loginForm.style.display = 'block';
  loggedInInfo.style.display = 'none';
  syncAllBtn.style.display = 'none';
  hideAuthStatus();
  renderWords();
});

// ======== WYSYŁANIE DO BAZY DANYCH ========

async function sendFlashcardToAPI(word, translation) {
  const result = await chrome.storage.local.get({ authToken: null });
  
  if (!result.authToken) {
    console.log('Brak tokena — fiszka zapisana tylko lokalnie.');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/flashcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.authToken}`,
      },
      body: JSON.stringify({ word, translation }),
    });

    if (response.status === 401) {
      // Token wygasł — wyloguj
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

async function syncUnsyncedWords() {
  const result = await chrome.storage.local.get({ savedWords: [], authToken: null });
  
  if (!result.authToken) return;

  const words = result.savedWords;
  let updated = false;

  for (let i = 0; i < words.length; i++) {
    const item = words[i];
    if (typeof item === 'object' && item !== null && !item.synced) {
      const success = await sendFlashcardToAPI(item.original, item.translation);
      if (success) {
        words[i] = { ...item, synced: true };
        updated = true;
      }
    }
  }

  if (updated) {
    await chrome.storage.local.set({ savedWords: words });
    renderWords();
  }
}

// ======== TŁUMACZENIE ========

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

// ======== RENDEROWANIE LISTY SŁÓW ========

function renderWords() {
  chrome.storage.local.get({ savedWords: [], authToken: null }, (result) => {
    listElement.innerHTML = '';
    currentWordsArray = result.savedWords;
    const isLoggedIn = !!result.authToken;

    if (currentWordsArray.length === 0) {
      listElement.innerHTML = '<li class="empty">Brak zapisanych słów</li>';
      return;
    }

    currentWordsArray.forEach((item, index) => {
      const isObject = typeof item === 'object' && item !== null;
      const original = isObject ? item.original : item;
      const translation = isObject ? item.translation : 'brak';
      const isSynced = isObject ? item.synced : false;

      const li = document.createElement('li');
      
      const textDiv = document.createElement('div');
      textDiv.className = 'word-info';

      let syncStatusHtml = '';
      if (isLoggedIn) {
        if (isSynced) {
          syncStatusHtml = '<div class="word-synced">✅ W bazie danych</div>';
        } else {
          syncStatusHtml = '<div class="word-not-synced">⏳ Niesynchronizowane</div>';
        }
      }

      textDiv.innerHTML = `
        <div class="word-original">${escapeHtml(original)}</div>
        <div class="word-translation">${escapeHtml(translation)}</div>
        ${syncStatusHtml}
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
          currentWordsArray[index] = { original: original, translation: defaultTrans, synced: false };
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

// ======== MODAL EDYCJI ========

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
        translation: newTranslation,
        synced: false, // Po edycji trzeba ponownie zsynchronizować
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

// ======== FUNKCJE POMOCNICZE ========

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

// ======== PRZYCISK SYNCHRONIZACJI ========

syncAllBtn.addEventListener('click', async () => {
  syncAllBtn.disabled = true;
  syncAllBtn.textContent = '⏳ Synchronizuję...';

  await syncUnsyncedWords();

  syncAllBtn.disabled = false;
  syncAllBtn.textContent = '🔄 Synchronizuj wszystkie do bazy';
});

// ======== PRZYCISK CZYSZCZENIA ========

clearBtn.addEventListener('click', () => {
  if (confirm('Czy na pewno chcesz usunąć wszystkie zapisane słowa?')) {
    chrome.storage.local.set({ savedWords: [] }, () => {
      renderWords();
    });
  }
});

// ======== INICJALIZACJA ========

checkAuthState();
renderWords();