var colorInverted = false;
var obstacleColor = "white"
var obstacleSize = 10
var obstacleShape = "sqaure"
var gaussSeidelConstant = 100

var mouseDown = false;
var tunnelDiameterFactor = 5 

var fluidVelocity = 2;
var eastTunnelActivated = true;
var westTunnelActivated = true;

var frameTimer = null
var initFrameValue = 0

var horizontalVelocityField = 0;
var verticalVelocityField = 1;
var smokeField = 2;

var multiRowIntersectionPoints = [
	[0.2 , 1.8 , 1.0 , 0.6 , 1.4 , 0.2 , 1.8 , 1.0 , 0.6 , 1.4 , 0.2 , 1.8 , 1.0 , 0.6 , 1.4],
	[0.5 , 0.5 , 0.5 , 0.5 , 0.5 , 0.8 , 0.8 , 0.8 , 0.8 , 0.8 , 0.2 , 0.2 , 0.2 , 0.2 , 0.2]
]

var singleRowIntersectionPoints = [
	[0.2 , 1.8 , 1.0 , 0.6 , 1.4],
	[0.5 , 0.5 , 0.5 , 0.5 , 0.5]
]

var movableObjectPoint = [
	[1.75],
	[0.5]
]

var obstacleType = "single"
var canvas , c , cScale  , simWidth
var simHeight = 1.1;


export var simulation = 
	{
		iterationCount : 100,
		overRelaxation : 1.9,
		obstacleX : singleRowIntersectionPoints[0],
		obstacleY : singleRowIntersectionPoints[1],
		obstacleRadius: 0.15,
		fluid: null,
		frameCounter : 0,
		gravity : -100.81,
		dt : 1.0 / 120.0,
	};


export function preSetupInitialization(screenHeight , screenWidth)
{
	document.getElementById("fluid-simulator-canvas").style.margin = "0"
	document.getElementById("fluid-simulator-canvas").style.padding= "0"
    canvas = document.getElementById("fluid-simulator-canvas");
    c = canvas.getContext("2d", { willReadFrequently: true })
    canvas.height = screenHeight - 90;
    canvas.width = screenWidth - 20 ;
    canvas.focus();
	cScale = canvas.height / simHeight;
	simWidth = canvas.width / cScale;
}


export function settingsInitialization(colorInvertedState , obsColor , obsSize , obsShape , gSConstant , tunnelDiamter , fVelocity , tunnelState , obsType)
{
   colorInverted = colorInvertedState
   obstacleColor = obsColor
   obstacleSize = obsSize / 100
   obstacleShape = obsShape
   simulation.obstacleRadius = obsSize / 100
   gaussSeidelConstant = gSConstant
   simulation.iterationCount = gaussSeidelConstant
   tunnelDiameterFactor = tunnelDiamter
   fluidVelocity = fVelocity
   eastTunnelActivated = tunnelState[0]
   westTunnelActivated = tunnelState[1]
   obstacleType = obsType
}

function index(x , y)
{
	return simulation.totalY * x + y
}

export class Fluid
{
constructor(horizontalCount, verticalCount, gSpacing) {
    this.totalX = horizontalCount ;  // Taking the number of x pixels
    this.totalY = verticalCount ; // Taking the number of y pixels
    this.total = horizontalCount * verticalCount; // Calculating X * Y

	this.velocityX = new Float64Array(horizontalCount * verticalCount); // X component of the velocity vector	
    this.velocityY = new Float64Array(horizontalCount * verticalCount); // Y component of the velocity vector
    this.updatedVelocityX = new Float64Array(horizontalCount * verticalCount); // updated X component of the velocity vector
    this.updatedVelocityY = new Float64Array(horizontalCount * verticalCount); // updated Y component of the velocity vector
    this.pressureField = new Float64Array(horizontalCount * verticalCount); // storing the pressure field 
    this.cellState = new Float64Array(horizontalCount * verticalCount); // used for identifying whether a cell is fluid or wall 
    this.minDiameterTunnel = new Float64Array(horizontalCount * verticalCount); // initializing the min diameter tunnel
    this.smokeField = new Float64Array(horizontalCount * verticalCount); // storing the smoke field 
    this.updatedSmokeField = new Float64Array(horizontalCount * verticalCount); // storing the updated smoke field

    this.gridSpacing = gSpacing; // Taking the grid spacing
    this.density = 5000 ; // Taking the density
    this.smokeField.fill(1) // Initializing the smoke field with 1
}

