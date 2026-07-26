export type Stage = {
    stageTime: number,
    events: Array<Object>
}

const stages = [
    {
        stageTime: 120,
        events: [
            {

            }
        ]
    }
] satisfies Array<Stage>;

let currentStage = 0;

export function GetCurrentStage() {
    return currentStage;
}

export function SetNextStage(next: number) {
    currentStage = next;
}
