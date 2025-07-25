export class TouchManager {
    private readonly is_id_left: { [id: number]: boolean } = {};
    private touches_left = 0;
    private touches_right = 0;

    public left = false;
    public right = false;

    public update(e: TouchEvent, down: boolean) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let to = e.changedTouches.item(i)!;
            // get left/right
            let left: boolean;
            if (down) {
                left = to.pageX > (e.target as HTMLCanvasElement).width / 2;
            } else {
                left = this.is_id_left[to.identifier];
            }
            // update left/right counter
            if (left) {
                this.touches_left += down ? 1 : -1;
            } else {
                this.touches_right += down ? 1 : -1;
            }
            // update map
            if (down) {
                this.is_id_left[to.identifier] = left;
            } else {
                delete this.is_id_left[to.identifier];
            }
        }
        // update output
        this.left = this.touches_left > 0;
        this.right = this.touches_right > 0;
    }
}