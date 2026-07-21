const dist = (a, b) => a.reduce((res, v, i) => res + Math.abs(v - b[i]), 0)

const parse = input => {
    let [nodesLit, partsLit] = input.split('\n\n');
    let nodes = {};
    nodesLit.split('\n').forEach(line => {
        let [_id, x, y] = line.split(' ');
        let id = _id.slice(1);
        nodes[id] =  {id: id, x: Number(x.slice(1)), y: Number(y.slice(1)), queue: [], store: [], processed: []}
    })
    return [
        nodes,
        partsLit.split(',').map(Number)
    ]
}

const getAllPaths = nodes => {
    let paths = [], fullPaths = [], cur;
    let nodesVals = Object.values(nodes);
    paths.push({
        seen: ['S'],
        id: 'S',
    })
    while (cur = paths.pop()) {
        if (cur.id === 'D') {
            fullPaths.push(cur);
            continue;
        }
        let cx = nodes[cur.id].x, cy = nodes[cur.id].y;
        nodesVals.filter(n => dist([cx, cy], [n.x, n.y]) <= 5 && !cur.seen.includes(n.id)).forEach(n => {
            paths.push({
                id: n.id,
                seen: [...cur.seen, n.id]
            })
        })
    }
    return fullPaths;
}

const run = ([nodes, parts]) => getAllPaths(nodes).length;

const getReceivers = (nodes, id) => Object.values(nodes).filter(n => n.id !== id && dist( [n.x, n.y], [ nodes[id].x, nodes[id].y ] ) <= 5).sort( (a, b) => {
    let da = dist( [a.x, a.y], [ nodes[id].x, nodes[id].y ] );
    let db = dist( [b.x, b.y], [ nodes[id].x, nodes[id].y ] );

    if (da !== db) return da - db;

    let qla = nodes[a.id].queue.length + nodes[a.id].store.length;
    let qlb = nodes[b.id].queue.length + nodes[b.id].store.length;

    if (qla !== qlb) return qla - qlb;

    return a.sortVal - b.sortVal;
})

const run2 = ([nodes, parts]) => {
    let nodesVals = Object.values(nodes);
    nodesVals.forEach(n => {
        nodes[n.id].sortVal = n.id === 'S' ? 0 : (n.id === 'D' ? 1_000_000 : Number(n.id));
    })

    nodes.S.queue.push(...parts);

    let t = 0;
    while (true) {
        let senders = Object.values(nodes).filter(n => n.queue.length > 0).sort((a, b) => a.sortVal - b.sortVal);

        if (senders.length === 0) {
            break;
        }

        let sender = nodes[senders[0].id];

        let receivers = getReceivers(nodes, sender.id);

        let idx = 0;

        while (part = sender.queue.shift()) {
            let receiver = false, i = 0;

            while (i < receivers.length && receiver === false) {
                if (!receivers[idx].processed.includes(part)) {
                    receiver = nodes[receivers[idx].id];
                }

                idx = (idx+1) % receivers.length;

                i++;
            }

            if (receiver === false) {
                sender.store.push(part);
            } else {
                if (receiver.id === 'D') {
                    receiver.store.push(part);
                } else {
                    receiver.queue.push(part);
                }
            }

            sender.processed.push(part);
        }

        //console.log('*** tick ended', t, structuredClone(nodes));
        t++;
    }

    return nodes.D.store.slice(-5).reduce((a, v) => a+v, 0) * nodes.D.store.length;
}

console.log('p1', run(parse(input)));
console.log('p2', run2(parse(input)));
