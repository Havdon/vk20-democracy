
import kmeans from './KMeans'

import Quadtree from './QuadTree';

const POPULATION_SIZE = 100;
const CITIZENS_PER_REP = 10;

const OPINION_COUNT = 5;

const BORDER_PADDING = 10;

const CITIZEN_RADIUS = 5;
const CITIZEN_PADDING = 3;

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

    kmeans(allOpinions, 3, function(err, res) {
        if (err) throw new Error(err)

        let spacing = window.innerWidth / (res.length + 1)
        for (var i = 0; i < res.length; i++) {
            const cluster = {
                opinions: res[i],
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
            let citizen = {
                x: BORDER_PADDING + Math.random() * (window.innerWidth - BORDER_PADDING * 2),
                y: BORDER_PADDING + Math.random() * (window.innerHeight - BORDER_PADDING * 2),
                vx: 0,
                vy: 0,
                opinion: cluster.opinions[j],
                cluster: i,
                id: `${i}:${j}`
            }
            citizens.push(citizen);
        }
    }
    
    console.log(citizens)

    const simulation = {
        citizens,
        clusters
    }
/*
    var lastUpdate = Date.now();
    function animFrame() {
        var now = Date.now();
        var dt = now - lastUpdate;
        lastUpdate = now;

        update(simulation, dt);
        render(canvas, ctx, simulation);
        window.requestAnimationFrame(animFrame);
    }

    window.requestAnimationFrame(animFrame);
*/
    let lastFrameTimeMs = Date.now();
    const maxFPS = 60;
    let timestep = 1000 / 60;
    let delta = 0;
    function mainLoop() {
        var timestamp = Date.now();
        // Throttle the frame rate
        if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
            window.requestAnimationFrame(mainLoop);
            return;
        }
        delta += timestamp - lastFrameTimeMs;
        lastFrameTimeMs = timestamp;
    
        var numUpdateSteps = 0;
        while (delta >= timestep) {
            update(simulation, timestep);
            delta -= timestep;
            if (++numUpdateSteps >= 240) {
                delta = 0;
                break;
            }
        }
        render(canvas, ctx, simulation);
        window.requestAnimationFrame(mainLoop);
    }
    window.requestAnimationFrame(mainLoop);
    
}

function update(simulation, dt) {
    const { citizens, clusters } = simulation;
    const maxOpinionDifference = OPINION_COUNT * 2;
    let quadTrees = [];
    for (var i = 0; i < clusters.length; i++) {
        var quadTree = new Quadtree({
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerWidth
        }, 10, 4);
        quadTrees.push(quadTree);
    }
    for (var i = 0; i < citizens.length; i++) {
        let citizen = citizens[i];
        let cluster = clusters[citizen.cluster];
        citizen.col = false;

        citizen.x += citizen.vx * dt;
        citizen.y += citizen.vy * dt;

        quadTrees[citizen.cluster].insert({
            x: citizen.x,
            y: citizen.y,
            width: CITIZEN_RADIUS,
            height: CITIZEN_RADIUS,
            citizen
        })

        citizen.vx = 0;
        citizen.vy = 0;
        
        
        // Move towards cluster center
        let dx = citizen.x - cluster.x;
        let dy = citizen.y - cluster.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        citizen.vx -= dx * 0.00005 * (dist > cluster.radius ? 1.0 : dist / cluster.radius) * dt;
        citizen.vy -= dy * 0.00005 * (dist > cluster.radius ? 1.0 : dist / cluster.radius) * dt;


        if (simulation.prevQuadTrees) {
            let results = simulation.prevQuadTrees[citizen.cluster].retrieve({
                x: citizen.x - 50,
                y: citizen.y - 50,
                width: 100,
                height: 100
            });
            //if (i == 0) console.log(results);
        }
        
    }

    let collisions = [];
    for (var i = 0; i < citizens.length; i++) {
        let citizen = citizens[i];
        for (var j = i + 1; j < citizens.length; j++) {
            let other = citizens[j];
            
            let dx = other.x - citizen.x;
            let dy = other.y - citizen.y;
            let distSqrt = dx * dx + dy * dy;

            //if (citizen.cluster == other.cluster) {
                let radius = CITIZEN_RADIUS + CITIZEN_PADDING;
                if (distSqrt <= (radius * 2) * (radius * 2)) {
                    let dist = Math.sqrt(distSqrt);
                    let udx = dx / dist;
                    let udy = dy / dist;
                    let overlap = (radius * 2) - dist;
                    other.x += udx * overlap / 2;
                    other.y += udy * overlap / 2;
                    citizen.x -= udx * overlap / 2;
                    citizen.y -= udy * overlap / 2;
                    citizen.col = true;
                    other.col = true; 

                    collisions.push([i, j])
                }
            //}
        }
    }/*

    for (var collision of collisions) {
        let citizen = citizens[collision[0]]
        let other = citizens[collision[1]]
        
        let dx = other.x - citizen.x;
        let dy = other.y - citizen.y;
        let distSqrt = Math.sqrt(dx * dx + dy * dy);
        let udx = dx / distSqrt;
        let udy = dy / distSqrt;

        let dot = other.vx * udx + other.vy * udy;
        if (dot > 0) {
            other.vx += udx * dot;
            other.vy += udy * dot;
        }

        dot = citizen.vx * udx + citizen.vy * udy;
        if (dot > 0) {
            citizen.vx -= udx * dot;
            citizen.vy -= udy * dot;
        }
    }*/
    simulation.prevQuadTrees = quadTrees;
}

function render(canvas, ctx, simulation) {
    const { citizens, clusters } = simulation;


    ctx.clearRect(0, 0, canvas.width, canvas.height);


    citizens.forEach(({ x, y, cluster, col }) => {
        ctx.beginPath();
        ctx.arc(x, y, CITIZEN_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = ["blue", "red", "green"][cluster]
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

    clusters.forEach(({ x, y, radius }, i) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = ["blue", "red", "green"][i]
        ctx.stroke();
    });
    
}



// The closer to 0 the more similar their opinions are.
function calculateOpinionDifference(citizenA, citizenB) {
    let opinionsDifference = 0;
    for (var i = 0; i < citizenA.opinions.length; i++) {
        opinionsDifference += Math.abs(citizenA.opinions[i] - citizenB.opinions[i]);
    }
    return opinionsDifference;
}