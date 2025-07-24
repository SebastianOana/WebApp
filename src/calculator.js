// Listen for update-not-available event and show notification (using preload API)
if (window.electronAPI && window.electronAPI.onUpdateNotAvailable) {
  window.electronAPI.onUpdateNotAvailable(() => {
    showPopupMessage('🎉 No new updates, everything is up to date! 🚀😎');
  });
}

// Show a transient popup message (like save notification)
function showPopupMessage(message) {
  const popup = document.createElement('div');
  popup.className = 'popup-message';
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.classList.add('show');
  }, 10);
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 400);
  }, 2200);
}
// Update Button Handler
window.addEventListener('DOMContentLoaded', () => {
  const updateBtn = document.getElementById('checkUpdateBtn');
  if (updateBtn && window.electronAPI && window.electronAPI.checkForUpdates) {
    updateBtn.addEventListener('click', () => {
      updateBtn.disabled = true;
      updateBtn.textContent = 'Checking...';
      window.electronAPI.checkForUpdates();
    });

    // Reset button state on update events
    const resetUpdateBtn = () => {
      setTimeout(() => {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Check for Updates';
      }, 2000);
    };
    if (window.electronAPI.onUpdateAvailable) window.electronAPI.onUpdateAvailable(resetUpdateBtn);
    if (window.electronAPI.onUpdateDownloaded) window.electronAPI.onUpdateDownloaded(resetUpdateBtn);
    if (window.electronAPI.onUpdateNotAvailable) window.electronAPI.onUpdateNotAvailable(resetUpdateBtn);
    if (window.electronAPI.onUpdateError) window.electronAPI.onUpdateError(resetUpdateBtn);
  }
});
// Global variables to store calculation results
let currentCalculations = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    annual: 0,
    bonuriMasa: 0,
    transport: 0,
    telemunca: 0,
    totalAdditional: 0,
    totalIncome: 0,
    totalExpenses: 0
};

// History management
let currentDate = new Date();
let historyData = JSON.parse(localStorage.getItem('incomeHistory')) || {};

// Theme management
let currentTheme = localStorage.getItem('selectedTheme') || 'default';

// Format month key for storage
function getMonthKey(date = currentDate) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Format month display
function formatMonthDisplay(date = currentDate) {
    const months = [
        'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Initialize month display
function initializeMonthDisplay() {
    // Removed cleanupHistoryData call to prevent deleting saved months
    document.getElementById('currentMonth').textContent = formatMonthDisplay();
    loadMonthData();
}

// Commented out cleanupHistoryData to prevent accidental use
/*
function cleanupHistoryData() {
    const july2025Key = '2025-07';
    const currentHistoryData = JSON.parse(localStorage.getItem('incomeHistory')) || {};
    
    // Create new history object with only July 2025 data
    const cleanedHistory = {};
    if (currentHistoryData[july2025Key]) {
        cleanedHistory[july2025Key] = currentHistoryData[july2025Key];
    }
    
    // Update both localStorage and global variable
    localStorage.setItem('incomeHistory', JSON.stringify(cleanedHistory));
    historyData = cleanedHistory;
    
    console.log('History cleaned up - keeping only July 2025');
}
*/

// Navigate months
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    document.getElementById('currentMonth').textContent = formatMonthDisplay();
    loadMonthData();
}

function nextMonth() {
    if (currentDate < new Date()) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        document.getElementById('currentMonth').textContent = formatMonthDisplay();
        loadMonthData();
    }
}

