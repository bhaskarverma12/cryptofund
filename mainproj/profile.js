document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const profileContainer = document.getElementById('profileContainer');
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const profileLink = document.getElementById('profileLink');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    // --- STATE ---
    let userAccount = null;
    let campaigns = [];

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
                init(); // Re-initialize the page with the connected account
            } catch (error) {
                showMessage('Wallet connection failed.', true);
            }
        } else {
            showMessage('Please install MetaMask to use this DApp.', true);
        }
    };

    const renderProfile = () => {
        // Filter campaigns
        const createdCampaigns = campaigns.filter(c => c.owner.toLowerCase() === userAccount.toLowerCase());
        const backedCampaigns = campaigns.filter(c => c.donators.some(d => d.address.toLowerCase() === userAccount.toLowerCase()));

        profileContainer.innerHTML = `
            <div class="mb-12">
                <h2 class="text-3xl font-bold text-white mb-2">My Wallet</h2>
                <p class="font-mono text-indigo-400 bg-gray-800 p-3 rounded-lg">${userAccount}</p>
            </div>

            <!-- Created Campaigns Section -->
            <div class="mb-12">
                <h3 class="text-3xl font-bold mb-6">Campaigns I've Created (${createdCampaigns.length})</h3>
                <div id="createdCampaignsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Created campaign cards will be injected here -->
                </div>
            </div>

            <!-- Backed Campaigns Section -->
            <div>
                <h3 class="text-3xl font-bold mb-6">Campaigns I've Backed (${backedCampaigns.length})</h3>
                <div id="backedCampaignsGrid" class="space-y-4">
                    <!-- Backed campaign list items will be injected here -->
                </div>
            </div>
        `;

        const createdGrid = document.getElementById('createdCampaignsGrid');
        const backedGrid = document.getElementById('backedCampaignsGrid');

        // Render Created Campaigns
        if (createdCampaigns.length > 0) {
            createdCampaigns.forEach(campaign => {
                createdGrid.innerHTML += createCampaignCard(campaign);
            });
        } else {
            createdGrid.innerHTML = `<p class="text-gray-500 col-span-full">You have not created any campaigns yet.</p>`;
        }

        // Render Backed Campaigns
        if (backedCampaigns.length > 0) {
            backedCampaigns.forEach(campaign => {
                backedGrid.innerHTML += createBackedCampaignItem(campaign);
            });
        } else {
            backedGrid.innerHTML = `<p class="text-gray-500">You have not backed any campaigns yet.</p>`;
        }
    };

    const createCampaignCard = (campaign) => {
        const progress = Math.min(100, (campaign.amountCollected / campaign.target) * 100);
        return `
            <a href="campaign-details.html?id=${campaign.id}" class="glassmorphism rounded-2xl overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <img class="w-full h-40 object-cover" src="${campaign.image}" alt="${campaign.title}">
                <div class="p-4 flex flex-col flex-grow">
                    <h4 class="font-bold text-lg mb-2 text-white">${campaign.title}</h4>
                    <div class="w-full bg-gray-700 rounded-full h-2 mt-auto mb-2">
                        <div class="bg-gradient-to-r from-indigo-500 to-pink-500 h-2 rounded-full" style="width: ${progress}%"></div>
                    </div>
                    <p class="text-sm text-gray-400">Raised: ${campaign.amountCollected} / ${campaign.target} ETH</p>
                </div>
            </a>
        `;
    };

     const createBackedCampaignItem = (campaign) => {
        const myDonation = campaign.donators.find(d => d.address.toLowerCase() === userAccount.toLowerCase());
        return `
            <a href="campaign-details.html?id=${campaign.id}" class="glassmorphism p-4 rounded-lg flex justify-between items-center hover:bg-gray-800 transition-colors duration-300">
                <div>
                    <p class="font-bold text-white">${campaign.title}</p>
                    <p class="text-sm text-gray-500">by ${campaign.owner.substring(0,12)}...</p>
                </div>
                <p class="font-bold text-green-400">You backed ${myDonation.amount} ETH</p>
            </a>
        `;
    };

    const renderLoggedOutState = () => {
        profileContainer.innerHTML = `
            <div class="text-center py-16 glassmorphism rounded-2xl">
                <h2 class="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p class="text-gray-400 mb-6">Please connect your wallet to view your profile.</p>
                <button id="connectWalletBtnSecondary" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                    Connect Wallet
                </button>
            </div>
        `;
        document.getElementById('connectWalletBtnSecondary').addEventListener('click', connectWallet);
    };

    // --- INITIALIZATION ---
    const init = () => {
        userAccount = localStorage.getItem('userAccount');
        const storedCampaigns = localStorage.getItem('campaignsData');
        
        if (storedCampaigns) {
            campaigns = JSON.parse(storedCampaigns);
        }

        if (userAccount) {
            const shortAddress = `${userAccount.substring(0, 6)}...${userAccount.substring(userAccount.length - 4)}`;
            connectWalletBtn.textContent = shortAddress;
            connectWalletBtn.disabled = true;
            profileLink.classList.remove('hidden');
            renderProfile();
        } else {
            renderLoggedOutState();
        }
    };

    connectWalletBtn.addEventListener('click', connectWallet);
    init();
});
