Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
        let res = [];
        for (let i = 0; i < this.length; i += chunkSize) res.push(this.slice(i, i + chunkSize));
        return res;
    }
});

Object.defineProperty(Array.prototype, 'sum', {
    value: function() {
        return this.reduce((a, v) => a+v, 0);
    }
});

const parse = input => input.split('\n').map(line => {
    let tmp = line.split('|');
    let checksum = Number(tmp.pop());
    return [
        tmp.join('|') + '|',
        checksum
    ]
})

const incorrects = lines => lines.filter(([line, checksum]) => line.split('').reduce((a, v) => a ^ v.charCodeAt(0), 0) !== checksum);

const solve = lines => {
    let o = {};

    lines.forEach(([line, checksum]) => {
        let tmp = line.split('|');
        tmp[1].split('').chunk(2).forEach(chunk => {
            if (o[chunk] === undefined) o[chunk] = 0;
            o[chunk]++;
        })
    })

    return Object.values(o).sort((a, b) => b-a).slice(0, 2).reduce((a, v) => a*v, 1);
}

console.log('p1', incorrects(parse(input)).map(([line, checksum]) => checksum).sum());
console.log('p2', solve(incorrects(parse(input))));