// Format Romanian currency
function formatRON(amount) {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

// Update summary section
function updateSummary() {
    const afterExpenses = currentCalculations.totalIncome - currentCalculations.totalExpenses;
    const afterExpensesNoBonuri = (currentCalculations.monthly + currentCalculations.transport + currentCalculations.telemunca) - currentCalculations.totalExpenses;
    
    document.getElementById('summaryWeekly').textContent = formatRON(currentCalculations.weekly);
    document.getElementById('summaryMonthly').textContent = formatRON(currentCalculations.monthly);
    document.getElementById('summaryAdditional').textContent = formatRON(currentCalculations.transport + currentCalculations.telemunca);
    document.getElementById('summaryBonuriMasa').textContent = formatRON(currentCalculations.bonuriMasa);
    document.getElementById('summaryTotal').textContent = formatRON(currentCalculations.totalIncome);
    document.getElementById('summaryAfterExpenses').textContent = formatRON(afterExpensesNoBonuri);
}

// Monthly Salary Calculator
function calculateSalary() {
    const monthlySalary = parseFloat(document.getElementById('monthlySalary').value) || 0;

    if (monthlySalary <= 0) {
        document.getElementById('salaryResult').innerHTML = 
            '<span style="color: #dc3545;">Te rog introdu un salariu lunar valid.</span>';
        // Reset salary calculations but keep additional income
        currentCalculations.daily = 0;
        currentCalculations.weekly = 0;
        currentCalculations.monthly = 0;
        currentCalculations.annual = 0;
        calculateTotalIncome();
        return;
    }

    const dailyPay = monthlySalary / 21.67; // Average working days per month
    const weeklyPay = dailyPay * 5;
    const annualPay = monthlySalary * 12;

    // Update global calculations
    currentCalculations.daily = dailyPay;
    currentCalculations.weekly = weeklyPay;
    currentCalculations.monthly = monthlySalary;
    currentCalculations.annual = annualPay;

    const resultHTML = `
        <div style="line-height: 1.4;">
            <div><strong>Pe zi:</strong> ${formatRON(dailyPay)}</div>
            <div><strong>Pe săptămână:</strong> ${formatRON(weeklyPay)}</div>
            <div><strong>Pe an:</strong> ${formatRON(annualPay)}</div>
        </div>
    `;

    document.getElementById('salaryResult').innerHTML = resultHTML;
    calculateTotalIncome();
}

// Calculate additional income
function calculateAdditionalIncome() {
    const bonuriMasa = parseFloat(document.getElementById('bonuriMasa').value) || 0;
    const transport = parseFloat(document.getElementById('transport').value) || 0;
    const telemunca = parseFloat(document.getElementById('telemunca').value) || 0;

    // Update global calculations
    currentCalculations.bonuriMasa = bonuriMasa;
    currentCalculations.transport = transport;
    currentCalculations.telemunca = telemunca;
    currentCalculations.totalAdditional = bonuriMasa + transport + telemunca;

    let resultHTML = '';
    const cashIncomeTotal = transport + telemunca;
    
    if (currentCalculations.totalAdditional > 0) {
        // Detect dark theme (by data-theme attribute or currentTheme variable)
        let isDarkTheme = false;
        if (typeof document !== 'undefined') {
            const themeAttr = document.documentElement.getAttribute('data-theme');
            isDarkTheme = themeAttr && (themeAttr.includes('dark') || themeAttr === 'forest' || themeAttr === 'ocean' || themeAttr === 'sunset');
        } else {
            isDarkTheme = currentTheme && (currentTheme.includes('dark') || currentTheme === 'forest' || currentTheme === 'ocean' || currentTheme === 'sunset');
        }
        const detailColor = isDarkTheme ? '#fff' : '#6c757d';
    resultHTML = `
        <div style="line-height: 1.4;">
            <div><strong>Total suplimentar:</strong> ${formatRON(currentCalculations.totalAdditional)}</div>
            <div style="margin-top: 8px; font-size: 0.95em; color: ${detailColor};">
                ${bonuriMasa > 0 ? `<div style='display: flex; align-items: center; gap: 12px;'><span>Bonuri de masă</span><span style='font-weight: 500;'>${formatRON(bonuriMasa)}</span></div>` : ''}
                ${transport > 0 ? `<div style='display: flex; align-items: center; gap: 12px;'><span>Transport</span><span style='font-weight: 500;'>${formatRON(transport)}</span></div>` : ''}
                ${telemunca > 0 ? `<div style='display: flex; align-items: center; gap: 12px;'><span>Telemuncă</span><span style='font-weight: 500;'>${formatRON(telemunca)}</span></div>` : ''}
            </div>
        </div>
    `;
    }

    document.getElementById('additionalIncomeResult').innerHTML = resultHTML;
    calculateTotalIncome();
}

// Calculate total income (salary + additional)
function calculateTotalIncome() {
    currentCalculations.totalIncome = currentCalculations.monthly + currentCalculations.totalAdditional;
    updateSummary();
}

// Add new expense item
function addExpense(listId = 'expenseListAbonamente') {
    const expenseList = document.getElementById(listId);
    const expenseRow = document.createElement('div');
    expenseRow.className = 'expense-row';
    const placeholderName = listId === 'expenseListLunare' ? 'Telefon' : 'YouTube';
    expenseRow.innerHTML = `
        <span class="drag-handle" draggable="true">⋮⋮</span>
        <input type="text" class="expense-name" placeholder="${placeholderName}">
        <input type="number" class="expense-amount" placeholder="0" step="0.01">
        <button type="button" class="remove-btn" onclick="removeExpenseRow(this)">×</button>
    `;
    expenseList.appendChild(expenseRow);
    
    // Set up drag and drop for the new row
    setupRowDragAndDrop(expenseRow);
    
    // Focus on the name input of the new item
    expenseRow.querySelector('.expense-name').focus();
    // Add event listeners for real-time calculation to both inputs
    const nameInput = expenseRow.querySelector('.expense-name');
    const amountInput = expenseRow.querySelector('.expense-amount');
    nameInput.addEventListener('input', calculateExpenses);
    amountInput.addEventListener('input', calculateExpenses);
}

// Remove expense item (fixed function name)
function removeExpenseRow(button) {
    const expenseItem = button.parentElement;
    expenseItem.remove();
    calculateExpenses(); // Recalculate after removal
    showNotification('🗑️ Cheltuiala a fost ștearsă!');
}

// Calculate total expenses
function calculateExpenses() {
    const allExpenseRows = document.querySelectorAll('.expense-row');
    let total = 0;
    let lunareTotal = 0;
    let abonamenteTotal = 0;
    let lunareList = [];
    let abonamenteList = [];

    allExpenseRows.forEach(row => {
        const name = row.querySelector('.expense-name').value.trim();
        const amount = parseFloat(row.querySelector('.expense-amount').value) || 0;
        
        if (name && amount > 0) {
            total += amount;
            
            // Determine which section this row belongs to
            const isInLunareSection = row.closest('#expenseListLunare');
            
            if (isInLunareSection) {
                lunareTotal += amount;
                lunareList.push({ name, amount });
            } else {
                abonamenteTotal += amount;
                abonamenteList.push({ name, amount });
            }
        }
    });

    currentCalculations.totalExpenses = total;


    // Two-column summary layout
    resultHTML = `
        <div style="display: flex; flex-direction: column;">
            <strong style="font-size: 1.08em; margin-bottom: 8px;">Total cheltuieli: ${formatRON(total)}</strong>
            <hr style="margin: 0 0 0 0; border: none; border-bottom: 1.5px solid #b3c6e0; opacity: 0.35;"> 
        </div>
    `;
    resultHTML += `
        <div class="history-summary-grid">
            <div class="history-summary-col">
                <div style="margin-bottom: 6px;"><strong>💡 Lunare: ${formatRON(lunareTotal)}</strong></div>
                <div style="font-size: 0.85rem; line-height: 1.3;">
                    ${lunareList.map(expense => `• ${expense.name}: ${formatRON(expense.amount)}`).join('<br>')}
                </div>
            </div>
            <div class="history-summary-col">
                <div style="margin-bottom: 6px;"><strong>📱 Abonamente: ${formatRON(abonamenteTotal)}</strong></div>
                <div style="font-size: 0.85rem; line-height: 1.3;">
                    ${abonamenteList.map(expense => `• ${expense.name}: ${formatRON(expense.amount)}`).join('<br>')}
                </div>
            </div>
        </div>
    `;

    document.getElementById('expenseResult').innerHTML = resultHTML;
    updateSummary();
}

// Clear all fields function
function clearAllFields() {
    // Clear input fields
    document.getElementById('monthlySalary').value = '';
    document.getElementById('bonuriMasa').value = '';
    document.getElementById('transport').value = '';
    document.getElementById('telemunca').value = '';
    
    // Clear results
    document.getElementById('salaryResult').innerHTML = '';
    document.getElementById('additionalIncomeResult').innerHTML = '';
    document.getElementById('expenseResult').innerHTML = '';
    
    // Reset calculations
    currentCalculations = {
        daily: 0,
        weekly: 0,
        monthly: 0,
        annual: 0,
        bonuriMasa: 0,
        transport: 0,
        telemunca: 0,
        totalAdditional: 0,
        totalIncome: 0,
        totalExpenses: 0
    };
    
    // Reset expense list to default items
    const expenseListLunare = document.getElementById('expenseListLunare');
    expenseListLunare.innerHTML = `
        <div class="expense-row">
            <input type="text" class="expense-name" value="Chirie" readonly>
            <input type="number" class="expense-amount" placeholder="0" step="0.01">
            <button class="remove-btn" onclick="removeExpense(this)">×</button>
        </div>
        <div class="expense-row">
            <input type="text" class="expense-name" value="Gaz" readonly>
            <input type="number" class="expense-amount" placeholder="0" step="0.01">
            <button class="remove-btn" onclick="removeExpense(this)">×</button>
        </div>
        <div class="expense-row">
            <input type="text" class="expense-name" value="Curent" readonly>
            <input type="number" class="expense-amount" placeholder="0" step="0.01">
            <button class="remove-btn" onclick="removeExpense(this)">×</button>
        </div>
        <div class="expense-row">
            <input type="text" class="expense-name" value="Întreținere" readonly>
            <input type="number" class="expense-amount" placeholder="0" step="0.01">
            <button class="remove-btn" onclick="removeExpense(this)">×</button>
        </div>
    `;
    
    const expenseListAbonamente = document.getElementById('expenseListAbonamente');
    expenseListAbonamente.innerHTML = `
        <div class="expense-row">
            <input type="text" class="expense-name" value="Netflix" readonly>
            <input type="number" class="expense-amount" placeholder="60" step="0.01" value="60">
            <button class="remove-btn" onclick="removeExpense(this)">×</button>
        </div>
        <div class="expense-row">
            <input type="text" class="expense-name" value="Spotify" readonly>
            <input type="number" class="expense-amount" placeholder="20" step="0.01">
            <button class="remove-btn" onclick="removeExpense(this)">×</button>
        </div>
    `;
    
    // Add event listeners to ALL expense items
    const allInputs = document.querySelectorAll('.expense-row input');
    allInputs.forEach(input => {
        input.addEventListener('input', calculateExpenses);
    });
    
    updateSummary();
    calculateExpenses(); // Calculate Netflix default
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + N or Cmd + N for new calculation
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        clearAllFields();
    }
});

