import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from "@angular/router";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { FuseUtils } from "@fuse/utils";
import { environment } from "environments/environment";
import { Contact, ContactForXls } from "app/main/apps/contacts/contact.model";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { AuthService } from "app/services/authentication/auth.service";
import { MatSnackBar, MatDialog } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { SelectFieldsComponent } from "./contact-list/dialog/select-fields/select-fields.component";
import { FormCustomService } from "../e-commerce/product/form-custom/services/form-custom.service";

@Injectable()
export class ContactsService {
    onContactsChanged: BehaviorSubject<any>;
    onSelectedContactsChanged: BehaviorSubject<any>;
    onUserDataChanged: BehaviorSubject<any>;
    onSearchTextChanged: Subject<any>;
    onFilterChanged: Subject<any>;

    contactsExist: boolean = false;
    contactInitial: boolean = false;
    arrayFieldSelection: string[];
    emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    initColumns: any[] = [];

    contacts: any[];
    user: any;
    selectedContacts: string[] = [];
    contactsArray: any[] = [];
    public loadingContact: boolean = false;
    arraySelect = [];

    inputsArray: any[] = [];

    searchText: string;
    filterBy: string;
    jsonData: any;
    contactsCount: number = 0;
    countSelect: number = 0;
    fileUploaded: File;
    worksheet: any;
    selection = new SelectionModel<any>(true, []);
    idEventNow: any;
    eventCreated: boolean = false;
    nameDataXlxs: any;
    columnHeaders: any[] = [];
    dialogRef: any;

    EXCEL_TYPE =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    EXCEL_EXTENSION = ".xlsx";

