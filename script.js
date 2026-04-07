// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(248, 248, 248, 0.98)';
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(248, 248, 248, 0.95)';
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    }
});

// 主题切换功能
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

// 检查本地存储中的主题设置
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    body.classList.add('dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
    body.classList.remove('dark');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

// 主题切换点击事件
themeToggle.addEventListener('click', function() {
    body.classList.toggle('dark');
    if (body.classList.contains('dark')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
});

// 照片轮播功能
const carouselContainer = document.querySelector('.carousel-container');
const slides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const indicatorsContainer = document.querySelector('.carousel-indicators');
let currentIndex = 0;

// 创建轮播指示器
slides.forEach((slide, index) => {
    const indicator = document.createElement('div');
    indicator.className = 'carousel-indicator';
    if (index === 0) indicator.classList.add('active');
    indicator.addEventListener('click', () => goToSlide(index));
    indicatorsContainer.appendChild(indicator);
});

const indicators = document.querySelectorAll('.carousel-indicator');

// 轮播函数
function updateCarousel() {
    carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
}

// 自动轮播
let autoplayInterval = setInterval(nextSlide, 5000);

// 轮播控制按钮
prevBtn.addEventListener('click', () => {
    clearInterval(autoplayInterval);
    prevSlide();
    autoplayInterval = setInterval(nextSlide, 5000);
});

nextBtn.addEventListener('click', () => {
    clearInterval(autoplayInterval);
    nextSlide();
    autoplayInterval = setInterval(nextSlide, 5000);
});

// AI 对话功能
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const clearButton = document.getElementById('clearButton');

// 本地部署的 DeepSeek 配置
const localDeepSeekUrl = 'http://localhost:8000/v1/chat/completions'; // 本地部署的 DeepSeek 服务地址

// 发送消息函数
async function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        // 添加用户消息
        addMessage('user', message);
        chatInput.value = '';
        sendButton.disabled = true;
        
        // 显示加载状态
        const loadingMessage = addMessage('ai', '', true);
        
        try {
            // 调用本地 DeepSeek 服务
            const response = await fetch(localDeepSeekUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个友好的AI助手，会用中文回答用户的问题。'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            
            if (!response.ok) {
                throw new Error(`API 调用失败: ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // 移除加载状态
            loadingMessage.remove();
            // 添加 AI 回复
            addMessage('ai', aiResponse);
        } catch (error) {
            console.error('本地 DeepSeek 服务调用错误:', error);
            // 移除加载状态
            loadingMessage.remove();
            // 添加错误消息
            addMessage('ai', '抱歉，本地AI服务暂时无法响应，请检查服务是否正常运行。');
        } finally {
            sendButton.disabled = false;
        }
    }
}

// 添加消息到聊天窗口
function addMessage(type, text, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `message-avatar ${type}-avatar`;
    
    if (type === 'ai') {
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
    } else {
        avatarDiv.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isLoading) {
        contentDiv.innerHTML = `
            <div class="loading-indicator">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
            </div>
        `;
    } else {
        contentDiv.innerHTML = `<p>${text}</p>`;
    }
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// 发送按钮点击事件
sendButton.addEventListener('click', sendMessage);

// 回车键发送
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 输入框变化事件（控制发送按钮状态）
chatInput.addEventListener('input', function() {
    sendButton.disabled = this.value.trim() === '';
});

// 清空对话按钮
clearButton.addEventListener('click', function() {
    chatMessages.innerHTML = '';
    // 添加欢迎消息
    addMessage('ai', '你好～有什么想问我的，随时告诉我😊');
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// 初始化
window.addEventListener('DOMContentLoaded', function() {
    // 初始化轮播
    updateCarousel();
    
    // 初始化 AI 聊天
    addMessage('ai', '你好！我是基于本地部署的 DeepSeek AI 助手，有什么问题可以随时问我😊');
    addMessage('ai', '提示：请确保本地 DeepSeek 服务已启动在 http://localhost:8000 端口');

    
    // 初始化发送按钮状态
    sendButton.disabled = chatInput.value.trim() === '';
});