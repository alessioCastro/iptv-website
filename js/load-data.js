const origin = location.origin;

async function test() {
    var response = await fetch(origin + '/iptv-website/json/part1.json')
    const data = await response.json();
    document.body.innerText = JSON.stringify(data)
    return data;
}

test().then(response => console.log(response));
