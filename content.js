document.addEventListener('keyup', function (e) {
    if (e.key === "Escape" || e.keyCode === 27) {
        document.getElementById('my-translate')?.remove()
    }
});

document.addEventListener('mouseup', showSelection);;

function showSelection(event) {
    document.getElementById('my-translate')?.remove()

    let definition = {}
    let search = window.getSelection().toString().trim()

    if (search.length > 0 && /^[A-Za-z]*$/.test(search)) {
        let difinition = chrome.runtime.sendMessage({
            contentScriptQuery: 'fetchDefinition',
            search: search
        }).then(value => {
            let head = ''
            let text = []
            let object = value
            let parser = new DOMParser();
            let htmlDoc = parser.parseFromString(object, 'text/html');
            let list = htmlDoc.getElementsByClassName('def ddef_d db')
            let kk = htmlDoc.querySelector('.us.dpron-i .ipa.dipa.lpr-2.lpl-1')
            let speech = htmlDoc.getElementsByClassName('pos dpos')[0]?.textContent

            head += kk?.textContent

            for (let item of list) {
                if(!text.includes(item.textContent)) {
                    text.push(item.textContent)
                }
            }

            text = text.map((item) => {
                return '. ' + item
            })

            Object.assign(definition, {
                header: head,
                speech: speech,
                text: text.join("<br />"),
                x: event.pageX,
                y: event.pageY,
            })
        })


        let image = chrome.runtime.sendMessage({
            contentScriptQuery: 'fetchImage',
            search: search
        }).then(value => {
            let parser = new DOMParser();
            let htmlDoc = parser.parseFromString(value, 'text/html');
            let images = Array.from(htmlDoc.getElementsByTagName('img'))

            // 優化圖片獲取：多種來源備選
            let validImages = []
            
            // 嘗試獲取 dataset.src
            validImages = images.filter(element => {
                return element.dataset.src
            }).map((element) => {
                return element.dataset.src
            })
            
            // 如果沒找到，嘗試 src 屬性
            if (validImages.length === 0) {
                validImages = images.filter(element => {
                    return element.src && !element.src.includes('data:image')
                }).map((element) => {
                    return element.src
                })
            }
            
            // 過濾掉無效圖片
            validImages = validImages.filter(url => {
                return url && 
                       !url.includes('placeholder') && 
                       !url.includes('loading') &&
                       (url.startsWith('http') || url.startsWith('//'))
            }).slice(0, 5) // 限制最多5張圖片

            definition.images = validImages
        }).catch(error => {
            // 如果圖片獲取失敗，設為空陣列
            definition.images = []
            console.log('圖片獲取失敗:', error)
        })

        Promise.all([difinition, image]).then(value => {
            drawDialog(definition)
        }).catch(error => {
            // 即使圖片失敗，仍然顯示定義
            drawDialog(definition)
            console.log('部分內容獲取失敗:', error)
        })
    }
}

async function drawDialog(definition) {
    document.getElementById('my-translate')?.remove()

    let container = document.createElement("div")
    container.setAttribute('id', 'my-translate')
    container.style.cssText = `
        position: absolute;
        left: ${definition.x}px;
        top: ${definition.y + 20}px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
        max-width: 500px;
        min-width: 300px;
        color: #e2e8f0;
        backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease-out;
        display: block !important;
    `

    definition.header && container.appendChild(createHeader(definition.header))
    definition.speech && container.appendChild(createSpeech(definition.speech))
    definition.images && definition.images.length > 0 && container.appendChild(createImages(definition.images))
    definition.text && container.appendChild(createContent(definition.text))

    document.getElementsByTagName('body')[0].appendChild(container)
    
    // Add animation styles
    const style = document.createElement('style')
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        #my-translate:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15);
        }
    `
    document.head.appendChild(style)
}

function createHeader(header) {
    let _head = document.createElement('h2')
    _head.style.cssText = `
        color: #f7fafc;
        text-align: left;
        margin: 0 0 10px 0;
        font-size: 28px;
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: -0.5px;
    `
    _head.innerHTML = header

    return _head
}

function createSpeech(speech) {
    let _speech = document.createElement('p')
    _speech.style.cssText = `
        color: #a0aec0;
        margin: 0 0 15px 0;
        font-size: 14px;
        font-style: italic;
        font-weight: 400;
        background: rgba(255, 255, 255, 0.1);
        padding: 5px 10px;
        border-radius: 8px;
        display: inline-block;
    `
    _speech.innerHTML = '(' + speech + ')'

    return _speech
}

function createContent(text) {
    let _content = document.createElement("div");
    _content.style.cssText = `
        font-size: 16px;
        line-height: 1.6;
        background: rgba(0, 0, 0, 0.3);
        padding: 15px;
        border-radius: 12px;
        margin: 15px 0;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #e2e8f0;
    `
    _content.innerHTML = text

    return _content
}

function createImages(images) {
    let container = document.createElement("div")
    container.style.cssText = `
        height: 200px;
        width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        margin: 15px 0;
        padding: 10px 0;
        display: flex;
        gap: 10px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
    `

    images.forEach(url => {
        let temp = document.createElement("div");
        temp.style.cssText = `
            flex-shrink: 0;
            max-width: 200px;
            padding: 5px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            transition: transform 0.2s ease;
        `
        temp.onmouseover = () => temp.style.transform = 'scale(1.05)'
        temp.onmouseout = () => temp.style.transform = 'scale(1)'

        let img = document.createElement("img");
        img.style.cssText = `
            width: 100%;
            height: auto;
            border-radius: 8px;
            object-fit: cover;
        `
        img.src = url
        
        // 添加圖片載入錯誤處理
        img.onerror = function() {
            temp.style.display = 'none'
            console.log('圖片載入失敗:', url)
        }
        
        img.onload = function() {
            // 如果圖片太小，也隱藏
            if (this.naturalWidth < 50 || this.naturalHeight < 50) {
                temp.style.display = 'none'
            }
        }

        temp.appendChild(img)
        container.appendChild(temp)
    });

    return container
}
