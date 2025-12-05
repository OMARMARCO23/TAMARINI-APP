// ===== TRANSLATIONS =====
const translations = {
  en: {
    tagline: "Math Tutor",
    newExercise: "New Exercise",
    emptyTitle: "Ready to Learn?",
    emptyDesc: "Click \"New Exercise\" or type your math question below",
    placeholder: "Type your math question...",
    thinking: "Thinking...",
    error: "Something went wrong. Please try again.",
    quotaError: "Too many requests. Please wait a moment.",
    navHome: "Home",
    navHistory: "History",
    navSettings: "Settings",
    navAbout: "About",
    settingsTitle: "Settings",
    langSection: "Language",
    clearSection: "Data",
    clearChat: "Clear Chat History",
    aboutTitle: "About",
    whatIs: "What is Tamrini?",
    whatIsDesc: "Tamrini is an AI-powered math tutor designed for students aged 12-18. Instead of giving direct answers, Tamrini guides you through problems step by step.",
    howWorks: "How it Works",
    subjects: "Subjects Covered",
    historyTitle: "History",
    historyEmpty: "No History Yet",
    historyEmptyDesc: "Your solved exercises will appear here",
    greeting: "Hello! 👋 I'm Tamrini, your math tutor.\n\nTell me what exercise you're working on, and I'll help you solve it step by step.",
    newExerciseGreeting: "Great! Let's start a new exercise. 📝\n\nWhat math problem would you like to work on?"
  },
  fr: {
    tagline: "Tuteur de Maths",
    newExercise: "Nouvel Exercice",
    emptyTitle: "Prêt à Apprendre?",
    emptyDesc: "Clique sur \"Nouvel Exercice\" ou tape ta question ci-dessous",
    placeholder: "Écris ta question de maths...",
    thinking: "Je réfléchis...",
    error: "Une erreur s'est produite. Réessaie.",
    quotaError: "Trop de demandes. Attends un moment.",
    navHome: "Accueil",
    navHistory: "Historique",
    navSettings: "Paramètres",
    navAbout: "À propos",
    settingsTitle: "Paramètres",
    langSection: "Langue",
    clearSection: "Données",
    clearChat: "Effacer l'historique",
    aboutTitle: "À propos",
    whatIs: "Qu'est-ce que Tamrini?",
    whatIsDesc: "Tamrini est un tuteur de maths alimenté par l'IA, conçu pour les élèves de 12 à 18 ans.",
    howWorks: "Comment ça marche",
    subjects: "Matières couvertes",
    historyTitle: "Historique",
    historyEmpty: "Pas encore d'historique",
    historyEmptyDesc: "Tes exercices résolus apparaîtront ici",
    greeting: "Bonjour! 👋 Je suis Tamrini, ton tuteur de maths.\n\nDis-moi sur quel exercice tu travailles.",
    newExerciseGreeting: "Super! Commençons un nouvel exercice. 📝\n\nQuel problème veux-tu résoudre?"
  },
  ar: {
    tagline: "معلم الرياضيات",
    newExercise: "تمرين جديد",
    emptyTitle: "مستعد للتعلم؟",
    emptyDesc: "انقر على \"تمرين جديد\" أو اكتب سؤالك أدناه",
    placeholder: "اكتب سؤالك في الرياضيات...",
    thinking: "أفكر...",
    error: "حدث خطأ. حاول مرة أخرى.",
    quotaError: "طلبات كثيرة. انتظر قليلاً.",
    navHome: "الرئيسية",
    navHistory: "السجل",
    navSettings: "الإعدادات",
    navAbout: "حول",
    settingsTitle: "الإعدادات",
    langSection: "اللغة",
    clearSection: "البيانات",
    clearChat: "مسح المحادثات",
    aboutTitle: "حول التطبيق",
    whatIs: "ما هو تمريني؟",
    whatIsDesc: "تمريني هو معلم رياضيات ذكي مصمم للطلاب من 12 إلى 18 سنة.",
    howWorks: "كيف يعمل",
    subjects: "المواد المتاحة",
    historyTitle: "السجل",
    historyEmpty: "لا يوجد سجل بعد",
    historyEmptyDesc: "ستظهر تمارينك هنا",
    greeting: "مرحباً! 👋 أنا تمريني، معلمك في الرياضيات.\n\nأخبرني ما هو التمرين الذي تعمل عليه.",
    newExerciseGreeting: "ممتاز! لنبدأ تمريناً جديداً. 📝\n\nما هي المسألة التي تريد حلها؟"
  }
};

// ===== STATE =====
let currentLang = 'en';
let messages = [];
let history = [];
let isLoading = false;

const API_URL = 'https://tamarini-app.vercel.app/api/chat';