// Keyboard shortcut: Ctrl+S triggers saveCurrentMonth
window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentMonth();
    }
});

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Initialize theme first
    initializeTheme();
    
    // Initialize month display and load data
    initializeMonthDisplay();
    
    // Set up drag and drop for expense reordering
    setupDragAndDrop();
    
    // Set up initial expense calculation
    calculateExpenses();
    
    // Add event listener for monthly salary real-time calculation
    document.getElementById('monthlySalary').addEventListener('input', () => {
        const value = document.getElementById('monthlySalary').value;
        if (value && value > 0) {
            calculateSalary();
        } else {
            // Clear results if input is empty
            document.getElementById('salaryResult').innerHTML = '';
            currentCalculations.daily = 0;
            currentCalculations.weekly = 0;
            currentCalculations.monthly = 0;
            currentCalculations.annual = 0;
            calculateTotalIncome();
        }
    });

    // Add event listeners for additional income fields
    ['bonuriMasa', 'transport', 'telemunca'].forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', calculateAdditionalIncome);
    });

    // Add event listeners to ALL expense inputs for real-time calculation
    document.querySelectorAll('.expense-row input').forEach(input => {
        input.addEventListener('input', calculateExpenses);
    });
});

// Handle menu shortcuts from main process
if (typeof window !== 'undefined' && window.require) {
    try {
        const { ipcRenderer } = window.require('electron');
        
        ipcRenderer.on('new-calculation', () => {
            clearAllFields();
        });
        
        // Listen for update progress
        ipcRenderer.on('update-progress', (event, progressObj) => {
            console.log('Update progress:', progressObj.percent + '%');
        });
    } catch (error) {
        console.log('Running in browser mode');
    }
}

