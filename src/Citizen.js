import Vec2 from './vec2';
import { lerp, gaussianRand } from './utils'

import {
    CITIZEN_RADIUS,
    ELECTED_RADIUS_MULTIPLIER,
    ELECTION_PROCESS_LENGTH,
    TIME_BETWEEN_ELECTIONS,
    MIN_ELECTORATE_SIZE,
    SPEED_LIMIT,
    AIR_FRICTION,
    CITIZEN_PADDING,
    VELOCITY_HISTORY_LENGTH,
    STILLNESS_LIMIT,
    FORM_PARLIAMENT
} from './config'

const STATE_NORMAL = 0;
const STATE_BEING_ELECTED = 1;
const STATE_ELECTED = 2;

export default class Citizen {


    constructor(opinions, clusterId, scale, cluster) {
        this.state = STATE_NORMAL;
        this.position = new Vec2();
        this.prevPosition = this.position.copy;
        this.velocity = new Vec2();
        this.opinions = opinions;
        this.clusterId = clusterId;
        this.radius = 5 * scale;
        this.scale = scale;

        this.k = 0.5;
        this.velocities = [];

        this.cluster = cluster;
        this.randomClusterOffset();
        
        this.isAtRest = false;
        this.secondsAtRest = 0;
        this.sleepCounter = 0;

        this.opacity = 0;
        this.targetOpacity = 0;
    }

    static getElectedFullRadius() {
        return CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER + CITIZEN_PADDING;
    }

    randomClusterOffset() {
        let x = this.cluster.radius * 2;
        let y = this.cluster.radius;
        this.clusterOffset = new Vec2(
            -(x / 2) + Math.random() * x, 
            -(y / 2) + Math.random() * y)
    }

    isNormal() {
        return this.state === STATE_NORMAL;
    }

    update(simulation, dt) {
        let cluster = simulation.clusters[this.clusterId];
        let movement = this.velocity.length;
        //this.velocities.push(this.velocity.length);
        this.velocities.push(movement);
        if (this.velocities.length > VELOCITY_HISTORY_LENGTH) {
            this.velocities.splice(0, this.velocities.length - VELOCITY_HISTORY_LENGTH);
        }
        this.activityLevel = this.velocities.reduce((avg, curr) => avg + curr, 0) / this.velocities.length;
        let isAtRest = (this.activityLevel < STILLNESS_LIMIT);
        if (isAtRest) {
            this.secondsAtRest += dt / 1000;
        }
        else {
            this.secondsAtRest = 0;
        }
        this.isAtRest = this.secondsAtRest > 2;

        let sleepCountThresh = 5;
        if (movement < 0.005) {
            if (this.sleepCounter < sleepCountThresh) 
                this.sleepCounter++;
        }
        else {
            if (this.sleepCounter > 0)
                this.sleepCounter--;
        }

        this.opacity = lerp(this.opacity, this.targetOpacity, 0.1);

        this.isSleeping = this.sleepCounter == sleepCountThresh;

        this.prevPosition = this.position.copy;

        if (this.velocity.sqlength > SPEED_LIMIT * SPEED_LIMIT) {
            this.velocity.setMag(SPEED_LIMIT);
        }
        
        if (!this.isSleeping) {
            this.position.add(Vec2.mult(this.velocity, dt, Vec2.cached[0]));
        }

        //this.velocity = new Vec2();
        this.velocity.mult(AIR_FRICTION);

        switch(this.state) {
            case STATE_NORMAL:
                this.updateNormal(simulation, dt);
                break;
            case STATE_BEING_ELECTED:
                this.updateBeingElected(simulation, dt);
                break;
            case STATE_ELECTED:
                this.updateElected(simulation, dt);
                break;
        }
    }