// ===== WAIT FOR DOM =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('Tamrini App Starting...');
  
  // Load saved data
  try {
    currentLang = localStorage.getItem('tamrini_lang') || 'en';
    messages = JSON.parse(localStorage.getItem('tamrini_messages') || '[]');
    history = JSON.parse(localStorage.getItem('tamrini_history') || '[]');
  } catch (e) {
    console.log('Error loading saved data:', e);
  }
  
  // Initialize
  updateLanguage(currentLang);
  setupEventListeners();
  renderMessages();
  renderHistory();
  
  console.log('Tamrini App Ready!');
});

// ===== GET ELEMENT =====
function getEl(id) {
  return document.getElementById(id);
}

// ===== UPDATE LANGUAGE =====
function updateLanguage(lang) {
  currentLang = lang;
  
  try {
    localStorage.setItem('tamrini_lang', lang);
  } catch (e) {}
  
  const t = translations[lang];
  
  // Update text elements safely
  const updates = {
    'tagline': t.tagline,
    'new-exercise-text': t.newExercise,
    'empty-title': t.emptyTitle,
    'empty-desc': t.emptyDesc,
    'typing-text': t.thinking,
    'nav-home': t.navHome,
    'nav-history': t.navHistory,
    'nav-settings': t.navSettings,
    'nav-about': t.navAbout,
    'settings-title': t.settingsTitle,
    'lang-section-title': t.langSection,
    'clear-section-title': t.clearSection,
    'clear-chat-text': t.clearChat,
    'about-title': t.aboutTitle,
    'what-is-title': t.whatIs,
    'what-is-desc': t.whatIsDesc,
    'how-works-title': t.howWorks,
    'subjects-title': t.subjects,
    'history-title': t.historyTitle,
    'history-empty-title': t.historyEmpty,
    'history-empty-desc': t.historyEmptyDesc
  };
  
  for (const [id, text] of Object.entries(updates)) {
    const el = getEl(id);
    if (el) el.textContent = text;
  }
  
  // Update placeholder
  const input = getEl('message-input');
  if (input) input.placeholder = t.placeholder;
  
  // Update header language buttons
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update settings checkmarks
  document.querySelectorAll('.option-check').forEach(function(check) {
    if (check.dataset.check === lang) {
      check.classList.add('active');
    } else {
      check.classList.remove('active');
    }
  });
  
  // RTL for Arabic
  if (lang === 'ar') {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
  
  console.log('Language changed to:', lang);
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Header language buttons
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      console.log('Language button clicked:', this.dataset.lang);
      updateLanguage(this.dataset.lang);
    });
  });
  
  // Settings language options
  document.querySelectorAll('.setting-option[data-lang]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      console.log('Settings language clicked:', this.dataset.lang);
      updateLanguage(this.dataset.lang);
    });
  });
  
  // Bottom Navigation
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
      const page = this.dataset.page;
      console.log('Nav clicked:', page);
      
      // Hide all pages
      document.querySelectorAll('.page').forEach(function(p) {
        p.classList.remove('active');
      });
      
      // Remove active from all nav items
      document.querySelectorAll('.nav-item').forEach(function(n) {
        n.classList.remove('active');
      });
      
      // Show selected page
      const pageEl = getEl('page-' + page);
      if (pageEl) {
        pageEl.classList.add('active');
      }
      
      // Activate nav item
      this.classList.add('active');
    });
  });
  
  // New Exercise Button
  const newExerciseBtn = getEl('new-exercise-btn');
  if (newExerciseBtn) {
    newExerciseBtn.addEventListener('click', function() {
      console.log('New Exercise clicked');
      
      // Clear messages
      messages = [];
      try {
        localStorage.setItem('tamrini_messages', '[]');
      } catch (e) {}
      
      // Render empty then add greeting
      renderMessages();
      addMessage('bot', translations[currentLang].newExerciseGreeting);
      
      // Focus input
      const input = getEl('message-input');
      if (input) input.focus();
    });
  }
  
  // Clear Chat Button
  const clearChatBtn = getEl('clear-chat-btn');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', function() {
      console.log('Clear chat clicked');
      
      if (confirm('Are you sure you want to clear all chat history?')) {
        messages = [];
        history = [];
        
        try {
          localStorage.setItem('tamrini_messages', '[]');
          localStorage.setItem('tamrini_history', '[]');
        } catch (e) {}
        
        renderMessages();
        renderHistory();
      }
    });
  }
  
  // Message Input
  const messageInput = getEl('message-input');
  const sendBtn = getEl('send-btn');
  
  if (messageInput) {
    messageInput.addEventListener('input', function() {
      // Enable/disable send button
      if (sendBtn) {
        sendBtn.disabled = !this.value.trim() || isLoading;
      }
      
      // Auto resize
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    
    messageInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  // Send Button
  if (sendBtn) {
    sendBtn.addEventListener('click', function() {
      console.log('Send button clicked');
      sendMessage();
    });
  }
  
  // Error Close Button
  const errorClose = getEl('error-close');
  if (errorClose) {
    errorClose.addEventListener('click', function() {
      const errorEl = getEl('error');
      if (errorEl) errorEl.classList.add('hidden');
    });
  }
  
  console.log('Event listeners ready!');
}

// ===== RENDER MESSAGES =====
function renderMessages() {
  const container = getEl('messages');
  const emptyState = getEl('empty-state');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (messages.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    
    messages.forEach(function(msg) {
      const el = createMessageElement(msg);
      container.appendChild(el);
    });
    
    scrollToBottom();
  }
}

// ===== CREATE MESSAGE ELEMENT =====
function createMessageElement(msg) {
  const div = document.createElement('div');
  div.className = 'message ' + (msg.role === 'user' ? 'user' : 'bot');
  
  const avatar = msg.role === 'user' ? '👤' : '📐';
  const time = msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Format message text
  let text = msg.content || '';
  text = text.replace(/\n/g, '<br>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  div.innerHTML = 
    '<div class="message-avatar">' + avatar + '</div>' +
    '<div class="message-bubble">' +
      '<div class="message-text">' + text + '</div>' +
      '<div class="message-time">' + time + '</div>' +
    '</div>';
  
  return div;
}

// ===== ADD MESSAGE =====
function addMessage(role, content) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msg = { role: role, content: content, time: time };
  
  messages.push(msg);
  
  try {
    localStorage.setItem('tamrini_messages', JSON.stringify(messages));
  } catch (e) {}
  
  // Hide empty state
  const emptyState = getEl('empty-state');
  if (emptyState) emptyState.classList.add('hidden');
  
  // Add to DOM
  const container = getEl('messages');
  if (container) {
    const el = createMessageElement(msg);
    container.appendChild(el);
    scrollToBottom();
  }
  
  // Save first question to history
  if (role === 'user' && messages.length <= 2) {
    saveToHistory(content);
  }
}

// ===== SAVE TO HISTORY =====
function saveToHistory(question) {
  const item = {
    id: Date.now(),
    question: question.substring(0, 100),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  
  history.unshift(item);
  if (history.length > 20) history.pop();
  
  try {
    localStorage.setItem('tamrini_history', JSON.stringify(history));
  } catch (e) {}
  
  renderHistory();
}

// ===== RENDER HISTORY =====
function renderHistory() {
  const container = getEl('history-list');
  const emptyState = getEl('history-empty');
  
  if (!container) return;
  
  if (history.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    container.innerHTML = '';
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    
    let html = '';
    history.forEach(function(item) {
      html += 
        '<div class="history-item">' +
          '<div class="history-question">' + item.question + '</div>' +
          '<div class="history-meta">' +
            '<span>' + item.date + '</span>' +
            '<span>' + item.time + '</span>' +
          '</div>' +
        '</div>';
    });
    
    container.innerHTML = html;
  }
}

// ===== SCROLL TO BOTTOM =====
function scrollToBottom() {
  const container = getEl('messages');
  if (container && container.parentElement) {
    container.parentElement.scrollTop = container.parentElement.scrollHeight;
  }
}

// ===== SEND MESSAGE =====
async function sendMessage() {
  const input = getEl('message-input');
  const sendBtn = getEl('send-btn');
  
  if (!input) return;
  
  const text = input.value.trim();
  if (!text || isLoading) return;
  
  console.log('Sending message:', text);
  
  // Add user message
  addMessage('user', text);
  
  // Clear input
  input.value = '';
  input.style.height = 'auto';
  if (sendBtn) sendBtn.disabled = true;
  
  // Show typing indicator
  isLoading = true;
  const typingEl = getEl('typing');
  if (typingEl) typingEl.classList.remove('hidden');
  
  // Hide error
  const errorEl = getEl('error');
  if (errorEl) errorEl.classList.add('hidden');
  
  scrollToBottom();
  
  try {
    // Build history for API
    const chatHistory = messages.slice(-10).map(function(m) {
      return {
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      };
    });
    
    console.log('Calling API...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: text,
        language: currentLang,
        history: chatHistory
      })
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (!response.ok) {
      if (data.details && data.details.includes('quota')) {
        throw new Error('QUOTA');
      }
      throw new Error('API_ERROR');
    }
    
    // Add bot response
    addMessage('bot', data.reply);
    
  } catch (error) {
    console.error('Error:', error);
    
    const t = translations[currentLang];
    const errorTextEl = getEl('error-text');
    
    if (errorTextEl) {
      if (error.message === 'QUOTA') {
        errorTextEl.textContent = t.quotaError;
      } else {
        errorTextEl.textContent = t.error;
      }
    }
    
    if (errorEl) errorEl.classList.remove('hidden');
  }
  
  // Hide typing
  isLoading = false;
  if (typingEl) typingEl.classList.add('hidden');
}
