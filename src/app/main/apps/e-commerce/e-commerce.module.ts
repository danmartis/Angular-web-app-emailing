import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';

import { EcommerceProductsComponent } from 'app/main/apps/e-commerce/products/products.component';
import { EcommerceProductsService } from 'app/main/apps/e-commerce/products/products.service';
import { EcommerceProductComponent } from 'app/main/apps/e-commerce/product/product.component';
import { EcommerceProductService } from 'app/main/apps/e-commerce/product/product.service';
import { EcommerceOrdersComponent } from 'app/main/apps/e-commerce/orders/orders.component';
import { EcommerceOrdersService } from 'app/main/apps/e-commerce/orders/orders.service';
import { EcommerceOrderComponent } from 'app/main/apps/e-commerce/order/order.component';
import { EcommerceOrderService } from 'app/main/apps/e-commerce/order/order.service';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';

import { FuseConfirmDialogModule, FuseSidebarModule, FuseProgressBarModule, FuseDemoModule } from '@fuse/components';
import { ContactsService } from 'app/main/apps/contacts/contacts.service';

import { EmailEditorModule } from 'angular-email-editor';
import { ContactsModule } from '../contacts/contacts.module';
import { AuthGuardService } from 'app/main/helpers/auth-guard.service';
import { CampaignsComponent } from './product/campaigns/campaigns.component';
import { CampaignService } from 'app/main/apps/e-commerce/product/campaigns/campaign.service';
import { AddComponent } from './product/campaigns/dialog/add/add.component';
import { SendComponent } from './product/campaigns/dialog/send/send.component';
import { AcademyModule } from '../academy/academy.module';
import { UsersComponent } from './product/users/users.component';
import { FormCustomComponent } from './product/form-custom/form-custom.component';
import { CardedLeftSidebar2Component } from 'app/main/ui/page-layouts/carded/left-sidebar-2/left-sidebar-2.component';
import { FormCustomService } from './product/form-custom/services/form-custom.service';
import { SelectFieldsComponent } from '../contacts/contact-list/dialog/select-fields/select-fields.component';
import {NgxImageCompressService} from 'ngx-image-compress';


const routes: Routes = [
    {
        path     : 'products',
        canActivate: [ AuthGuardService ],
        component: EcommerceProductsComponent,
        resolve  : {
            data: EcommerceProductsService
        }
    },
    {
        path     : 'products/:id',
        component: EcommerceProductComponent,
        resolve  : {
            data: EcommerceProductService
        }
    },
    {
        path     : 'products/:id/:handle',
        component: EcommerceProductComponent,
        resolve  : {
            data: EcommerceProductService
        }
    },
    {
        path     : 'orders',
        component: EcommerceOrdersComponent,
        resolve  : {
            data: EcommerceOrdersService
        }
    },
    {
        path     : 'orders/:id',
        component: EcommerceOrderComponent,
        resolve  : {
            data: EcommerceOrderService
        }
    },

];

@NgModule({

    declarations: [
        EcommerceProductsComponent,
        EcommerceProductComponent,
        EcommerceOrdersComponent,
        EcommerceOrderComponent,
        CampaignsComponent,
        AddComponent,
        SendComponent,
        UsersComponent,
        FormCustomComponent,

        
       


    ],
    imports     : [
        RouterModule.forChild(routes),

        MaterialModule,
      

        NgxChartsModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyD81ecsCj4yYpcXSLFcYU97PvRsE_X8Bx8'
        }),

        FuseSharedModule,
        FuseProgressBarModule,
        FuseWidgetModule,
        FuseConfirmDialogModule,
        FuseSidebarModule,
        ContactsModule,
        AcademyModule,
        FuseDemoModule
    ],
    providers   : [
        EcommerceProductsService,
        EcommerceProductService,
        EcommerceOrdersService,
        EcommerceOrderService,
        ContactsService,
        CampaignService,
        FormCustomService,
        NgxImageCompressService,


    ],
    entryComponents: [
        AddComponent,
        
        SelectFieldsComponent,
        SendComponent
        
    ]
})
export class EcommerceModule
{
}