    velocityUpdation(timeDuration, g) 
	{ 
        for (var i = 1; i < this.totalX; i++) 
		{
            for (var j = 1; j < this.totalY-1; j++) 
			{
                if (this.cellState[index(i,j)] != 0.0 && this.cellState[index(i,j-1)] != 0.0)
				// making sure that the required cell is not a wall / obstacle 
				{
				    this.velocityX[index(i,j)] =  this.velocityX[index(i,j)] + g * timeDuration;
				    this.velocityY[index(i,j)] =  this.velocityY[index(i,j)] + g * timeDuration;
				}
            }	 
        }
    }

    projection(gaussSeidelConstant, deltaT) {

        var n = this.totalY;
        var cp = this.density * this.gridSpacing / deltaT;

        for (var iter = 0; iter < gaussSeidelConstant; iter++) {

            for (var i = 1; i < this.totalX-1; i++) {
                for (var j = 1; j < this.totalY-1; j++) {

                    if (this.cellState[i*n + j] == 0.0)
                        continue;

                    var stateXLeft = this.cellState[(i-1)*n + j];
                    var stateXRight = this.cellState[(i+1)*n + j];
                    var stateYDown = this.cellState[i*n + j-1];
                    var stateYUp = this.cellState[i*n + j+1];
                    var stateSummation = stateXLeft + stateXRight + stateYDown + stateYUp;

                    if (stateSummation == 0.0)
                        continue;

                    var divergence = 
					- this.velocityX[i*n + j] 
					+ this.velocityX[(i+1)*n + j]  
					- this.velocityY[i*n + j]
					+ this.velocityY[i*n + (j+1)] 

                    var rectifiedDivergence = -divergence / stateSummation;
                    rectifiedDivergence *= simulation.overRelaxation;
					this.velocityX[i*n + j] -= stateXLeft * rectifiedDivergence;
                    this.velocityX[(i+1)*n + j] += stateXRight * rectifiedDivergence;
                    this.velocityY[i*n + j] -= stateYDown * rectifiedDivergence;
                    this.velocityY[i*n + j+1] += stateYUp * rectifiedDivergence;



                    this.pressureField[i*n + j] = this.pressureField[i*n + j] + rectifiedDivergence * 
					(this.density * this.gridSpacing / deltaT);

                    
                }
            }
        }
    }

    extrapolate() { 
			var n = this.totalY;
			for (var i = 0; i < this.totalX; i++) {
				this.velocityX[i*n + 0] = this.velocityX[i*n + 1];
				this.velocityX[i*n + this.totalY-1] = this.velocityX[i*n + this.totalY-2]; 
			}
			for (var j = 0; j < this.totalY; j++) {
				this.velocityY[0*n + j] = this.velocityY[1*n + j];
				this.velocityY[(this.totalX-1)*n + j] = this.velocityY[(this.totalX-2)*n + j] 
			}
		}

        sampleField(x, y, field) 
        {
			var n = this.totalY;
			var h = this.gridSpacing;
			var h1 = 1.0 / h;
			var h2 = 0.5 * h;

			x = Math.max(Math.min(x, this.totalX * h), h);
			y = Math.max(Math.min(y, this.totalY * h), h);

			var dx = 0.0;
			var dy = 0.0;

			var f;

			switch (field) {
				case horizontalVelocityField: f = this.velocityX; dy = h2; break; // horizontal velocity field
				case verticalVelocityField: f = this.velocityY; dx = h2; break; // vertical velocity field 
				case smokeField: f = this.smokeField; dx = h2; dy = h2; break // smoke field  

			}

			// handling wall corner cases
			var x0 = Math.min(Math.floor((x-dx)*h1), this.totalX-1);
			var tx = ((x-dx) - x0*h) * h1;
			var x1 = Math.min(x0 + 1, this.totalX-1);
			
			var y0 = Math.min(Math.floor((y-dy)*h1), this.totalY-1);
			var ty = ((y-dy) - y0*h) * h1;
			var y1 = Math.min(y0 + 1, this.totalY-1);

			var sx = 1.0 - tx;
			var sy = 1.0 - ty;

			var val = sx*sy * f[x0*n + y0] +
				tx*sy * f[x1*n + y0] +
				tx*ty * f[x1*n + y1] +
				sx*ty * f[x0*n + y1];
			
			return val;
		}

