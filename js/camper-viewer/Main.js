
function showGertrudeViewer()
{
	var canvas = document.getElementById("gertrudeCanvas");
	var renderingEngine = new RenderingEngine(canvas);

	var resizeCanvas = function()
	{
		var canvasWidth = Math.min(720, window.innerWidth * 0.4);
		if (window.innerWidth < 900)
		{
			canvasWidth = window.innerWidth * 0.9;
		}

		canvas.width = canvasWidth;
		canvas.height = canvas.width / 1.5;
		renderingEngine.onResize();
	};
	resizeCanvas();
	$(window).resize(resizeCanvas);

	renderingEngine.camera = new Camera();
	renderingEngine.camera.projection.perspective(30, 720 / 480, 1, 10000);
	renderingEngine.camera.projection.lookat(0, 0, 0, 0, 0, -1, 0, 1, 0);

	renderingEngine.pipeline = new AlphaPipeline("simpleVertexShader", "simpleFragmentShader");
	renderingEngine.pipeline.addPass("mirrorVertexShader", "mirrorFragmentShader");

	var scriptingEngine = new ScriptingEngine(canvas);

	Simplicity.engines.push(renderingEngine);
	Simplicity.engines.push(scriptingEngine);

	var cameraController = new Entity();
	cameraController.components.push(new CameraSpringer("gertrudeCanvas", renderingEngine.camera, [0, 0.55, 0],
		[0, 0, 4]));

	Simplicity.entities.push(cameraController);
	Simplicity.entities.push(createGertrude(renderingEngine.pipeline));

	Simplicity.play();
}

function createGertrude(pipeline)
{
	var gertrude = new Entity();
	gertrude.transform.translate(0, 0.05, 0);

	addPhoto(gertrude, "images/gertrude-exterior-back.png", 0.5, 0.5, [0, 0, -1.1], 180);
	addPhoto(gertrude, "images/gertrude-exterior-front.png", 0.5, 0.5, [0, 0, 1.1], 0);
	addPhoto(gertrude, "images/gertrude-exterior-left.png", 1, 0.5, [0.6, 0, 0], 90);
	addPhoto(gertrude, "images/gertrude-exterior-right.png", 1, 0.5, [-0.6, 0, 0], 270);

	gertrude.components.push(new Animator(gertrude, pipeline, "up"));
	gertrude.components.push(new Spinner("gertrudeCanvas", gertrude));

	return gertrude;
}

function addPhoto(entity, image, halfWidth, halfHeight, position, rotation)
{
	var frameWidth = 0.02;
	var halfFrameWidth = halfWidth + frameWidth;
	var halfFrameHeight = halfHeight + frameWidth;

	var photoOffset = [0, 0, 0];
	if (position[0] !== 0)
	{
		photoOffset[0] = position[0] / Math.abs(position[0]) * 0.001;
	}
	if (position[1] !== 0)
	{
		photoOffset[1] = position[1] / Math.abs(position[1]) * 0.001;
	}
	if (position[2] !== 0)
	{
		photoOffset[2] = position[2] / Math.abs(position[2]) * 0.001;
	}

	var photo = createPhotoRectangle(halfWidth, halfHeight, halfFrameHeight);
	photo.texture = loadImageTexture(gl, image);
	photo.transform.translate(position[0] + photoOffset[0], position[1] + photoOffset[1], position[2] + photoOffset[2]);
	photo.transform.rotate(rotation, 0, 1, 0);
	entity.components.push(photo);

	var frame = createPhotoRectangle(halfFrameWidth, halfFrameHeight, halfFrameHeight, [1, 1, 1, 1]);
	frame.transform.translate(position[0], position[1], position[2]);
	frame.transform.rotate(rotation, 0, 1, 0);
	entity.components.push(frame);

	var back = createPhotoRectangle(halfFrameWidth, halfFrameHeight, halfFrameHeight, [0.375, 0.375, 0.375, 1]);
	back.transform.translate(position[0], position[1], position[2]);
	back.transform.rotate(rotation + 180, 0, 1, 0);
	entity.components.push(back);
}

function createPhotoRectangle(halfWidth, halfHeight, yOffset, color)
{
	var rectangle = new Model();

	if (color === undefined)
	{
		color = [0, 0, 0, 1];
	}

	var colors = new Float32Array(16);
	colors[0] = color[0];
	colors[1] = color[1];
	colors[2] = color[2];
	colors[3] = color[3];
	colors[4] = color[0];
	colors[5] = color[1];
	colors[6] = color[2];
	colors[7] = color[3];
	colors[8] = color[0];
	colors[9] = color[1];
	colors[10] = color[2];
	colors[11] = color[3];
	colors[12] = color[0];
	colors[13] = color[1];
	colors[14] = color[2];
	colors[15] = color[3];

	rectangle.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, rectangle.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

	var indices = new Uint8Array([	0, 1, 2,
					0, 2, 3]);

	rectangle.indexBuffer = gl.createBuffer();
	rectangle.indexCount = indices.length;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rectangle.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	var normals = new Float32Array([0, 0, 1,
					0, 0, 1,
					0, 0, 1,
					0, 0, 1]);

	rectangle.normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, rectangle.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

	var texCoords = new Float32Array([	1, 0,
						0, 0,
						0, 1,
						1, 1]);

	rectangle.texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, rectangle.texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

	var vertices = new Float32Array([	halfWidth, halfHeight + yOffset, 0,
						-halfWidth, halfHeight + yOffset, 0,
						-halfWidth,-halfHeight + yOffset, 0,
						halfWidth,-halfHeight + yOffset, 0]);

	rectangle.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, rectangle.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	// Unbind buffers.
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return rectangle;
}
