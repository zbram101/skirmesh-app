const REGISTER = 0x01;
const QUERY    = 0x02;
const PAIR_UID = 0x03;
const CAPTURE  = 0x0A;
const MEDIC    = 0x0E;
const BOMB     = 0xBB;


export class DeviceSettings {

    id:             number;
    enabled:        boolean;
    address:        string;
    location:       string;
    gameID:         number;
    medic:          MedicSettings;
    bomb:           BombSettings;
    capture:        CaptureSettings;
    queryPlayer:    QueryPlayerSettings;
    registerPlayer: RegisterPlayer;

    constructor(
        id:             number,
        enabled:        boolean,
        address:        string,
        location:       string,
        gameID:         number              = null,
        medic:          MedicSettings       = new MedicSettings(),
        bomb:           BombSettings        = new BombSettings(),
        capture:        CaptureSettings     = new CaptureSettings(),
        registerPlayer: RegisterPlayer      = new RegisterPlayer(),
        queryPlayer:    QueryPlayerSettings = new QueryPlayerSettings()
    ) {
        this.id             = id;
        this.enabled        = enabled;
        this.address        = address;
        this.location       = location;
        this.gameID         = gameID;
        this.medic          = medic;
        this.bomb           = bomb;
        this.capture        = capture;
        this.registerPlayer = registerPlayer;
        this.queryPlayer    = queryPlayer;
    }

    toJSON() {

        return {
            id:          this.id,
            enabled:     this.enabled,
            address:     this.address,
            location:    this.location,
            gameID:      this.gameID,
            teamID:      this.registerPlayer.teamID,

            config:      this.medic.enabled              ? MEDIC    :
                             this.capture.enabled        ? CAPTURE  :
                             this.bomb.enabled           ? BOMB     :
                             this.registerPlayer.enabled ? REGISTER :
                             this.queryPlayer.enabled    ? QUERY    :
                             QUERY,

            cap_time:    this.capture.cap_time,
            cap_asst:    this.capture.cap_asst,
            point_scale: this.capture.point_scale,

            allow_medic: this.capture.allow_medic,
            med_time:    this.medic.medTime,

            bomb_time:   this.bomb.bomb_time,
            arm_time:    this.bomb.arm_time,
            diff_time:   this.bomb.diff_time
        }

    }
}


export class MedicSettings {

    enabled: boolean;
    medTime: number;

    constructor(
        enabled: boolean = false,
        medTime: number  = 6
    ) {
        this.enabled = enabled;
        this.medTime = medTime;
    }
}


export class BombSettings {

    enabled:   boolean;
    arm_time:  number;
    bomb_time: number;
    diff_time: number;

    constructor(
        enabled:   boolean  = false,
        arm_time:  number   = 1,
        bomb_time: number   = 12,
        diff_time: number   = 3
    ) {
        this.enabled   = enabled;
        this.arm_time  = arm_time;
        this.bomb_time = bomb_time;
        this.diff_time = diff_time;
    }
}


export class CaptureSettings {

    enabled:     boolean;
    cap_time:    number;
    cap_asst:    number;
    point_scale: number;
    allow_medic: boolean;

    constructor(
        enabled:     boolean  = false,
        cap_time:    number   = 12,
        cap_asst:    number   = 5,
        point_scale: number   = 60,
        allow_medic: boolean  = true,
    ) {
        this.enabled     = enabled;
        this.cap_time    = cap_time;
        this.cap_asst    = cap_asst;
        this.point_scale = point_scale;
        this.allow_medic = allow_medic;
    }
}


export class RegisterPlayer {

    enabled: boolean;
    teamID:  number;

    constructor(
        enabled: boolean = false,
        teamID:  number  = null,
    ) {
        // Don't allow enabling this unless a teamID is available
        this.enabled = enabled ;
        this.teamID  = teamID;
    }
}


export class QueryPlayerSettings {

    enabled: boolean;

    constructor(
        enabled: boolean = false
    ) {
        this.enabled = enabled;
    }
}



export function makeDeviceModal(device): DeviceSettings[] {

    let ds, id, addr, loc, gID;

    id   = device.id;
    addr = device.address;
    loc  = device.location;
    gID  = device.gameID;

    let med   = new MedicSettings(device.config == MEDIC,device.med_time)
    let bmb   = new BombSettings(device.config == BOMB,device.arm_time,device.bomb_time,device.diff_time)
    let cap   = new CaptureSettings(device.config == CAPTURE,device.cap_time,device.cap_asst,device.point_scale,device.allow_medic)
    let query = new QueryPlayerSettings(device.config == QUERY)
    let reg   = new RegisterPlayer(device.config == REGISTER, device.teamID)

    ds        = new DeviceSettings(id,device.enabled,addr,loc,gID,med,bmb,cap,reg,query)

    return ds;
}



export function makeDeviceModals(devices, createNewModals=false): DeviceSettings[] {

    let arr: DeviceSettings[]=[];

    if (!Array.isArray(devices) ) {
        devices = JSON.parse(devices);
    }

    devices.forEach(device => {

        let ds, id, addr, loc;

        id   = device.id;
        addr = device.address;
        loc  = device.location;

        if(createNewModals){

            ds = new DeviceSettings(id,false,addr,null);

        }else{
            ds = makeDeviceModal(device)
        }
        arr.push(ds)
    });

    return arr;
}
