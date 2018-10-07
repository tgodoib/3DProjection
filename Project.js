let elem = document.getElementById('canvas');
let params = {width: window.innerWidth * 0.9, height: window.innerHeight * 0.9};
let two = new Two(params).appendTo(elem);

let off = {x: window.innerWidth * 0.9 / 2, y: window.innerHeight * 0.9 / 2};
let colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'black'];
let angle = 0;


function ortho_matrix(vert) {
    return [
        [1, 0, 0],
        [0, 1, 0]
    ]
}

function projection_matrix(ver) {
    return [
        [1 / ((300 - ver.z) / (300 - ver.z + 100)), 0, 0],
        [0, 1 / ((300 - ver.z) / (300 - ver.z + 100)), 0]
    ]
}


function rotation_x(angle) {
    return [
        [1, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]
    ];
}

function rotation_y(angle) {
    return [
        [Math.cos(angle), 0, Math.sin(angle)],
        [0, 1, 0],
        [-Math.sin(angle), 0, Math.cos(angle)]
    ];
}

function rotation_z(angle) {
    return [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]
    ];
}


function calculate_3D_vertices() {
    let vertices = [];
    [-100, 100].forEach(function (x) {
        [-100, 100].forEach(function (y) {
            [-100, 100].forEach(function (z) {
                vertices[vertices.length] = {x: x, y: y, z: z};
            });
        });
    });
    return vertices;
}

function coordinate_to_matrix(pnt) {
    return [
        [pnt.x],
        [pnt.y],
        [!('z' in pnt) ? 0 : pnt.z]
    ]
}

function matrix_to_coordinate(mtx) {
    return {
        x: mtx[0][0],
        y: mtx[1][0],
        z: (mtx.length > 2) ? (mtx[2][0]) : 0
    }
}

function matrix_multiplication(a, b) {
    let result = [];
    for (var i = 0; i < a.length; i++) {
        result[i] = [];
        for (var j = 0; j < b[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function translate_vertices_to_2D(ver, mtx) {
    let vertices = [];
    ver.forEach(function (val) {
        vertices[vertices.length] = matrix_to_coordinate(matrix_multiplication(mtx(val), coordinate_to_matrix(val)));
    });
    return vertices;
}

function rotate(axis, ver, angle) {
    let vertices = [];
    ver.forEach(function (val) {
        vertices[vertices.length] = matrix_to_coordinate(matrix_multiplication(axis(angle), coordinate_to_matrix(val)));
    });
    return vertices;
}

function connect(ver, ver_2d) {
    ver.forEach(function (val, index) {
        ver.forEach(function (val2, in2) {
            if (Math.sqrt(Math.pow(val2.x - val.x, 2) + Math.pow(val2.y - val.y, 2) + Math.pow(val2.z - val.z, 2)) === 200) {
                two.makeLine(off.x - 5 + ver_2d[index].x, off.y - 5 + ver_2d[index].y, off.x - 5 + ver_2d[in2].x, off.y - 5 + ver_2d[in2].y)
            }
        });
    });
    two.update();
}

function draw(ver) {
    ver.forEach(function (val, index) {
        two.makeCircle(val.x + off.x - 5, val.y + off.y - 5, 10).fill = colors[index];
    });
    two.update();
}


function loop() {
    angle = (angle + 0.02) > 360 ? 360 - (angle + 0.02) : angle + 0.02;

    let vertices_3D = calculate_3D_vertices();
    let rotated = rotate(rotation_z, rotate(rotation_y, rotate(rotation_x, vertices_3D, angle), angle), angle);
    let vertices_2D = translate_vertices_to_2D(rotated, ortho_matrix);

    two.clear();
    connect(vertices_3D, vertices_2D);
    draw(vertices_2D);

    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);