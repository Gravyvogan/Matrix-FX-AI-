// Matrix-FX Main Interface & Terminal Controller

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element Bindings ---
  const authContainer = document.getElementById('auth-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const authForm = document.getElementById('auth-form');
  const usernameFieldGroup = document.getElementById('username-field-group');
  const authUsernameInput = document.getElementById('auth-username');
  const authEmailInput = document.getElementById('auth-email');
  const authPasswordInput = document.getElementById('auth-password');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authToggleBtn = document.getElementById('auth-toggle-btn');
  const authToggleText = document.getElementById('auth-toggle-text');
  const authAlert = document.getElementById('auth-alert');
  
  const userDisplay = document.getElementById('user-display');
  const logoutBtn = document.getElementById('logout-btn');
  const marketRatesList = document.getElementById('market-rates-list');
  const ledgerEntriesBody = document.getElementById('ledger-entries-body');
  
  const tradeExecutionForm = document.getElementById('trade-execution-form');
  const triggerAnalysisBtn = document.getElementById('trigger-analysis-btn');
  const signalPairSelect = document.getElementById('signal-pair-select');
  const signalResponseBlock = document.getElementById('signal-response');

  let isLoginMode = true;
  let socket = null;

  // --- Start Up & Session Checks ---
  const token = MatrixAPI.getToken();
  if (token) {
    initializeSession();
  }

  // --- Auth Section Switch Handler ---
  authToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    authAlert.classList.add('hidden');

    if (isLoginMode) {
      usernameFieldGroup.classList.add('hidden');
      authUsernameInput.removeAttribute('required');
      authSubmitBtn.innerText = 'Access Terminal';
      authToggleText.innerText = 'New operative account request?';
      authToggleBtn.innerText = 'Register Profile';
    } else {
      usernameFieldGroup.classList.remove('hidden');
      authUsernameInput.setAttribute('required', 'true');
      authSubmitBtn.innerText = 'Initialize Profile Account';
      authToggleText.innerText = 'Security account verified?';
      authToggleBtn.innerText = 'Login Credentials';
    }
  });

  // --- Account Access Submission ---
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authAlert.classList.add('hidden');

    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    
    try {
      let data;
      if (isLoginMode) {
        data = await MatrixAPI.auth.login(email, password);
      } else {
        const username = authUsernameInput.value.trim();
        data = await MatrixAPI.auth.register(username, email, password);
      }

      if (data.token) {
        MatrixAPI.setToken(data.token);
        initializeSession();
      } else {
        showAuthError(data.message || 'Authentication processing error.');
      }
    } catch (err) {
      showAuthError('Network communication failure with secure host node.');
    }
  });

  function showAuthError(msg) {
    authAlert.innerText = `⚠️ SECURE CRYPTO EXCEPTION: ${msg}`;
    authAlert.classList.remove('hidden');
  }

  // --- Session Loader ---
  function initializeSession() {
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    // Fallback to extraction if decoded string structures aren't running natively
    userDisplay.innerText = "AGENT_OPERATIVE";
    
    // Connect Live Data Streams
    loadMarketRatesLoop();
    loadTradeLedgerEntries();
    establishLiveWebSocket();
  }

  // --- Real-time Price Monitors ---
  async function loadMarketRatesLoop() {
    try {
      const rates = await MatrixAPI.market.getRates();
      marketRatesList.innerHTML = '';
      
      Object.keys(rates).forEach(pair => {
        const item = rates[pair];
        const isUp = item.change.startsWith('+');
        const colorClass = isUp ? 'text-green-400' : 'text-red-400';
        
        marketRatesList.innerHTML += `
          <div class="flex justify-between text-xs border-b border-[#1f991f]/20 pb-1">
            <span class="font-bold">${pair}</span>
            <span class="font-mono">B: ${item.bid} / A: ${item.ask}</span>
            <span class="${colorClass} font-bold">${item.change}</span>
          </div>
        `;
      });
    } catch (err) {
      console.log("Rates connection failure.");
    }
    // Poll every 4 seconds to maintain active data feeds
    setTimeout(loadMarketRatesLoop, 4000);
  }

  // --- Trade Action Framework Handling ---
  async function loadTradeLedgerEntries() {
    try {
      const trades = await MatrixAPI.trades.getAll();
      ledgerEntriesBody.innerHTML = '';

      if (!trades || trades.length === 0) {
        ledgerEntriesBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-[#1f991f]/60">No open risk data files found.</td></tr>`;
        return;
      }

      trades.forEach(trade => {
        const sideColor = trade.type === 'BUY' ? 'text-green-400 font-bold' : 'text-red-400 font-bold';
        const isClosed = trade.status === 'CLOSED';
        
        let liquidationCell = '';
        if (isClosed) {
          const profitColor = trade.profit >= 0 ? 'text-green-400' : 'text-red-400';
          liquidationCell = `<span class="${profitColor} font-bold">$${trade.profit.toFixed(2)}</span>`;
        } else {
          liquidationCell = `
            <button onclick="closeActiveTradePosition('${trade._id}', ${trade.entryPrice})" class="bg-red-950/40 hover:bg-red-600 hover:text-black border border-red-500 text-red-400 text-[10px] px-2 py-0.5 rounded cursor-pointer transition-all">
              Liquidate
            </button>
          `;
        }

        ledgerEntriesBody.innerHTML += `
          <tr class="ledger-row border-b border-[#1f991f]/10 py-2">
            <td class="py-2">${trade.pair}</td>
            <td class="${sideColor}">${trade.type}</td>
            <td>${trade.quantity}</td>
            <td>${trade.entryPrice}</td>
            <td>SL: ${trade.stopLoss || '--'} <br> TP: ${trade.takeProfit || '--'}</td>
            <td class="text-[10px] uppercase tracking-wider font-bold">${trade.status}</td>
            <td class="text-right py-2">${liquidationCell}</td>
          </tr>
        `;
      });
    } catch (err) {
      console.log("Error printing system logs.");
    }
  }

  // Bind order execution to form action
  tradeExecutionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tradeData = {
      pair: document.getElementById('trade-pair').value,
      type: document.getElementById('trade-type').value,
      quantity: parseInt(document.getElementById('trade-quantity').value),
      entryPrice: parseFloat(document.getElementById('trade-entry').value),
      stopLoss: parseFloat(document.getElementById('trade-sl').value) || undefined,
      takeProfit: parseFloat(document.getElementById('trade-tp').value) || undefined
    };

    try {
      const res = await MatrixAPI.trades.create(tradeData);
      if (res.trade) {
        loadTradeLedgerEntries();
        tradeExecutionForm.reset();
      }
    } catch (err) {
      alert("Error logging manual position.");
    }
  });

  // Global closure map reference helper
  window.closeActiveTradePosition = async function(id, entry) {
    const deviation = (Math.random() * 0.004) - 0.002;
    const mockExit = parseFloat((entry + deviation).toFixed(4));
    
    try {
      await MatrixAPI.trades.close(id, mockExit);
      loadTradeLedgerEntries();
    } catch (err) {
      alert("Execution error while trying to transmit closure price.");
    }
  };

  // --- AI Computation Event Trigger ---
  triggerAnalysisBtn.addEventListener('click', async () => {
    const selectedPair = signalPairSelect.value;
    triggerAnalysisBtn.innerText = 'CALCULATING INDICATORS...';
    
    try {
      const data = await MatrixAPI.market.analyzePair(selectedPair);
      if (data.signal) {
        signalResponseBlock.classList.remove('hidden');
        
        const actionEl = document.getElementById('signal-action');
        actionEl.innerText = data.signal;
        actionEl.className = 'font-black ' + 
          (data.signal === 'BUY' ? 'text-green-400 matrix-glow' : data.signal === 'SELL' ? 'text-red-400 matrix-glow' : 'text-yellow-400');
          
        document.getElementById('signal-strength').innerText = data.strength;
        document.getElementById('signal-rsi').innerText = data.indicators.rsi;
        document.getElementById('signal-macd').innerText = data.indicators.macd;
      }
    } catch (err) {
      console.log("Indicator generation failure.");
    } finally {
      triggerAnalysisBtn.innerText = 'Execute Technical Computation';
    }
  });

  // --- WebSocket Connection Node Mapping ---
  function establishLiveWebSocket() {
    const wsBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : window.location.origin;

    try {
      socket = io(wsBaseUrl);
      
      socket.on('connect', () => {
        console.log('Connected to socket data nodes.');
        socket.emit('subscribe_prices', ['EURUSD', 'GBPUSD', 'USDJPY']);
      });

      socket.on('signal_generated', (data) => {
        console.log('Live AI stream packet received:', data);
      });
    } catch (e) {
      console.log("WebSocket node currently offline.");
    }
  }

  // --- Disconnection Processing ---
  logoutBtn.addEventListener('click', () => {
    MatrixAPI.clearToken();
    if (socket) socket.disconnect();
    dashboardContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    authForm.reset();
  });
});
                     
