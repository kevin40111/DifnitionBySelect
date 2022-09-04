var OpenDialog = true
var Search = null

document.addEventListener('keyup', function (e) {
    if (e.key === "Escape" || e.keyCode === 27) {
        document.getElementById('my-translate')?.remove()
    }

    if ((e.ctrlKey + e.shiftKey + (e.key=='s' || e.key=='S')) == 3 ) {
        OpenDialog = (!OpenDialog)
        if (OpenDialog) {
            alert('dialog open')
        } else {
            alert('dialog close')
        }
    }
});

document.addEventListener('mouseup', showSelection);;

function showSelection(event) {

    let definition = {}

    document.getElementById('my-translate')?.remove()
    let search = window.getSelection().toString()
    search = search.trim()

    if(Search == search || !OpenDialog) return 0

    Search = search
    if (search.length > 0 && /^[A-Za-z]*$/.test(search)) {
        let difinition = chrome.runtime.sendMessage({
            contentScriptQuery: 'fetchDefinition',
            search: search
        }).then(value => {
            let count = 4
            let head = ''
            let text = ''
            let object = value
            let parser = new DOMParser();
            let htmlDoc = parser.parseFromString(object, 'text/html');
            let list = htmlDoc.getElementsByClassName('def ddef_d db')
            let kk = htmlDoc.getElementsByClassName('ipa dipa lpr-2 lpl-1')
            let speech = htmlDoc.getElementsByClassName('pos dpos')[0]?.textContent

            head += kk[1]?.textContent

            for (let item of list) {
                text += item.textContent
                count = count - 1

                if (count <= 0) break
            }

            Object.assign(definition, {
                header: head,
                speech: speech,
                text: text,
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
        _temp = document.createElement("div");
        _temp.style.float="left"
        _temp.style.maxWidth="300px"
        _temp.style.padding="5px"

        _img = document.createElement("img");
        _img.src = url

        _temp.appendChild(_img)

        container.appendChild(_temp)
    });

    return container
}
