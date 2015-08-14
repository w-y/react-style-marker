import Jellymarker from 'jellymarker';

let jellymarker = Jellymarker.create();

let isNumber = function(n) {
    return typeof n === 'number';
};

let findByName = function(v, name) {
    if (!Array.isArray(v)) {
        return -1;
    }
    for (let i = 0; i < v.length; i++) {
        if (v[i].name === name) {
            return i;
        }
    }
    return -1;
};
let clone = function(v) {
    return JSON.parse(JSON.stringify(v));
};

//build-in style support
[
    'background', 'color', 'backgroundColor',
    'fontSize', 'fontWeight', 'fontFamily', 'lineHeight',
    'cursor',
    'textAlign',
    'display',
    'float',
    'position',
    'left', 'right', 'top', 'bottom',
    'overflow',
    'width', 'height', 'maxWidth', 'maxHeight',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'margin',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'padding',
 ]
.forEach(function(k) {
    jellymarker.registerVariables(k, function(v) {
        return [{
            name: k,
            value: v,
            priority: 1,
            state: 'default'
        }];
    });
});

//build-in pattern
let block = [{
    name: 'display',
    value: 'block',
    priority: 1,
    state: 'default'
}];

let inlineBlock = [{
    name: 'display',
    value: 'inline-block',
    priority: 1,
    state: 'default'
}];

let inline= [{
    name: 'display',
    value: 'inline',
    priority: 1,
    state: 'default'
}];

let absolute = [{
    name: 'position',
    value: 'absolute',
    priority: 1,
    state: 'default'
}];

let relative = [{
    name: 'position',
    value: 'relative',
    priority: 1,
    state: 'default'
}];

jellymarker.registerVariables('block', block);
jellymarker.registerVariables('inlineBlock', inlineBlock);
jellymarker.registerVariables('inline', inline);

jellymarker.registerVariables('absolute', absolute);
jellymarker.registerVariables('relative', relative);

jellymarker.registerOperators('+', function(v1, v2) {
    if (isNumber(v1) && isNumber(v2)) {
        return v1 + v2;
    }
    let v3 = clone(v1);
    v2.forEach(function(v) {
        let index = findByName(v3, v.name);

        if (index >= 0) {
            if (v3[index].priority < v.priority) {
                v3.push(clone(v));
            } else {
                throw new Error('can\'t add two style with same priority');
            }
        } else {
            v3.push(clone(v));
        }
    });
    return v3;
});

jellymarker.registerOperators('-', function(v1, v2) {
    if (isNumber(v1) && isNumber(v2)) {
        return v1 - v2;
    }
    let v3 = clone(v1);

    v2.forEach(function(v) {
        let index = findByName(v3, v.name);

        if (index >= 0) {
            v3.splice(index, 1);
        }
    });
    return v3;
});

jellymarker.registerOperators('*', function(v1, v2) {
    if (isNumber(v1) && isNumber(v2)) {
        return v1 * v2;
    }
    let v3 = clone(v1);

    v2.forEach(function(v) {
        let index = findByName(v3, v.name);

        if (index >= 0) {
            let stateMap1 = {};
            let stateMap2 = {};

            if (Array.isArray(v3[index].state)) {
                v3[index].state.forEach(function(s, ii) {
                    stateMap1[s] = v3[index].value[ii];
                });
            } else {
                stateMap1[v3[index].state] = v3[index].value;
            }

            if (Array.isArray(v.state)) {
                v.state.forEach(function(s, ii) {
                    stateMap2[s] = v.value[ii];
                });
            } else {
                stateMap2[v.state] = v.value;
            }
            let stateMap = Jellymarker.util.extend({}, stateMap1, stateMap2);

            v3[index].state = Object.keys(stateMap);
            v3[index].value = Object.keys(stateMap).map(function(k) {
                return stateMap[k];
            });
        }
    });
    return v3;
});

jellymarker.registerOperators('/', function(v1, v2) {
    if (isNumber(v1) && isNumber(v2)) {
        return v1 / v2;
    }
    let v3 = clone(v1);

    v2.forEach(function(v) {
        let index = findByName(v3, v.name);

        if (index >= 0) {
            let stateMap1 = {};
            let stateMap2 = {};

            if (Array.isArray(v3[index].state)) {
                v3[index].state.forEach(function(s, ii) {
                    stateMap1[s] = v3[index].value[ii];
                });
            } else {
                stateMap1[v3[index].state] = v3[index].value;
            }

            if (Array.isArray(v.state)) {
                v.state.forEach(function(s, ii) {
                    stateMap2[s] = v.value[ii];
                });
            } else {
                stateMap2[v.state] = v.value;
            }

            Object.keys(stateMap1).forEach(function(k) {
                if (stateMap2[k] != null && typeof stateMap2[k] !== 'undefined') {
                    delete stateMap1[k];
                }
            });

            let states = Object.keys(stateMap1);
            let values = Object.keys(stateMap1).map(function(k) {
                return stateMap1[k];
            });

            if (states.length === 1) {
                v3[index].state = states[0];
                v3[index].value = values[0];
            } else {
                v3[index].state = states;
                v3[index].value = values;
            }
        }
    });

    return v3;
});

let _trans = (attrList, state) => {
    state = state || 'default';

    return attrList.map((attr) => {
        let val = attr.value;

        if (Array.isArray(attr.state) && attr.state.length > 0 && attr.value.length > 0) {

            let index = attr.state.indexOf(state);

            if (index > 0) {
                val = attr.value[index];
            } else {
                val = attr.value[0];
            }
        }
        return {[attr.name]:val};
    }).reduce((prev, next) => {
        Jellymarker.util.extend(prev, next);
        return prev;
    }, {});
};

export function trans(expr, state) {
    if (!expr) {
        return null;
    }
    let input = expr.trim();

    let ret = jellymarker.eval(input);

    //empty statement
    if (!ret) {
        return null;
    }
    return _trans(ret, state);
}

export function insert(alias, name, value, priority, state) {
    let style = [{
        name: name,
        value: value,
        priority: priority || 1,
        state: state || 'default'
    }];

    if (alias) {
        jellymarker.registerVariables(alias, style);
    }
}
