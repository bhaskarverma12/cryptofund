document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Screen Logic ---
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');
    if (splashScreen) { splashScreen.classList.add('splash-exit'); }
    if (mainContent) { mainContent.classList.add('content-visible'); }

    // --- DOM ELEMENTS (RESTORED) ---
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const campaignsGrid = document.getElementById('campaignsGrid');
    const createCampaignBtn = document.getElementById('createCampaignBtn');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const createCampaignModal = document.getElementById('createCampaignModal');
    const closeCreateModalBtn = document.getElementById('closeCreateModalBtn');
    const createCampaignForm = document.getElementById('createCampaignForm');
    const fundCampaignModal = document.getElementById('fundCampaignModal');
    const closeFundModalBtn = document.getElementById('closeFundModalBtn');
    const fundCampaignForm = document.getElementById('fundCampaignForm');
    const fundCampaignTitle = document.getElementById('fundCampaignTitle');
    const fundCampaignIdInput = document.getElementById('fundCampaignId');

    // --- STATE ---
    let userAccount = null;
    let campaigns = []; // Will be loaded below

    // --- THREE.JS 3D BACKGROUND ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x7e22ce, wireframe: true });
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(5, 5, 5);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(pointLight, ambientLight);
    camera.position.z = 5;
    const mouse = new THREE.Vector2();
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    function animate() {
        requestAnimationFrame(animate);
        shape.rotation.x += 0.001;
        shape.rotation.y += 0.001;
        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // --- INTERSECTION OBSERVER ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // --- FUNCTIONS (RESTORED) ---
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = accounts[0];
                localStorage.setItem('userAccount', userAccount);
                updateHeaderUI(userAccount);
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
            document.getElementById('profileLink').classList.remove('hidden');
        }
    };
    
    const showMessage = (msg, isError = false) => {
        messageText.textContent = msg;
        messageBox.classList.remove('hidden', 'bg-sky-500', 'bg-red-500');
        messageBox.classList.add(isError ? 'bg-red-500' : 'bg-sky-500');
        setTimeout(() => { messageBox.classList.add('hidden'); }, 3000);
    };

    const handleCreateCampaign = (e) => {
        e.preventDefault();
        if (!userAccount) { showMessage('Please connect your wallet first.', true); return; }
        const formData = new FormData(createCampaignForm);
        const newCampaign = {
            id: campaigns.length,
            owner: userAccount,
            title: formData.get('title'),
            description: formData.get('description'),
            target: parseFloat(formData.get('goal')),
            deadline: new Date(formData.get('deadline')).getTime(),
            amountCollected: 0,
            image: `https://placehold.co/600x400/1a202c/ffffff?text=${formData.get('title').replace(/\s/g, '+')}`,
            donators: []
        };
        campaigns.unshift(newCampaign);
        localStorage.setItem('campaignsData', JSON.stringify(campaigns));
        renderCampaigns();
        createCampaignForm.reset();
        createCampaignModal.classList.add('hidden');
        showMessage('Campaign created successfully!');
    };
    
    // RENDER CAMPAIGNS (New Style)
    const renderCampaigns = () => {
        campaignsGrid.innerHTML = '';
        campaigns.forEach((campaign, index) => {
            const progress = Math.min(100, (campaign.amountCollected / campaign.target) * 100);
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'animate-on-scroll';
            cardWrapper.dataset.delay = (index % 3) * 150;
            cardWrapper.innerHTML = `
                <a href="campaign-details.html?id=${campaign.id}" class="card p-4 flex flex-col h-full">
                    <img class="w-full h-40 object-cover rounded-md mb-4" src="${campaign.image}" alt="${campaign.title}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/030913/ffffff?text=Image+Error';">
                    <div class="flex flex-col flex-grow">
                        <h4 class="font-bold text-lg mb-2 text-white">${campaign.title}</h4>
                        <p class="text-gray-400 text-sm mb-4 flex-grow">${campaign.description.substring(0, 80)}...</p>
                        <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div class="progress-gradient h-2 rounded-full" style="width: ${progress}%"></div>
                        </div>
                        <div class="flex justify-between text-sm text-gray-400">
                            <span><span class="font-bold text-white">${campaign.amountCollected} ETH</span> Raised</span>
                            <span>${progress.toFixed(0)}%</span>
                        </div>
                    </div>
                </a>
            `;
            campaignsGrid.appendChild(cardWrapper);
            observer.observe(cardWrapper);
        });
    };
    
    // --- EVENT LISTENERS (RESTORED) ---
    connectWalletBtn.addEventListener('click', connectWallet);
    createCampaignBtn.addEventListener('click', () => createCampaignModal.classList.remove('hidden'));
    closeCreateModalBtn.addEventListener('click', () => createCampaignModal.classList.add('hidden'));
    createCampaignForm.addEventListener('submit', handleCreateCampaign);

    // --- INITIALIZATION & DATA LOADING ---
    const init = () => {
        const defaultCampaigns = [
            { id: 0, owner: '0x1234...', title: 'Project Nebula: A Sci-Fi Game', description: 'An open-world space exploration game built on decentralized principles.', target: 50, amountCollected: 35.5, image: 'https://placehold.co/600x400/030913/0ea5e9?text=Nebula', donators: [] },
            { id: 1, owner: '0xabcd...', title: 'Decentralized Art Gallery', description: 'A virtual gallery for artists to showcase and sell their work as NFTs.', target: 25, amountCollected: 18.2, image: 'https://placehold.co/600x400/030913/c026d3?text=Art+Gallery', donators: [] },
            { id: 2, owner: '0x9876...', title: 'EcoChain: Carbon Tracker', description: 'A transparent platform to track and trade carbon credits on the blockchain.', target: 100, amountCollected: 45.8, image: 'https://placehold.co/600x400/030913/059669?text=EcoChain', donators: [] },
            { id: 3, owner: '0x4567...', title: 'Quantum Leap Music Studio', description: 'A decentralized record label where fans can invest in upcoming artists.', target: 75, amountCollected: 60.1, image: 'https://placehold.co/600x400/030913/0ea5e9?text=Music+Studio', donators: [] },
            { id: 4, owner: '0xefgh...', title: 'BioVerse Health Data', description: 'Securely monetize your health data for research while maintaining privacy.', target: 120, amountCollected: 90.3, image: 'https://placehold.co/600x400/030913/c026d3?text=BioVerse', donators: [] },
            { id: 5, owner: '0xijkl...', title: 'Indie Film "The Grid"', description: 'Fund the creation of a community-driven science fiction film.', target: 40, amountCollected: 15.7, image: 'https://placehold.co/600x400/030913/059669?text=The+Grid', donators: [] }
        ];

        let campaignsData = JSON.parse(localStorage.getItem('campaignsData'));
        if (!campaignsData || campaignsData.length === 0) {
            campaignsData = defaultCampaigns;
            localStorage.setItem('campaignsData', JSON.stringify(campaignsData));
        }
        campaigns = campaignsData;

        renderCampaigns();
        
        const staticElementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        staticElementsToAnimate.forEach(el => observer.observe(el));

        const savedAccount = localStorage.getItem('userAccount');
        if (savedAccount) {
            userAccount = savedAccount;
            updateHeaderUI(userAccount);
        }
    };
    
    init(); // Run initialization
});
