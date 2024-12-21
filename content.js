// 创建翻译弹窗
function createTranslationPopup() {
    const popup = document.createElement('div');
    popup.className = 'quick-translator-popup';
    popup.style.display = 'none';
    document.body.appendChild(popup);
    return popup;
}

// 获取选中的文本
function getSelectedText() {
    return window.getSelection().toString().trim();
}

// 获取鼠标位置
function getMousePosition(event) {
    return {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY
    };
}

// 显示弹窗
function showPopup(popup, position, text) {
    popup.style.left = `${position.x}px`;
    popup.style.top = `${position.y + 20}px`;
    popup.innerHTML = `
        <div class="translation-result">
            <div class="loading"></div>
        </div>
        <div class="controls">
            <button class="translate-btn">翻译</button>
            <button class="copy-btn">复制</button>
        </div>
    `;
    popup.style.display = 'block';

    // 立即开始翻译
    translateText(text, popup);

    // 添加事件监听
    const translateBtn = popup.querySelector('.translate-btn');
    const copyBtn = popup.querySelector('.copy-btn');

    translateBtn.addEventListener('click', () => translateText(text, popup));
    copyBtn.addEventListener('click', () => copyTranslation(popup));
}

// 翻译文本
async function translateText(text, popup) {
    const resultDiv = popup.querySelector('.translation-result');
    
    try {
        const response = await fetch(`https://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(text)}&from=auto&to=zh&appid=20231221001924077&salt=1234567890&sign=YOUR_SIGN`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (data && data.trans_result && data.trans_result.length > 0) {
            resultDiv.textContent = data.trans_result[0].dst;
        } else {
            throw new Error('Translation failed');
        }
    } catch (error) {
        resultDiv.textContent = '翻译出错，请稍后重试';
        console.error('Translation error:', error);
    }
}

// 复制翻译结果
async function copyTranslation(popup) {
    const text = popup.querySelector('.translation-result').textContent;
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        const copyBtn = popup.querySelector('.copy-btn');
        copyBtn.textContent = '已复制';
        setTimeout(() => {
            copyBtn.textContent = '复制';
        }, 2000);
    } catch (error) {
        console.error('Copy failed:', error);
    }
}

// 主要逻辑
let popup = null;

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('mouseup', (event) => {
        const selectedText = getSelectedText();
        
        if (!popup) {
            popup = createTranslationPopup();
        }
        
        if (selectedText) {
            const position = getMousePosition(event);
            showPopup(popup, position, selectedText);
        } else if (popup && !popup.contains(event.target)) {
            popup.style.display = 'none';
        }
    });

    // 点击其他地方时隐藏弹窗
    document.addEventListener('click', (event) => {
        if (popup && !popup.contains(event.target) && !getSelectedText()) {
            popup.style.display = 'none';
        }
    });
});
