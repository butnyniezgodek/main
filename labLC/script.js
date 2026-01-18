if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

function showSystemNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Puzzle ułożone!", {
            body: "Gratulacje! Ułożyłeś mapę poprawnie"
        });
    }
}

//mapka wawa
const map = L.map('map').setView([52.2297, 21.0122], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    crossOrigin: true
}).addTo(map);

document.getElementById('locate').onclick = () => {
    if (!navigator.geolocation) return alert("Brak obsługi geolokalizacji");
    navigator.geolocation.getCurrentPosition(pos => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 14);
    });
};

let gameFinished = false;

function splitCanvas(canvas) {
    const tiles = [];
    const w = canvas.width / 4;
    const h = canvas.height / 4;
    let index = 0;

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            c.getContext('2d').drawImage(canvas, x*w, y*h, w, h, 0, 0, w, h);

            tiles.push({
                src: c.toDataURL(),
                originalIndex: index
            });

            index++;
        }
    }
    return tiles;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function makeDraggable(img) {
    img.draggable = true;
    img.ondragstart = e => {
        e.dataTransfer.setData("text/plain", img.dataset.originalIndex);
    };
}

function checkPuzzle(cells) {
    let complete = true;

    cells.forEach(cell => {
        if (!cell.firstChild) complete = false;
        else if (
            Number(cell.firstChild.dataset.originalIndex) !==
            Number(cell.dataset.index)
        ) complete = false;
    });

    return complete;
}

document.getElementById('download').onclick = () => {
    leafletImage(map, (err, canvas) => {
        if (err) return alert("Błąd pobierania mapy");

        gameFinished = false;

        const raster = document.getElementById('raster');
        raster.width = 600;
        raster.height = 400;
        raster.getContext('2d').drawImage(canvas, 0, 0, 600, 400);

        let tiles = splitCanvas(raster);
        shuffle(tiles);

        const leftTable = document.getElementById('left-table');
        const rightCells = document.querySelectorAll('#right-table .cell');

        leftTable.innerHTML = "";
        rightCells.forEach(c => c.innerHTML = "");

        tiles.forEach(tile => {
            const img = document.createElement('img');
            img.src = tile.src;
            img.dataset.originalIndex = tile.originalIndex;
            makeDraggable(img);
            leftTable.appendChild(img);
        });

        rightCells.forEach(cell => {
            cell.ondragover = e => e.preventDefault();

            cell.ondrop = e => {
                e.preventDefault();
                const index = e.dataTransfer.getData("text/plain");
                const img = document.querySelector(
                    `img[data-original-index='${index}']`
                );

                if (!img) return;

                if (cell.firstChild) {
                    leftTable.appendChild(cell.firstChild);
                }

                cell.appendChild(img);
                makeDraggable(img);

                requestAnimationFrame(() => {
                    if (checkPuzzle(rightCells)) {

                        setTimeout(() => {
                            alert("Puzzle ułożone poprawnie!");
                            showSystemNotification();
                        }, 0);

                    }
                });

            };
        });

        leftTable.ondragover = e => e.preventDefault();
        leftTable.ondrop = e => {
            e.preventDefault();
            const index = e.dataTransfer.getData("text/plain");
            const img = document.querySelector(
                `#right-table img[data-original-index='${index}']`
            );
            if (img) leftTable.appendChild(img);
        };
    });
};