        avgU(i, j) // returns the average u component value in the von neumonn neighbourhood of the cell 
         {
			var n = this.totalY;
			var u = (this.velocityX[i*n + j-1] + this.velocityX[i*n + j] +
				this.velocityX[(i+1)*n + j-1] + this.velocityX[(i+1)*n + j]) * 0.25;
			return u;
				
		}

        avgV(i, j) { // returns the average v component value in the von neuman neighbourhood of the cell 
			var n = this.totalY;
			var v = (this.velocityY[(i-1)*n + j] + this.velocityY[i*n + j] +
				this.velocityY[(i-1)*n + j+1] + this.velocityY[i*n + j+1]) * 0.25;
			return v;
		}
        advectVel(dt) {

			this.updatedVelocityX.set(this.velocityX);
			this.updatedVelocityY.set(this.velocityY);

			var n = this.totalY;
			var h = this.gridSpacing;
			var h2 = 0.5 * h;

			for (var i = 1; i < this.totalX; i++) {
				for (var j = 1; j < this.totalY; j++) {
					if (this.cellState[i*n + j] != 0.0 && this.cellState[(i-1)*n + j] != 0.0 && j < this.totalY - 1) {
						var x = i*h;
						var y = j*h + h2;
						var u = this.velocityX[i*n + j];
						var v = this.avgV(i, j);
						x = x - dt*u;
						y = y - dt*v;
						u = this.sampleField(x,y, horizontalVelocityField);
						this.updatedVelocityX[i*n + j] = u;
					}
					if (this.cellState[i*n + j] != 0.0 && this.cellState[i*n + j-1] != 0.0 && i < this.totalX - 1) {
						var x = i*h + h2;
						var y = j*h;
						var u = this.avgU(i, j);
						var v = this.velocityY[i*n + j];
						x = x - dt*u;
						y = y - dt*v;
						v = this.sampleField(x,y, verticalVelocityField);
						this.updatedVelocityY[i*n + j] = v;
					}
				}	 
			}

			this.velocityX.set(this.updatedVelocityX);
			this.velocityY.set(this.updatedVelocityY);
		}

		advectSmoke(dt) {

			this.updatedSmokeField.set(this.smokeField);

			var n = this.totalY;
			var h = this.gridSpacing;
			var h2 = 0.5 * h;

			for (var i = 1; i < this.totalX-1; i++) {
				for (var j = 1; j < this.totalY-1; j++) {

					if (this.cellState[i*n + j] != 0.0) {
						var u = (this.velocityX[i*n + j] + this.velocityX[(i+1)*n + j]) * 0.5;
						var v = (this.velocityY[i*n + j] + this.velocityY[i*n + j+1]) * 0.5;
						var x = i*h + h2 - dt*u;
						var y = j*h + h2 - dt*v;
						this.updatedSmokeField[i*n + j] = this.sampleField(x,y, smokeField); // change here 
 					}
				}	 
			}
			this.smokeField.set(this.updatedSmokeField);
		}

        simulate(dt, gravity, iterationCount) {

			this.velocityUpdation(dt, gravity);

			this.pressureField.fill(0.0);
			this.projection(iterationCount, dt);

			this.extrapolate();
			this.advectVel(dt);
			this.advectSmoke(dt);
		}
}

function cX(x) { // this basically takes in the x coordinates and makes it acc to the simulation screen
    return x * cScale;
}

function cY(y) { // takes in the y coordinate and makes it acc to the simulation screen (scaling)
    return canvas.height - y * cScale;
}
// all of the cX , cY , cScale are scaling factors which help to 
// scale down the simulation numbers which help in visualization
			


