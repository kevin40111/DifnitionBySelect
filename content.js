

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

function drawDialog(head, text, x, y)
{
    var dialog = document.createElement("div");
        dialog.setAttribute('id', 'my-translate');
        dialog.style.fontFamily = 'monospace'
        dialog.style.left = x + 'px'
        dialog.style.zIndex = '999'
        dialog.style.top = y + 20 + 'px'
        dialog.style.position = 'absolute'
        dialog.style.backgroundColor = 'wheat'
        dialog.style.fontSize = 'large'
        dialog.style.padding = '10px'
        dialog.style.fontWeight = 'bold'
        dialog.style.borderRadius = '15px'
        dialog.style.color="black"

        dialog.innerHTML = text

        dialog.insertAdjacentHTML('afterbegin', '<h2 style="color:black!important">'+ head +'</h2><hr>')
        document.getElementsByTagName('body')[0].appendChild(dialog)
}
