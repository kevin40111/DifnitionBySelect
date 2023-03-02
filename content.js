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
            let images = Array.from(htmlDoc.getElementsByClassName('rg_i'))

            definition.images = images.filter(element => {
                return element.dataset.src
            }).map((element) => {
                return element.dataset.src
            });
        })


        Promise.all([difinition, image]).then(value => {
            drawDialog(definition)
        })
    }
}

async function drawDialog(definition) {
    document.getElementById('my-translate')?.remove()

    let container = document.createElement("div")
    container.setAttribute('id', 'my-translate')
    container.style.fontFamily = 'monospace'
    container.style.left = definition.x + 'px'
    container.style.zIndex = '999'
    container.style.top = definition.y + 20 + 'px'
    container.style.position = 'absolute'
    container.style.backgroundColor = 'wheat'
    container.style.fontSize = 'large'
    container.style.padding = '10px'
    container.style.fontWeight = 'bold'
    container.style.borderRadius = '15px'
    container.style.color = "#000"
    container.style.textAlign = "left"
    container.style.maxWidth = '600px'
    container.style.display = 'block !important'

    definition.header && container.appendChild(createHeader(definition.header))
    definition.speech && container.appendChild(createSpeech(definition.speech))
    definition.images && container.appendChild(createImages(definition.images))
    definition.text && container.appendChild(createContent(definition.text))

    document.getElementsByTagName('body')[0].appendChild(container)
}

function createHeader(header) {
    let _head = document.createElement('h2')
    _head.style.color = '#000'
    _head.style.textAlign = 'left'
    _head.innerHTML = header

    return _head
}

function createSpeech(speech) {
    let _speech = document.createElement('p')
    _speech.style.color = '#999'

    _speech.innerHTML = '(' + speech + ')'

    return _speech
}

function createContent(text) {
    let _content = document.createElement("div");
    _content.style.fontSize = '16px'
    _content.innerHTML = text

    return _content
}

function createImages(images) {
    let container = document.createElement("div")
    container.style.height = '250px'
    container.style.float = 'left'
    container.style.width = '100%'
    container.style.overflowY = 'auto'

    images.forEach(url => {
        let temp = document.createElement("div");
        temp.style.float="left"
        temp.style.maxWidth="300px"
        temp.style.padding="5px"

        let img = document.createElement("img");
        img.src = url

        temp.appendChild(img)

        container.appendChild(temp)
    });

    return container
}
