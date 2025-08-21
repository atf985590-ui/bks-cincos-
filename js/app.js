// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. STATE MANAGEMENT (Simulated Backend) ---
    const state = {
        currentPage: 'profile',
        user: { email: '', balance: 0.00, vipLevel: 0, depositPlan: 1 },
        vipPlans: [],
    };
    
    // --- 2. DATA (Hardcoded for prototype) ---
    state.navItems = [
        { page: 'profile', label: 'أنا', svg: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>` },
        { page: 'vip', label: 'VIP', svg: `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>` },
        { page: 'deposit', label: 'إيداع', svg: `<svg viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5-1.5z"/></svg>` },
        { page: 'withdraw', label: 'سحب', svg: `<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>` },
    ];
    state.depositAddresses = [
        { currency: 'USDT (TRC20)', address: 'TLsGeELYfexmuhK6g3TVQ44AAt5kxZN3gb', logo: 'images/usdt.png' },
        { currency: 'BTC (Segwit)', address: 'bc1qlvx4tzwzvm66p0ukfykkv4zsqq7ywug65282u2', logo: 'images/btc.png' },
        { currency: 'BNB (BEP20)', address: '0x83c317eab7f9d70cf1f98ca8cd30fce09d7fe18e', logo: 'images/bnb.png' },
        { currency: 'Ethereum (ERC20)', address: '0x83c317eab7f9d70cf1f98ca8cd30fce09d7fe18e', logo: 'images/eth.png' },
    ];
    state.withdrawMethods = [
        { name: 'USDT (TRC20)', logo: 'images/usdt.png' },
        { name: 'Bitcoin', logo: 'images/btc.png' },
        { name: 'Ethereum', logo: 'images/eth.png' },
        // Add more methods as needed
    ];

    (function generateVipPlans() {
        let price = 5;
        for(let i = 1; i <= 20; i++) {
            const daily = i === 1 ? 0.5 : (i === 2 ? 1 : 1 + (i-2) * 0.2);
            const tasks = i === 1 ? 0.7 : (i === 2 ? 0.8 : 0.8 + (i-2) * 0.3);
            const referral = 1 + Math.floor((i-1)/2) * 0.5;
            state.vipPlans.push({ level: i, price, daily, tasks, referral });
            price = i === 1 ? 8 : Math.round(price * 1.4);
        }
        state.vipPlans[19].price = 1000;
    })();

    // --- 3. DOM Elements ---
    const mainContent = document.getElementById('main-content');
    const modalOverlay = document.getElementById('modal-overlay');
    const header = document.querySelector('header');

    // --- 4. RENDERING ENGINE ---
    const render = () => {
        header.innerHTML = `
            <div class="header-top">
                <h1 class="app-title">BKS Cincos</h1>
                <div class="balance-display">الرصيد: <span id="balance-amount">${state.user.balance.toFixed(2)}$</span></div>
            </div>
            <div class="withdrawal-feed"><span id="feed-item" class="feed-item"></span></div>
        `;
        mainContent.innerHTML = pageTemplates[state.currentPage]();
        document.getElementById('nav-bar').innerHTML = state.navItems.map(item => `
            <button class="nav-btn ${state.currentPage === item.page ? 'active' : ''}" data-page="${item.page}">
                ${item.svg}<p>${item.label}</p>
            </button>
        `).join('');
        startWithdrawalFeed();
    };

    const pageTemplates = {
        profile: () => `<div class="page info-card"><h2>الملف الشخصي</h2><p><strong>البريد الإلكتروني:</strong> ${state.user.email}</p><p><strong>خطة VIP الحالية:</strong> ${state.user.vipLevel > 0 ? `VIP ${state.user.vipLevel}` : 'لا يوجد'}</p></div>`,
        vip: () => `
            <div class="page">
                <h2>خطط كبار الشخصيات</h2>
                <div class="grid-layout">${state.vipPlans.map(p => `
                    <div class="info-card" style="text-align:center;">
                        <h3>VIP ${p.level}</h3>
                        <p style="font-size:1.5rem;font-weight:bold">${p.price.toFixed(2)}$</p>
                        <ul style="text-align:right; list-style:none; padding:0; margin:15px 0;">
                            <li>- تسجيل يومي: ${p.daily.toFixed(2)}$</li>
                            <li>- إكمال المهام: ${p.tasks.toFixed(2)}$</li>
                            <li>- دعوة صديق: ${p.referral.toFixed(2)}$</li>
                        </ul>
                        <button class="btn" data-action="select-vip-for-deposit" data-level="${p.level}" ${state.user.vipLevel>=p.level?'disabled':''}>${state.user.vipLevel>=p.level?'مُفعّلة':'اشترك الآن'}</button>
                    </div>`).join('')}
                </div>
            </div>`,
        deposit: () => {
            const selectedPlan = state.vipPlans.find(p => p.level === state.user.depositPlan);
            return `
            <div class="page info-card">
                <h2>إيداع للاشتراك في VIP ${selectedPlan.level}</h2>
                <p>المبلغ المطلوب: <strong style="color:var(--accent-primary);">${selectedPlan.price.toFixed(2)}$</strong></p>
                <hr style="border-color:var(--card-border);margin:20px 0;">
                ${state.depositAddresses.map(addr => `<div class="method-item"><img src="${addr.logo}" alt="${addr.currency} logo"><div class="method-info"><span>${addr.currency}</span><p>${addr.address}</p></div><button class="btn copy-btn" data-copy="${addr.address}">نسخ</button></div>`).join('')}
                <div class="instructions" style="margin-top:20px;">
                    <h3>كيفية الإيداع:</h3>
                    <ol>
                        <li>انسخ عنوان المحفظة وأرسل المبلغ المطلوب (${selectedPlan.price.toFixed(2)}$).</li>
                        <li>بعد التحويل، عد إلى هنا واضغط على "تأكيد".</li>
                    </ol>
                </div>
                <br>
                <button class="btn" data-action="confirm-deposit" style="width:100%;">تأكيد الإيداع</button>
            </div>`;
        },
        withdraw: () => `<div class="page"><h2>اختر وسيلة السحب</h2><div class="grid-layout">${state.withdrawMethods.map(m => `<div class="info-card method-item" data-action="show-withdraw-modal" data-method='${JSON.stringify(m)}' style="cursor:pointer;flex-direction:row;justify-content:center;align-items:center;text-align:center;"><img src="${m.logo}" alt="${m.name}"><h3>${m.name}</h3></div>`).join('')}</div></div>`,
    };

    // --- 5. ACTIONS & LOGIC ---
    const handleAction = (action, data) => {
        switch (action) {
            case 'login':
                const email = document.getElementById('login-email').value;
                if (!email) { alert('الرجاء إدخال البريد الإلكتروني'); return; }
                state.user.email = email;
                document.getElementById('login-screen').classList.remove('active');
                document.getElementById('main-app').classList.add('active');
                render();
                break;
            case 'navigate': state.currentPage = data.page; render(); break;
            case 'copy': navigator.clipboard.writeText(data.copy).then(() => { alert('تم نسخ العنوان!'); }); break;
            case 'select-vip-for-deposit':
                state.user.depositPlan = parseInt(data.level);
                state.currentPage = 'deposit';
                render();
                break;
            case 'confirm-deposit':
                modalOverlay.innerHTML = `<div class="modal-content" style="text-align:center;"><button class="modal-close" data-action="close-modal">&times;</button><h3>تم استلام طلبك</h3><p>طلب الإيداع قيد المراجعة. سيستغرق الأمر من 3 دقائق إلى 24 ساعة.</p><button class="btn" data-action="close-modal">موافق</button></div>`;
                modalOverlay.style.display = 'flex';
                break;
            case 'show-withdraw-modal':
                const method = JSON.parse(data.method);
                modalOverlay.innerHTML = `<div class="modal-content"><button class="modal-close" data-action="close-modal">&times;</button><h3>سحب عبر ${method.name}</h3><input type="text" id="withdraw-address" placeholder="عنوان المحفظة"><input type="number" id="withdraw-amount" placeholder="المبلغ"><div style="display:flex;gap:15px;margin-top:20px;"><button class="btn" data-action="process-withdrawal">تأكيد</button><button class="btn" data-action="close-modal" style="background:grey;">إلغاء</button></div></div>`;
                modalOverlay.style.display = 'flex';
                break;
            case 'close-modal': modalOverlay.style.display = 'none'; break;
        }
    };
    
    // --- 6. VISUALS & EVENT LISTENERS ---
    const startWithdrawalFeed = () => {
        const feedEl = document.getElementById('feed-item');
        if (!feedEl) return;
        let feedIndex = 0;
        const randomNames = ['Ahmed', 'Sara', 'Mohammed', 'Fatima', 'Yusuf', 'Layla'];
        
        const showNextFeed = () => {
            const name = randomNames[Math.floor(Math.random() * randomNames.length)];
            const amount = (Math.random() * 990 + 10).toFixed(2);
            feedEl.innerHTML = `🎉 نجح <strong>${name.slice(0,1)}***${name.slice(-1)}</strong> في سحب <strong>${amount}$</strong>!`;
            feedEl.classList.add('visible');
            setTimeout(() => {
                feedEl.classList.remove('visible');
                setTimeout(showNextFeed, 500);
            }, 2500);
        };
        showNextFeed();
    };

    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        target.appendChild(ripple);
        const rect = target.getBoundingClientRect();
        ripple.style.left = `${e.clientX - rect.left - (ripple.offsetWidth / 2)}px`;
        ripple.style.top = `${e.clientY - rect.top - (ripple.offsetHeight / 2)}px`;
        ripple.onanimationend = () => ripple.remove();

        const { action, page, copy, level } = target.dataset;
        if (target.id === 'login-btn') handleAction('login');
        else if (page) handleAction('navigate', { page });
        else if (copy) handleAction('copy', { copy });
        else if (action) handleAction(action, { ...target.dataset });
    });

    // --- 7. INITIALIZATION ---
    render();
});
