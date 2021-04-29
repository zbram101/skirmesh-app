import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenStorageService } from 'src/service/token-storage.service';
import { UserServiceService } from 'src/service/user-service.service';
import { combineLatest, of } from 'rxjs';

import { makeDeviceModals } from 'src/app/global/node.modal';

const TIME_INTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, // Every 10 secs >>  2min
                   15, 18, 21, 24, 27, 30,                // Every 30 secs >>  5min
                   36, 42, 48, 54, 60, 66, 72, 78, 84, 90,// Every 60 secs >> 15min
                   120, 150, 180, 210, 240];              // Every  5 mins >> 40min

const PERC_INTS = [0x64, 0x32, 0x19, 0x14, 0x0a, 0x05, 0x04, 0x02, 0x01];
const POINT_SCL = [0x0f, 0x14, 0x1e, 0x28, 0x30, 0x3c, 0x4b,
                   0x50, 0x64, 0x78, 0x96, 0xf0].reverse();

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss']
})

export class DeviceListComponent implements OnInit {

  userSvc: UserServiceService;
  tokenSvc: TokenStorageService;

  devices = [];// BehaviorSubject<any>;

  @Input() config;
  @Output() nodeConfigs = new EventEmitter<string>();

  mode: String;
  mapid:String;
  locationsToSet = [];
  selectedLocations = [];
  updatedLocationList = [];

  teamsAvaliable = [];
  previousSelected;
  constructor(
    userService: UserServiceService,
    tokenService: TokenStorageService,
    private router: Router) {
    this.userSvc = userService;
    this.tokenSvc = tokenService;
  }


  ngOnInit(): void {

    this.config.subscribe( modeConfig => {

        this.userSvc.getUserData().subscribe(userData => {

          this.mode  = modeConfig.mode;
          this.mapid = modeConfig.mapID;

          //  TEAMS CONFIGS
          if(modeConfig.teams){

              const teams = [];
              modeConfig.teams.forEach(element => {

                if(element.value && element.value.name){

                  teams.push({ 'id': element.value.id, 'name': element.value.name, 'color': element.value.color })

                }else{

                  teams.push({ 'id': element.id, 'name': element.name, 'color': element.color })

                }
              });
              this.teamsAvaliable = teams//set teams
            // }
          }

          //  NODE CONFIGS -- if we don't have them, make them
          if (!modeConfig.nodeConfigs){
            //This can NEVER evaluate as true...
          // if (modeConfig.nodeConfigs && modeConfig.nodeConfigs.length == 0 )
            this.devices = makeDeviceModals(userData.fieldProfile.devices);
          } else {
             // modeConfig.nodeConfigs have already been made Device Modals
            this.devices = modeConfig.nodeConfigs;
          }

          //  LOCATIONS CONFIGS  -needs to be after node configs above.

          if(modeConfig.mapID){

            this.locationsToSet = this.userSvc.getLocationsForMap(modeConfig.mapID);

              let arr=[];

              this.devices.forEach(device=>{

                if(device.location){
                  arr.push(device.location);
                }
              })
              this.selectedLocations   = arr;
              this.updatedLocationList = this.getLocationList();
          }

        })

      }
    )
  }

    endGame(){
        this.nodeConfigs.emit('endGame')
    }

    saveOldVal(device){
        this.previousSelected = device.location;
    }

    saveNodeConfigs() {
        this.nodeConfigs.emit(JSON.stringify(this.devices))
    }

    locationSelected(event, device) {
        // console.log(device.location,"location selected print", "::LOC VAL::", event.target)
        this.selectedLocations = this.selectedLocations.filter(loc=>loc!=this.previousSelected)

        if (device.location) {this.selectedLocations.push(device.location)}
        // Angular black magic updates all this for us....
        // let loc = this.userSvc.findLocationID(this.mapid,val)
        //find id of val
        // device.location = val || null;
        device.enabled = true;

        this.updatedLocationList = this.getLocationList();
        this.saveNodeConfigs();
    }

