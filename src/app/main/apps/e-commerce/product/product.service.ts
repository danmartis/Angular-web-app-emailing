import { Injectable, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, of  } from 'rxjs';
import { environment } from 'environments/environment';
import { ContactsService } from 'app/main/apps/contacts/contacts.service';
import { MatHorizontalStepper } from '@angular/material';

import { AcademyCoursesService } from '../../academy/courses.service';


@Injectable()
export class EcommerceProductService implements Resolve<any>
{       

    routeParams: any;
    product: any;
    loadingFile: boolean = false;
    onProductChanged: BehaviorSubject<any>;
    idNowEvent: any;
    formCustomPristine: boolean = false;
    isNew: boolean = false




    @ViewChild(MatHorizontalStepper, {static: true}) stepper: MatHorizontalStepper;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private contactServices: ContactsService,
        private _academyCoursesService: AcademyCoursesService,
      

    )
    {
        // Set the defaults
        this.onProductChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {

        this.routeParams = route.params;

        return new Promise((resolve, reject) => {

          
            Promise.all([

                
              
                this.contactServices.getContacts(this.routeParams.id),
    

                this.getProduct()
                .then((event) => {

                    this._academyCoursesService.eventObj = event;


                   
                    this._academyCoursesService.getCategories(),
                    this._academyCoursesService.getUsersData()
                }),
    

         

            ]).then(
                () => {

                   

                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get product
     *
     * @returns {Promise<any>}
     */
    getProduct(): Promise<any>
    {
        return new Promise((resolve, reject) => {

          
  
            if ( this.routeParams.id === 'new' )
            {

           
                this.onProductChanged.next(false);
                resolve(false);
            }
            else
            {

                this._httpClient.get(environment.apiUrl + '/api/event/' + this.routeParams.id)
                    .subscribe((response: any) => {
                        this.product = response;
                       

                    

                        this.contactServices.idEventNow = this.product.event._id;


                        this.onProductChanged.next(this.product);
                        resolve( this.product.event)

                       
                    }, reject);
            }
        });
    }

    /**
     * Save product
     *
     * @param product
     * @returns {Promise<any>}
     */
    saveProduct(product, img): Promise<any>
    {
      
        return new Promise((resolve, reject) => {
            this._httpClient.post(environment.apiUrl + '/api/event/edit-event', 
            {   
                imgBanner: img,
                eventId: product.id, 
                eventName: product.name, 
                address: product.address,
                handle: product.handle, 
                company: product.company, 
                desc: product.description, 
                dateEvent: product.date ,
                active: product.active,
                imgTitle: product.imgTitle
            })
                .subscribe((response: any) => {

                    
                    resolve(response);

               
                }, reject);
        });
    }

    Is_mailJet(): Promise<any>
    {
       
        return new Promise((resolve, reject) => {
            this._httpClient.post(environment.apiUrl + '/api/event/edit/is_mail-jet', 
            {   
                
                eventId:this.contactServices.idEventNow, 
            })
                .subscribe((response: any) => {

                    
                    resolve(response);

                    
            
                }, reject);
        });
    }

    /**
     * Add product
     *
     * @param product
     * @returns {Promise<any>}
     */
    addProduct(product, img): Promise<any> {


        
        return new Promise((resolve, reject) => {
            this._httpClient.post(environment.apiUrl + '/api/event/add-new-event', 
            {   
                imgBanner: img,
                eventName: product.name, 
                company: product.company, 
                handle: product.handle, 
                desc: product.description, 
                address: product.address,
                dateEvent: product.date, 
                active: product.active, 
                imgTitle: product.imgTitle

            })
                .subscribe((response: any) => {


                    this.contactServices.idEventNow = response._id;

                    //this.contactServices.eventCreated = true;
                    //this.contactServices.getContacts(this.contactServices.idEventNow)
                    resolve(response);
                    
                }, reject);
        });
    }


    getTagsByEvent(): Promise<any> {

       
        return new Promise((resolve, reject) => {
            this._httpClient.get(environment.apiUrl + '/api/tag/event/' + this.contactServices.idEventNow)
                .subscribe((response: any) => {
 
                    resolve(response);
                    
                }, reject);
        });
    }

    addTagsInProduct(tag): Promise<any> {

       
       return new Promise((resolve, reject) => {
           this._httpClient.post(environment.apiUrl + '/api/tag/add-new-tag', 
           {   
                eventId:  this.contactServices.idEventNow,
                name: tag,
                desc: ""

           })
               .subscribe((response: any) => {

         
                   resolve(response);
                   
               }, reject);
       });
   }

 

   deleteAllTags(array) {

    return new Promise((resolve, reject) => {
        this._httpClient
            .delete(
                environment.apiUrl +
                    "/api/delete-all-tag/event/" +
                    this.contactServices.idEventNow
            )
            .subscribe(response => {
          


                array.forEach(tag => {
            
                    this.addTagsInProduct(tag)
                    .then( (x) => {
        
                    })
            
    
            })

                resolve(response)
            });
    });
}


addInputFormInEvent(input): Promise<any> {

       
    return new Promise((resolve, reject) => {
        this._httpClient.post(environment.apiUrl + '/api/form/new-input', 
        {   
             codeEvento:  this.contactServices.idEventNow,
             title: input.title,
             type: input.type,
             placeHolder: input.placeHolder,
             value: input.value,
             required: input.required,
             initial: false

        })
            .subscribe((response: any) => {

          
                resolve(response);
                
            }, reject);
    });
}


getInputsEvent(): Promise<any> {

    
    return new Promise((resolve, reject) => {
        this._httpClient.get(environment.apiUrl + '/api/form/event/' + this.contactServices.idEventNow)
            .subscribe((response: any) => {

         
                resolve(response);
                
            }, reject);
    });
}


getInputsInitial(): Promise<any> {

    
    return new Promise((resolve, reject) => {
        this._httpClient.get(environment.apiUrl + '/api/form/initial')
            .subscribe((response: any) => {

                resolve(response);
                
            }, reject);
    });
}

editInputFormRequired(input): Promise<any>
{
  
    return new Promise((resolve, reject) => {
        this._httpClient.post(environment.apiUrl + '/api/form/edit-input-required', 
        {   

            inputId: input.id,
            required: input.required,


        })
            .subscribe((response: any) => {

                
                resolve(response);

     
            }, reject);
    });
}

editInputFormtitle(input): Promise<any>
{
  
    return new Promise((resolve, reject) => {
        this._httpClient.post(environment.apiUrl + '/api/form/edit-input-title', 
        {   

            inputId: input.id,

            title: input.title

        })
            .subscribe((response: any) => {

                
                resolve(response);

  
            }, reject);
    });
}

editInputFormColumnSelect(inputId): Promise<any>
{
  
    return new Promise((resolve, reject) => {
        this._httpClient.post(environment.apiUrl + '/api/form/edit-input-column-select', 
        {   

            inputId: inputId,
        })
            .subscribe((response: any) => {

                
                resolve(response);

  
            }, reject);
    });
}


editInputFormColumnEnabled(inputId): Promise<any>
{
  
    return new Promise((resolve, reject) => {
        this._httpClient.post(environment.apiUrl + '/api/form/edit-input-column-enabled', 
        {   

            inputId: inputId,
        })
            .subscribe((response: any) => {

                
                resolve(response);

  
            }, reject);
    });
}





}