export function handleTunnelState()
{
	var f = simulation.fluid
	var n = f.totalY;
		for (var i = 0; i < f.totalX; i++) {
			for (var j = 0; j < f.totalY; j++) {
				if (i == 1 && !eastTunnelActivated) 
				{
					f.velocityX[i*n + j] = 0;
				}
				if(i == f.totalX - 1  && !westTunnelActivated)
				{
					f.velocityX[i*n + j] = 0;

				}
			}
	}
}

export function changeTunnelDiameter()
{
	if (!eastTunnelActivated && !westTunnelActivated)
		return

	var f = simulation.fluid

	for (var j = 0 ; j < 100; j++)
	{
		if (eastTunnelActivated)
			simulation.fluid.smokeField[j] = simulation.fluid.minDiameterTunnel[j]
		if (westTunnelActivated)
			simulation.fluid.smokeField[(f.totalX-1)*f.totalY + j] = simulation.fluid.minDiameterTunnel[j]

	}
	var pipeH = 0.05 * tunnelDiameterFactor * f.totalY; 
	var minJ = Math.floor(0.5 * f.totalY - 0.5*pipeH);
	var maxJ = Math.floor(0.5 * f.totalY + 0.5*pipeH);

	for (var j = minJ; j < maxJ; j++)
	{
		if (eastTunnelActivated)
			f.smokeField[j] = 0.0;
		if (westTunnelActivated)
			f.smokeField[(f.totalX-1)*f.totalY + j] = 0.0		
	}

}

export function changeFluidVelocity()
{

	var f = simulation.fluid
	var n = f.totalY;

	var inVel = fluidVelocity / 2.5;
			for (var i = 0; i < f.totalX; i++) {
				for (var j = 0; j < f.totalY; j++) {
					if (i == 1 && eastTunnelActivated) 
					{
						f.velocityX[i*n + j] = inVel;
					}
					if(i == f.totalX - 1 && westTunnelActivated)
					{
						f.velocityX[i*n + j] = -inVel;

					}
				}
			}
}


export function handleObstacleType()
{
	simulation.obstacleRadius = 0.09
	if (obstacleType == "movable")
	{
		simulation.obstacleX = movableObjectPoint[0]
		simulation.obstacleY = movableObjectPoint[1]
	}
	else if (obstacleType == "single")
	{
		simulation.obstacleX = singleRowIntersectionPoints[0]
		simulation.obstacleY = singleRowIntersectionPoints[1]
	}
	else if (obstacleType == "multi")
	{
		simulation.obstacleX = multiRowIntersectionPoints[0]
		simulation.obstacleY = multiRowIntersectionPoints[1]
	}
}

 export   function setupSimulation( ) 
	{
		simulation.obstacleRadius = obstacleSize;
		simulation.overRelaxation = 1.9; 
		
		simulation.dt = 1.0 / 60.0;
		simulation.iterationCount = 40;

		var res = 100;
		
		var domainHeight = 1.0;
		var domainWidth = domainHeight / simHeight * simWidth;
		var h = domainHeight / res;

		var numX = Math.floor(domainWidth / h);
		var numY = Math.floor(domainHeight / h);
	
		var density = 5500;

		var f = simulation.fluid = new Fluid(numX, numY, h );
		var n = f.totalY;

	
			var inVel = fluidVelocity / 2.5;
			for (var i = 0; i < f.totalX; i++) {
				for (var j = 0; j < f.totalY; j++) {
					var s = 1.0;	

					if (i == 0 || j == 0 || j == f.totalY-1 || i == f.totalX-1) 
						s = 0.0;	

					f.cellState[i*n + j] = s

					if (i == 1 && eastTunnelActivated) { // THIS IS THE LEFT  WALL 
						f.velocityX[i*n + j] = inVel;
					}
					if(i == f.totalX - 1 && westTunnelActivated) // THIS IS THE RIGHT WALL 
					{
						f.velocityX[i*n + j] = -inVel;

					}
					
				}
			}

			for (var j = 0  ; j < f.minDiameterTunnel.length ; j++) // copying the 1 data
			{
				f.minDiameterTunnel[j] = f.smokeField[j]
			}

			var pipeH = 0.05  * f.totalY; // making the minimum diameter tunnel 
			var minJ = Math.floor(0.5 * f.totalY - 0.5*pipeH);
			var maxJ = Math.floor(0.5 * f.totalY + 0.5*pipeH);
			for (var j = minJ; j < maxJ; j++)
				f.minDiameterTunnel[j] = 0.0;


			for (var j = 0 ; j < simulation.obstacleX.length ; j++)
			{
				setObstacle(simulation.obstacleX[j], simulation.obstacleY[j], true) // here we are supplying the initial x and the y coordinate 

			}
			simulation.gravity = 0.00;
	}


