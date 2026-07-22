Object.defineProperty(Array.prototype, 'sum', {
    value: function() {
        return this.reduce((a, v) => a+v, 0);
    }
});

const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const offMap = (map, x, y) => map[y] === undefined || map[y][x] === undefined;

const parse = input => input.split('\n').map(line => line.split(' ').map(coords => coords.split(',').map(Number) ) )


const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

// floodfill
const distanceMap = (map, froms, entryDist = 0, wall = '#', path = '.') => {
    let cur;
    let filled = map.map(row => row.slice().fill(Infinity)),
        stack = froms.map(from => ({
            pos: [...from],
            dist: entryDist
        }));

    while (cur = stack.shift()) {
        let [cx, cy] = cur.pos;

        if (filled[cy][cx] <= cur.dist) continue;
        filled[cy][cx] = cur.dist;

        DIRS.forEach(([dx, dy]) => {
            let [x, y] = [cx+dx, cy+dy];
            if (offMap(map, x, y)) return true;
            if (map[y][x] === wall) return true;
            if (filled[y][x] > cur.dist+1) stack.push({
                pos: [x, y],
                dist: cur.dist+1
            })
        })
    }
    return filled;
}

const solve = (data, returnMap = false) => {
    let borders = new Set(), xmin = 100, xmax = 0, ymin = 100, ymax = 0;

    data.forEach(row => row.forEach(([x, y]) => {
        xmin = Math.min(xmin, x-1);
        ymin = Math.min(ymin, y-1);
        xmax = Math.max(xmax, x+1);
        ymax = Math.max(ymax, y+1);
    }))

    let map = [];

    for (let y = 0; y <= ymax; y++) {
        map[y] = [];
        for (let x = 0; x <= xmax; x++) map[y][x] = '.';
    }

    let cols = map[0].length, rows = map.length;

    data.forEach(([p1, p2, p3, p4]) => {
        for (let x = p1[0]; x <= p2[0]; x++) {
            map[ p1[1] ][ x ] = '#';
            map[ p3[1] ][ x ] = '#';
        }
        for (let y = p2[1]; y <= p3[1]; y++) {
            map[ y ][ p2[0] ] = '#';
            map[ y ][ p1[0] ] = '#';
        }
    })

    let dmap = distanceMap(map, [[0, 0]]);

    let res = 0;
    for (let y = 0; y < map.length; y++) for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] !== '#') continue;
        let isBorder = false;
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
            if (!offMap(map, x+i, y+j) && dmap[y+j][x+i] !== Infinity) isBorder = true;
        }
        if (isBorder || y === 0) res++; // lol lazy accounting for rectangles bordering top row
        else map[y][x] = '.';
    }

    document.getElementById('root').innerHTML = map.map(row=> row.join('')).join('\n');
    return returnMap ? map : res;
}

const solve2 = data => {
    let map = solve(data, true);
    let cols = map[0].length, rows = map.length;

    // now we need to create a marked version of the map with individual distinct polygon's borders marked by their ids
    // during this process we also find top left corners of all the polygons
    // then we can find shortest path between those top left corners (starting and ending at [0, 0] ofc)
    // takes about 6 seconds to compute

    let tbl = 0; // The Black Lotus! ... or total border length
    let marked = map.map(row => row.slice().fill(0))
    let topLefts = [];

    const mark = (x, y, polyId) => {
        if (marked[y][x] !== 0) return;
        marked[y][x] = polyId;
        map[y][x] = String.fromCharCode(polyId+64);
        tbl++;
        DIRS.forEach(([dx, dy]) => {
            let nx = x+dx, ny = y+dy;
            if (!offMap(map, nx, ny) && map[ny][nx] !== '.' && marked[ny][nx] === 0) mark(nx, ny, polyId);
        })
    }

    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        if (map[y][x] !== '#') continue;
        if (marked[y][x] !== 0) continue;

        let polyId = topLefts.push({
            pos: [x, y],
            id: String.fromCharCode(topLefts.length + 1 + 64)
        });

        mark(x, y, polyId);
    }

    document.getElementById('root').innerHTML = map.map(row=> row.join('')).join('\n');

    topLefts.sort((a, b) => dist([0, 0], b.pos) - dist([0, 0], a.pos));

    let queue = [{
        seen: [],
        pos: [0,0],
        dist: tbl
    }], cur, minRoundtripLen = Infinity, tlLen = topLefts.length, minSeen = {};

    while (cur = queue.pop()) {
        let distHome = dist([0, 0], cur.pos);
        
        if (cur.dist + distHome >= minRoundtripLen) continue;
        
        if (cur.seen.length === tlLen) {
            minRoundtripLen = cur.dist + distHome;
            continue;
        }

        let k = cur.seen.join('');
        if (minSeen[k] <= cur.dist + distHome) continue;
        minSeen[k] = cur.dist + distHome;

        topLefts
        .filter(t => !cur.seen.includes(t.id))
        .sort((a, b) => dist(cur.pos, b.pos) - dist(cur.pos, a.pos) )
        .forEach(t => queue.push({
            pos: t.pos,
            seen: [...cur.seen, t.id].sort(),
            dist: cur.dist + dist(cur.pos, t.pos)
        }))
    }
    
    return minRoundtripLen;
}

console.log('p1', solve(parse(input)));
console.log('p2', solve2(parse(input)));
