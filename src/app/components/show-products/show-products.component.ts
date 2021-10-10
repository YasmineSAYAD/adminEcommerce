import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { event } from '@cds/core/internal';
import { Product } from 'src/app/models/product';
import { Response } from 'src/app/models/response';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ProductsService } from 'src/app/services/products.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-show-products',
  templateUrl: './show-products.component.html',
  styleUrls: ['./show-products.component.css']
})
export class ShowProductsComponent implements OnInit {
@Input() products:Product[];
productModalOpen=false;
selectedProduct:Product;
file:File;
progress=0;
baseUrlImage=`${environment.api_image}`;
delete=false;
productToBeDelete:Product;
  constructor(private productService:ProductsService, private serviceFile:FileUploadService) { }

  ngOnInit(): void {
  }
onEdit(product:Product):void{
  this.productModalOpen=true;
  this.selectedProduct=product;
}
onDelete(product:Product):void{
this.delete=true;
this.productToBeDelete=product; //lui affecter le produit reçu en param
}
handleCancelDelete(){
 this.delete=false;
}
handleConfirmDelete(){
  this.productService.deleteProduct(this.productToBeDelete).subscribe(
    (data: Response)=>{
      if(data.status == 200){
        // Delete Product Image
        this.serviceFile.deleteImage(this.productToBeDelete.image).subscribe(
          (data: Response)=>{
            console.log(data);

          }
        )
        console.log(data);

        // Update Frontend
        const index = this.products.findIndex(p => p.idProduct == this.productToBeDelete.idProduct);
        this.products.splice(index,1);

      }else{
        console.log(data.message);
      }
    }
  )
  this.handleCancelDelete();
}
addProduct():void{
  this.selectedProduct=undefined;
  this.productModalOpen=true;
}
handleFinish(event){
let product=event.product ? event.product : null;
this.file=event.file ? event.file : null;
if(product){
  if(this.selectedProduct){
    //edit product
    product.idProduct=this.selectedProduct.idProduct; //product c'est le produit reçu du form
    this.editProductToServer(product);
  }else{
    //add product
    this.addProductToServer(product);
  }
}
this.productModalOpen=false;
}

uploadImage(events){
return new Promise(
(resolve,reject)=>{
  switch(events.type){
    case HttpEventType.Sent://la rqt a été envoyé
        console.log("Requête envoyée avec succès")
    break;

    case HttpEventType.UploadProgress://infos concernant l'upload de l'image
        //stocker l'evolution
        this.progress=Math.round(events.loaded/events.total*100); //pourcentage d'evolution
        if(this.progress==100){
          resolve(true);
        }
    break;

    case HttpEventType.Response:
        console.log(events.body);
        //reinitialiser progress
        setTimeout(()=>{
         this.progress=0;
         },
        1500);
    break;
  }
}
)
}

addProductToServer(product){
  this.productService.addProduct(product).subscribe(
    (data: Response)=>{
      if(data.status == 200){
        // Update frontend
        if(this.file){
          this.serviceFile.uploadImage(this.file).subscribe(
            (event: HttpEvent<any>)=>{
              this.uploadImage(event).then(
                ()=>{
                  product.idProduct = data.args.lastInsertId;
                  product.Category = product.category;
                  this.products.push(product);
                }
              );
            }
          )
        }

      }

    }
  )
}

editProductToServer(product){
  this.productService.editProduct(product).subscribe(
    (data: Response)=>{
      if(data.status == 200){
         //l'image
        //si on a un fichier à charger
        if(this.file){
          //charger le fichier
          this.serviceFile.uploadImage(this.file).subscribe(
            (event: HttpEvent<any>)=>{
              this.uploadImage(event).then(
                ()=>{
                   // update frontend
                   this.updateProducts(product);
                }
              );
            }
          );

          this.serviceFile.deleteImage(product.oldImage).subscribe(
            (data: Response)=>{
              console.log(data);
            }
          );
        }else{
           // update frontend
            this.updateProducts(product);
        }


      }else{
        console.log(data.message);

      }
    }
  )
}

updateProducts(product){
 // update frontend
  //recuperer l'index du produit qui a été modifié
  const index=this.products.findIndex(p=>p.idProduct==product.id);//parcourir tt les produit et les comparer au produit reçu en param
  product.Category=product.category;//prsk qd on reçoit les infos du back Category vient avec un c minuscule
 this.products = [
   ...this.products.slice(0,index),
   product,
   ...this.products.slice(index+1)
 ]
}
}
