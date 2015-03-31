var jitterz = {};

jitterz.points = [];

// CONFIG
jitterz.numPoints = 100;

var w = window.innerWidth,
    h = window.innerHeight - 28,
    c = Math.cos,
    s = Math.sin,
    inc = 2 * Math.PI / jitterz.numPoints;

var cx = w / 2,
    cy = h / 2,
    r = w > h ? h * 0.36 : w * 0.36,
    targetR = 0.95 * r,
    numLoops = 10, // number of times to loop around the circle (for a multitude of points)
    closeness = r * 0.75, // how close should the cursor have to be for a point to move toward it
    jitterFactor = r / 150, // how far the points jitter
    biasFactor = 0.4; // the smaller, the less attracted to the cursor points are

var timer = false,
    timerInterval,
    successTime = false,
    currentLevel = 0,
    gameOver = true;

function shapeReset() {
    fill(255, 255, 255, 80);
    strokeWeight(0);
}

function explode() {
    jitterz.points.forEach(function(pt) {
        pt[0] += 3 * ( Math.random() * 2 - 1 ) * jitterFactor;
        pt[1] += 3 * ( Math.random() * 2 - 1 ) * jitterFactor;
    });
}

function setExplosion(times) {
    for ( var i = 0; i < times; i++ ) {
        setTimeout(explode, i * 30);
    }
}

var levels = [
    {
        shape: function() {
            ellipse(cx, cy, 2 * targetR, 2 * targetR);
        },
        test: function(px) {
            return distance(px, [cx, cy] ) < targetR;
        }
    },
    {
        shape: function() {
            rect(cx - r, cy - r / 4, 2 * r, r / 2);
        },
        test: function(px) {
            return px[0] > cx - r && px[0] < cx + r && px[1] > cy - r / 4 && px[1] < cy + r / 4;
        }
    },
    {
        shape: function() {
            ellipse(cx, cy, 2 * targetR, 2 * targetR);
            fill(0);
            ellipse(cx, cy, targetR, targetR);
        },
        test: function(px) {
            return distance(px, [cx, cy] ) < targetR && distance(px, [cx, cy] ) > targetR / 2;
        }
    },
    {
        shape: function() {
            /* rect(cx - r, cy - r, 2 * r / 3, 2 * r / 3);
            rect(cx +  r / 3, cy - r, 2 * r / 3, 2 * r / 3);
            rect(cx - r, cy + r / 3, 2 * r / 3, 2 * r / 3);
            rect(cx + r / 3, cy + r / 3, 2 * r / 3, 2 * r / 3); */

            ellipse(cx - 2 * r / 3, cy - 2 * r / 3, 3 * r / 4, 3 * r / 4);
            ellipse(cx + 2 * r / 3, cy - 2 * r / 3, 3 * r / 4, 3 * r / 4);
            ellipse(cx, cy + 2 * r / 3, 3 * r / 4, 3 * r / 4);
        },
        test: function(px) {
            /* var x = Math.abs(px[0] - cx),
                y = Math.abs(px[1] - cy);
            return x < 3 * r / 4 && x > r / 4 && y < 3 * r / 4 && y > r / 4; */
            var x = px[0], y = px[1];
            return distance([x, y], [cx - 2 * r / 3, cy - 2 * r / 3]) < 3 * r / 8 ||
                distance([x, y], [cx + 2 * r / 3, cy - 2 * r / 3]) < 3 * r / 8 ||
                distance([x, y], [cx, cy + 2 * r / 3]) < 3 * r / 8;
        },
        inAllRegions: function(pts) {

            var inRegions = 0,
                regions = [
                    [cx - 2 * r / 3, cy - 2 * r / 3],
                    [cx + 2 * r / 3, cy - 2 * r / 3],
                    [cx, cy + 2 * r / 3]
                ];

            regions.forEach(function(region) {
                var x, y;
                for ( var p = 0; p < pts.length; p++ ) {
                    x = pts[p][0];
                    y = pts[p][1];
                    if ( distance([x, y], region) < 3 * r / 8 ) {
                        inRegions++;
                        break;
                    }
                }
            });

            return inRegions === regions.length ;
        }
    }
];

// add a shapeReset to each level's shape() method
levels.forEach(function(level) {

    var dummy = level.shape;

    level.shape = function() {
        shapeReset();
        dummy();
    };
});

// map the distance (0 - closeness) to 0-255 for color mapping
function mapCloseness(dist) {
    return (closeness - dist) * 255 / closeness;
}

function normalizeColor(value) {
    if ( value < 80 ) value = 80;
    if ( value > 255 ) value = 255;

    return value;
}

function writeParagraph(html, id) {
    var p = document.createElement('p');
    p.style.width = (w / 2).toString() + 'px';

    if ( id ) p.id = id;

    p.innerHTML = html;
    document.body.appendChild(p);

    p.style.left = (cx - p.clientWidth / 2).toString() + 'px';
    p.style.top = (cy - p.clientHeight / 2).toString() + 'px';
}

function setup() {

    document.getElementById('loading').style.display = 'none';

    createCanvas( w, h );
    background(0);

    for ( var i = 0; i < jitterz.numPoints - 1; i += inc ) {
        jitterz.points.push([cx + r * c(i), cy + r * s(i)]);
    }

    writeParagraph('"If a man has a hundred sheep, and one of them has gone astray, does he not leave the ninety-nine on the mountain and search for the one that is straying?"', 'quote');

    // show the info block
    document.getElementById('info').style.display = 'block';

    setTimeout(startTimer, 4000);
}