// Update check function for UI button
async function checkForUpdates() {
    if (typeof window !== 'undefined' && window.require) {
        try {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('check-for-updates');
        } catch (error) {
            console.log('Update check not available in this environment');
            alert('Update functionality is only available in the desktop app.');
        }
    } else {
        alert('Update functionality is only available in the desktop app.');
    }
}

// Save current month data
function saveCurrentMonth() {
    const monthKey = getMonthKey();
    const monthData = {
        date: new Date().toISOString(),
        salary: parseFloat(document.getElementById('monthlySalary').value) || 0,
        additionalIncome: {
            bonuriMasa: parseFloat(document.getElementById('bonuriMasa').value) || 0,
            transport: parseFloat(document.getElementById('transport').value) || 0,
            telemunca: parseFloat(document.getElementById('telemunca').value) || 0
        },
        calculations: { ...currentCalculations },
        expenses: {
            lunare: [],
            abonamente: []
        }
    };
    
    // Collect expense data
    document.querySelectorAll('#expenseListLunare .expense-row').forEach(row => {
        const name = row.querySelector('.expense-name').value;
        const amount = parseFloat(row.querySelector('.expense-amount').value) || 0;
        if (name && amount > 0) {
            monthData.expenses.lunare.push({ name, amount });
        }
    });
    
    document.querySelectorAll('#expenseListAbonamente .expense-row').forEach(row => {
        const name = row.querySelector('.expense-name').value;
        const amount = parseFloat(row.querySelector('.expense-amount').value) || 0;
        if (name && amount > 0) {
            monthData.expenses.abonamente.push({ name, amount });
        }
    });
    
    historyData[monthKey] = monthData;
    localStorage.setItem('incomeHistory', JSON.stringify(historyData));
    
    // Show confirmation
    showNotification('✅ Datele pentru ' + formatMonthDisplay() + ' au fost salvate!');
}

