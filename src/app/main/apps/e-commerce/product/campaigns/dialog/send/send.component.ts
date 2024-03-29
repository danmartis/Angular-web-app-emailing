import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CampaignService } from '../../campaign.service';
import { isThisSecond } from 'date-fns';
import { Campaign } from '../../campaign.model';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit, OnDestroy {

  selectionCount = this._campaignService._contactService.selectedContacts.length;

  allContacts: any[]
  arrayDataImport: any[];
  contactsCount: number = 0;
  loadingContacts: boolean = true;

  campaign: Campaign

  constructor(public matDialogRef: MatDialogRef<SendComponent>,
    public _campaignService: CampaignService,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    ) { }

  ngOnInit() {

    
    this._campaignService.getContacts(this._campaignService._contactService.idEventNow)
    .then((x) => {
      this.allContacts = x.invited;


      this.contactsCount = this.allContacts.length;

        this.loadingContacts = false;
    })



  }


  allInvitation(option){

if(this.allContacts.length > 0){


    if(this._campaignService.allLoading){
      return 

  } 
  else {

    this.statusAndSendMails(option);

  }
}


}


  SendInvitation(option){

    if(this.selectionCount > 0){


      if(this._campaignService.selectLoading){
        return 

    } 
    else {

      this.statusAndSendMails(option);


    }



  }
  }

  statusAndSendMails(option){

    const initialStatus =  'Cargando...'
    this._campaignService.countStatus = initialStatus

    this._campaignService.statusSendInvitation = initialStatus
    
    this.campaign = this._data.campaign;

  this._campaignService.getDataInvitedForSendEmail(option, this.campaign, this.allContacts)

  }

  ngOnDestroy(){

    this._campaignService.allLoading = false;

    this._campaignService.emailsValidForSend = 0;
    this._campaignService.value = 0
    this._campaignService.invitedFails = [];
    this._campaignService.valueOk = 0;
    this._campaignService.value = 0;
    this._campaignService.countStatus = "Enviar a:"

  

  }


}
