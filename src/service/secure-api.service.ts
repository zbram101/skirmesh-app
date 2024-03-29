import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EMPTY } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SecureAPIService {

    headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });


    BASE = 'https://api.skirmesh.net/'
    // BASE = 'http://lvh.me:5000/'

    // setup source routes
    RSRC = 'resources/'
    SEC = 'secure/'
    GMPL = 'gameplay/'

    // setup subroutes
    DEVC = 'device'
    USER = 'user'
    FPRO = 'fieldProfile'
    IMAG = 'image'
    GCFG = 'gameConfig'
    TEAM = 'team'


    constructor(
        private http: HttpClient
    ) { }


    // █▀▀▀ █▀▀█ █▀▄▀█ █▀▀ █▀▀█ █░░ █▀▀█ █░░█
    // █░▀█ █▄▄█ █░▀░█ █▀▀ █░░█ █░░ █▄▄█ █▄▄█
    // ▀▀▀▀ ▀░░▀ ▀░░░▀ ▀▀▀ █▀▀▀ ▀▀▀ ▀░░▀ ▄▄▄█

    modifyDevice(token, data) {

        let route = this.BASE + this.GMPL + this.DEVC;

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.put(route, data, options);
    }


    // █▀▀ █▀▀▄ ░▀░ ▀▀█▀▀ 　 █▀▀▀ █▀▀█ █▀▄▀█ █▀▀
    // █▀▀ █░░█ ▀█▀ ░░█░░ 　 █░▀█ █▄▄█ █░▀░█ █▀▀
    // ▀▀▀ ▀▀▀░ ▀▀▀ ░░▀░░ 　 ▀▀▀▀ ▀░░▀ ▀░░░▀ ▀▀▀

    getGameConfigs(token, fieldProfileID) {

        let route = this.BASE + this.SEC + this.GCFG

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("fieldProfileID", fieldProfileID)
        }

        return this.http.get(route, options)
    }

    saveGameConfig(token, data) {

        let route = this.BASE + this.SEC + this.GCFG

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.post(route, data, options)
    }

    modifyGameConfig(token, data) {

        let route = this.BASE + this.SEC + this.GCFG

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.put(route, data, options)
    }

    deleteGameConfig(token, gameConfigID) {

        let route = this.BASE + this.SEC + this.GCFG

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("id", gameConfigID)
        }

        return this.http.delete(route, options)
    }

    deleteTeam(token, teamID) {

        let route = this.BASE + this.SEC + this.TEAM

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("id", teamID)
        }

        return this.http.delete(route, options)
    }


    // █░░█ █▀▀ █▀▀ █▀▀█ 　 █▀▀█ █▀▀█ █▀▀█ █▀▀ ░▀░ █░░ █▀▀
    // █░░█ ▀▀█ █▀▀ █▄▄▀ 　 █░░█ █▄▄▀ █░░█ █▀▀ ▀█▀ █░░ █▀▀
    // ░▀▀▀ ▀▀▀ ▀▀▀ ▀░▀▀ 　 █▀▀▀ ▀░▀▀ ▀▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▀▀▀

    updatePass(token, data) {

        let route = this.BASE + this.RSRC + this.USER;

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.put(route, data, options);
    }

    saveProfile(token, data) {

        let user = data.user;
        let player = data.player;
        let field = data.field;

        let route = this.BASE + this.RSRC + this.USER;

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        let for_update = { "user": user, "player": player, "field": field }

        return this.http.put(route, for_update, options);
    }

    saveImage(token, data) {

        let route = this.BASE + this.SEC + this.IMAG;

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.put(route, data, options);
    }

    getUser(token, callSign = "") {
        if (token) {

            let route = this.BASE + this.RSRC + this.USER;

            const options = {
                params: new HttpParams()
                    .set("token", token)
                    .set("callSign", callSign)
            }

            return this.http.get(route, options);
        } else {
            return EMPTY;
        }
    }

    deleteUser(token) {

        let route = this.BASE + this.RSRC + this.USER;

        const options = { params: new HttpParams().set("token", token) }

        return this.http.delete(route, options);
    }


    // █░░ ░▀░ ▀█░█▀ █▀▀ 　 █▀▀▀ █▀▀█ █▀▄▀█ █▀▀ █▀▀
    // █░░ ▀█▀ ░█▄█░ █▀▀ 　 █░▀█ █▄▄█ █░▀░█ █▀▀ ▀▀█
    // ▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀ 　 ▀▀▀▀ ▀░░▀ ▀░░░▀ ▀▀▀ ▀▀▀

    getGamesByFieldProfile(token, fieldProfileID) {

        let route = this.BASE + this.SEC;

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("fieldProfileID", fieldProfileID)
        }

        return this.http.get(route + 'gamesBy', options)
    }

    getActiveGamesByMap(token, mapID) {

        let route = this.BASE + this.SEC;

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("mapID", mapID)
        }

        return this.http.get(route + 'activeGamesBy', options)
    }

    pauseGame(token, data) {

        let route = this.BASE + this.GMPL;

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.put(route + 'pauseGame', data, options)
    }

    startGame(token, gameConfigID) {

        let data = { "gameConfigID": gameConfigID }
        let route = this.BASE + this.SEC

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.post(route + 'startGame', data, options)
    }

    endGame(token, gameID) {

        let data = { "id": gameID }
        let route = this.BASE + this.SEC

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.put(route + 'endGame', data, options)
    }


    // █▀▀ ░▀░ █▀▀ █░░ █▀▀▄ 　 █▀▀█ █▀▀▄ █▀▄▀█ ░▀░ █▀▀▄
    // █▀▀ ▀█▀ █▀▀ █░░ █░░█ 　 █▄▄█ █░░█ █░▀░█ ▀█▀ █░░█
    // ▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀░ 　 ▀░░▀ ▀▀▀░ ▀░░░▀ ▀▀▀ ▀░░▀

  getFieldProfileFromAPI(token, fieldProfileID) {

        let route = this.BASE + this.SEC + this.FPRO;

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("id", fieldProfileID)
        }

        return this.http.get(route, options)
    }

    getUserListFromAPI(token) {

        let route = this.BASE + this.SEC;

        const options = { params: new HttpParams().set("token", token) }

        return this.http.get(route + 'user_list', options)
    }

    getFieldListFromAPI(token) {
        let route = this.BASE + this.SEC;

        const options = { params: new HttpParams().set("token", token) }

        return this.http.get(route + 'fieldProfile_list', options)
    }

    pairUid(token, data) {

        let route = this.BASE + this.SEC;

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.put(route + 'pair_rfid', data, options)
    }

    deleteUid(token, rfidID) {

        let route = this.BASE + this.SEC;

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("rfidID", rfidID)
        }

        return this.http.delete(route + 'pair_rfid', options)
    }

    updateFieldProfile(token, data) {
        // Requires fieldPofileID as id in data
        let route = this.BASE + this.SEC + this.FPRO;

        const options = {
            params: new HttpParams().set("token", token),
            headers: this.headers
        }

        return this.http.put(route, data, options)
    }

    deleteGame(token, id) {

        let route = this.BASE + this.SEC;

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("id", id)
        }

        return this.http.delete(route + 'deleteGame', options)
    }

  getFieldMarshals(token) {

      let route = this.BASE + this.SEC;

      const options = { params  : new HttpParams()
                                      .set("token", token)}

      return this.http.get(route + 'field_marshal', options)
  }


  addFieldMarshal(token, userID) {

      let route = this.BASE + this.SEC;

      const options = { params  : new HttpParams()
                                      .set("token", token),
                        headers : this.headers}

      return this.http.put(route + 'field_marshal', {"userID":userID}, options)
  }


  deleteFieldMarshal(token, userID) {

      let route = this.BASE + this.SEC;

      const options = { params  : new HttpParams()
                                      .set("token", token)
                                      .set("userID", userID)}

      return this.http.delete(route + 'field_marshal', options)
  }


    // █▀▀ ▀█░█▀ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
    // █▀▀ ░█▄█░ █▀▀ █░░█ ░░█░░ ▀▀█
    // ▀▀▀ ░░▀░░ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

    submitEvent(token, data) {

        let route = this.BASE + this.SEC + 'events';
        const options = {
            params: new HttpParams()
                .set("token", token)
        };

        return this.http.post(route, data, options)
    }

    updateEvent(token, data) {

        let route = this.BASE + this.SEC + 'events';

        const options = {
            params: new HttpParams()
                .set("token", token)
        };

        return this.http.put(route, data, options)
    }

    deleteEvent(token, id) {

        let route = this.BASE + this.SEC + 'events';

        const options = {
            params: new HttpParams()
                .set("token", token)
                .set("id", id)
        };

        return this.http.delete(route, options)
    }
}
