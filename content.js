document.addEventListener('keyup', function (e) {
    if( e.key === "Escape" || evt.keyCode === 27) {
        document.getElementById('my-translate')?.remove()
    }
});

document.addEventListener('mouseup', showSelection);;

var definition
var imgIndex

async function showSelection(event)
{
    imgIndex = 0
    definition = {}

    document.getElementById('my-translate')?.remove()
    var search = window.getSelection().toString()
    search = search.trim()
    if (search.length > 0 && /^[A-Za-z]*$/.test(search)) {
        await chrome.runtime.sendMessage(
            {
                contentScriptQuery: 'fetchDefinition',
                search: search
            },
            function (value) {
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

                    if (count <= 0 ) break
                }

                Object.assign(definition, {
                    header:head,
                    text:text,
                    x: event.pageX,
                    y: event.pageY,
                })
            }
        )

        await chrome.runtime.sendMessage(
            {
                contentScriptQuery: 'fetchImage',
                search: search
            },
            function (value) {
                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString(value, 'text/html');
                var images = Array.from(htmlDoc.getElementsByClassName('rg_i'))

                definition.images = images.filter(element => {
                    return element.dataset.src
                }).map((element) => {
                    return element.dataset.src
                });

                drawDialog(definition.header, definition.text, definition.x, definition.y, definition.images)
            }
        )
    }
}

function drawDialog(header, text, x, y, images)
{
    var container = document.createElement("div")
        container.setAttribute('id', 'my-translate')
        container.style.fontFamily = 'monospace'
        container.style.left = x + 'px'
        container.style.zIndex = '999'
        container.style.top = y + 20 + 'px'
        container.style.position = 'absolute'
        container.style.backgroundColor = 'wheat'
        container.style.fontSize = 'large'
        container.style.padding = '10px'
        container.style.fontWeight = 'bold'
        container.style.borderRadius = '15px'
        container.style.color="black"
        container.style.textAlign="left"
        container.style.maxWidth='600px'

        container.appendChild(createHeader(header))
        container.appendChild(createImages(images))
        container.appendChild(createContent(text))

    document.getElementsByTagName('body')[0].appendChild(container)
}

function createHeader(header)
{
    let _head = document.createElement('h2')
        _head.style.color = 'black!important'

        _head.innerHTML = header

    return _head
}

function createContent(text)
{
    let _content = document.createElement("div");
    _content.style.fontSize='16px!important'
    _content.innerHTML = text

    return _content
}

function createImages(images)
{
    let container = document.createElement("div")
    container.style.height='200px'
    container.style.float='left'
    container.style.padding='5px'
    container.style.overflowY='auto'

    images.forEach(url => {
        _img = document.createElement("img");
        _img.style.maxWidth='250px'
        _img.src = url

        container.appendChild(_img)
    });

    return container
}
