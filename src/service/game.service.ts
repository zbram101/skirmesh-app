import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokenStorageService } from './token-storage.service';
import { UserServiceService } from './user-service.service';

@Injectable({
      providedIn: 'root'
})
export class GameService {

    headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });
    options = { headers: this.headers };

    BASE = 'https://api.skirmesh.net/'
    GTK  = 'games/activeGames'
    RGMS = 'resources/games?token='

    userSvc: UserServiceService;

    constructor(
      private socket: Socket,
        private http: HttpClient,
        tokenSvc: TokenStorageService,
        userSvc: UserServiceService
    ) {
        this.userSvc = userSvc;
    }


    public getDeviceUpdate() {
      return new Observable((observer) => {
              this.socket.on('deviceUpdate', (message) => {
                // console.log(message,"message from socket")
                  observer.next(message);
              });
      });
    }

    public getNewAction() {
      return new Observable((observer) => {
              this.socket.on('newAction', (message) => {
                // console.log(message,"message from socket")
                  observer.next(message);
              });
      });
    }

    public getPlayerUpdate() {
      return new Observable((observer) => {
              this.socket.on('playerUpdate', (message) => {
                // console.log(message,"message from socket")
                  observer.next(message);
              });
      });
    }

    getGamesByFieldProfile(token, fieldProfileID) {
        return this.http.get(this.BASE + 'resources/gamesBy?token=' + token + "&fieldProfileID=" + fieldProfileID)
    }

    getActiveGamesByFieldProfile(token, fieldProfileID) {
        return this.http.get(this.BASE + 'games/activeGamesBy?token=' + token + "&fieldProfileID=" + fieldProfileID)
    }

    getGames() {
        return this.http.get(this.BASE + this.GTK)
    }

    getPastGames() {
        return this.http.get(this.BASE + '/games/pastGames')
    }

    pauseGame(token, data) {
        return this.http.put(this.BASE + 'gameplay/pauseGame?token=' + token, data, this.options)
    }

    startGame(token, gameConfigID){
        let data = {"gameConfigID":gameConfigID}
        return this.http.post(this.BASE+'games/startGame?token='+token,data,this.options )
    }

    endGame(token, gameID){
        let data = {"id":gameID}
        return this.http.put(this.BASE+'games/endGame?token='+token,data,this.options )
    }

    getGameStats(gameID){
        return this.http.get(this.BASE + 'statistics/game?id=' + gameID )
    }

    getLocations(){
      return this.http.get(this.BASE + 'resources/locations')
//http://api.skirmesh.net/resources/locations
    }

    getMapData(mapID){
      return this.http.get(this.BASE + 'resources/map?id=' + mapID)
//http://api.skirmesh.net/resources/locations
    }

    getActions(){
      return this.http.get(this.BASE + 'resources/actions')
//http://api.skirmesh.net/resources/locations
    }

}