// Load month data
function loadMonthData() {
    const monthKey = getMonthKey();
    const monthData = historyData[monthKey];
    
    if (monthData) {
        // Load salary - only show if it has a value
        document.getElementById('monthlySalary').value = monthData.salary || '';
        
        // Load additional income (with backward compatibility)
        if (monthData.additionalIncome) {
            document.getElementById('bonuriMasa').value = monthData.additionalIncome.bonuriMasa || '';
            document.getElementById('transport').value = monthData.additionalIncome.transport || '';
            document.getElementById('telemunca').value = monthData.additionalIncome.telemunca || '';
        } else {
            document.getElementById('bonuriMasa').value = '';
            document.getElementById('transport').value = '';
            document.getElementById('telemunca').value = '';
        }
        
        // Load calculations
        currentCalculations = { ...monthData.calculations };
        
        // Clear existing expenses
        document.getElementById('expenseListLunare').innerHTML = '';
        document.getElementById('expenseListAbonamente').innerHTML = '';
        
        // Load expenses
        monthData.expenses.lunare.forEach(expense => {
            addExpenseToSection('lunare', expense.name, expense.amount);
        });
        
        monthData.expenses.abonamente.forEach(expense => {
            addExpenseToSection('abonamente', expense.name, expense.amount);
        });
        
        // Recalculate if salary exists
        if (monthData.salary > 0) {
            calculateSalary();
        }
        calculateAdditionalIncome();
        calculateExpenses();
        
        // Add event listeners to all loaded expense inputs
        document.querySelectorAll('.expense-row input').forEach(input => {
            input.addEventListener('input', calculateExpenses);
        });
        
        // Add drag listeners to all loaded rows
        setupDragAndDrop();
    } else {
        // Clear form for new month - all values should be 0/empty
        document.getElementById('monthlySalary').value = '';
        document.getElementById('bonuriMasa').value = '';
        document.getElementById('transport').value = '';
        document.getElementById('telemunca').value = '';
        
        // Clear results
        document.getElementById('salaryResult').innerHTML = '';
        document.getElementById('additionalIncomeResult').innerHTML = '';
        document.getElementById('expenseResult').innerHTML = '';
        
        // Reset to empty expense lists
        document.getElementById('expenseListLunare').innerHTML = '';
        document.getElementById('expenseListAbonamente').innerHTML = '';
        
        // Reset calculations to zero
        currentCalculations = { 
            daily: 0, 
            weekly: 0, 
            monthly: 0, 
            annual: 0, 
            bonuriMasa: 0,
            transport: 0,
            telemunca: 0,
            totalAdditional: 0,
            totalIncome: 0,
            totalExpenses: 0 
        };
        updateSummary();
        
        // Set up drag and drop for empty lists
        setupDragAndDrop();
    }
}

// Helper function to add expense to specific section
function addExpenseToSection(section, name, amount) {
    const container = document.getElementById('expenseList' + section.charAt(0).toUpperCase() + section.slice(1));
    const expenseRow = document.createElement('div');
    expenseRow.className = 'expense-row';
    expenseRow.innerHTML = `
        <span class="drag-handle" draggable="true">⋮⋮</span>
        <input type="text" class="expense-name" value="${name}" placeholder="Denumire cheltuială">
        <input type="number" class="expense-amount" value="${amount}" placeholder="Suma (RON)" step="0.01">
        <button type="button" class="remove-btn" onclick="removeExpenseRow(this)">×</button>
    `;
    container.appendChild(expenseRow);
    
    // Set up drag and drop for the new row
    setupRowDragAndDrop(expenseRow);
    
    // Add event listeners to both name and amount inputs
    const nameInput = expenseRow.querySelector('.expense-name');
    const amountInput = expenseRow.querySelector('.expense-amount');
    nameInput.addEventListener('input', calculateExpenses);
    amountInput.addEventListener('input', calculateExpenses);
}

