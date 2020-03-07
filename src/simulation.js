
import kmeans from './KMeans'

import Quadtree from './QuadTree';
import Citizen from './Citizen'
import Vec2 from './vec2';
import { startUpdateLoop, lerp, drawEqTriangle } from './utils'

import {
    POPULATION_SIZE,
    CITIZENS_PER_REP,
    OPINION_COUNT,
    BORDER_PADDING,
    CITIZEN_RADIUS,
    CITIZEN_PADDING,
    PARLIAMENT_RADIUS,
    PARLIAMENT_SPACING,
    MIN_CLUSTERS,
    MAX_CLUSTERS,
    DRAW_CLUSTER_RADI,
    DRAW_SEATS,
    ONLY_CIRCLES,
    VARIABLE_COLOR
} from './config'


export default function(canvas, centerOn) {

    let scale = 1;

    const ctx = canvas.getContext('2d');

    const citizens = [];
    const allOpinions = [];
    for (var i = 0; i < POPULATION_SIZE; i++) {
        let opinions = [];
        for (var j = 0; j < OPINION_COUNT; j++) {
            opinions.push(-1 + Math.random() * 2);
        }
        allOpinions.push(opinions);

        
    }

    let parliament = {
        position: new Vec2(window.innerWidth / 2, window.innerHeight / 2),
        radius: PARLIAMENT_RADIUS * scale
    }

    if (centerOn) {
        let bb = centerOn.getBoundingClientRect();
        parliament.position.x = bb.x + bb.width / 2;
        parliament.position.y = window.scrollY + bb.y + bb.height / 2 + parliament.radius;
    }

    let clusters = [];

    const clusterCount = MIN_CLUSTERS + Math.round(Math.random() * MAX_CLUSTERS);

    kmeans(allOpinions, clusterCount, function(err, res) {
        if (err) throw new Error(err)


        let clusterPositionRadius = window.innerHeight * 0.8;
        let clusterCircleCenter = new Vec2(window.innerWidth / 2,
            window.innerHeight);

        let minAngle = -180;
        let maxAngle = 0;


        // Calculate min + max angles, if t
        if (window.innerWidth < clusterPositionRadius * 2) {
            let left = new Vec2(
                0, 
                clusterCircleCenter.y - Math.sqrt(clusterPositionRadius * clusterPositionRadius - Math.pow(clusterCircleCenter.x - 0, 2))
            );
            let right = new Vec2(
                window.innerWidth, 
                clusterCircleCenter.y - Math.sqrt(clusterPositionRadius * clusterPositionRadius - Math.pow(clusterCircleCenter.x - window.innerWidth, 2))
            );

            let dirL = Vec2.sub(clusterCircleCenter, left);
            let dirR = Vec2.sub(clusterCircleCenter, right);

            minAngle = dirL.heading * 57.2958 - 180;
            maxAngle = dirR.heading * 57.2958 - 180;
        }
        
        let range = maxAngle - minAngle;
        let spacing = range / (clusterCount + 1);

        let seatsGiven = 0;

        for (var i = 0; i < res.length; i++) {
            let citizenArea = Math.PI * Math.pow((CITIZEN_RADIUS + CITIZEN_PADDING * scale), 2);
            const cluster = {
                opinions: res[i],
                citizenCount: res[i].length,
                representativeCount: 0,
                beingElectedCount: 0,
                timeSinceElection: 0,
                restCount: 0,
                representativeMaxCount: Math.round(res[i].length / CITIZENS_PER_REP),
                x: clusterCircleCenter.x + Math.cos((minAngle + (spacing + i * spacing)) * Math.PI / 180) * clusterPositionRadius,
                y: clusterCircleCenter.y + Math.sin((minAngle + (spacing + i * spacing)) * Math.PI / 180) * clusterPositionRadius,
                finalX: clusterCircleCenter.x + Math.cos((minAngle + (spacing + i * spacing)) * Math.PI / 180) * clusterPositionRadius * 0.5,
                finalY: clusterCircleCenter.y + Math.sin((minAngle + (spacing + i * spacing)) * Math.PI / 180) * clusterPositionRadius * 0.5,
                
                // Radius calculated based on the circle packing constant.
                radius: Math.sqrt(citizenArea * res[i].length * 0.9069) / Math.PI * 2
            }
            seatsGiven += cluster.representativeMaxCount;
            clusters.push(cluster);
        }

        // If too few seats were given, we give the remaining to the last cluster.
        if (seatsGiven < res.length) {
            clusters[clusters.length - 1].representativeMaxCount += res.length - seatsGiven;
        }
    })
    for (var i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        for (var j = 0; j < cluster.opinions.length; j++) {
            let citizen = new Citizen(cluster.opinions[j], i, scale);
            citizen.position.x = BORDER_PADDING + Math.random() * (window.innerWidth - BORDER_PADDING * 2);
            citizen.position.y = BORDER_PADDING + Math.random() * (window.innerHeight - BORDER_PADDING * 2)
            citizen.index = citizens.length;
            citizens.push(citizen);
        }
    }
    
    console.log(citizens)

    const simulation = {
        citizens,
        clusters,
        parliament
    }

    simulation.parliament.seats = createSeatingOrder(simulation);
    let ix = 0;
    for (var i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        cluster.seats = simulation.parliament.seats.slice(ix, ix + cluster.representativeMaxCount);
        ix += cluster.representativeMaxCount;
    }

    startUpdateLoop(dt => update(simulation, dt), () => render(canvas, ctx, simulation));    
}

