import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NonSecureRoutingModule } from './non-secure-routing.module';
import { NonSecureComponent } from './non-secure.component';
import { FeaturesListComponent } from './features-list/features-list.component';
import { HomeComponent } from './home/home.component';
import { GlobalModule } from '../global/global.module';
import { AuthRoutingModule } from '../auth/auth-routing.module';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { FieldInfoComponent } from './field-info/field-info.component';
import { LiveGamesComponent } from './liveGames/liveGames.component'
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { HowToUseComponent } from './how-to-use/how-to-use.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { EventsComponent } from './events/events.component';
import { FormsModule, FormControl } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { GameHistoryComponent } from './game-history/game-history.component';



@NgModule({
  declarations: [HowToUseComponent,
                 NonSecureComponent,
                 FeaturesListComponent,
                 HomeComponent,
                 ContactUsComponent,
                 PrivacyPolicyComponent,
                 FieldInfoComponent,
                 LiveGamesComponent,
                 LeaderboardComponent,
                 EventsComponent,
                 GameHistoryComponent],
  imports: [
    CommonModule,
    NonSecureRoutingModule,
    AuthRoutingModule,
    GlobalModule,
    CarouselModule,
    NgxDatatableModule, 
    AccordionModule.forRoot(),
    NgxChartsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    ModalModule.forRoot(),
    CollapseModule.forRoot()
  ]
})
export class NonSecureModule { }
