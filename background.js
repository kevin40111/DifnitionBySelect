chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == 'fetchDefinition') {
            let url = 'https://dictionary.cambridge.org/dictionary/english/' + request.search
            fetch(url, {}).then(function (data) {
                var a = (data.text())
                a.then(function (value) {
                    sendResponse(value)
                })
            })
        }

        if (request.contentScriptQuery == 'fetchImage') {
            let url = 'https://images.search.yahoo.com/search/images;_ylt=Awr99rSToD5n2RgAxmuJzbkF;_ylu=c2VjA3NlYXJjaARzbGsDYnV0dG9u;_ylc=X1MDOTYwNjI4NTcEX3IDMgRmcgMEZnIyA3A6cyx2OmksbTpzYi10b3AEZ3ByaWQDWjZ4Z2NuY0pTUUdUOHM3RVNDMHp1QQRuX3JzbHQDMARuX3N1Z2cDMTAEb3JpZ2luA2ltYWdlcy5zZWFyY2gueWFob28uY29tBHBvcwMwBHBxc3RyAwRwcXN0cmwDMARxc3RybAM2BHF1ZXJ5A3JvdXRpbgR0X3N0bXADMTczMjE1NzYxNA--?q='+ request.search
            fetch(url, {}).then(function (data) {
                var a = (data.text())
                a.then(function (value) {
                    sendResponse(value)
                })
            })
        }

        return true
    });
