const parse = input => input.split('\n').map(line => line.split(' ').map(coords => coords.split(',').map(Number) ) )

// intersection of 2 discrete lines in parametric notation; let's compute parameter (t) when first coord matches, then compare 2nd coord
const solve = (data, ship = [[0, 0], [0, 1]]) => data.filter(([[xs, ys], [vx, vy]]) => {
    let t = (ship[0][0] - xs) / ( vx - ship[1][0] ); // time when x coords match
    let yShip = ship[0][1] + t * ship[1][1];
    let y = ys + t * vy;
    return t === Math.floor(t) && t > 0 && (yShip === y)
})

const solve2 = (data) => {
    let min = Infinity;
    for (let y = -10; y <= 10; y++) {
        min = Math.min(min, solve(data, [[y, 0], [0, 1]]).length );
    }
    return min;
}

console.log('p1', solve(parse(input)).length);
console.log('p2', solve2(parse(input)));