function startTimer() {

    var p = document.getElementById('quote');
    setTimeout(function() {
        //p.innerHTML += '<br>-Christ, <em>Matthew 18:12-14</em>';
    }, 4500);

    setTimeout(function() {
        p.parentNode.removeChild(p);
    }, 4500);

    textFont('Helvetica Neue');

    timerInterval = setInterval(function(){
        timer++;
    }, 1000);
}

function writeText(str) {
    textSize(32);
    fill(255);
    text(str, 20, 45);
}

function time(again) {

    var minutes, seconds, theTime;

    minutes = Math.floor(timer / 60);
    seconds = timer % 60;

    minutes = minutes.toString();
    seconds = seconds.toString();

    theTime = minutes + ':' + ( seconds.length === 2 ? seconds : '0' + seconds );

    if ( again ) {
        writeText(theTime);
        setTimeout(time, 1000);
    } else {
        return theTime;
    }
}

function drawLines() {

    var pt = 0,
        inc = 2 * Math.PI / jitterz.numPoints,
        dist,
        numberInside = 0,
        ratioInside = 0,
        inAllRegions = true;

    var r, g, b, a;
    a = 100;

    var targetX, targetY;

    if ( touchIsDown ) {
        targetX = touchX;
        targetY = touchY;
    }

    if ( mouseX && mouseY ) {
        targetX = mouseX;
        targetY = mouseY;
    }

    clear();
    background(0);

    levels[currentLevel].shape();
    time(true);

    for ( var i = 0; i < numLoops * 2 * Math.PI; i += inc ) {

        r = g = b = 255;

        dist = distance(jitterz.points[pt], [targetX, targetY]);

        strokeWeight(1.5);

        // if in the target, add to the number inside
        if ( levels[currentLevel].test(jitterz.points[pt]) ) {
            numberInside++;
        // if not, red pixels remain high but others are low
        } else {
            g = b = 60;
        }

        if ( dist < closeness ) {

            r -= mapCloseness(dist);
            g -= mapCloseness(dist);
            b += 0.5 * mapCloseness(dist);
        }

        // make sure they stay within 0-255 range
        r = normalizeColor(r);
        g = normalizeColor(g);
        b = normalizeColor(b);

        stroke(r, g, b, a);

        // point
        ellipse(jitterz.points[pt][0], jitterz.points[pt][1], 1, 1);

        line(
            jitterz.points[pt][0],
            jitterz.points[pt][1],
            jitterz.points[pt + 1][0],
            jitterz.points[pt + 1][1]
        );
        pt++;
    }

    // draw the ratio of success rectangle
    ratioInside = numberInside / (jitterz.numPoints * numLoops);

    strokeWeight(0);
    fill(200, 0, 0);

    // If success is above 99%, set success fill and successTime
    if ( ratioInside >= 0.99 ) {

        fill(100, 200, 255);
        if ( !successTime ) successTime = timer;

    } else if ( ratioInside >= 0.9 ) {
        fill(50, 200, 50);
    } else if ( ratioInside >= 0.75 ) {
        fill(255);
    } else if ( ratioInside >= 0.5 ) {
        fill(255, 200, 0);
    } else if ( ratioInside >= 0.25 ) {
        fill(200, 100, 0);
    }

    if ( levels[currentLevel].inAllRegions ) {
        inAllRegions = levels[currentLevel].inAllRegions(jitterz.points);

        if ( !inAllRegions ) fill(200, 0, 0);
    }

    rect(w - w / 20, ( 1 - ratioInside ) * h, w, h);

    if ( !!successTime && timer - successTime >= 5 && inAllRegions ) {
        currentLevel++;
        setExplosion(50);
        successTime = false;
    }

    if ( successTime && inAllRegions ) {
        fill(255);
        text((5 - (timer - successTime)).toString() + '...', w / 2 - 20, 45);
    }
}

function distance(pt, target) {

    var dx = target[0] - pt[0],
        dy = target[1] - pt[1];

    return Math.sqrt( dx * dx + dy * dy );
}

// since everything should be relative to the radius
function normalize(distance) {
    return distance / (0.005 * r);
}

function jitter() {
    if ( jitterz.points.length > 0 ) {

        var targetX, targetY;

        if ( touchIsDown ) {
            targetX = touchX;
            targetY = touchY;
        }

        if ( mouseX && mouseY ) {
            targetX = mouseX;
            targetY = mouseY;
        }

        var dist,
            nd,
            close = 0,
            atPoint = false;

        jitterz.points.forEach(function(pt) {

            dist = distance(pt, [targetX, targetY]);
            nd = normalize(dist);

            pt[0] += ( Math.random() * 2 - 1 ) * jitterFactor;
            pt[1] += ( Math.random() * 2 - 1 ) * jitterFactor;

            // weird maths happen if the distance is 0 (since dividing by 0)
            if ( Math.abs(targetX - pt[0]) <= 1 && Math.abs(targetY - pt[1]) <= 1 ) atPoint = true;

            if ( dist < closeness ) {
                pt[0] += atPoint ? 0 : biasFactor * (targetX - pt[0]) / nd;
                pt[1] += atPoint ? 0 : biasFactor * (targetY - pt[1]) / nd;
            }
        });

        drawLines();
    }
}

function keyTyped() {

    if ( key === ' ' ) {
        currentLevel++;
    }

    if ( key === '1' ) {
        draw = null;
    }
}

function success() {
    clear();
    background(0);
    clearInterval(timerInterval);

    // no more drawing to be done
    draw = null;

    writeParagraph('Rejoice! The task has been completed.<br>It took you ' + time() + '.<br><br>You may <a style="color: #fff; text-decoration: underline;" href="/">start again</a>.');

}

function draw() {
    if ( !levels[currentLevel] ) {
        success();
    } else if ( !!timer && timer >= 0 ) {
        jitter();
    }
}
