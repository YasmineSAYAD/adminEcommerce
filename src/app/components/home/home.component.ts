import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { Response } from 'src/app/models/response';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products;
  productSub;
  constructor(private productService:ProductsService) { }

  ngOnInit(): void {
    this.productSub=this.productService.getProducts().subscribe(
      (response:Response)=>{
        this.products=response.result;
     },
      (error)=>{console.log("Erreur de récupération "+error)},
      ()=>{console.log("Récupération terminée ")},
    )
  }

}
