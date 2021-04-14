import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenStorageService } from 'src/service/token-storage.service';
import { UserServiceService } from 'src/service/user-service.service';
import { combineLatest, of } from 'rxjs';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss']
})

export class DeviceListComponent implements OnInit {
  p: number = 1;

  userSvc: UserServiceService;
  tokenSvc: TokenStorageService;

  devices=[];// BehaviorSubject<any>;

  REGISTER = 0x01;
  QUERY = 0x02;
  PAIR_UID = 0x03;
  CAPTURE = 0x0A;
  MEDIC = 0x0E;
  BOMB = 0xBB;


  @Input() config;

  @Output() nodeConfigs = new EventEmitter<string>(); 
  mode: String;
  locationsToSet = [];
  setLocation = [];
  leftLocations = [];
  teamsAvaliable = [];
  selectedLocations = [];
  constructor(
    userService: UserServiceService,
    tokenService: TokenStorageService,
    private router: Router) {
    this.userSvc = userService;
    this.tokenSvc = tokenService;
  }


  ngOnInit(): void {
    this.config.subscribe(
      modeConfig => {
        // console.log(modeConfig);
        this.userSvc.getUserData().subscribe(userData => {
          // console.log(modeConfig, "config", userData.fieldProfiles[0].devices)
          this.mode = modeConfig.mode;
          // this.selectedLocations = [];//this resets the selcted locations
          if (modeConfig.mode == 'createMode') {
            this.locationsToSet = modeConfig.location;//set locations
            if (modeConfig.teams) {
              const teams = [];
              modeConfig.teams.forEach(element => {
                // console.log(element, element.value.name)
                teams.push({ 'name': element.value.name })
              });
              this.teamsAvaliable = teams//set teams
            }
          }
          if (typeof modeConfig.nodeConfigs == 'string') {//this mean coming from device map
            this.devices = JSON.parse(modeConfig.nodeConfigs);
          } else {
            this.devices = modeConfig.nodeConfigs;
          }
          // console.log(modeConfig.nodeConfigs,'passed in config in devicelist')
        })
      }
    )
  }
 
  saveNodeConfigs() { 
    this.nodeConfigs.emit(JSON.stringify(this.devices))
  }

  locationSelected(event, device) {
    this.selectedLocations.push(event.target.value)
    device.location = event.target.value;
    console.log('location selected ',this.selectedLocations,device.location)
    device.enabled = true;
  }
  getLocationList() {
    let arr = [];
    if (this.locationsToSet) {
      this.locationsToSet.forEach(loc => {
        if (this.selectedLocations.indexOf(loc.name) == -1) {
          if (arr) {
            arr.push({ 'name': loc.name, 'isDisabled': false });
          }
        } else {
          if (arr) {
            arr.push({ 'name': loc.name, 'isDisabled': true });
          }
        }
      });
    }
    return arr;
  }

  enableMedic(device) {
    device.medic.enabled = true;
    device.bomb.enabled = false;
    device.capture.enabled = false;
  }
  medicNodeTeamSelected(teamName, device) {
    device.medic.team = teamName.target.value
  }

  enableQuery(device) {
    device.query.enable = true;
  }

  enableRegister(device) {
    device.register.enable = true;
  }

  convertPointScale(value) {

    var new_val

    new_val = 60 / value + " x"

    return new_val

  }
  getTimeIndex(value) {

    var int_map = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      15, 18, 21, 24, 27, 30,
      36, 42, 48, 54, 60, 66, 72, 78, 84, 90,
      120, 150, 180, 210, 240];

    return int_map.indexOf(value)
  }

  getPercIndex(value) {

    var int_map = [0x64, 0x32, 0x19, 0x14, 0x0a,
      0x05, 0x04, 0x02, 0x01];

    return int_map.indexOf(value)
  }

  getScaleIndex(value) {

    var int_map = [0x0f, 0x14, 0x1e, 0x28, 0x30, 0x3c,
      0x4b, 0x50, 0x64, 0x78, 0x96, 0xf0].reverse();

    return int_map.indexOf(value)
  }

  medicTime(device, value) {

    var int_map = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,          // Use discrete values to convert
      15, 18, 21, 24, 27, 30,                   // to simple times used for gameplay
      36, 42, 48, 54, 60, 66, 72, 78, 84, 90,
      120, 150, 180, 210, 240]                 // TODO: convert text based on range


    device.med_time = int_map[value];

  }

  convertTime(value) {

    var new_val

    if (value < 12) {
      new_val = value * 10 + " sec"
    }
    else {
      new_val = value * 10 / 60 + " min"
    }

    return new_val

  }
  convertPerc(value) {

    var new_val

    return 100 / value

  }


  //save data for capture all works
  enableCapture(device) {
    device.medic.enabled = false;
    device.bomb.enabled = false;
    device.capture.enabled = true;
  }
  capTime(device, value) {

    var int_map = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      15, 18, 21, 24, 27, 30,
      36, 42, 48, 54, 60, 66, 72, 78, 84, 90,
      120, 150, 180, 210, 240]

    device.capture.cap_time = int_map[value];
  }
  capasst(device, value) {

    var int_map = [0x64, 0x32, 0x19, 0x14, 0x0a,
      0x05, 0x04, 0x02, 0x01]

    device.capture.cap_asst = int_map[value];
  }
  pointScale(device, value) {

    var int_map = [0x0f, 0x14, 0x1e, 0x28, 0x30, 0x3c,
      0x4b, 0x50, 0x64, 0x78, 0x96, 0xf0].reverse()

    device.capture.point_scale = int_map[value];
  }
  enableAllowMedic(device) {
    if (device.capture.allow_medic) {
      device.capture.allow_medic = false;
    } else {
      device.capture.allow_medic = true;
    }
  }


  //save data for bomb all works
  enableBomb(device) {
    device.medic.enabled = false;
    device.bomb.enabled = true;
    device.capture.enabled = false;
  }
  armTime(device, value) {

    var int_map = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    device.bomb.arm_time = int_map[value];
  }
  bombTime(device, value) {

    var int_map = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      15, 18, 21, 24, 27, 30,
      36, 42, 48, 54, 60, 66, 72, 78, 84, 90,
      120, 150, 180, 210, 240]

    device.bomb.bomb_time = int_map[value];//fusetimer?
  }
  difuseTime(device, value) {

    var int_map = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    device.bomb.diff_time = int_map[value];
  }

}
