const origin = location.origin;

async function test() {
    var response = await fetch(origin + '/iptv-website/json/part1.json')
    const data = await response.json();
    return data;
}

test().then(response => console.log(response));