// Toggle history display
function toggleHistory() {
    const container = document.getElementById('historyContainer');
    const isVisible = container.style.display !== 'none';
    
    if (isVisible) {
        container.style.display = 'none';
    } else {
        container.style.display = 'block';
        displayHistory();
    }
}

// Display history
function displayHistory() {
    const historyList = document.getElementById('historyList');
    const sortedHistory = Object.entries(historyData).sort().reverse();
    
    if (sortedHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">Nu există date salvate încă.</p>';
        return;
    }
    
    historyList.innerHTML = sortedHistory.map(([monthKey, data]) => {
        const date = new Date(monthKey + '-01');
        const monthName = formatMonthDisplay(date);
        const afterExpenses = data.calculations.totalIncome - data.calculations.totalExpenses;
        const additionalTotal = data.additionalIncome ? 
            (data.additionalIncome.bonuriMasa || 0) + (data.additionalIncome.transport || 0) + (data.additionalIncome.telemunca || 0) : 0;
        const lunareTotal = data.expenses.lunare.reduce((sum, exp) => sum + exp.amount, 0);
        const abonamenteTotal = data.expenses.abonamente.reduce((sum, exp) => sum + exp.amount, 0);
        return `
            <div class="history-month-card">
                <div class="history-month-title" style="font-weight: bold; font-size: 1.15em; margin-bottom: 10px;"><span class="icon">📅</span>${monthName}</div>
                <div class="history-month-table" style="display: grid; grid-template-columns: 1fr 1px 1fr; align-items: center;">
                    <div>
                        <div class="history-month-row" style="display: flex; justify-content: flex-start; padding-left: 8px;">
                            <span class="history-label">Salariu</span>
                        </div>
                        ${additionalTotal > 0 ? `<div class="history-month-row" style="display: flex; justify-content: flex-start; padding-left: 8px;"><span class="history-label">Venituri suplimentare</span></div>` : ''}
                        <div class="history-month-row" style="display: flex; justify-content: flex-start; padding-left: 8px;"><span class="history-label">Cheltuieli Lunare</span></div>
                        <div class="history-month-row" style="display: flex; justify-content: flex-start; padding-left: 8px;"><span class="history-label">Abonamente</span></div>
                    </div>
                    <div style="width: 0; border-left: 1.5px solid #b3c6e0; opacity: 0.2; height: 100%; margin: 0 8px;"></div>
                    <div>
                        <div class="history-month-row" style="display: flex; justify-content: flex-start; padding-left: 16px;">
                            <span class="history-value important">${formatRON(data.salary)}</span>
                        </div>
                        ${additionalTotal > 0 ? `<div class="history-month-row" style="display: flex; justify-content: flex-start; padding-left: 16px;"><span class="history-value">${formatRON(additionalTotal)}</span></div>` : ''}
                        <div class="history-month-row" style="display: flex; justify-content: flex-start; padding-left: 16px;"><span class="history-value negative">${formatRON(lunareTotal)}</span></div>
                        <div class="history-month-row" style="display: flex; justify-content: flex-start; padding-left: 16px;"><span class="history-value negative">${formatRON(abonamenteTotal)}</span></div>
                    </div>
                </div>
                <hr style="margin: 8px 0; border: none; border-top: 1.5px solid #b3c6e0; opacity: 0.55;">
                <div class="history-month-row history-row-grid">
                    <span class="history-label" style="font-weight: bold;">Total Cheltuieli</span>
                    <span class="history-value total-expenses" style="color: #e67e22; font-weight: bold;">${formatRON(data.calculations.totalExpenses)}</span>
                </div>
                <div class="history-month-row history-row-grid">
                    <span class="history-label" style="font-weight: bold;">Rămas</span>
                    <span class="history-value remaining"><strong>${formatRON(afterExpenses)}</strong></span>
                </div>
            </div>
        `;
    }).join('');
}

// Export history to CSV
// Removed exportHistory function and CSV export references

