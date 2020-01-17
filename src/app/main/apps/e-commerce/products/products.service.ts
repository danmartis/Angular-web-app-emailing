import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthService } from 'app/services/authentication/auth.service';


@Injectable()
export class EcommerceProductsService implements Resolve<any>
{
    products: any[];
    onProductsChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private authServices: AuthService,
 
    ) {
        // Set the defaults
        this.onProductsChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {

                Promise.all([
                
                    this.getAllEvents()
                    
                ]).then(
                    () => {
                        resolve();
                    },
                    reject
                );

        });
    }

    /**
     * Get products
     *
     * @returns {Promise<any>}
     */
    getProducts(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get('api/e-commerce-products')
                .subscribe((response: any) => {
                    this.products = response;

 
                    this.onProductsChanged.next(this.products);
                    resolve(response);
                }, reject);
        });
    }


    getAllEvents(): Promise<any> {

        console.log('user ',this.authServices.currentUserValue.token)

        const Haeader = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `beader ${this.authServices.currentUserValue.token}`
            }),
        }

        return new Promise((resolve, reject) => {
            this._httpClient.get(environment.apiUrl + '/api/all-events', Haeader)
                .subscribe((response: any) => {
                    
                    console.log(response)
                    let eventArray: any = []
                    let count = 0;

                    response.events.forEach(e => {
                        count++
                        e.displayId = count
                        e.id = e._id
                        

                        eventArray.push(e)
                       
                    });

                    console.log(eventArray)

                    this.products = eventArray;

                    this.onProductsChanged.next(this.products);

                    console.log(this.onProductsChanged)
                    resolve(this.products);


                }, reject);
        });

    }

}