    teamSelected(event, device) {
        this.saveNodeConfigs();
    }

    getLocationList() {
        let arr = [];

        if (this.locationsToSet) {

            this.locationsToSet.forEach(loc => {

                if (this.selectedLocations.includes(loc.id)) {

                    arr.push({'id':loc.id, 'name': loc.name, 'enabled': false });

                } else {

                    arr.push({'id':loc.id, 'name': loc.name, 'enabled': true });
                }
            });
        }
        return arr;
    }

    getLocationName(locID) {
          return this.updatedLocationList.find(ele => ele.id == locID)
    }



    updateModeSwitches(device){

        device.medic.enabled          = false;
        device.bomb.enabled           = false;
        device.capture.enabled        = false;
        device.queryPlayer.enabled    = false;
        device.registerPlayer.enabled = false;
        // reset the team to ensure it's null if not
        // in registerPlayer mode --- the only way to set
        // the teamID is if you are *in* registerPlayer
        device.registerPlayer.teamID  = null;

    }

    enableMedic(device) {

        this.updateModeSwitches(device);
        device.medic.enabled = true;
        this.saveNodeConfigs();

    }

    enableQuery(device) {

        this.updateModeSwitches(device);
        device.queryPlayer.enabled = true;
        this.saveNodeConfigs();

    }

    enableRegister(device) {

        this.updateModeSwitches(device);
        device.registerPlayer.enabled = true;
        this.saveNodeConfigs();

    }

    enableCapture(device) {

        this.updateModeSwitches(device);
        device.capture.enabled = true;
        this.saveNodeConfigs();

    }

    enableBomb(device) {

        this.updateModeSwitches(device);
        device.bomb.enabled = true;
        this.saveNodeConfigs();

    }



    convertPointScale(value) {
        return 60 / value + " x"
    }

    getTimeIndex(value) {
        return TIME_INTS.indexOf(value)
    }

    getPercIndex(value) {
        return PERC_INTS.indexOf(value)
    }

    getScaleIndex(value) {
        return POINT_SCL.indexOf(value)
    }



    medicTime(device, value, updateConfigs=false) {

        device.medic.medTime = TIME_INTS[value];

        if (updateConfigs) {
            this.saveNodeConfigs();
        }

    }

    capTime(device, value, updateConfigs=false) {

        device.capture.cap_time = TIME_INTS[value];

        if (updateConfigs) {
            this.saveNodeConfigs();
        }
    }

    capasst(device, value, updateConfigs=false) {

        device.capture.cap_asst = PERC_INTS[value];

        if (updateConfigs) {
            this.saveNodeConfigs();
        }
    }

    pointScale(device, value, updateConfigs=false) {

        device.capture.point_scale = POINT_SCL[value];

        if (updateConfigs) {
            this.saveNodeConfigs();
        }
    }

    enableAllowMedic(device) {

        if (device.capture.allow_medic) {
            device.capture.allow_medic = false;
        } else {
            device.capture.allow_medic = true;
        }
        this.saveNodeConfigs();
    }

    armTime(device, value, updateConfigs=false) {

        device.bomb.arm_time = TIME_INTS[value];

        if (updateConfigs) {
            this.saveNodeConfigs();
        }
    }

    bombTime(device, value, updateConfigs=false) {
        //bomb_time == fuse time
        device.bomb.bomb_time = TIME_INTS[value];

        if (updateConfigs) {
            this.saveNodeConfigs();
        }
    }

    difuseTime(device, value, updateConfigs=false) {

        device.bomb.diff_time = TIME_INTS[value];

        if (updateConfigs) {
            this.saveNodeConfigs();
        }
    }

    convertTime(value) {

        if (value < 12) {
            return  value * 10 + " sec"
        }
        else {
            return  value * 10 / 60 + " min"
        }
    }

    convertPerc(value) {
        return 100 / value
    }

}