function update(simulation, dt) {
    const { citizens, clusters } = simulation;
    const maxOpinionDifference = OPINION_COUNT * 2;
    let quadTree = new Quadtree({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerWidth
    }, 10, 5);
    for (var i = 0; i < citizens.length; i++) {
        let citizen = citizens[i];
        let cluster = clusters[citizen.clusterId];

        citizen.closeToOthers = 0;

        citizen.update(simulation, dt);

        quadTree.insert({
            x: citizen.position.x,
            y: citizen.position.y,
            width: citizen.radius,
            height: citizen.radius,
            citizen
        })
    }

    for (var i = 0; i < clusters.length; i++) {
        clusters[i].restCount = 0;
        clusters[i].timeSinceElection += dt / 1000;
        /*if (clusters[i].representativeCount == clusters[i].representativeMaxCount) {
            clusters[i].x = lerp(clusters[i].x, clusters[i].finalX, 0.01)
            clusters[i].y = lerp(clusters[i].y, clusters[i].finalY, 0.01)
        }*/
    }

    
    for (var i = 0; i < citizens.length; i++) {
        let citizen = citizens[i];
        
        var elements = quadTree.retrieve({
            x: citizen.position.x - 10,
            y: citizen.position.y - 10,
            width: 20,
            height: 20
        });
        for (var j = 0; j < elements.length; j++) {
            let other = elements[j].citizen
            if (other != citizen && other.index > i) {
                Citizen.collide(citizen, other);
            }
            if (other.clusterId == citizen.clusterId) {
                citizen.closeToOthers++;
                other.closeToOthers++;
            }
        }
        if (citizen.isAtRest) {
            if (citizen.isNormal()) 
                clusters[citizen.clusterId].restCount++;
        }

        citizen.targetOpacity = (Math.min(citizen.closeToOthers, 50) / 50);
    }

}

