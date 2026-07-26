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

export function GetStage(stageNumber: number) {
    return stages[stageNumber];
}