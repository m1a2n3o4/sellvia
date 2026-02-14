## 📋 Document Information

## Landing page
- Lefti side bar: Live Chat(Empty page), Orders Page (Create and update the orders), Contacts (Table with all contacts can aslo create contacts), Brodcast (Select any consxcta and can stat the brodcasts.) 
- 
## My Products page ; (Please add this on side nav).
- We need complete new component thatnot yet created - please create new one.
- Woner can Create new Product, edit, update, Delte, Offile/online, and do Basic Operations.
- Create Product form (Very Important).
     - while creating product the woner must have form fileds,
        1. Product Name : Text Box.
        2. Small Description: free text box.
        3. Price : Number box 
        4. Quntaty: Number Box.
        5. Brand : Text box.
        6. Images: (will add this feature later).
        7. Add more Specifications ? give 3 text boxes can add / remove dynamacially. 
            ex : key.     :    value :   Price.
                 size          XL.         800
                 size.         S            650.
                 Ram          6GB.          45000
                 material.    Cotton.         699
                 material.    foam.           600.

            Please store this Specifications as Json data to DB Table. maybe attributes coloumn on table.
            - Can EDIT Delete update the tabeles.
   - Once Product is created : Actions - API call to DB. Should list on My products table, Same table display on Landin dashbiard page saying recent orders.

## Order page:
   The orders can place offline or online,
    Offline means : Someone can visit the store and buy the product. so business woner can update the invetory in Dashbiard. 
    Ex : if customer buy adidas shoe size 10 rs 700, bssiness woner can search the product from invertory and search product and clieck on Buy - this action remove the quntaty and create the order on order list with 
          with that product link...while clik Business woner can ask the customer name and mobile number so the contact aslo will save on contacts DB and link this ordered product.

    Online : Customer can order the product from whstAPP order: 
            Once order recived from online customer details store on Orders table - with type online order - Paymet status - type and Dellivery address and delivery status.

    UI UX : Order page : shoud be visbobe with a table goof UI, Sorting default is latest order. 
                        - Filter needs for table : 1 Filter By online ormoffline,
                        - 2. Today orders.
                        - 3. Order by Date or between dates (need to show datepicker)
                        - 4. Pending Deliveries.
                        - 5. COD - deliveries.
                        - 6. Payments failed.
                        - 7. search order by product name
                        - 8. search order by customer name.
                        - 9. Please add any and mustneede filters.
      Technically, We need to create Backend API call to Datab when order is created. 
      Actions one order palced : Invetory must updated. If new contact data will save on contacts LIst.  

## Contacts page :
    Woner can Add his customers data to DB, he can manuvally add and if any customer order online store the data on this Table.
    Cretaet customer form,
       1. name : Text box.
       2. Mobile : number (while adding please check this number alredy exstis).
       3. Address : text area.
       4. Ordered Products : Link to ordersed products.
HOLD Broadcast now.


## Conlusion.

   Seems need to EDIT UPDATE THE DATABASE ALSO, as we have new fileds for order table on DB.
   Please use UI UX componets that alredy we used installed on this project.
   Please ask any queston before you proceed.