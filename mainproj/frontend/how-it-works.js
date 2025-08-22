document.addEventListener('DOMContentLoaded', () => {
    // This script is identical to about.js and just handles the header UI.
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const profileLink = document.getElementById('profileLink');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    let userAccount = null;

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
                localStorage.setItem('userAccount', accounts[0]);
                updateHeaderUI(accounts[0]);
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

    const init = () => {
        userAccount = localStorage.getItem('userAccount');
        if (userAccount) {
            updateHeaderUI(userAccount);
        }
    };

    connectWalletBtn.addEventListener('click', connectWallet);
    init();
});