    updateNormal(simulation, dt) {
        let cluster = simulation.clusters[this.clusterId];

        if (FORM_PARLIAMENT) {
            if (this.isAtRest && this.secondsAtRest > 8) {
                if (cluster.representativeCount < cluster.representativeMaxCount) {
                    if (cluster.restCount > Math.floor(cluster.citizenCount * MIN_ELECTORATE_SIZE) 
                        && cluster.beingElectedCount === 0
                        && cluster.timeSinceElection > ELECTION_PROCESS_LENGTH + TIME_BETWEEN_ELECTIONS
                        && cluster.seats.length > 0) {
                        cluster.representativeCount++;
                        cluster.beingElectedCount++;
                        cluster.timeSinceElection = 0;
                        this.state = STATE_BEING_ELECTED;
                        this.electionTimer = 0;
                        this.seat = cluster.seats.splice(0, 1)[0];
                    }
                }
            }
        }

        let diff = Vec2.sub(Vec2.add(this.position, this.clusterOffset, Vec2.cached[0]), new Vec2(cluster.x, cluster.y), Vec2.cached[0]);
        let dist = diff.length;
        this.velocity.sub(
            new Vec2(
            diff.x * 0.0000015 * (dist > cluster.radius ? 1.0 : dist / cluster.radius) * dt,
            diff.y * 0.0000015 * (dist > cluster.radius ? 1.0 : dist / cluster.radius) * dt
            )
        )
        this.mass = 1 + dist;

        if (Math.random() < 0.00005) {
            this.randomClusterOffset();
        }
    }

    updateBeingElected(simulation, dt) {
        this.electionTimer += dt / 1000;
        let cluster = simulation.clusters[this.clusterId];
        /*
        this.radius = lerp( CITIZEN_RADIUS, 
                            CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER, 
                            this.electionTimer / ELECTION_PROCESS_LENGTH
                            ) * this.scale
                            */
        
        if (this.electionTimer >= ELECTION_PROCESS_LENGTH) {
            //this.radius = CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER  * this.scale;
            this.state = STATE_ELECTED;
            
            cluster.beingElectedCount--;
        }
    }

    updateElected(simulation, dt) {
        const { parliament } = simulation;

        let dir = Vec2.sub(this.seat, this.position);
        let dist = dir.length;
        if (dist < 5) {
            this.mass = 1;
        }
        else {
            this.mass = 10000;
        }
        if (dist > 3) {
            dir.setMag(1);
            dir.mult(0.1 * dt / 1000);

            this.velocity.add(dir);
        }
        
    }

    static collide(citizenA, citizenB) {
        let radius = citizenA.radius + citizenB.radius + CITIZEN_PADDING * citizenA.scale;
        if (Math.abs(citizenA.position.x - citizenB.position.x) > radius &&
            Math.abs(citizenA.position.y - citizenB.position.y) > radius ) 
            return;

        let diff = Vec2.sub(citizenA.position, citizenB.position, Vec2.cached[0]);
        let distSqrt = diff.sqlength;
        
        if (distSqrt > radius * radius) return false;

        let m1 = citizenA.mass;
        let m2 = citizenB.mass;
        let im1 = 1 / citizenA.mass;
        let im2 = 1 / citizenB.mass;
        let k = (citizenA.k + citizenB.k) / 2;

        let dist = Math.sqrt(distSqrt);
        let overlap = radius - dist;

        diff.setMag(1);
        diff.mult((overlap * m2) / (m1 + m2));
        citizenA.position.add(diff);

        diff.setMag(1);
        diff.mult((-overlap * m1) / (m1 + m2));
        citizenB.position.add(diff);
        
        
        let vdot = Vec2.dot(diff, Vec2.sub(citizenA.velocity, citizenB.velocity, Vec2.cached[1]));
        if (vdot < 0) return;

        diff.setMag(1);
        let i = (-(1.0 + k) * vdot) / (im1 + im2);
        let impulse = Vec2.mult(diff, i, Vec2.cached[2]);
        citizenA.velocity.add(Vec2.mult(impulse, im1, Vec2.cached[3]));
        citizenB.velocity.sub(Vec2.mult(impulse, im2, Vec2.cached[4]));
        
    }

}