describe('MixDatUp controllers', function() {
 
  describe('AlcoholicDrinksCtrl', function(){
 
    it('should create "phones" model with 3 phones', function() {
      var scope = {},
          ctrl = new AlcoholicDrinksCtrl(scope);
 
      expect(scope.drinks.length).toBe(3);
    });
  });
});