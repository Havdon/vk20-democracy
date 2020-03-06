import Vec2 from './vec2';
import { lerp } from './utils'

const CITIZEN_RADIUS = 5;
const ELECTED_RADIUS_MULTIPLIER = 1.5;
// Seconds it takes to grow when elected.
const ELECTION_PROCESS_LENGTH = 2; 
const TIME_BETWEEN_ELECTIONS = 4;

const CITIZEN_PADDING = 3;
const VELOCITY_HISTORY_LENGTH = 10;
const STILLNESS_LIMIT = 0.1;

const STATE_NORMAL = 0;
const STATE_BEING_ELECTED = 1;
const STATE_ELECTED = 2;

export default class Citizen {


    constructor(opinions, clusterId) {
        this.state = STATE_NORMAL;
        this.position = new Vec2();
        this.prevPosition = this.position.copy;
        this.velocity = new Vec2();
        this.opinions = opinions;
        this.clusterId = clusterId;
        this.radius = 5; //+ Math.random() * 10;

        this.k = 0.9;
        this.velocities = [];
        
        this.isAtRest = false;
        this.secondsAtRest = 0;
    }

    isNormal() {
        return this.state === STATE_NORMAL;
    }

    update(simulation, dt) {
        let cluster = simulation.clusters[this.clusterId];
        //this.velocities.push(this.velocity.length);
        this.velocities.push(Vec2.dist(this.prevPosition, this.position));
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

        this.prevPosition = this.position.copy;
        
        this.position.add(Vec2.mult(this.velocity, dt));

        //this.velocity = new Vec2();
        this.velocity.mult(0.8);

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
                if (cluster.restCount > Math.floor(cluster.citizenCount / 2) 
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
            diff.x * 0.00001 * (dist > cluster.radius ? 1.0 : dist / cluster.radius) * dt,
            diff.y * 0.00001 * (dist > cluster.radius ? 1.0 : dist / cluster.radius) * dt
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
                            )
        5 * (dt / 1000);
        if (this.electionTimer >= ELECTION_PROCESS_LENGTH) {
            this.radius = CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER;
            this.state = STATE_ELECTED;
            cluster.beingElectedCount--;
        }
    }

    updateElected(simulation, dt) {
        this.position.y += 25 * (dt / 1000);
        this.mass = 10000;
    }

    // Avoids citizens of other clusters.
    static avoid(citizenA, citizenB) {
        let oneIsElected = (!citizenA.isNormal() || !citizenB.isNormal()) && citizenA.isNormal() != citizenB.isNormal();
        if (citizenA.clusterId == citizenB.clusterId) return;
        let diff = Vec2.sub(citizenA.position, citizenB.position);
        let distSqrt = diff.sqlength;
        let radius = citizenA.radius + citizenB.radius + CITIZEN_PADDING * 2;
        if (distSqrt > radius * radius) return;
        let overlap = diff.length - radius;
        let m1 = citizenA.mass;//citizenA.radius * citizenA.radius * Math.PI;
        let m2 = citizenB.mass;//citizenB.radius * citizenB.radius * Math.PI;


        diff.setMag(1);
        diff.mult((overlap * m2) / (m1 + m2) * 0.1);
        citizenA.velocity.sub(diff);
        
        diff.setMag(1);
        diff.mult((-overlap * m1) / (m1 + m2) * 0.1);
        citizenB.velocity.add(diff);

    }

    static collide(citizenA, citizenB) {
        let diff = Vec2.sub(citizenA.position, citizenB.position);
        let distSqrt = diff.sqlength;
        let radius = citizenA.radius + citizenB.radius + CITIZEN_PADDING;
        if (distSqrt > radius * radius) return;

        let m1 = citizenA.mass;//citizenA.radius * citizenA.radius * Math.PI;
        let m2 = citizenB.mass;//citizenB.radius * citizenB.radius * Math.PI;
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

        if (Vec2.dot(diff, Vec2.sub(citizenA.velocity, citizenB.velocity)) < 0) return;

        diff.setMag(1);

        let vel1Perpendicular = Vec2.dot(diff, citizenA.velocity);
        let vel2Perpendicular = Vec2.dot(diff, citizenB.velocity);

        // Calculate the new perpendicular velocities
        let u1Perpendicular =
            (1 + k) *
                ((m1 * vel1Perpendicular + m2 * vel2Perpendicular) / (m1 + m2)) -
            k * vel1Perpendicular;
        let u2Perpendicular =
            (1 + k) *
                ((m1 * vel1Perpendicular + m2 * vel2Perpendicular) / (m1 + m2)) -
            k * vel2Perpendicular;

        
        citizenA.velocity = Vec2.mult(diff, u1Perpendicular);
        citizenB.velocity = Vec2.mult(diff, u2Perpendicular);
    }

}