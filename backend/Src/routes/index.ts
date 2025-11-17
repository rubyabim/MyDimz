import express from 'express';
import {  login, 
     initializeAdmin} 
     from '../controllers/authController';

     import { 
         getProducts,
          createProduct, 
          updateProduct, 
          deleteProduct,
          getPublicProducts,
          getProductById,
          getProductCategories
          } from '../controllers/productController';
          import {  
            createSale, 
              getSales
              from '../controllers/saleController';

              import { 
                 authenticateToken, 
}


