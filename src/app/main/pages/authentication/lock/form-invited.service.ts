import { Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
    Router,
} from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "environments/environment";
import { AuthService } from "app/services/authentication/auth.service";
import { map } from "rxjs/operators";

@Injectable()
export class FormInvitedService implements Resolve<any> {
    routeParams: any;
    onInvitedChanged: BehaviorSubject<any>;
    campaignId: any;
    invitedId: any;
    campaignInvitation: any;
    invited: any;
    campaignName: any;
    event: any;
    eventLoad: boolean = false;
    editInvited: boolean = false;
    loadingPage: boolean = false;
    openEvent: boolean = false;
    invitedExist: boolean = false;
    arrayInputsSelect: any[ ] = [];

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(private _httpClient: HttpClient) {
        // Set the defaults
        this.onInvitedChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            this.routeParams = route.params;

            this.campaignId = this.routeParams.campaignId;

            this.invitedId = this.routeParams.invitedId;

            this.loadingPage = true;

            Promise.all([
                this.getCampaignById(this.campaignId).then((res: any) => {
                    console.log(res);

                    this.editInvited = true;

                    this.getEventById(this.campaignInvitation.eventId).then(
                        (data) => {
                            console.log(data);

                            this.event = data.event;

                            console.log("this.event", this.event);

                            this.eventLoad = true;


                            if (this.invitedId !== "new") {
                                console.log("invitedId", this.invitedId);

                                this.getInvited().then(() => {
                                    this.invitedExist = true;
                                });
                            } else {
                                this.invitedExist = false;
                            }
                        }
                    );
                }),

                //this.getEventsByUser()
            ]).then(() => {
                resolve();
            }, reject);
        });
    }


    getInputsEvent(idEvent): Promise<any> {

    
        return new Promise((resolve, reject) => {
            this._httpClient.get(environment.apiUrl + '/api/form/event/' + idEvent)
                .subscribe((response: any) => {
    
             
                    resolve(response);
                    
                }, reject);
        });
    }

    getCampaignById(idCampaign) {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/get-campaign/" + idCampaign)
                .subscribe((response: any) => {
                    this.campaignInvitation = response.campaign;

                    this.campaignName = this.campaignInvitation.affair;

                    console.log(this.campaignInvitation);

                    const linkBol = response.campaign.webLinkCharge;
                    const linkString = response.campaign.webLink;

                    if (linkBol) {
                        console.log(linkString);

                        this.onClickEditInvited().then((x) => {
                            console.log("x", x);
                            window.location.href = linkString;

                            return;
                        });
                    } else {
                        this.loadingPage = true;
                    }

                    resolve(response);
                }, reject);
        });
    }

    getInvited(): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log("elseseeee", this.invitedId);

            this._httpClient
                .get(
                    environment.apiUrl +
                        "/api/invited-confirm/" +
                        this.invitedId
                )
                .subscribe((response: any) => {
                    resolve(response);

                    console.log(response);

                    this.invited = response;

                    this.onInvitedChanged.next(this.invited);
                    resolve(response);

                    console.log(response);
                }, reject);
        });
    }

    getInvitedByEmail(email): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/invited-email/" + email)
                .subscribe((response: any) => {
                    let invited = response.invited[0];

                    this.invited = invited;
                    resolve(invited);

                    console.log(this.invited);
                }, reject);
        });
    }

    getEventById(idEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/event/" + idEvent)
                .subscribe((response: any) => {
                    resolve(response);

                    console.log(response);
                }, reject);
        });
    }

    confirmInvitation(invited) {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(
                    environment.apiUrl + "/api/invited/confirm-invited",
                    invited
                )
                .subscribe((response: any) => {
                    console.log(response);

                    resolve(response);
                }, reject);
        });
    }

    addNewInvitation(data): Promise<any> {
        const obj = {
            asiste: data.asiste,
            codeEvento: this.event._id,
            company: data.company,
            contactado: data.contactado,
            email: data.email,
            invitedId: data.invitedId,
            lastname: data.lastname,
            name: data.name,
            phone: data.phone,
            rut: data.rut,
        };

        return new Promise((resolve, reject) => {
            console.log("entro add", obj);
            this._httpClient
                .post(environment.apiUrl + "/api/invited/add-new-invited/", obj)
                

                .subscribe((response: any) => {
                    resolve(response);
                    console.log(response);
                });
        });
    }

    onClickEditInvited() {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(environment.apiUrl + "/api/invited/onClick", {
                    invitedId: this.invitedId,
                    onClick: true,
                })
                .subscribe((response: any) => {
                    console.log(response);

                    resolve(response);
                }, reject);
        });
    }
}
