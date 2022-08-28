var data = null

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
            let url = 'https://www.google.com/search?q='+ request.search +'&rlz=1C5CHFA_enTW772TW772&sxsrf=ALiCzsb1X5ysZDoTLy1SmBJr-6goe15jfw:1661697709572&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjy0M-t4un5AhWYAqYKHVn_DO0Q_AUoAXoECAIQAw&biw=1280&bih=812&dpr=1'
            fetch(url, {}).then(function (data) {
                var a = (data.text())
                a.then(function (value) {
                    sendResponse(value)
                })
            })
        }

        return true
    });
