var canvas: HTMLCanvasElement;
var context: CanvasRenderingContext2D;
var start_time: number | undefined = undefined;
var t: number = 0; // milliseconds


function draw() {
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);

    draw_line(0, 0, (t / 5000 * canvas.width) % canvas.width, canvas.height);
    context.translate(200, 200);
    context.rotate(t / 1000);
    context.fillRect(0, 0, 100, 100);
}

function draw_line(x1: number, y1: number, x2: number, y2: number) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function logic() {

}

function loop(now: number = 0) {
    console.log("loop");
    if (start_time === undefined) {
        // 1st run
        start_time = now;
    } else {
        t = now - start_time;
        logic();
        draw();
    }
    window.requestAnimationFrame(loop);
}

function resized() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function main() {
    document.body.removeChild(document.getElementById("noscript-text")!);
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    context = canvas.getContext("2d")!
    window.addEventListener("resize", resized);
    resized();
    loop();
}