const COLORS = ["blue", "red", "green", "orange", "purple"]
function render(canvas, ctx, simulation) {
    const { citizens, clusters, parliament } = simulation;


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (DRAW_CLUSTER_RADI) {
        for (let cluster of clusters) {
            ctx.beginPath();
            ctx.arc(cluster.x, cluster.y, cluster.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    //ctx.globalAlpha = 0.3
    if (DRAW_SEATS) {
        for (let seat of simulation.parliament.seats) {
            ctx.beginPath();
            ctx.arc(seat.x, seat.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    ctx.lineWidth = 2;
    citizens.forEach((citizen) => {
        let { position, clusterId, radius, col } = citizen;
        if (VARIABLE_COLOR) {
            let color = 220 - (220 * citizen.opacity);
            if (!citizen.isNormal()) color = 0;
            ctx.strokeStyle = `rgb(${color}, ${color}, ${color})`
        }
        ctx.beginPath();
        switch (clusterId + (ONLY_CIRCLES ? 1000 : 0)) {
            case 1: {
                // Diamond / Box
                let size = radius;
                ctx.save();
                ctx.translate(position.x, position.y);
                //ctx.rotate(45 * 0.0174533);
                ctx.moveTo(-size, -size);
                ctx.lineTo(-size, +size);
                ctx.lineTo(+size, +size);
                ctx.lineTo(+size, -size);
                ctx.lineTo(-size, -size);
                // An extra line is needed to make the corner of the square nice.
                ctx.lineTo(-size, +size);
                ctx.restore();
            }
                break;
            case 2: {
                // Triangle
                drawEqTriangle(ctx, radius * 2.5, position.x, position.y);
            }
                break;
            case 3: {
                // Plus
                let size = radius + 2;
                let width = size / 3;
                ctx.save();
                ctx.translate(position.x, position.y);
                ctx.rotate(45 * 0.0174533);
                ctx.moveTo(-size, +width);
                ctx.lineTo(-size, -width);
                ctx.lineTo(-width, -width);
                ctx.lineTo(-width, -size);
                ctx.lineTo(+width, -size);
                ctx.lineTo(+width, -width);
                ctx.lineTo(+size, -width);
                ctx.lineTo(+size, +width);
                ctx.lineTo(+width, +width);
                ctx.lineTo(+width, +size);
                ctx.lineTo(-width, +size);
                ctx.lineTo(-width, +width);
                ctx.lineTo(-size, +width);
                ctx.lineTo(-size, -width);
                ctx.restore();
            }
                break;
            case 4: {
                ctx.beginPath();
                for (var i = 0; i < Math.PI * 2; i += Math.PI * 2 / 5) {
                    let x = position.x + Math.cos(i - (90 * Math.PI / 180)) * radius * 1.3;
                    let y = position.y + Math.sin(i - (90 * Math.PI / 180)) * radius * 1.3;
                    if (i == 0) {
                        ctx.moveTo(x, y);
                    }
                    else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.stroke();
                break;
            }
            default:
                // Circle
                ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
                break;
        }
        //ctx.fillStyle = citizen.isSleeping ? 'orange' : 'black'
        /*if (citizen.isAtRest) {
            ctx.fillStyle = citizen.secondsAtRest > 5 ? 'gold' : "black"
        }*/
        ctx.stroke();
        /*
        if (col) {
            ctx.beginPath();
            ctx.arc(x, y, CITIZEN_RADIUS + 2, 0, 2 * Math.PI);
            ctx.strokeStyle = "yellow"
            ctx.stroke();
        }
        */
    });
}

let imgCache = {};
function getCachedCanvasImg(clusterId, radius) {
    if (!imgCache[clusterId]) {
        let offscreen = document.createElement('canvas');
        offscreen.width = radius * 2;
        offscreen.height = radius * 2;
        let ctx = offscreen.getContext('2d');
    }
    else {
        return imgCache[clusterId];
    }
}

function createSeatingOrder(simulation) {
    const { parliament } = simulation;
    const electedRadius = Citizen.getElectedFullRadius();

    let targetSeatCount = Math.round(POPULATION_SIZE / CITIZENS_PER_REP);

    let seatPositions = [];
    let level = 0;
    let seats = 0;
    let levelRadius = parliament.radius;
    while(true) {
        if (level > 10) break;
        let minAngle = -170;
        let maxAngle = -10;
        let angleDiff = maxAngle - minAngle;
        let angleSpacing = (electedRadius * 2 * PARLIAMENT_SPACING) / (Math.PI * levelRadius) * 180;
        let seatCount = Math.round(angleDiff / angleSpacing);
        let trueSpacing = angleDiff / seatCount;
        
        if (seats + seatCount > targetSeatCount) {
            let diff = targetSeatCount - (seats + seatCount);
            minAngle -= (Math.round(diff / 2)) * trueSpacing;
        }
        
        for (var i = 0; i < seatCount + 1; i++) {
            if (seats > targetSeatCount) break;
            seats++;
            let angle = (minAngle + i * trueSpacing);
            let x = levelRadius * Math.cos(angle * Math.PI / 180);
            let y = levelRadius * Math.sin(angle * Math.PI / 180);
            seatPositions.push(new Vec2(parliament.position.x + x, parliament.position.y + y));
        }
        if (seats > targetSeatCount) break;
        level++;
        levelRadius += electedRadius * 2 * PARLIAMENT_SPACING;
    }

    seatPositions.sort((a, b) => {
        let diff = Vec2.sub(a, parliament.position)
        let aDist = diff.length;
        diff.setMag(1);
        let angleA = diff.heading * 57.2958;

        diff = Vec2.sub(b, parliament.position)
        let bDist = diff.length;
        diff.setMag(1);
        let angleB = diff.heading * 57.2958;
        let angleDiff = angleA - angleB;
        if (Math.abs(angleDiff) < 10) {
            return aDist - bDist;
        }
        else {
            return angleDiff;
        }
    });

    return seatPositions;
}
