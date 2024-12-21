document.addEventListener('DOMContentLoaded', () => {
    const sourceText = document.getElementById('sourceText');
    const translatedText = document.getElementById('translatedText');
    const translateBtn = document.getElementById('translateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const swapLang = document.getElementById('swapLang');

    // 翻译功能
    async function translate() {
        const text = sourceText.value.trim();
        if (!text) return;

        translatedText.innerHTML = '<div class="loading"></div>';
        
        // 直接使用用户选择的源语言
        const sourceLanguage = sourceLang.value;
        
        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLang.value}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data && data.responseData && data.responseData.translatedText) {
                translatedText.textContent = data.responseData.translatedText;
            } else {
                throw new Error('Translation failed');
            }
        } catch (error) {
            translatedText.textContent = '翻译出错，请稍后重试';
            console.error('Translation error:', error);
        }
    }

    // 复制翻译结果
    async function copyTranslation() {
        const text = translatedText.textContent;
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = '已复制';
            setTimeout(() => {
                copyBtn.textContent = '复制';
            }, 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    }

    // 交换语言
    function swapLanguages() {
        if (sourceLang.value === 'auto') return;
        
        const temp = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = temp;

        const tempText = sourceText.value;
        sourceText.value = translatedText.textContent;
        translatedText.textContent = tempText;
    }

    // 事件监听
    translateBtn.addEventListener('click', translate);
    copyBtn.addEventListener('click', copyTranslation);
    swapLang.addEventListener('click', swapLanguages);
    
    // 自动翻译（当用户停止输入后）
    let timeout;
    sourceText.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(translate, 1000);
    });
});