export	function getSciColor(val, minVal, maxVal) {
		var val = Math.min(Math.max(val, minVal), maxVal- 0.0001);
		var d = maxVal - minVal;
		val = d == 0.0 ? 0.5 : (val - minVal) / d;
		var m = 0.25;
		var num = Math.floor(val / m);
		var s = (val - num * m) / m;
		var r, g, b;

		switch (num) {
			case 0 : r = 0.0; g = s; b = 1.0; break;
			case 1 : r = 0.0; g = 1.0; b = 1.0-s; break;
			case 2 : r = s; g = 1.0; b = 0.0; break;
			case 3 : r = 1.0; g = 1.0 - s; b = 0.0; break;
		}

        return colorInverted ? [255-(255*r), 255-(255*g), 255-(255*b), 255]: [255*r,255*g,255*b, 255]
		
	}

export 	function draw() 
	{
		c.clearRect(0, 0, canvas.width, canvas.height);

		var f = simulation.fluid;
		var n = f.totalY;

		var cellScale = 1.1;

		var h = f.gridSpacing;

		var minP = f.pressureField[0];
		var maxP = f.pressureField[0];

		for (var i = 0; i < f.total; i++) {
			minP = Math.min(minP, f.pressureField[i]);
			maxP = Math.max(maxP, f.pressureField[i]);
		}

		var id = c.getImageData(0,0, canvas.width, canvas.height)

		var color = [255, 255, 255, 255]

		for (var i = 0; i < f.totalX; i++) {
			for (var j = 0; j < f.totalY; j++) {

					var p = f.pressureField[i*n + j];
					var s = f.smokeField[i*n + j];
					color = getSciColor(p, minP, maxP);
					
						color[0] = Math.max(0.0, color[0] - 255*s);
						color[1] = Math.max(0.0, color[1] - 255*s);
						color[2] = Math.max(0.0, color[2] - 255*s);
					
				var x = Math.floor(cX(i * h));
				var y = Math.floor(cY((j+1) * h));
				var cx = Math.floor(cScale * cellScale * h) + 1;
				var cy = Math.floor(cScale * cellScale * h) + 1;

				var r = color[0];
				var g = color[1];
				var b = color[2];

				for (var yi = y; yi < y + cy; yi++) {
					var p = 4 * (yi * canvas.width + x)

					for (var xi = 0; xi < cx; xi++) {
						id.data[p++] = r;
						id.data[p++] = g;
						id.data[p++] = b;
						id.data[p++] = 255;
					}
				}
			}
		}

		c.putImageData(id, 0, 0);

		
			r = simulation.obstacleRadius + f.gridSpacing;


			for (var j = 0 ; j < simulation.obstacleX.length ; j++)
		{
			if (obstacleShape == "circle")
			{
			    c.fillStyle = obstacleColor
				// drawing the obstacle circle
				c.beginPath();	// begin path is used to start the path
				c.arc( // x pos , y pos , radius , start angle , end angle
				cX(simulation.obstacleX[j]), cY(simulation.obstacleY[j]), cScale * r,0.00,2* Math.PI); 
				c.closePath(); // clsoe path is used to end / close the path 
				c.fill();

				// drawing the outer radial border
				c.lineWidth = 2.0;
				c.strokeStyle = obstacleColor;
				c.beginPath();	
				c.arc(
					cX(simulation.obstacleX[j]), cY(simulation.obstacleY[j]), cScale * r, 0.0, 2.0 * Math.PI); 
				c.closePath();
				c.stroke();
			}
			// all of the cX , cY , cScale are scaling factors which help to 
			// scal	e down the simulation numbers which help in visualization

			else if (obstacleShape == "square")
			{
				var centreCoordX = cX(simulation.obstacleX[j])
				var centreCoordY = cY(simulation.obstacleY[j])
				var startingCoordX = centreCoordX - cScale * r
				var startingCoordY = centreCoordY - cScale * r
				c.fillStyle = obstacleColor
				c.beginPath();
				c.rect(startingCoordX, startingCoordY, cScale *2* r , cScale*2 * r);
				c.closePath();
				c.fill();
			}

		}

		

	}

