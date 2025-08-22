document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const profileLink = document.getElementById('profileLink');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    // --- STATE ---
    let userAccount = null;

    // --- FUNCTIONS ---

    const showMessage = (msg, isError = false) => {
        messageText.textContent = msg;
        messageBox.classList.remove('hidden');
        messageBox.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
        setTimeout(() => { messageBox.classList.add('hidden'); }, 3000);
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                localStorage.setItem('userAccount', accounts[0]); // Save account to local storage
                updateHeaderUI(accounts[0]); // Update the header
                showMessage('Wallet connected successfully!');
            } catch (error) {
                showMessage('Wallet connection failed.', true);
            }
        } else {
            showMessage('Please install MetaMask to use this DApp.', true);
        }
    };

    const updateHeaderUI = (account) => {
        if (account) {
            const shortAddress = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
            connectWalletBtn.textContent = shortAddress;
            connectWalletBtn.disabled = true;
            profileLink.classList.remove('hidden');
        }
    };

    // --- INITIALIZATION ---
    const init = () => {
        userAccount = localStorage.getItem('userAccount');
        if (userAccount) {
            updateHeaderUI(userAccount);
        }
    };

    connectWalletBtn.addEventListener('click', connectWallet);
    init();
});
