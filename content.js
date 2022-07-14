

document.addEventListener('keyup', function (e) {
    if( e.key === "Escape" || evt.keyCode === 27) {
        document.getElementById('my-translate')?.remove()
    }
});

document.addEventListener('mouseup', showSelection);;

async function showSelection(event)
{
    document.getElementById('my-translate')?.remove()

    var search = window.getSelection().toString()
    search = search.trim()
    if (search.length > 0 && /^[A-Za-z]*$/.test(search)) {
        chrome.runtime.sendMessage(
            {
                contentScriptQuery: 'fetch',
                search: search
            },
            function (value) {
                var count = 3
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

                drawDialog(head, text, event.pageX, event.pageY)
            }
        )
    }
}

function drawDialog(header, text, x, y)
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

    var head = document.createElement('h2')
        head.style.color = 'black!important'
        head.style.color = 'black'

        head.innerHTML = header

    var content = document.createElement("div");
        content.innerHTML = text

        container.appendChild(head)
        container.appendChild(document.createElement("hr"))
        container.appendChild(content)

    document.getElementsByTagName('body')[0].appendChild(container)
}
