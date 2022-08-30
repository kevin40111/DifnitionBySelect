var _openDialog = true
var _search = null

document.addEventListener('keyup', function (e) {
    if (e.key === "Escape" || e.keyCode === 27) {
        document.getElementById('my-translate')?.remove()
    }

    if ((e.ctrlKey + e.shiftKey + (e.key=='s' || e.key=='S')) == 3 ) {
        _openDialog = (!_openDialog)
        if (_openDialog) {
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
    var search = window.getSelection().toString()
    search = search.trim()

    if(_search == search || !_openDialog) return 0

    _search = search
    if (search.length > 0 && /^[A-Za-z]*$/.test(search)) {
        var difinition = chrome.runtime.sendMessage({
            contentScriptQuery: 'fetchDefinition',
            search: search
        }).then(value => {
            var count = 4
            var head = ''
            var text = ''
            var object = value
            var parser = new DOMParser();
            var htmlDoc = parser.parseFromString(object, 'text/html');
            var list = htmlDoc.getElementsByClassName('def ddef_d db')
            var kk = htmlDoc.getElementsByClassName('ipa dipa lpr-2 lpl-1')

            head += kk[1]?.textContent

            for (let item of list) {
                text += item.textContent
                count = count - 1

                if (count <= 0) break
            }

            Object.assign(definition, {
                header: head,
                text: text,
                x: event.pageX,
                y: event.pageY,
            })
        })


        var image = chrome.runtime.sendMessage({
            contentScriptQuery: 'fetchImage',
            search: search
        }).then(value => {
            var parser = new DOMParser();
            var htmlDoc = parser.parseFromString(value, 'text/html');
            var images = Array.from(htmlDoc.getElementsByClassName('rg_i'))

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
    var container = document.createElement("div")
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
    container.style.color = "black"
    container.style.textAlign = "left"
    container.style.maxWidth = '600px'
    container.style.display = 'block !important'

    container.appendChild(createHeader(definition.header))
    container.appendChild(createImages(definition.images))
    container.appendChild(createContent(definition.text))

    document.getElementsByTagName('body')[0].appendChild(container)
}

function createHeader(header) {
    let _head = document.createElement('h2')
    _head.style.color = 'black!important'

    _head.innerHTML = header

    return _head
}

function createContent(text) {
    let _content = document.createElement("div");
    _content.style.fontSize = '16px!important'
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