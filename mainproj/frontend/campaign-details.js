document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const campaignDetailsContainer = document.getElementById('campaignDetailsContainer');
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    // --- STATE ---
    let userAccount = null;
    let campaigns = [];

    // --- FUNCTIONS ---

    const showMessage = (msg, isError = false) => {
        messageText.textContent = msg;
        messageBox.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
        messageBox.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
        setTimeout(() => { messageBox.classList.add('hidden'); }, 3000);
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = accounts[0];
                const shortAddress = `${userAccount.substring(0, 6)}...${userAccount.substring(userAccount.length - 4)}`;
                connectWalletBtn.textContent = shortAddress;
                connectWalletBtn.disabled = true;
                document.getElementById('profileLink').classList.remove('hidden');
                showMessage('Wallet connected successfully!');
            } catch (error) {
                showMessage('Wallet connection failed.', true);
            }
        } else {
            showMessage('Please install MetaMask to use this DApp.', true);
        }
    };
    
    const renderCampaignDetails = (campaign) => {
        if (!campaign) {
            campaignDetailsContainer.innerHTML = `<div class="text-center text-2xl font-bold p-16 text-red-500">Campaign not found.</div>`;
            return;
        }

        const now = new Date().getTime();
        const timeLeft = campaign.deadline - now;
        const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
        const progress = Math.min(100, (campaign.amountCollected / campaign.target) * 100);

        campaignDetailsContainer.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                <!-- Left Column: Image and Stats -->
                <div class="lg:col-span-2">
                    <img src="${campaign.image}" alt="${campaign.title}" class="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg mb-8">
                    <h2 class="text-4xl font-black text-white mb-2">${campaign.title}</h2>
                    <p class="text-gray-400 mb-6">Created by: <span class="font-mono text-indigo-400">${campaign.owner}</span></p>
                    <p class="text-lg text-gray-300 leading-relaxed">${campaign.description}</p>
                </div>

                <!-- Right Column: Funding and Donators -->
                <div class="glassmorphism rounded-2xl p-6 h-fit sticky top-8">
                    <div class="mb-6">
                        <p class="text-4xl font-bold text-white">${campaign.amountCollected} ETH</p>
                        <p class="text-gray-400">raised of ${campaign.target} ETH goal</p>
                    </div>
                    
                    <div class="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                        <div class="bg-gradient-to-r from-indigo-500 to-pink-500 h-2.5 rounded-full" style="width: ${progress}%"></div>
                    </div>

                    <div class="flex justify-between text-lg mb-6">
                        <div>
                            <p class="font-bold text-white">${progress.toFixed(2)}%</p>
                            <p class="text-xs text-gray-400">Funded</p>
                        </div>
                        <div>
                            <p class="font-bold text-white">${daysLeft}</p>
                            <p class="text-xs text-gray-400">Days Left</p>
                        </div>
                        <div>
                            <p class="font-bold text-white">${campaign.donators.length}</p>
                            <p class="text-xs text-gray-400">Backers</p>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <label for="fundAmount" class="block text-sm font-medium text-gray-300 mb-1">Amount (ETH)</label>
                        <input type="number" id="fundAmount" name="fundAmount" step="0.01" min="0.01" required class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="0.1">
                    </div>

                    <button id="fundBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300">
                        Fund This Campaign
                    </button>
                </div>
            </div>

            <!-- Donators List -->
            <div class="mt-16">
                <h3 class="text-3xl font-bold mb-6">Recent Donators</h3>
                <div id="donatorsList" class="space-y-4">
                    <!-- Donator items will be injected here -->
                </div>
            </div>
        `;

        const donatorsList = document.getElementById('donatorsList');
        if (campaign.donators.length > 0) {
            campaign.donators.forEach(donator => {
                const item = document.createElement('div');
                item.className = 'glassmorphism p-4 rounded-lg flex justify-between items-center';
                item.innerHTML = `
                    <p class="font-mono text-sm text-gray-300">${donator.address}</p>
                    <p class="font-bold text-indigo-400">${donator.amount} ETH</p>
                `;
                donatorsList.appendChild(item);
            });
        } else {
            donatorsList.innerHTML = `<p class="text-gray-500">Be the first to support this campaign!</p>`;
        }
        
        // Add event listener for the new fund button
        document.getElementById('fundBtn').addEventListener('click', handleFundCampaign);
    };

    const handleFundCampaign = () => {
        if (!userAccount) {
            showMessage('Please connect your wallet first.', true);
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const campaignId = parseInt(urlParams.get('id'));
        const campaign = campaigns.find(c => c.id === campaignId);
        
        const amountInput = document.getElementById('fundAmount');
        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount <= 0) {
            showMessage('Please enter a valid amount.', true);
            return;
        }

        if (campaign) {
            campaign.amountCollected += amount;
            campaign.donators.push({ address: userAccount, amount: amount });
            
            // Update the data in localStorage
            localStorage.setItem('campaignsData', JSON.stringify(campaigns));
            
            // Re-render the page to show the new data
            renderCampaignDetails(campaign);
            showMessage(`Successfully funded ${amount} ETH!`);
            amountInput.value = ''; // Clear the input
        }
    };
    
    // --- INITIALIZATION ---
    const init = () => {
        // Retrieve the campaign data from localStorage
        const storedCampaigns = localStorage.getItem('campaignsData');
        if (storedCampaigns) {
            campaigns = JSON.parse(storedCampaigns);
        } else {
            console.error("No campaign data found.");
            campaignDetailsContainer.innerHTML = `<div class="text-center text-2xl font-bold p-16 text-red-500">Error: Could not load campaign data.</div>`;
            return;
        }

        // Get campaign ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const campaignId = parseInt(urlParams.get('id'));

        if (isNaN(campaignId)) {
            console.error("Invalid campaign ID in URL.");
            campaignDetailsContainer.innerHTML = `<div class="text-center text-2xl font-bold p-16 text-red-500">Invalid campaign ID.</div>`;
            return;
        }

        const campaign = campaigns.find(c => c.id === campaignId);
        renderCampaignDetails(campaign);
    };

    connectWalletBtn.addEventListener('click', connectWallet);
    init();
});