export	function setObstacle(x = simulation.obstacleX[0] , y = simulation.obstacleY[0] , reset = true , movable = false) {
		var vx = 0.0;
		var vy = 0.0;
		if (movable)
		{
			if (!reset) {
				vx = (x - simulation.obstacleX[0]) / simulation.dt;
				vy = (y - simulation.obstacleY[0]) / simulation.dt;
			}

		}
		var r = simulation.obstacleRadius ;
		var f = simulation.fluid;
		var n = f.totalY;

		for (var i = 1; i < f.totalX-2; i++) {
			for (var j = 1; j < f.totalY-2; j++) {

				f.cellState[i*n + j] = 1.0;

			}
		}
		for (var k  = 0 ; k < simulation.obstacleX.length; k++ )
		{
			if (reset)
			{

				x = simulation.obstacleX[k] 
				y = simulation.obstacleY[k] 
	
			}
		for (var i = 1; i < f.totalX-2; i++) {
			for (var j = 1; j < f.totalY-2; j++) {

				var dx = (i + 0.5) * f.gridSpacing - x;
				var dy = (j + 0.5) * f.gridSpacing - y;


				if (obstacleShape == "circle")
				{
					if (dx * dx + dy * dy < r * r) // eqn of a circle : x2 + y2 < r2 
					{
						f.cellState[i*n + j] = 0.0;
						f.smokeField[i*n + j] = 1.0;
						f.velocityX[i*n + j] = vx;
						f.velocityX[(i+1)*n + j] = vx;
						f.velocityY[i*n + j] = vy;
						f.velocityY[i*n + j+1] = vy;
					}
				}
				else if (obstacleShape == "square")
				{
					if ( Math.abs(dx + dy)   + Math.abs(dx - dy) < 2 * r ) // eqn of a sqaure : |x+y| + |x-y| < side length
					{
						f.cellState[i*n + j] = 0.0;
						f.smokeField[i*n + j] = 1.0;
						f.velocityX[i*n + j] = vx;
						f.velocityX[(i+1)*n + j] = vx;
						f.velocityY[i*n + j] = vy;
						f.velocityY[i*n + j+1] = vy;
					}
				}			
			}
		}
	}
		
	}

export function simulate() 
	{
			simulation.fluid.simulate(simulation.dt, simulation.gravity, simulation.iterationCount)
			simulation.frameCounter += 1;
			if (frameTimer == null)
			{
				initFrameValue = simulation.frameCounter
				frameTimer = setTimeout(() => {
				var fps = (simulation.frameCounter - initFrameValue)*2
				if (fps < 20)
				{
					document.getElementById("frame-display").innerText = `Frame Rate : ${(fps)} FPS ⚠️ `
					document.getElementById("frame-display").style.color = "red"
				}
				else
				{
					document.getElementById("frame-display").innerText = `Frame Rate : ${(fps)} FPS `
					document.getElementById("frame-display").style.color = "white"
				}
				frameTimer = null
				},500)
			}
	}

export	function update() {
		simulate();
		draw();
		requestAnimationFrame(update);
	}


export	function startDrag(x, y) {

		let bounds = canvas.getBoundingClientRect();
		let mx = x - bounds.left - canvas.clientLeft;
		let my = y - bounds.top - canvas.clientTop;
		mouseDown = true;
		x = mx / cScale;
		y = (canvas.height - my) / cScale;
		setObstacle(x,y, true  ,true);
	}

	export	function drag(x, y) {
		if (mouseDown) {
			let bounds = canvas.getBoundingClientRect();
			let mx = x - bounds.left - canvas.clientLeft;
			let my = y - bounds.top - canvas.clientTop;
			x = mx / cScale;
			y = (canvas.height - my) / cScale;
			simulation.obstacleX[0] = x
			simulation.obstacleY[0] = y
			setObstacle(x,y, false , true);
		}
	}

	export	function endDrag() {
		mouseDown = false;
	}