    contactsArrayXls: ContactForXls[] = [];

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private _matSnackBar: MatSnackBar,
        private _formCustomService: FormCustomService,
        public _matDialog: MatDialog
    ) {
        // Set the defaults
        this.onContactsChanged = new BehaviorSubject([]);
        this.onSelectedContactsChanged = new BehaviorSubject([]);
        this.onUserDataChanged = new BehaviorSubject([]);
        this.onSearchTextChanged = new Subject();
        this.onFilterChanged = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get contacts
     *
     * @returns {Promise<any>}
     */
    getContacts(idEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/invited/event/" + idEvent)
                .subscribe((response: any) => {
                    this.contacts = response.invited;

                    if (this.searchText && this.searchText !== "") {
                        this.contacts = FuseUtils.filterArrayByString(
                            this.contacts,
                            this.searchText
                        );
                    }

                    this.contacts = this.contacts.map((contact) => {
                        return contact;
                    });

                    this.onContactsChanged.next(this.contacts);
                    resolve(this.contacts);
                }, reject);
        });
    }

    getContactsOnly(idEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/invited/event/" + idEvent)
                .subscribe((response: any) => {
                    resolve(response.invited);
                }, reject);
        });
    }

    getContact(idInvited): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/invited/" + idInvited)
                .subscribe((response: any) => {}, reject);
        });
    }

    addInputFormToInvited(body): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(environment.apiUrl + "/api/add-inputs-invited", body)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getInputsInvited(idInvited): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/inputs-invited/" + idInvited)
                .subscribe((response: any) => {
                    resolve(response.inputs);
                }, reject);
        });
    }

    getInputsEvent(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/form/event/" + this.idEventNow)
                .subscribe((response: any) => {
                    resolve(response.inputs);
                }, reject);
        });
    }

    validateEmail(email): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(environment.apiUrl + "/api/validate-email/" + email)
                .subscribe((response: any) => {
                    let result = response.result.data.debounce.result;
                    let valid =
                        result === "Invalid"
                            ? false
                            : result === "Risky"
                            ? true
                            : result === "Safe to Send"
                            ? true
                            : result === "Unknown"
                            ? true
                            : null;

                    resolve(valid);
                }, reject);
        });
    }

    /**
     * Get user data
     *
     * @returns {Promise<any>}
     */
    getUserData(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get("api/contacts-user/5725a6802d10e277a0f35724")
                .subscribe((response: any) => {
                    this.user = response;
                    this.onUserDataChanged.next(this.user);
                    resolve(this.user);
                }, reject);
        });
    }

    getInputsForm(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get("api/contacts-user/5725a6802d10e277a0f35724")
                .subscribe((response: any) => {
                    this.user = response;
                    this.onUserDataChanged.next(this.user);
                    resolve(this.user);
                }, reject);
        });
    }

    /**
     * Toggle selected contact by id
     *
     * @param id
     */
    toggleSelectedContact(id): void {
        // First, check if we already have that contact as selected...
        if (this.selectedContacts.length > 0) {
            const index = this.selectedContacts.indexOf(id);

            if (index !== -1) {
                this.selectedContacts.splice(index, 1);

                // Trigger the next event
                this.onSelectedContactsChanged.next(this.selectedContacts);

                // Return
                return;
            }
        }

        // If we don't have it, push as selected
        this.selectedContacts.push(id);

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Toggle select all
     */
    toggleSelectAll(): void {
        if (this.selectedContacts.length > 0) {
            this.deselectContacts();
        } else {
            this.selectContacts();
        }
    }

    /**
     * Select contacts
     *
     * @param filterParameter
     * @param filterValue
     */
    selectContacts(filterParameter?, filterValue?): void {
        this.selectedContacts = [];

        // If there is no filter, select all contacts
        if (filterParameter === undefined || filterValue === undefined) {
            this.selectedContacts = [];
            this.contacts.map((contact) => {
                this.selectedContacts.push(contact._id);
            });
        }

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Update contact
     *
     * @param contact
     * @returns {Promise<any>}
     */
    createContactValidatorEmail(obj): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(
                    environment.apiUrl +
                        "/api/invited/add-new-email-validator/",
                    obj
                )
                .subscribe((response: any) => {
                    this.contacts.push(response.post);
                    this.onContactsChanged.next(this.contacts);
                    resolve(response);
                }, reject);
        });
    }

    createContact(obj): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(environment.apiUrl + "/api/invited/add-new-invited/", obj)

                .subscribe((response: any) => {
                    this.contacts.push(response.post);
                    this.onContactsChanged.next(this.contacts);

                    resolve(response);
                });
        });
    }

    insertDbExcelInvited(db): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(
                    environment.apiUrl + "/api/invited/add-multi-invited/",
                    db
                )

                .subscribe((response: any) => {
                    resolve(response);
                });
        });
    }

    editCountInvited(count): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(environment.apiUrl + "/api/event/edit-count-invited/", {
                    countInvited: count,
                    eventId: this.idEventNow,
                })
                .subscribe((response: any) => {
                    //this.getContacts(this.idEventNow)
                    resolve(response);
                });
        });
    }

    editEventInputs(arrayInputs): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(environment.apiUrl + "/api/event/edit-inputs/", {
                    eventId: this.idEventNow,
                    arrayInputs: arrayInputs,
                })
                .subscribe((response: any) => {
                    //this.getContacts(this.idEventNow)
                    resolve(response);
                });
        });
    }

    editMessageId(invitedId, messageId): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(environment.apiUrl + "/api/invited/messageId", {
                    invitedId: invitedId,
                    messageId: messageId,
                })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    editContact(id, init, obj): Promise<any> {
        return new Promise((resolve, reject) => {
            //obj.send_email ? true : false;

            this._httpClient
                .post(environment.apiUrl + "/api/invited/edit-invited/", {
                    invitedId: id,
                    init: init,
                    dataInvited: obj,
                })
                .subscribe((response: any) => {
                    //this.getContacts(this.idEventNow)
                    resolve(response);

                    this.getContacts(this.idEventNow).then((x) => {
                        this.editCountInvited(this.contacts.length);
                    });
                });
        });
    }

    duplicateContact(contact): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(environment.apiUrl + "/api/invited/add-new-invited/", {
                    codeEvento: this.idEventNow,
                    name: contact.name,
                    title: contact.title,
                    lastname: contact.lastname,
                    company: contact.company,
                    jobtitle: contact.jobtitle,
                    email: "",
                    phone: contact.phone,
                    asiste: "null",
                    contactado: "null",
                    address: contact.address,
                    notes: contact.notes,
                    street: contact.street,
                    city: contact.city,
                    country: contact.country,
                    phoneMobil: contact.phoneMobil,
                })

                .subscribe((response: any) => {
                    this.getContacts(this.idEventNow).then((x) => {
                        this.editCountInvited(this.contacts.length);
                    });
                });
        });
    }

    /**
     * Update user data
     *
     * @param userData
     * @returns {Promise<any>}
     */
    updateUserData(userData): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post("api/contacts-user/" + this.user.id, { ...userData })
                .subscribe((response) => {
                    this.getUserData();
                    this.getContacts(this.idEventNow);
                    resolve(response);
                });
        });
    }

    /**
     * Deselect contacts
     */
    deselectContacts(): void {
        this.selectedContacts = [];

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Delete contact
     *
     * @param contact
     */
    deleteContact(id) {
        return new Promise((resolve, reject) => {
            this._httpClient
                .delete(environment.apiUrl + "/api/delete-invited/" + id)
                .subscribe((response) => {
                    // this.conditionConatctExist();

                    this.editCountInvited(this.contacts.length);

                    this.getContacts(this.idEventNow);
                });
        });
    }

    conditionConatctExist() {
        if (this.contacts.length > 0) {
            this.contactsExist = true;
            this.loadingContact = false;
        } else {
            this.contactsExist = false;
            this.loadingContact = false;
        }
    }

    deleteAllContacts() {
        this.loadingContact = true;

        return new Promise((resolve, reject) => {
            this._httpClient
                .delete(
                    environment.apiUrl +
                        "/api/delete-all-invited/event/" +
                        this.idEventNow
                )
                .subscribe((response) => {
                    this.getContacts(this.idEventNow).then((x) => {
                        this.deselectContacts();

                        this.conditionConatctExist();

                        setTimeout(() => {
                            this.loadingContact = false;
                        }, 600);
                    });
                });
        });
    }

    /**
     * Delete selected contacts
     */
    deleteSelectedContacts(): void {
        this.loadingContact = true;

        for (const contactId of this.selectedContacts) {
            const contact = this.contacts.find((_contact) => {
                return _contact.id === contactId;
            });

            this.deleteContact(contact.id);
        }
        //this.onContactsChanged.next(this.contacts);
        this.deselectContacts();
    }

    jsonToExcel() {
        this.jsonData = XLSX.utils.json_to_sheet(this.worksheet);
        this.jsonData = JSON.stringify(this.jsonData);

        const data: Blob = new Blob([this.jsonData], {
            type: "application/json",
        });
        FileSaver.saveAs(data, "JsonFile" + new Date().getTime() + ".json");
    }

    public exportAsExcelFile(excelFileName: string): void {


        this.contacts.forEach((c) => {

       


            let obj = {
                ASISTE: c.asiste,
                CONTACTADO: c.contactado,
                CLICK: c.onClick ? "SI" : "NO",
                ESTADO: c.Status,
                FECHA_ESTADO: c.StatusDateTime,
               
            };

            c.dataImport.forEach(element => {

        
            Object.getOwnPropertyNames(element)
            .forEach(val => {
    
                let value = c.dataImport[0][val];

                obj[val] = value? value : '';
                
            })

    

            this.contactsArrayXls.push(obj);

            })
        });






        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
            this.contactsArrayXls
        );
        const workbook: XLSX.WorkBook = {
            Sheets: { data: worksheet },
            SheetNames: ["data"],
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: this.EXCEL_TYPE,
        });
        FileSaver.saveAs(
            data,
            fileName + "_export_" + new Date().getTime() + this.EXCEL_EXTENSION
        );
    }

    capitalize(word) {
        return word[0].toUpperCase() + word.slice(1).toLowerCase();
    }

    onFileChange(ev): Promise<any> {
        return new Promise((resolve, reject) => {
            let workBook = null;

            const reader = new FileReader();
            const file = ev.target.files[0];
            const xlsx = file;
            if (xlsx.name.includes("xls") || xlsx.name.includes("xlsx")) {
                reader.onload = (event) => {
                    const data = reader.result;

                    workBook = XLSX.read(data, { type: "binary" });

                    const sheet_name_list = workBook.SheetNames;

                    let columnHeaders = [];
                    for (
                        var sheetIndex = 0;
                        sheetIndex < sheet_name_list.length;
                        sheetIndex++
                    ) {
                        var worksheet =
                            workBook.Sheets[sheet_name_list[sheetIndex]];
                        for (let key in worksheet) {
                            let regEx = new RegExp("^(\\w)(1){1}$");
                            if (regEx.test(key) == true) {
                                columnHeaders.push(worksheet[key].v);
                            }
                        }
                    }

                    this.columnHeaders = columnHeaders;

                    let jsonData = workBook.SheetNames.reduce(
                        (initial, name) => {
                            const sheet = workBook.Sheets[name];
                            initial[name] = XLSX.utils.sheet_to_json(sheet);

                            this.nameDataXlxs = name;

                            return initial;
                        },
                        {}
                    );

                    resolve(jsonData);
                };
            } else {
                this._matSnackBar.open("Archivo invalido", "OK", {
                    verticalPosition: "top",
                    duration: 2000,
                });
            }
            reader.readAsBinaryString(file);
        });
    }

    selectFieldsAddInvited(jsonData): Promise<any> {
        return new Promise((resolve, reject) => {
            const dataString = jsonData;

            let inputsArray = [];

           

            let nameData = dataString.data
                ? dataString.data
                : dataString.Hoja1
                ? dataString.Hoja1
                : dataString;



            this.selectFieldsDialog(this.columnHeaders).then((arraySelect) => {
                inputsArray.push({
                    name: "checkbox",
                    initial: true,
                    checkbox: true,
                    title: "",
                });

                const arrayFields = arraySelect.map((obj) => obj.name);

                arrayFields.forEach((e) => {
                    const cap = this.capitalize(e);

                    const obj = {
                        name: e,
                        import: true,
                        title: cap,
                    };

                    inputsArray.push(obj);
                });

                inputsArray.push(
                    {
                        name: "contactado",             
                        initial: true,
                        title: "Contacto",
                        contact: true,
                    },

                    {
                        name: "asiste",
                        initial: true,
                        title: "Asiste",
                        asiste: true,
                    },
                    { name: "buttons", initial: true, title: "", buttons: true }
                );

                this.inputsArray = inputsArray;

                this.initColumns = this.inputsArray;

                const onlyImport = inputsArray.filter((obj) => obj.import);
                this.arraySelect = onlyImport;

                let arrays = {
                    inputsArray: this.inputsArray,
                    nameData: nameData,
                    arraySelect: this.arraySelect,
                };
                resolve(arrays);
            });
        });
    }

    editEventInputsInvitedData(
        inputsArray,
        nameData,
        arraySelect
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            this.editEventInputs(inputsArray).then((res) => {
                this.addInputsForm(res).then((res) => {
                    let contactsArray = [];

                    let count = 0;

                    

                    nameData.forEach((e, index) => {
                        setTimeout(() => {  

                            this.dataExcelCreateArrayForAdd(e, arraySelect).then(
                                (objInvited) => {
                                    count++;
    
                                    contactsArray.push(objInvited);
    
                                    if (count === nameData.length) {
                                        resolve(contactsArray);
                                    }
                                }
                            );
                        }, 3000);
                        
                    });
                });
            });
        });
    }

    addInputsForm(res): Promise<any> {
        return new Promise((resolve, reject) => {
            res.event.inputs.forEach((input) => {
                if (input.import) {
                    const obj = {
                        title: input.title,
                        type: "text",
                        nameInitial: input.name,
                        placeHolder: input.placeHolder,
                        value: "",
                        required: true,
                    };

                    this.addInputFormInEvent(obj).then((res) => {
                        this._formCustomService.getInputsEventOrInitial(
                            res.input
                        );
                        resolve(true);
                    });
                }
            });
        });
    }

    dataExcelCreateArrayForAdd(e, arraySelect): Promise<any> {
        return new Promise((resolve, reject) => {
            let value;
            let email;
            const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            Object.keys(e).map(function (k) {
                value = emailPattern.test(e[k]);

                if (value) {
                    email = e[k];
                }
            });

            this.validateEmail(email).then((valid) => {
                let objInvited = {
                    codeEvento: this.idEventNow,
                    contactado: e.CONTACTADO || e.contactado,
                    asiste: e.ASISTE || e.asiste,
                    asistio: false,
                    notes: e.OBSERVACIONES,
                    dataImport: [],
                    emailValid: valid,
                };

                const dataImport = {};

              

                arraySelect.forEach((i) => {

                  

                    if(e[i.name]){

                        dataImport[i.name] = e[i.name];

                    }

                    else {
                       dataImport[i.name] = '';
                    }
                   

                 
                });

             

                objInvited.dataImport.push(dataImport);

                resolve(objInvited);
            });
        });
    }

    addMultipleInvited(contactsArray): Promise<any> {
        return new Promise((resolve, reject) => {
            this.validateEmailInvited(contactsArray).then((array) => {
                resolve(array);
            });
        });
    }

    validateEmailInvited(array): Promise<any> {
        let email = "";
        const arrayValid = [];

        return new Promise((resolve, reject) => {
            array.forEach((obj) => {
                const objData = obj.dataImport[0];

                Object.keys(objData).map(function (k) {
                    email = objData[k];
                });

                if (this.emailPattern.test(email)) {
                    this.validateEmail(email).then((valid) => {
                        obj.emailValid = valid;
                    });
                }

                arrayValid.push(obj);
            });

            resolve(arrayValid);
        });
    }

    addManyInvitedValid(array): Promise<any> {
        return new Promise((resolve, reject) => {
            this.insertDbExcelInvited(array).then((res) => {
                this.getContacts(this.idEventNow).then((res) => {
                    resolve(true);
                });
            });
        });
    }

    selectFieldsDialog(fields): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dialogRef = this._matDialog.open(SelectFieldsComponent, {
                disableClose: true,
                panelClass: "my-class-send",
                data: {
                    fields: fields,
                },
            });

            this.dialogRef.afterClosed().subscribe((response) => {
                if (!response) {
                    return;
                } else {
                    resolve(response);
                }
            });
        });
    }

    xlsxToJson(): Promise<any> {
        return new Promise((resolve, reject) => {
            const fileUpload = document.getElementById(
                "fileUpload"
            ) as HTMLInputElement;

            fileUpload.onchange = () => {
                fileUpload.value = "";
            };

            fileUpload.click();

            resolve(true);
        });
    }

    addInputFormInEvent(input): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .post(environment.apiUrl + "/api/form/new-input", {
                    codeEvento: this.idEventNow,
                    title: input.title,
                    type: input.type,
                    nameInitial: input.nameInitial,
                    placeHolder: input.placeHolder,
                    value: input.value,
                    required: input.required,
                    initial: false,
                })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
