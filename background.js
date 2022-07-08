var data = null

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == 'fetch') {
            let url = 'https://dictionary.cambridge.org/dictionary/english/' + request.search
            fetch(url, {}).then(function (data) {
                var a = (data.text())
                a.then(function (value) {
                    sendResponse(value)
                })
            })
        }

        return true
    });