// Reset to default expenses
function resetDefaultExpenses() {
    // Reset Lunare expenses
    const lunareContainer = document.getElementById('expenseListLunare');
    lunareContainer.innerHTML = `
        <div class="expense-row">
            <span class="drag-handle" draggable="true">⋮⋮</span>
            <input type="text" class="expense-name" value="Chirie" placeholder="Denumire cheltuială">
            <input type="number" class="expense-amount" value="1500" placeholder="Suma (RON)" step="0.01">
            <button type="button" class="remove-btn" onclick="removeExpenseRow(this)">×</button>
        </div>
        <div class="expense-row">
            <span class="drag-handle" draggable="true">⋮⋮</span>
            <input type="text" class="expense-name" value="Gaz" placeholder="Denumire cheltuială">
            <input type="number" class="expense-amount" value="150" placeholder="Suma (RON)" step="0.01">
            <button type="button" class="remove-btn" onclick="removeExpenseRow(this)">×</button>
        </div>
        <div class="expense-row">
            <span class="drag-handle" draggable="true">⋮⋮</span>
            <input type="text" class="expense-name" value="Curent" placeholder="Denumire cheltuială">
            <input type="number" class="expense-amount" value="200" placeholder="Suma (RON)" step="0.01">
            <button type="button" class="remove-btn" onclick="removeExpenseRow(this)">×</button>
        </div>
        <div class="expense-row">
            <span class="drag-handle" draggable="true">⋮⋮</span>
            <input type="text" class="expense-name" value="Întreținere" placeholder="Denumire cheltuială">
            <input type="number" class="expense-amount" value="300" placeholder="Suma (RON)" step="0.01">
            <button type="button" class="remove-btn" onclick="removeExpenseRow(this)">×</button>
        </div>
    `;
    // Reset Abonamente expenses
    const abonamenteContainer = document.getElementById('expenseListAbonamente');
    abonamenteContainer.innerHTML = `
        <div class="expense-row">
            <span class="drag-handle" draggable="true">⋮⋮</span>
            <input type="text" class="expense-name" value="Netflix" placeholder="Denumire cheltuială">
            <input type="number" class="expense-amount" value="60" placeholder="Suma (RON)" step="0.01">
            <button type="button" class="remove-btn" onclick="removeExpenseRow(this)">×</button>
        </div>
        <div class="expense-row">
            <span class="drag-handle" draggable="true">⋮⋮</span>
            <input type="text" class="expense-name" value="Spotify" placeholder="Denumire cheltuială">
            <input type="number" class="expense-amount" value="25" placeholder="Suma (RON)" step="0.01">
            <button type="button" class="remove-btn" onclick="removeExpenseRow(this)">×</button>
        </div>
    `;
    // Add event listeners to ALL inputs (both name and amount)
    document.querySelectorAll('.expense-row input').forEach(input => {
        input.addEventListener('input', calculateExpenses);
    });
    
    // Set up drag and drop for all rows
    document.querySelectorAll('.expense-row').forEach(row => {
        setupRowDragAndDrop(row);
    });
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Advanced Drag and Drop functionality with smooth mobile-like behavior
let draggedElement = null;
let dragStartY = 0;
let dragStartX = 0;
let isDragging = false;
let currentContainer = null;
let placeholder = null;

function setupDragAndDrop() {
    console.log('Setting up advanced drag and drop system...');
    
    // Remove any existing listeners first
    document.querySelectorAll('.expense-row').forEach(row => {
        const newRow = row.cloneNode(true);
        row.parentNode.replaceChild(newRow, row);
    });
    
    // Add fresh listeners to all rows
    document.querySelectorAll('.expense-row').forEach(row => {
        setupRowDragAndDrop(row);
    });
    
    console.log('Advanced drag and drop system ready');
}

function setupRowDragAndDrop(row) {
    const handle = row.querySelector('.drag-handle');
    if (!handle) return;
    
    // Mouse down on handle starts potential drag
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        draggedElement = row;
        currentContainer = row.parentNode;
        dragStartY = e.clientY;
        dragStartX = e.clientX;
        isDragging = false;
        
        // Immediate visual feedback - make it bigger and closer
        row.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        row.style.transform = 'scale(1.05)';
        row.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        row.style.zIndex = '1000';
        row.style.position = 'relative';
        handle.style.cursor = 'grabbing';
        
        // Add temporary listeners for dragging
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        console.log('Drag started for:', row);
    });
}

