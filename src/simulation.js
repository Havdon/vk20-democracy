
import kmeans from './KMeans'

import Quadtree from './QuadTree';
import Citizen from './Citizen'
import Vec2 from './vec2';
import { startUpdateLoop } from './utils'

const POPULATION_SIZE = 200;
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
        clusters
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
                Citizen.collide(citizen, other);
                Citizen.avoid(citizen, other);
            }
        }
        if (citizen.isAtRest) {
            if (citizen.isNormal()) 
                clusters[citizen.clusterId].restCount++;
        }
    }
}

function render(canvas, ctx, simulation) {
    const { citizens, clusters } = simulation;


    ctx.clearRect(0, 0, canvas.width, canvas.height);


    citizens.forEach(({ position, clusterId, radius, col, ...citizen }) => {
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = ["blue", "red", "green", "yellow", "purple"][clusterId]
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
    clusters.forEach(({ x, y, radius }, i) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = ["blue", "red", "green"][i]
        ctx.stroke();
    });*/
    
}



// The closer to 0 the more similar their opinions are.
function calculateOpinionDifference(citizenA, citizenB) {
    let opinionsDifference = 0;
    for (var i = 0; i < citizenA.opinions.length; i++) {
        opinionsDifference += Math.abs(citizenA.opinions[i] - citizenB.opinions[i]);
    }
    return opinionsDifference;
}