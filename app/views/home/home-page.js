var observableModule = require("tns-core-modules/data/observable");

var TattooPhotosList = require("../../shared/view-models/home-view-model");
var tattooPhotosList = new TattooPhotosList([]);

var page;
var pageData = new observableModule.fromObject({
  tattooPhotosList: tattooPhotosList,
  isLoading : true
});


exports.loaded = function(args) {
    page = args.object;
    
    if(pageData.get("isLoading")){
      tattooPhotosList.getAllTattooPhotosOrderBy().then(function(){
          pageData.set("isLoading", false);
      });
    }
    page.bindingContext = pageData;
}

/*exports.animationCard = function () {
    const card = page.getViewById('jokerCard');
    card
      .animate({
        translate: { x: 0 , y: 100 },
        scale : {x: 1, y: 2},
        duration: 1000
      })
      .then(() => {
        card.visibility = 'collapse';
      });
}*/