function handleMouseMove(e) {
    if (!draggedElement) return;
    
    const deltaY = e.clientY - dragStartY;
    const deltaX = e.clientX - dragStartX;
    
    // Start dragging if moved enough
    if (!isDragging && (Math.abs(deltaY) > 3 || Math.abs(deltaX) > 3)) {
        isDragging = true;
        
        // Create placeholder
        placeholder = document.createElement('div');
        placeholder.className = 'drag-placeholder';
        placeholder.style.height = draggedElement.offsetHeight + 'px';
        placeholder.style.margin = '4px 0';
        placeholder.style.border = '2px dashed #007bff';
        placeholder.style.borderRadius = '8px';
        placeholder.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
        placeholder.style.transition = 'all 0.2s ease';
        
        // Insert placeholder where dragged element was
        currentContainer.insertBefore(placeholder, draggedElement);
        
        // Make dragged element float - completely detach it from container constraints
        draggedElement.style.position = 'fixed';
        draggedElement.style.pointerEvents = 'none';
        draggedElement.style.width = draggedElement.offsetWidth + 'px';
        draggedElement.style.height = draggedElement.offsetHeight + 'px';
        draggedElement.style.transition = 'none';
        draggedElement.style.zIndex = '99999'; // Very high z-index
        draggedElement.style.opacity = '0.9'; // Slightly transparent to see underneath
        draggedElement.style.transform = 'none'; // Reset any transforms
        draggedElement.style.margin = '0'; // Reset margins
        draggedElement.style.padding = draggedElement.style.padding; // Keep original padding
        
        // Ensure it's not clipped by any parent overflow
        document.body.appendChild(draggedElement);
    }
    
    if (isDragging) {
        // Always follow cursor exactly with your preferred positioning
        draggedElement.style.left = (e.clientX - 10) + 'px';
        draggedElement.style.top = (e.clientY - 25) + 'px';
        
        // Find what's under the mouse
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        const targetRow = elementBelow ? elementBelow.closest('.expense-row') : null;
        
        if (targetRow && targetRow !== draggedElement && targetRow.parentNode === currentContainer) {
            // Get all rows in the container
            const allRows = Array.from(currentContainer.querySelectorAll('.expense-row')).filter(row => row !== draggedElement);
            const targetIndex = allRows.indexOf(targetRow);
            
            // Determine where to place the placeholder
            const rect = targetRow.getBoundingClientRect();
            const mouseY = e.clientY;
            const targetCenter = rect.top + rect.height / 2;
            
            if (mouseY < targetCenter) {
                // Insert before target
                currentContainer.insertBefore(placeholder, targetRow);
            } else {
                // Insert after target
                if (targetRow.nextSibling) {
                    currentContainer.insertBefore(placeholder, targetRow.nextSibling);
                } else {
                    currentContainer.appendChild(placeholder);
                }
            }
        }
    }
}

function handleMouseUp(e) {
    if (!draggedElement) return;
    
    // Remove temporary listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (isDragging && placeholder) {
        // Move the element back to its original container first
        document.body.removeChild(draggedElement);
        currentContainer.insertBefore(draggedElement, placeholder);
        currentContainer.removeChild(placeholder);
        
        showNotification('📋 Ordinea a fost schimbată!');
        calculateExpenses();
    }
    
    // Reset dragged element styles
    if (draggedElement) {
        // If element is still in body (drag was cancelled), move it back
        if (draggedElement.parentNode === document.body) {
            document.body.removeChild(draggedElement);
            if (placeholder && placeholder.parentNode) {
                currentContainer.insertBefore(draggedElement, placeholder);
            } else {
                currentContainer.appendChild(draggedElement);
            }
        }
        
        draggedElement.style.position = '';
        draggedElement.style.left = '';
        draggedElement.style.top = '';
        draggedElement.style.width = '';
        draggedElement.style.height = '';
        draggedElement.style.transform = '';
        draggedElement.style.boxShadow = '';
        draggedElement.style.zIndex = '';
        draggedElement.style.pointerEvents = '';
        draggedElement.style.transition = '';
        draggedElement.style.opacity = '';
        draggedElement.style.margin = '';
        
        const handle = draggedElement.querySelector('.drag-handle');
        if (handle) handle.style.cursor = 'grab';
    }
    
    // Clean up
    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
    }
    
    draggedElement = null;
    dragStartY = 0;
    dragStartX = 0;
    isDragging = false;
    currentContainer = null;
    placeholder = null;
}

// Theme Management Functions
function initializeTheme() {
    let savedTheme = localStorage.getItem('selectedTheme');
    // If no theme is saved, default to 'forest' (Nature)
    if (!savedTheme) {
        savedTheme = 'forest';
        localStorage.setItem('selectedTheme', savedTheme);
    }
    applyTheme(savedTheme);
    
    // Update selector
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.value = savedTheme;
    }
}

function changeTheme(themeName) {
    applyTheme(themeName);
}

function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('selectedTheme', themeName);
    currentTheme = themeName;
}

// Charts Management Functions - Removed as per request

// Add event listeners to ALL expense inputs for real-time calculation - Repeated code removed
document.querySelectorAll('.expense-row input').forEach(input => {
    input.addEventListener('input', calculateExpenses);
});
