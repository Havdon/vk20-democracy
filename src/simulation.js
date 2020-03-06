
import kmeans from './KMeans'

import Quadtree from './QuadTree';
import Citizen from './Citizen'
import Vec2 from './vec2';
import { startUpdateLoop } from './utils'

const POPULATION_SIZE = 300;
const CITIZENS_PER_REP = 10;

const OPINION_COUNT = 5;

const BORDER_PADDING = 10;

const CITIZEN_RADIUS = 5;
const CITIZEN_PADDING = 3;

const PARLIAMENT_SPACING = 5;

export default function(canvas) {

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

    let clusters = [];

    kmeans(allOpinions, 5, function(err, res) {
        if (err) throw new Error(err)

        let spacing = window.innerWidth / (res.length + 1)
        for (var i = 0; i < res.length; i++) {
            const cluster = {
                opinions: res[i],
                citizenCount: res[i].length,
                representativeCount: 0,
                beingElectedCount: 0,
                timeSinceElection: 0,
                restCount: 0,
                representativeMaxCount: Math.round(res[i].length / CITIZENS_PER_REP),
                x: spacing + spacing * i,
                y: 100,
                // HACK: Guess, don't ask how we got here
                radius: (CITIZEN_RADIUS + CITIZEN_PADDING) / Math.sin(Math.PI / res[i].length) / 2 
            }
            clusters.push(cluster);
        }
    })
    for (var i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        for (var j = 0; j < cluster.opinions.length; j++) {
            let citizen = new Citizen(cluster.opinions[j], i);
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
        parliament: {
            position: new Vec2(window.innerWidth / 2, window.innerHeight / 2 + 200),
            radius: 60
        }
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
    }, 20, 4);
    for (var i = 0; i < citizens.length; i++) {
        let citizen = citizens[i];
        let cluster = clusters[citizen.clusterId];

        

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
                //Citizen.avoid(citizen, other);
                Citizen.collide(citizen, other);
            }
        }
        if (citizen.isAtRest) {
            if (citizen.isNormal()) 
                clusters[citizen.clusterId].restCount++;
        }
    }

}

const COLORS = ["blue", "red", "green", "orange", "purple"]
function render(canvas, ctx, simulation) {
    const { citizens, clusters, parliament } = simulation;


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "12px Arial";

    citizens.forEach(({ position, clusterId, radius, col, ...citizen }) => {
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS[clusterId]
        /*if (citizen.isAtRest) {
            ctx.fillStyle = citizen.secondsAtRest > 5 ? 'gold' : "black"
        }*/
        ctx.fill();
        /*
        if (col) {
            ctx.beginPath();
            ctx.arc(x, y, CITIZEN_RADIUS + 2, 0, 2 * Math.PI);
            ctx.strokeStyle = "yellow"
            ctx.stroke();
        }
        */
    });
/*
    ctx.beginPath();
    ctx.arc(parliament.position.x, parliament.position.y, parliament.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "black"
    ctx.stroke();*/

    

    
    
    
/*
    clusters.forEach(({ x, y, radius }, i) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = ["blue", "red", "green"][i]
        ctx.stroke();
    });*/
    
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
        let minAngle = -150;
        let maxAngle = -30;
        let angleDiff = maxAngle - minAngle;
        let angleSpacing = (electedRadius * 2 + PARLIAMENT_SPACING) / (Math.PI * levelRadius) * 180;
        let seatCount = Math.floor(angleDiff / angleSpacing);
        
        if (seats + seatCount > targetSeatCount) {
            let diff = targetSeatCount - (seats + seatCount);
            minAngle -= (Math.round(diff / 2) - 1) * angleSpacing;
        }
        
        for (var i = 0; i < seatCount + 1; i++) {
            if (seats > targetSeatCount) break;
            seats++;
            let angle = (minAngle + i * angleSpacing);
            let x = levelRadius * Math.cos(angle * Math.PI / 180);
            let y = levelRadius * Math.sin(angle * Math.PI / 180);
            seatPositions.push(new Vec2(parliament.position.x + x, parliament.position.y + y));
        }
        if (seats > targetSeatCount) break;
        level++;
        levelRadius += electedRadius * 2 + PARLIAMENT_SPACING;
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
