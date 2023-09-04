import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import { Subject, filter, map, takeUntil } from 'rxjs';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';
type ProfileType = {
  givenName?: string,
  surname?: string,
  userPrincipalName?: string,
  id?: string
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  profile!: ProfileType;
  response : any;
  accessToken : any;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private broadcastService: MsalBroadcastService
  ) { }

  ngOnInit() {
    this.broadcastService.msalSubject$
    .pipe(
      filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
      takeUntil(this._destroying$)
    )
    .subscribe((result: EventMessage) => {
      // Do something with event payload here
      console.log("broadcastService",result)
      this.accessToken = result.payload
    });
    this.getProfile();
  }

  getProfile() {
    this.http.get(GRAPH_ENDPOINT)
      .subscribe(profile => {
        this.profile = profile;
      });
    // this.http.get("https://localhost:44351/api/weatherforecast")
    // .pipe(
    //   map((response:any) => {
    //     console.log("pipe",response);
    //     return response
    //   }
    //   ) // get only results
    // )
    // .subscribe(data => {
    //   console.log("subscribe",data);
    //   this. response = data;
    // });  
  }

}
