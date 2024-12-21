// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'translateSelection',
        title: '翻译选中文本',
        contexts: ['selection']
    });
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'translateSelection') {
        const text = info.selectionText;
        translateText(text, tab.id);
    }
});

// 翻译文本
async function translateText(text, tabId) {
    try {
        const url = `https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.translateResult && data.translateResult[0] && data.translateResult[0][0]) {
            const translation = data.translateResult[0][0].tgt;
            // 发送消息到content script显示翻译结果
            chrome.tabs.sendMessage(tabId, {
                action: 'showTranslation',
                translation: translation
            });
        }
    } catch (error) {
        console.error('Translation error:', error);
        chrome.tabs.sendMessage(tabId, {
            action: 'showError',
            message: '翻译出错，请稍后重试'
        });
    }
}

// 监听来自popup或content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate') {
        translateText(request.text, sender.tab.id);
    }
});
