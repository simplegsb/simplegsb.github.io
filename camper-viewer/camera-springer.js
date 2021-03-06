function CameraSpringer(canvasId, camera)
{
	this.camera = camera;
	this.mode = "free";
	this.offset = new sim.Vector3();
	this.pivot = new sim.Vector3();
	this.rotation = 0;
	this.speed = 0;
	this.yNew = 0;
	this.yOld = 0;

	$("#" + canvasId).mousedown(this.onMouseDown.bind(this));
	$("#" + canvasId).mousemove(this.onMouseMove.bind(this));
	$("#" + canvasId).mouseout(this.onMouseUp.bind(this));
	$("#" + canvasId).mouseup(this.onMouseUp.bind(this));
}

CameraSpringer.prototype.execute = function()
{
	if (this.mode === "free")
	{
		var acceleration = -this.rotation * sim.deltaTime * 0.005;

		// Dampening
		if (this.rotation > 0 && this.speed > 0 ||
			this.rotation < 0 && this.speed < 0)
		{
			acceleration *= 2.5;
		}

		this.speed += acceleration;
		this.rotation += this.speed;
	}
	else if (this.mode === "user")
	{
		this.rotation -= (this.yNew - this.yOld) / Math.max(Math.abs(this.rotation), 1);
		this.yOld = this.yNew;
	}

	this.camera.view = new sim.Matrix44();
	this.camera.view.translate(this.pivot[0], this.pivot[1], this.pivot[2]);
	this.camera.view.rotate(this.rotation, 1, 0, 0);
	this.camera.view.translate(this.offset[0], this.offset[1], this.offset[2]);
};

CameraSpringer.prototype.onMouseDown = function(event)
{
	event.preventDefault();

	this.mode = "user";
	this.yOld = event.pageY;
};

CameraSpringer.prototype.onMouseMove = function(event)
{
	this.yNew = event.pageY;
};

CameraSpringer.prototype.onMouseUp = function()
{
	this.mode = "free";
	this.speed = 0;
};

module.exports = CameraSpringer;
