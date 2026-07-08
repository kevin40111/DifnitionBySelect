chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == 'fetchDefinition') {
            let url = 'https://dictionary.cambridge.org/dictionary/english-japanese/' + request.search
            fetch(url, {}).then(function (data) {
                var a = (data.text())
                a.then(function (value) {
                    sendResponse(value)
                })
            })
        }

        if (request.contentScriptQuery == 'fetchImage') {
            let url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(request.search)
            fetch(url, {}).then(function (data) {
                var a = (data.text())
                a.then(function (value) {
                    sendResponse(value)
                })
            })
        }

        return true
    });
