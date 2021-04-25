import { Component, OnInit, ViewChild } from '@angular/core';
import { DeviceService } from 'src/service/device.service';
import { UserServiceService } from 'src/service/user-service.service';
import { DeviceSettings } from '../node.modal';
import { TabsComponent } from '../tabs/tabs.component';

@Component({
  selector: 'app-game-config',
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.scss']
})
export class GameConfigComponent implements OnInit {

    private REGISTER = 0x01;
    private QUERY    = 0x02;
    private PAIR_UID = 0x03;
    private CAPTURE  = 0x0A;
    private MEDIC    = 0x0E;
    private BOMB     = 0xBB;

    @ViewChild('gameModeEdit') editModeTemplate;
    @ViewChild(TabsComponent) tabsComponent;

    gameModes = [];
    userSvc: UserServiceService
    deviceSvc: DeviceService

    constructor(deviceSvc: DeviceService, userSvc: UserServiceService) {
        this.deviceSvc = deviceSvc;
        this.userSvc   = userSvc;
    }

    ngOnInit(): void {

        let fpID  = this.userSvc.getFieldProfileID();
        let token = this.userSvc.getToken();

        this.deviceSvc.getGameConfigs(token, fpID).subscribe(savedConfigs => {
            // console.log(savedConfigs, "savedConfigs");
            JSON.parse(JSON.stringify(savedConfigs)).forEach(savedConfig => {

                console.log("saved configs", savedConfig)
                this.gameModes.push({
                    id:        savedConfig.id,
                    name:      savedConfig.description,
                    teams:     savedConfig.teams,
                    nodeModes: savedConfig.deviceMap,
                    map:       savedConfig.mapID
                });

            });
        })
    }

    onDeleteMode(gameMode) {
        this.deviceSvc.deleteGameConfig(this.userSvc.getToken(), gameMode.id).subscribe(data => {
        // console.log(data,"delete")
            this.gameModes = this.gameModes.filter(function (obj) {
                return obj.id !== gameMode.id;
            });
        })
    }

    onEditMode(gameMode) {
    // console.log(this.tabsComponent,this.editModeTemplate,gameMode,"edit call");
        this.tabsComponent.openTab(
              `Editing ${gameMode.name}`,
              this.editModeTemplate,
              gameMode,
              true
        );
    }

    onAddMode() {
        this.tabsComponent.openTab('New Game Mode', this.editModeTemplate, {}, true);
    }

    onGameModeFormSubmit(dataModel) {

        if (dataModel.id > 0) {
          console.log(dataModel,"modal to edit")
            let apiData = {
                id             : dataModel.id,
                mapID          : this.userSvc.findMapID(dataModel.map),
                fieldProfileID : this.userSvc.getFieldProfileID(),
                description    : dataModel.name,
                deviceMap      : dataModel.nodeModes,
                teams          : dataModel.teams
            }
            // console.log('edit gameconfig',apiData)
            this.deviceSvc.modifyGameConfig(apiData, this.userSvc.getToken()).subscribe(data => {})
            this.gameModes = this.gameModes.map(gameMode => {

                if (gameMode.id === dataModel.id) {
                    return dataModel;
                } else {
                    return gameMode;
                }
          });
        }
        else {
            // create a new one
            // let apiGameConfigData = new UITOAPIDeviceSettings()
            let apiGameConfigData=[];

            JSON.parse(dataModel.nodeModes).forEach(element => {
                apiGameConfigData.push(element)
            });

            let apiData = {
                mapID          : this.userSvc.findMapID(dataModel.map),
                fieldProfileID : this.userSvc.getFieldProfileID(),
                description    : dataModel.name,
                deviceMap      : JSON.stringify(apiGameConfigData),
                teams          : dataModel.teams
            }

            console.log('create gameconfig',dataModel)

            dataModel.map = this.userSvc.findMapID(dataModel.map)
            dataModel.id  = Math.round(Math.random() * 100); // WHAT IS THIS FOR?

            this.gameModes.push(dataModel);
            this.deviceSvc.saveGameConfigs(apiData, this.userSvc.getToken()).subscribe(data => {

            })
        }
        // close the tab
        this.tabsComponent.closeActiveTab();
    }


}
