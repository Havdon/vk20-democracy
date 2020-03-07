
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function getCanvas() {
      const canvas = document.getElementById('vk20-democracy-canvas');
      if (!canvas) {
          throw new Error('Cannot find canvas with id "vk20-democracy-canvas"');
      }
      if (canvas.tagName.toLowerCase() !== 'canvas') {
          throw new Error('Element with id "vk20-democracy-canvas" is not of type "canvas"');
      }
      return canvas;
  }


  /**
   * Starts a fixed timestep update loop.
   * @param {*} updateFn Update callback, will be called multiple times per animation frame.
   * @param {*} renderFn Render callback, will be called only once per animation frame
   */
  function startUpdateLoop(updateFn, renderFn) {
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
          if (delta > timestep * maxFPS) {
              delta = timestep * maxFPS;
          }
          lastFrameTimeMs = timestamp;

          var numUpdateSteps = 0;
          while (delta >= timestep) {
              updateFn(timestep);
              delta -= timestep;
              if (++numUpdateSteps >= 240) {
                  delta = 0;
                  break;
              }
          }
          renderFn();
          window.requestAnimationFrame(mainLoop);
      }
      window.requestAnimationFrame(mainLoop);
  }

  function lerp(v0, v1, t) {
      return v0 * (1 - t) + v1 * t
  }

  const multiplier = Math.sqrt(3)/2;
  function drawEqTriangle(ctx, side, cx, cy){
      
      var h = side * multiplier;
      ctx.save();
      ctx.translate(cx, cy);
    
      ctx.beginPath();
          
          ctx.moveTo(0, -h / 2);
          ctx.lineTo( -side / 2, h / 2);
          ctx.lineTo(side / 2, h / 2);
          ctx.lineTo(0, -h / 2);
          
          ctx.stroke();
          
      ctx.closePath();
      ctx.restore();

  }

  const CANVAS_OPACITY =  0.2;

  const POPULATION_SIZE = 1000;
  const CITIZENS_PER_REP = 10;

  // Number of opinions that citizens have
  const OPINION_COUNT = 5;

  // How close to the window edges citizens can spawn
  const BORDER_PADDING = 10;

  // Radius of the inner circle of the parliament formation.
  const PARLIAMENT_RADIUS = 80;

  // Multiplier for spacing between seats
  const PARLIAMENT_SPACING = 1.2;

  // Number of clusters
  const MIN_CLUSTERS = 2;
  const MAX_CLUSTERS = 5;

  // Radius of a citizen
  const CITIZEN_RADIUS = 5;

  // Let's keep a respectable distance between citizens.
  const CITIZEN_PADDING = 5;

  // How much bigger an elected official is
  const ELECTED_RADIUS_MULTIPLIER = 1.75;

  // Seconds it takes to grow when elected.
  const ELECTION_PROCESS_LENGTH = 2; 

  // Seconds between elections
  const TIME_BETWEEN_ELECTIONS = 8;

  // Percentage of a cluster that have to be at rest to allow for elections.
  const MIN_ELECTORATE_SIZE = 0.7;

  // Max speed anyone can move.
  const SPEED_LIMIT = 0.05;

  const AIR_FRICTION = 0.8;

  // Number of velocity reading stored for sleep detection.
  const VELOCITY_HISTORY_LENGTH = 10;

  // Avg velocity over history has to be below this for a citizen to be asleep.
  const STILLNESS_LIMIT = 0.01;

  function kmeans(vector, k, callback) { 
      if (!vector || !k || !callback) throw new Error(
              "Provide 3 arguments: callback, vector, clusters")
      
      return new Kmeans(vector, k, callback)
  }

  // Initialize
  // ----------
  function Kmeans (vector, k, callback) {
      //**Vector:** array of arrays. Inner array
      //represents a multidimensional data point (vector)  
      //*These should be normalized*
      this.callback = callback;
      this.vector = vector; 
      //**K:** represents the number of groups/clusters into 
      //which the vectors will be grouped
      this.k = k;
      //Initialize the centroids and clusters     
      //**Centroids:** represent the center of each cluster. 
      //They are taken by averaging each dimension of the vectors
      this.centroids = new Array(k);
      this.cluster = new Array(k); 

      //Create centroids and place them randomly because 
      //we don't yet know where the vectors are most concentrated
      this.createCentroids();
      
      this.iterate(this.centroids.slice(0));
  }

  // Assign vector to each centroid
  // ----------
  // Randomly choose **k** vectors from the vector 
  // array **vector**. These represent our guess 
  // at where clusters may exist. 
  Kmeans.prototype.createCentroids = function () {
      var randomArray = this.vector.slice(0);
      var self = this;
      randomArray.sort(function() {
          return (Math.floor(Math.random() * self.vector.length))
      });
      this.centroids = randomArray.slice(0, this.k);
  };

  // Recursively cluster and move the centroids
  // ----------
  //This method groups vectors into clusters and then determine the 
  //the new location for each centroid based upon the mean
  //location of the vectors in the cooresponding cluster
  Kmeans.prototype.iterate = function (vecArray) {
     
      this.cluster = new Array(this.k); 
      
      var tempArray = [];    
      for (var a=0; a<this.vector[0].length; a++) {
          tempArray.push(0);
      }
      var vecArray = [];
      for (var a=0; a<this.k; a++) {
          vecArray[a] = (tempArray.slice(0));
      }
      //Group each vector to a cluster based upon the 
      //cooresponding centroid
      for (var i in this.vector) {
          var v = this.vector[i].slice(0);
          var index = this.assignCentroid(v);
          
          if (!this.cluster[index]) this.cluster[index]=[];
              this.cluster[index].push(v);

          for (var a=0; a<v.length; a++){
              vecArray[index][a]+=v[a]; //keep a sum for cluster
          }
      }

      //Calculate the mean values for each cluster.
      var distance 
          , max = 0; 
     
      for (var a=0; a<this.k; a++) {
          
          var clusterSize = 0; //cluster is empty
          if (this.cluster[a]) clusterSize = this.cluster[a].length;
          
          for (var b in vecArray[a]) {
              vecArray[a][b] = vecArray[a][b]/clusterSize;
          }
          distance = this.distance(vecArray[a], this.centroids[a]);
          if (distance>max) 
              max=distance;
      }
      
      if (max<=0.5)
          return this.callback(null, this.cluster, this.centroids)
         
      //For each centroid use the mean calculated for the 
      //corresponding cluster (effectively "moving" the centroid
      //to its new "location")
      for (var z in vecArray) {
          this.centroids[z] = vecArray[z].slice(0);
      }
      this.iterate(vecArray);

  };


  // Determine the closest centroid to a vector
  // ----------
  Kmeans.prototype.assignCentroid = function (point) {
      var min = Infinity
          , res = 0;

      //For each vector we determine the distance to the 
      //nearest centroid. The vector is assigned to the 
      //cluster that corresponds to the nearest centroid.
      for (var i in this.centroids) {
          var dist = this.distance(point, this.centroids[i]);
          if (dist < min) {
              min = dist;
              res = i;       
          }
      }
      return res
  };

  // Calculate euclidian distance between vectors
  // ----------
  Kmeans.prototype.distance = function(v1, v2) {
      var total = 0;
      for (var c in v1) {
          if (c!=0)
          total += Math.pow(v2[c]-v1[c], 2);
      }
      return Math.sqrt(total)
  };

  /*
   * Javascript Quadtree 
   * @version 1.2.1
   * @licence MIT
   * @author Timo Hausmann
   * https://github.com/timohausmann/quadtree-js/
   */
   
  /*
  Copyright © 2012-2020 Timo Hausmann

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */
       
  /*
      * Quadtree Constructor
      * @param Object bounds            bounds of the node { x, y, width, height }
      * @param Integer max_objects      (optional) max objects a node can hold before splitting into 4 subnodes (default: 10)
      * @param Integer max_levels       (optional) total max levels inside root Quadtree (default: 4) 
      * @param Integer level            (optional) deepth level, required for subnodes (default: 0)
      */
  function Quadtree(bounds, max_objects, max_levels, level) {
      
      this.max_objects    = max_objects || 10;
      this.max_levels     = max_levels || 4;
      
      this.level  = level || 0;
      this.bounds = bounds;
      
      this.objects    = [];
      this.nodes      = [];
  }

  /*
      * Split the node into 4 subnodes
      */
  Quadtree.prototype.split = function() {
      
      var nextLevel   = this.level + 1,
          subWidth    = this.bounds.width/2,
          subHeight   = this.bounds.height/2,
          x           = this.bounds.x,
          y           = this.bounds.y;        
      
      //top right node
      this.nodes[0] = new Quadtree({
          x       : x + subWidth, 
          y       : y, 
          width   : subWidth, 
          height  : subHeight
      }, this.max_objects, this.max_levels, nextLevel);
      
      //top left node
      this.nodes[1] = new Quadtree({
          x       : x, 
          y       : y, 
          width   : subWidth, 
          height  : subHeight
      }, this.max_objects, this.max_levels, nextLevel);
      
      //bottom left node
      this.nodes[2] = new Quadtree({
          x       : x, 
          y       : y + subHeight, 
          width   : subWidth, 
          height  : subHeight
      }, this.max_objects, this.max_levels, nextLevel);
      
      //bottom right node
      this.nodes[3] = new Quadtree({
          x       : x + subWidth, 
          y       : y + subHeight, 
          width   : subWidth, 
          height  : subHeight
      }, this.max_objects, this.max_levels, nextLevel);
  };


  /*
      * Determine which node the object belongs to
      * @param Object pRect      bounds of the area to be checked, with x, y, width, height
      * @return Array            an array of indexes of the intersecting subnodes 
      *                          (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
      */
  Quadtree.prototype.getIndex = function(pRect) {
      
      var indexes = [],
          verticalMidpoint    = this.bounds.x + (this.bounds.width/2),
          horizontalMidpoint  = this.bounds.y + (this.bounds.height/2);    

      var startIsNorth = pRect.y < horizontalMidpoint,
          startIsWest  = pRect.x < verticalMidpoint,
          endIsEast    = pRect.x + pRect.width > verticalMidpoint,
          endIsSouth   = pRect.y + pRect.height > horizontalMidpoint;    

      //top-right quad
      if(startIsNorth && endIsEast) {
          indexes.push(0);
      }
      
      //top-left quad
      if(startIsWest && startIsNorth) {
          indexes.push(1);
      }

      //bottom-left quad
      if(startIsWest && endIsSouth) {
          indexes.push(2);
      }

      //bottom-right quad
      if(endIsEast && endIsSouth) {
          indexes.push(3);
      }
      
      return indexes;
  };


  /*
      * Insert the object into the node. If the node
      * exceeds the capacity, it will split and add all
      * objects to their corresponding subnodes.
      * @param Object pRect        bounds of the object to be added { x, y, width, height }
      */
  Quadtree.prototype.insert = function(pRect) {
      
      var i = 0,
          indexes;
          
      //if we have subnodes, call insert on matching subnodes
      if(this.nodes.length) {
          indexes = this.getIndex(pRect);
      
          for(i=0; i<indexes.length; i++) {
              this.nodes[indexes[i]].insert(pRect);     
          }
          return;
      }
      
      //otherwise, store object here
      this.objects.push(pRect);

      //max_objects reached
      if(this.objects.length > this.max_objects && this.level < this.max_levels) {

          //split if we don't already have subnodes
          if(!this.nodes.length) {
              this.split();
          }
          
          //add all objects to their corresponding subnode
          for(i=0; i<this.objects.length; i++) {
              indexes = this.getIndex(this.objects[i]);
              for(var k=0; k<indexes.length; k++) {
                  this.nodes[indexes[k]].insert(this.objects[i]);
              }
          }

          //clean up this node
          this.objects = [];
      }
      };
      
      
  /*
      * Return all objects that could collide with the given object
      * @param Object pRect        bounds of the object to be checked { x, y, width, height }
      * @Return Array            array with all detected objects
      */
  Quadtree.prototype.retrieve = function(pRect) {
          
      var indexes = this.getIndex(pRect),
          returnObjects = this.objects;
          
      //if we have subnodes, retrieve their objects
      if(this.nodes.length) {
          for(var i=0; i<indexes.length; i++) {
              returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(pRect));
          }
      }

      //remove duplicates
      returnObjects = returnObjects.filter(function(item, index) {
          return returnObjects.indexOf(item) >= index;
      });
      
      return returnObjects;
  };


  /*
      * Clear the quadtree
      */
  Quadtree.prototype.clear = function() {
      
      this.objects = [];
      
      for(var i=0; i < this.nodes.length; i++) {
          if(this.nodes.length) {
              this.nodes[i].clear();
              }
      }

      this.nodes = [];
  };

  class Vec2 {
    /**
     * Create a vector.
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     */
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }

    /**
     * Get a copy of the vector.
     * @return {Vec2} The copy.
     */
    get copy() {
      return new Vec2(this.x, this.y);
    }

    /**
     * Get the length of the vector.
     * @return {number} The length.
     */
    get length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Get the length of the vector squared.
     * @return {number} The length squared.
     */
    get sqlength() {
      return this.x * this.x + this.y * this.y;
    }

    /**
     * Get the heading of the vector compared to (1, 0).
     * @return {number} The angle between (1, 0)
     * and the vector in anticlockwise direction.
     */
    get heading() {
      if (this.x === 0 && this.y === 0) return 0;
      if (this.x === 0) return this.y > 0 ? Math.PI / 2 : 1.5 * Math.PI;
      if (this.y === 0) return this.x > 0 ? 0 : Math.PI;
      let v = Vec2.normalized(this);
      if (this.x > 0 && this.y > 0) return Math.asin(v.y);
      if (this.x < 0 && this.y > 0) return Math.asin(-v.x) + Math.PI / 2;
      if (this.x < 0 && this.y < 0) return Math.asin(-v.y) + Math.PI;
      if (this.x > 0 && this.y < 0) return Math.asin(v.x) + 1.5 * Math.PI;
      return 0;
    }

    /**
     * Adds another vector to the vector.
     * @param {Vec2} a - The other vector.
     */
    add(a) {
      this.x += a.x;
      this.y += a.y;
    }

    /**
     * Subtracts another vector from the vector.
     * @param {Vec2} a - The other vector.
     */
    sub(a) {
      this.x -= a.x;
      this.y -= a.y;
    }

    /**
     * Multiplies the vector by a scalar.
     * @param {number} x - The scalar.
     */
    mult(x) {
      this.x *= x;
      this.y *= x;
    }

    /**
     * Divides the vector by a scalar.
     * @param {number} x - The scalar.
     */
    div(x) {
      this.x /= x;
      this.y /= x;
    }

    /**
     * Linearry interpolates the vector into the other vector by scalar x.
     * @param {Vec2} other - The other vector.
     * @param {number} x - The scalar.
     */
    lerp(other, x) {
      this.x += (other.x - this.x) * x;
      this.y += (other.y - this.y) * x;
    }

    /**
     * Get the distance between the vector and the other vector.
     * Vectors are representing points here.
     * @param {Vec2} other - The other vector.
     * @return {number} The distance between them.
     */
    dist(other) {
      return new Vec2(this.x - other.x, this.y - other.y).length;
    }

    /**
     * Set the length of the vector.
     * @param {number} l - The new length value.
     */
    setMag(l) {
      if (this.length === 0) return;
      this.mult(l / this.length);
    }

    /**
     * Rotate the vector anticlockwise.
     * @param {number} angle - Rotation angle.
     */
    rotate(angle) {
      let h = this.heading;
      let v = Vec2.fromAngle(angle + h);
      v.mult(this.length);
      this.x = v.x;
      this.y = v.y;
    }

    // Static functions:
    /**
     * Add two vectors together.
     * @param {Vec2} a - Vector.
     * @param {Vec2} b - Other vector.
     * @return {Vec2} The sum of the vectors.
     */
    static add(a, b) {
      return new Vec2(a.x + b.x, a.y + b.y);
    }

    /**
     * Subtracts one vector from another.
     * @param {Vec2} a - Vector.
     * @param {Vec2} b - Other vector.
     * @return {Vec2} The subtraction of the vectors.
     */
    static sub(a, b) {
      return new Vec2(a.x - b.x, a.y - b.y);
    }

    /**
     * Multiply the vector by a scalar.
     * @param {Vec2} v - Vector.
     * @param {number} x - Scalar.
     * @return {Vec2} The multiplied vector.
     */
    static mult(v, x) {
      return new Vec2(v.x * x, v.y * x);
    }

    /**
     * Divide the vector by a scalar.
     * @param {Vec2} v - Vector.
     * @param {number} x - Scalar.
     * @return {Vec2} The divided vector.
     */
    static div(v, x) {
      return new Vec2(v.x / x, v.y / x);
    }

    /**
     * Create a unit vector from an angle.
     * @param {number} a - The angle.
     * @return {Vec2} The created vector.
     */
    static fromAngle(a) {
      return new Vec2(Math.cos(a), Math.sin(a));
    }

    /**
     * Linearry interpolates a vector into another vector by scalar x.
     * @param {Vec2} a - A vector.
     * @param {Vec2} b - Other vector.
     * @param {number} x - The scalar.
     * @return {Vec2} The created vector.
     */
    static lerp(a, b, x) {
      return Vec2.add(a, Vec2.mult(Vec2.sub(b, a), x));
    }

    /**
     * Get the distance between vectors.
     * @param {Vec2} a - A vector.
     * @param {Vec2} b - Other vector
     * @return {number} The distance between them.
     */
    static dist(a, b) {
      return Vec2.sub(a, b).length;
    }

    /**
     * Get the dot product of two vectors.
     * @param {Vec2} a - A vector.
     * @param {Vec2} b - Other vector
     * @return {number} The dot product of them.
     */
    static dot(a, b) {
      return a.x * b.x + a.y * b.y;
    }

    /**
     * Get the cross product of two vectors.
     * @param {Vec2} a - A vector.
     * @param {Vec2} b - Other vector
     * @return {number} The cross product of them.
     */
    static cross(a, b) {
      return a.x * b.y - a.y * b.x;
    }

    /**
     * Get the angle between two vectors.
     * @param {Vec2} a - A vector.
     * @param {Vec2} b - Other vector
     * @return {number} Angle between them.
     */
    static angle(a, b) {
      return Math.acos(Vec2.dot(a, b) / Math.sqrt(a.sqlength * b.sqlength));
    }

    /**
     * Get the angle between two vectors but in the anticlockwise direction.
     * @param {Vec2} a - A vector.
     * @param {Vec2} b - Other vector
     * @return {number} Angle between them.
     */
    static angleACW(a, b) {
      let ah = a.heading;
      let bh = b.heading;
      let angle = bh - ah;
      return angle < 0 ? 2 * Math.PI + angle : angle;
    }

    /**
     * Get a vector with the same heading with the input vector
     * but with length = 1.
     * @param {Vec2} v - A vector.
     * @return {Vec2} Vector with length = 0.
     */
    static normalized(v) {
      let l = v.length;
      return l === 0 ? v : new Vec2(v.x / l, v.y / l);
    }

    /**
     * @return {Object} The vector represented in a JS object
     * Ready to be converted into JSON
     */
    toJSObject() {
      let ret = {};

      ret.x = this.x;
      ret.y = this.y;

      return ret;
    }

    /**
     * Creates a Vec2 class from the given object
     * @param {Object} obj The object to create the class from
     * @return {Vec2} The Vec2 object
     */
    static fromObject(obj) {
      return new Vec2(obj.x, obj.y);
    }
  }

  const STATE_NORMAL = 0;
  const STATE_BEING_ELECTED = 1;
  const STATE_ELECTED = 2;

  class Citizen {


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
          );
          this.mass = dist;
      }

      updateBeingElected(simulation, dt) {
          this.electionTimer += dt / 1000;
          let cluster = simulation.clusters[this.clusterId];
          this.radius = lerp( CITIZEN_RADIUS, 
                              CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER, 
                              this.electionTimer / ELECTION_PROCESS_LENGTH
                              ) * this.scale;
          if (this.electionTimer >= ELECTION_PROCESS_LENGTH) {
              this.radius = CITIZEN_RADIUS * ELECTED_RADIUS_MULTIPLIER  * this.scale;
              this.state = STATE_ELECTED;
              this.seat = cluster.seats.splice(0, 1)[0];
              cluster.beingElectedCount--;
          }
      }

      updateElected(simulation, dt) {

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

  function initSimulation(canvas, centerOn) {

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
      };

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
              };
              seatsGiven += cluster.representativeMaxCount;
              clusters.push(cluster);
          }

          // If too few seats were given, we give the remaining to the last cluster.
          if (seatsGiven < res.length) {
              clusters[clusters.length - 1].representativeMaxCount += res.length - seatsGiven;
          }
      });
      for (var i = 0; i < clusters.length; i++) {
          const cluster = clusters[i];
          for (var j = 0; j < cluster.opinions.length; j++) {
              let citizen = new Citizen(cluster.opinions[j], i, scale);
              citizen.position.x = BORDER_PADDING + Math.random() * (window.innerWidth - BORDER_PADDING * 2);
              citizen.position.y = BORDER_PADDING + Math.random() * (window.innerHeight - BORDER_PADDING * 2);
              citizen.index = citizens.length;
              citizens.push(citizen);
          }
      }
      
      console.log(citizens);

      const simulation = {
          citizens,
          clusters,
          parliament
      };

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
          });
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
              let other = elements[j].citizen;
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
  function render(canvas, ctx, simulation) {
      const { citizens, clusters, parliament } = simulation;


      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      citizens.forEach((citizen) => {
          let { position, clusterId, radius, col } = citizen;
          ctx.beginPath();
          switch (clusterId + ( 0)) {
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
          let diff = Vec2.sub(a, parliament.position);
          let aDist = diff.length;
          diff.setMag(1);
          let angleA = diff.heading * 57.2958;

          diff = Vec2.sub(b, parliament.position);
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

  function handleOnLoad() {

      const canvas = getCanvas();
      canvas.style = `pointer-events: none; margin: 0; padding: 0; width: 100%; height: 100%; position: absolute; z-index: 6; opacity: ${CANVAS_OPACITY};`;

      let centerOn = canvas.getAttribute('data-center-on');
      if (centerOn != null) {
          let result = document.querySelector(centerOn);
          if (result == null) {
              throw new Error(`Invalid data-center-on, querySelector returns null for ${centerOn}`);
          }
          centerOn = result;
      }

      handleOnResize();
      initSimulation(canvas, centerOn);


      // Handle window resizing.
      function handleOnResize() {
          canvas.setAttribute('width', window.innerWidth);
          canvas.setAttribute('height', window.innerHeight);
      }
      
      window.onresize = handleOnResize;
  }

  window.addEventListener('load', handleOnLoad);

})));
