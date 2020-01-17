import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { map } from 'rxjs/operators';
import { ContactsService } from 'app/main/apps/contacts/contacts.service';
import { ContactsContactFormDialogComponent } from 'app/main/apps/contacts/contact-form/contact-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { FuseUtils } from '@fuse/utils';
import {ChangeDetectorRef } from '@angular/core';

@Component({
    selector     : 'contacts-contact-list',
    templateUrl  : './contact-list.component.html',
    styleUrls    : ['./contact-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ContactsContactListComponent implements OnInit, OnDestroy
{
    @ViewChild('dialogContent', {static: false})
    dialogContent: TemplateRef<any>;
    @ViewChild(MatPaginator, {static: true})
    paginator: MatPaginator;

    contacts: any;
    user: any;
    dataSource: FilesDataSource | null;
    displayedColumns = ['checkbox', 'avatar', 'name', 'email', 'phone', 'jobTitle', 'buttons'];
    selectedContacts: any[];
    checkboxes: {};
    dialogRef: any;
    loading: boolean = false;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ContactsService} _contactsService
     * @param {MatDialog} _matDialog
     */
    constructor(
        public _contactsService: ContactsService,
        public _matDialog: MatDialog,
        private cdref: ChangeDetectorRef
    )
    
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngAfterContentChecked() {

        this.dataSource = new FilesDataSource(this._contactsService, this.paginator);

        this.onContactchanged()
        this.cdref.detectChanges();
        
    }



    ngOnInit(): void
    {

       this._contactsService.loadingContact = true;
     
        this.dataSource = new FilesDataSource(this._contactsService, this.paginator);

        //this.onContactchanged()

        let contacts = this.dataSource._contactsService.contacts;
        this._contactsService.contacts = contacts;

       
        if(contacts.length > 0){


            this._contactsService.contactsExist = true;
            this._contactsService.loadingContact = false;
        }
    
        else {
            this._contactsService.contactsExist = false;
            this._contactsService.loadingContact = false; 
        }

        this._contactsService.onSelectedContactsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(selectedContacts => {
                for ( const id in this.checkboxes )
                {
                    if ( !this.checkboxes.hasOwnProperty(id) )
                    {
                        continue;
                    }

                    this.checkboxes[id] = selectedContacts.includes(id);
                }
                this.selectedContacts = selectedContacts;
            });


        this._contactsService.onFilterChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._contactsService.deselectContacts();
            });

       
    }

    onContactchanged(){
        this.dataSource = new FilesDataSource(this._contactsService, this.paginator);

        this._contactsService.onContactsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(contacts => {
                this.contacts = contacts;



                
                this.checkboxes = {};
                contacts.map(contact => {
                    this.checkboxes[contact.id] = false;
                });
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Edit contact
     *
     * @param contact
     */
    editContact(contact): void
    {
        this.dialogRef = this._matDialog.open(ContactsContactFormDialogComponent, {
            panelClass: 'contact-form-dialog',
            data      : {
                contact: contact,
                action : 'edit'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(response => {
                if ( !response )
                {
                    return;
                }
                const actionType: string = response[0];
                const formData: FormGroup = response[1];
                switch ( actionType )
                {
                    /**
                     * Save
                     */
                    case 'save':

                        this._contactsService.createContact(formData.getRawValue());

                        break;
                    /**
                     * Delete
                     */
                    case 'delete':

                        this.deleteContact(contact);

                        break;
                }
            });
    }

    /**
     * Delete Contact
     */
    deleteContact(contact): void
    {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false,
            panelClass: 'custom-dialog-container'
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Esta seguro de eliminar este invitado?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this._contactsService.deleteContact(contact, 1);
            }
            this.confirmDialogRef = null;
        });

    }

    /**
     * On selected change
     *
     * @param contactId
     */
    onSelectedChange(contactId): void
    {
        console.log('contactId',contactId)
        this._contactsService.toggleSelectedContact(contactId);
    }


    /**
     * Toggle star
     *
     * @param contactId
     */
    toggleStar(contactId): void
    {
        if ( this.user.starred.includes(contactId) )
        {
            this.user.starred.splice(this.user.starred.indexOf(contactId), 1);
        }
        else
        {
            this.user.starred.push(contactId);
        }

        this._contactsService.updateUserData(this.user);
    }
}

export class FilesDataSource extends DataSource<any>
{
    /**
     * Constructor
     *
     * @param {ContactsService} _contactsService,
     * 
     */
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    constructor(
        public _contactsService: ContactsService,
        private _matPaginator: MatPaginator,
    )
    {
        super();
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {

        const displayDataChanges = [
            this._contactsService.onContactsChanged,
            this._matPaginator.page
        ];
   
        return merge(...displayDataChanges)
            .pipe(
                map(() => {


                  
                    if(this._contactsService.contacts) {
                        let data = this._contactsService.contacts.slice();
                        data = this.filterData(data);

                        this.filteredData = [...data];

                        // Grab the page's slice of data.
                        const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
                        return data.splice(startIndex, this._matPaginator.pageSize);
                    }

                    let data = [];
                    return data;
   

                    }

                
                ));
    }

        // Filtered data
        get filteredData(): any
        {
            return this._filteredDataChange.value;
        }
    
        set filteredData(value: any)
        {
            this._filteredDataChange.next(value);
        }

            // Filter
    get filter(): string
    {
        return this._filterChange.value;
    }

    set filter(filter: string)
    {
        this._filterChange.next(filter);
    }

        filterData(data): any
        {
            if ( !this.filter )
            {
                return data;
            }
            return FuseUtils.filterArrayByString(data, this.filter);
        }

    /**
     * Disconnect
     */
    disconnect(): void
    {
    }
}