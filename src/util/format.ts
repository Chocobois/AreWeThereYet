export function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.ceil(time) % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}