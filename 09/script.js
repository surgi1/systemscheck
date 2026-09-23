const parse = input => input.split('\n').map(line => line.split(' '))

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];

// floodfill
const distanceMap = (map, start, p2 = false) => {
    const offMap = (x, y) => x < 0 || y < 0 || x >= cols || y >= rows;

    let cols = map[0].length, rows = map.length, cur;
    let filled = map.map(row => row.slice().fill(Infinity)),
        stack = [{
            pos: start.slice(),
            dist: 0
        }];

    while (cur = stack.shift()) {
        let [cx, cy] = cur.pos;

        if (filled[cy][cx] <= cur.dist) continue;
        filled[cy][cx] = cur.dist;

        DIRS.forEach(([dx, dy]) => {
            let [x, y] = [cx+dx, cy+dy];
            if (offMap(x, y)) return true;
            if (Math.abs(map[y][x] - map[cy][cx]) > 1) return true;
            if (filled[y][x] > cur.dist+1) stack.push({
                pos: [x, y],
                dist: cur.dist + (p2 && (map[y][x] > map[cy][cx]) ? 5 : 1)
            })
        })
    }
    return filled;
}


const solve = (map, p2 = false) => {
    let start, end;
    map = map.map((row, y) => row.map((v, x) => {
        if (v === '^') {start = [x, y]; return 0;}
        if (v === '*') {end = [x, y]; return 0;}
        return Number(v);
    }))
    let dmap = distanceMap(map, start, p2);
    return dmap[end[1]][end[0]];
}

console.log('p1', solve(parse(input)));
console.log('p2', solve(parse(input), true));
