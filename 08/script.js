const parseSections = input => input.split('\n\n');

const parseDAGLine = line => {
    let tmp = line.split(/-|>/);
    return {
        from: tmp[0],
        to: tmp[2],
        dist: Number(tmp[1].match(/\d+/g)[0])
    }
}

const parseAmountLine = line => {
    let tmp = line.split(' ');
    return {
        id: tmp[0],
        v: Number(tmp[1].match(/\d+/g)[0])
    }
}

const parse = input => {
    let sections = parseSections(input);
    return {
        routes: sections[0].split('\n').map(line => parseDAGLine(line)),
        amounts: sections[1].split('\n').map(line => parseAmountLine(line))
    }
}

// overredundant structure anyone?
const constructNodes = data => {
    let nodes = {};
    data.routes.forEach(route => {
        if (nodes[route.from] === undefined) nodes[route.from] = {
            id: route.from,
            subnodes: [],
        }
        if (nodes[route.to] === undefined) nodes[route.to] = {
            id: route.to,
            subnodes: [],
        }
        nodes[route.to].subnodes.push({
            id: route.to,
            distance: route.dist
        })
        nodes[route.from].parentId = route.to;
        nodes[route.from].distanceToParent = route.dist;
    })

    data.amounts.forEach(o => {
        nodes[o.id].rubbish = o.v;
        nodes[o.id].cleaningInProgress = false;
    })

    return nodes;
}

const solve = data => {
    let nodes = constructNodes(data);
    let chutes = Object.values(nodes).filter(n => n.subnodes.length === 0).map(n => n.id);

    let minDist = Infinity;
    chutes.forEach(chuteId => {
        let dist = 0;
        let id = chuteId;
        while (id !== 'inc') {
            dist += nodes[id].distanceToParent;
            id = nodes[id].parentId;
        }
        if (dist < minDist) {
            minDist = dist;
        }
    })

    return minDist;
}

// simulation second by second
const solve2 = data => {
    let nodes = constructNodes(data);
    let bots = Object.values(nodes).filter(n => n.subnodes.length === 0).map(n => ({
        currentNode: n.id,
        nextNode: n.id,
        busyTill: 0,
    }));

    let t = 0, incReached = false;
    while (true) {
        let turnOnCleaningInNodes = [];

        bots.forEach(bot => {
            if (bot.busyTill <= t) {
                if (nodes[bot.currentNode].rubbish > 0 && nodes[bot.currentNode].cleaningInProgress === false) {
                    // cleaning
                    turnOnCleaningInNodes.push(bot.currentNode);
                    bot.busyTill = t + nodes[bot.currentNode].rubbish; // bots arriving at the exact second are all delayed by rubbush seconds as they can't cooperate; they simply take turns
                } else {
                    // travel
                    bot.currentNode = bot.nextNode;
                    if (nodes[bot.currentNode].parentId === undefined) {
                        incReached = t;
                    } else {
                        bot.nextNode = nodes[bot.currentNode].parentId;
                        bot.busyTill = t + nodes[bot.currentNode].distanceToParent;
                    }
                }
            }
        })

        if (incReached) break;

        turnOnCleaningInNodes.forEach(id => nodes[id].cleaningInProgress = true);
        t++;
    }

    return t;
}

console.log('p1', solve(parse(input)));
console.log('p2', solve2(parse(input)));
