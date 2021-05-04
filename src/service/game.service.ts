import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { UserServiceService } from './user-service.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // }
  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  options = { headers: this.headers };

  BASE = 'http://api.skirmesh.net/'
  GTK = 'games/activeGames?token='

  userSvc: UserServiceService;

  constructor(
    private http: HttpClient,
    tokenSvc: TokenStorageService,
    userSvc: UserServiceService
  ) {
    this.userSvc = userSvc;
  }

  getGames(token) {
    return this.http.get(this.BASE + this.GTK + token )
  }

}