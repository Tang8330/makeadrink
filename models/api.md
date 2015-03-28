#API
##Register an account?
hit /account/register
	must have username & password
	renders 'register' view
##Items
- /item/all
- /item/add
- /item/edit/:id
- /item/id/:id - view

##Orders
- /order/all
- /order/add
- /order/edit/:id
- /order/id/:id - view


##Query all items
hit /item/all

#Edit items
hit /item/edit/:id
hit /item/id/:id to view


#Add items
hit /item/add

#Edit Orders
hit /order/edit/:id
hit /order/all to view all

#Add orders
hit /order/add
