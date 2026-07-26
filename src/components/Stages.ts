export type Stage = {
    id: number
    stageTime: number,
    events: Array<Object>
}

const stages = [
    {
        id: 0,
        stageTime: 600,
        events: [
            {

            }
        ]
    },
    {
        id: 1,
        stageTime: 840,
        events: [
            {

            }
        ]
    },
    {
        id: 2,
        stageTime: 1200,
        events: [
            {

            }
        ]
    }
] satisfies Array<Stage>;

const endlessStage: Stage = {
    id: -1,
    stageTime: 999999999,
    events: [
        {

        }
    ]
}

const timerList = ["golen", "bluecone", "hourglass"];

let currentStage = 0;
let currentTimers: string[] = [];

export function GetTimerMasterList(){
    return timerList;
}

export function GetTimerList(){
    return currentTimers;
}

export function GetStage() {
    if(currentStage != -1){
        return stages[currentStage];
    } else {
        console.log("Returning endless stage");
        return endlessStage;
    }

}

export function GetCurrentStage() {
    return currentStage;
}

export function SetNextStage(next: number) {
    if(currentStage == -1){
        return;
    }
    currentStage = next;
    if(currentStage > 2){
        currentStage = -1;
    }
}

export function SetEndless() {
    currentStage = -1;
}

export function AddTimer(s: string) {
    currentTimers.push(s);
}

export function RestartStages(){
    currentTimers = [];
    currentStage = 0;
}
