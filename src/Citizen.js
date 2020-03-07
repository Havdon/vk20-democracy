import Vec2 from './vec2';
import { lerp } from './utils'

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
    STILLNESS_LIMIT
} from './config'

const STATE_NORMAL = 0;
const STATE_BEING_ELECTED = 1;
const STATE_ELECTED = 2;

export default class Citizen {


    constructor(opinions, clusterId, scale) {
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
        
        this.isAtRest = false;
        this.secondsAtRest = 0;
        this.sleepCounter = 0;

        this.opacity = 0;
        this.targetOpacity = 0;
    }

    static getElectedFullRadius() {
        return CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER + CITIZEN_PADDING;
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
            this.position.add(Vec2.mult(this.velocity, dt));
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

        if (this.isAtRest && this.secondsAtRest > 8) {
            if (cluster.representativeCount < cluster.representativeMaxCount) {
                if (cluster.restCount > Math.floor(cluster.citizenCount * MIN_ELECTORATE_SIZE) 
                    && cluster.beingElectedCount === 0
                    && cluster.timeSinceElection > ELECTION_PROCESS_LENGTH + TIME_BETWEEN_ELECTIONS) {
                    cluster.representativeCount++;
                    cluster.beingElectedCount++;
                    cluster.timeSinceElection = 0;
                    this.state = STATE_BEING_ELECTED;
                    this.electionTimer = 0;
                }
            }
        }

        let diff = Vec2.sub(this.position, new Vec2(cluster.x, cluster.y));
        let dist = diff.length;
        this.velocity.sub(
            new Vec2(
            diff.x * 0.0000015 * (dist > cluster.radius ? 1.0 : dist / cluster.radius) * dt,
            diff.y * 0.0000015 * (dist > cluster.radius ? 1.0 : dist / cluster.radius) * dt
            )
        )
        this.mass = dist;
    }

    updateBeingElected(simulation, dt) {
        this.electionTimer += dt / 1000;
        let cluster = simulation.clusters[this.clusterId];
        this.radius = lerp( CITIZEN_RADIUS, 
                            CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER, 
                            this.electionTimer / ELECTION_PROCESS_LENGTH
                            ) * this.scale
        5 * (dt / 1000);
        if (this.electionTimer >= ELECTION_PROCESS_LENGTH) {
            this.radius = CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER  * this.scale;
            this.state = STATE_ELECTED;
            this.seat = cluster.seats.splice(0, 1)[0];
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
        
        let diff = Vec2.sub(citizenA.position, citizenB.position);
        let distSqrt = diff.sqlength;
        let radius = citizenA.radius + citizenB.radius + CITIZEN_PADDING * citizenA.scale;
        if (distSqrt > radius * radius) return false;

        let m1 = citizenA.mass;
        let m2 = citizenB.mass;
        let im1 = 1 / citizenA.mass;
        let im2 = 1 / citizenB.mass;
        let k = (citizenA.k + citizenB.k) / 2;

        let dist = Math.sqrt(distSqrt);
        let overlap = radius - dist;

        let cp1 = citizenA.position.copy;
        let cp2 = citizenB.position.copy;

        
        diff.setMag(1);
        diff.mult((overlap * m2) / (m1 + m2));
        cp1.add(diff);

        diff.setMag(1);
        diff.mult((-overlap * m1) / (m1 + m2));
        cp2.add(diff);
        
        citizenA.position = cp1;
        citizenB.position = cp2;
        
        
        let vdot = Vec2.dot(diff, Vec2.sub(citizenA.velocity, citizenB.velocity));
        if (vdot < 0) return;

        diff.setMag(1);
        let i = (-(1.0 + k) * vdot) / (im1 + im2);
        let impulse = Vec2.mult(diff, i);
        citizenA.velocity.add(Vec2.mult(impulse, im1));
        citizenB.velocity.sub(Vec2.mult(impulse, im2));
        
    }

}