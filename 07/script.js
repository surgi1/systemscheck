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
    let tmp = line.split(' ');
    return [tmp[0], Number(tmp[1]), Number(tmp[2])]
})

const solve = data => data.map(d => Math.floor(100*d[2]/d[1])).filter(eff => eff < 97).sum();

const solve2 = data => {
    let loads = {};
    data.filter(d => Math.floor(100*d[2]/d[1]) < 97).forEach(d => {
        d[0].split('|')[1].split('').chunk(3).forEach(loadId => {
            if (loads[loadId] === undefined) loads[loadId] = 0;
            loads[loadId] += Math.floor(100*d[2]/d[1]);
        })
    })
    return Object.values(loads).sort((a, b) => b-a)[0]
}

console.log('p1', solve(parse(input)));
console.log('p2', solve2(parse(input)));
